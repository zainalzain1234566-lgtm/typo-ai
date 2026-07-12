-- Billing mutations are server-only. Server actions authenticate the user,
-- then call these RPCs with the service role and the verified user id.

ALTER TABLE template_designer_model_limits ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE template_designer_model_limits FROM anon, authenticated;

REVOKE ALL ON FUNCTION begin_template_designer_request(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION complete_template_designer_request(uuid, jsonb, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION fail_template_designer_request(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION begin_template_designer_request_internal(
  p_user_id uuid,
  p_operation text,
  p_model text,
  p_template_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account account_entitlements;
  v_reserve bigint;
  v_request_id uuid;
  v_paid_active boolean;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_operation NOT IN ('generate', 'edit') THEN RAISE EXCEPTION 'INVALID_OPERATION'; END IF;
  IF p_template_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM custom_templates WHERE id = p_template_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'TEMPLATE_NOT_FOUND';
  END IF;

  SELECT * INTO v_account
  FROM account_entitlements
  WHERE user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENTITLEMENT_NOT_FOUND'; END IF;

  SELECT reserve_microusd INTO v_reserve
  FROM template_designer_model_limits
  WHERE model = p_model AND is_active;
  IF v_reserve IS NULL THEN RAISE EXCEPTION 'MODEL_NOT_AVAILABLE'; END IF;

  v_paid_active := v_account.current_plan = 'paid'
    AND v_account.subscription_status = 'active'
    AND (v_account.subscription_expires_at IS NULL OR v_account.subscription_expires_at > now());

  IF v_paid_active THEN
    IF v_account.credit_balance_microusd - v_account.credit_reserved_microusd < v_reserve THEN
      RAISE EXCEPTION 'INSUFFICIENT_CREDIT';
    END IF;
    UPDATE account_entitlements
    SET credit_reserved_microusd = credit_reserved_microusd + v_reserve,
        updated_at = now()
    WHERE user_id = p_user_id;
    INSERT INTO template_designer_requests (
      user_id, template_id, operation, model, reservation_type, reserved_microusd
    ) VALUES (
      p_user_id, p_template_id, p_operation, p_model, 'credit', v_reserve
    ) RETURNING id INTO v_request_id;
    RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'credit');
  END IF;

  IF p_operation = 'generate'
    AND v_account.free_template_generations_used + v_account.free_template_generations_reserved < 2 THEN
    UPDATE account_entitlements
    SET free_template_generations_reserved = free_template_generations_reserved + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    INSERT INTO template_designer_requests (
      user_id, template_id, operation, model, reservation_type
    ) VALUES (
      p_user_id, p_template_id, p_operation, p_model, 'trial'
    ) RETURNING id INTO v_request_id;
    RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'trial');
  END IF;

  RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE';
END;
$$;

CREATE OR REPLACE FUNCTION complete_template_designer_request_internal(
  p_user_id uuid,
  p_request_id uuid,
  p_provider_usage jsonb,
  p_provider_cost_microusd bigint,
  p_template_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request template_designer_requests;
  v_account account_entitlements;
  v_template_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_customer_cost bigint;
  v_available_for_request bigint;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_provider_cost_microusd < 0 THEN RAISE EXCEPTION 'INVALID_COST'; END IF;

  SELECT * INTO v_request
  FROM template_designer_requests
  WHERE id = p_request_id AND user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'reserved' THEN
    RAISE EXCEPTION 'REQUEST_NOT_AVAILABLE';
  END IF;

  -- Serialize edits to one template before selecting MAX(version_number).
  IF v_request.template_id IS NOT NULL THEN
    SELECT id INTO v_template_id
    FROM custom_templates
    WHERE id = v_request.template_id AND user_id = p_user_id
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'TEMPLATE_NOT_FOUND'; END IF;
  END IF;

  SELECT * INTO v_account
  FROM account_entitlements
  WHERE user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENTITLEMENT_NOT_FOUND'; END IF;

  IF v_request.reservation_type = 'trial' THEN
    UPDATE account_entitlements
    SET free_template_generations_reserved = free_template_generations_reserved - 1,
        free_template_generations_used = free_template_generations_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    v_customer_cost := 0;
  ELSE
    v_customer_cost := CEIL(p_provider_cost_microusd * 1.2)::bigint;
    v_available_for_request := v_account.credit_balance_microusd
      - v_account.credit_reserved_microusd
      + v_request.reserved_microusd;

    IF v_available_for_request < v_customer_cost THEN
      UPDATE account_entitlements
      SET credit_reserved_microusd = credit_reserved_microusd - v_request.reserved_microusd,
          updated_at = now()
      WHERE user_id = p_user_id;
      UPDATE template_designer_requests
      SET status = 'failed',
          provider_usage = COALESCE(p_provider_usage, '[]'::jsonb),
          provider_cost_microusd = p_provider_cost_microusd,
          customer_cost_microusd = 0,
          error_message = 'INSUFFICIENT_FINAL_CREDIT',
          completed_at = now()
      WHERE id = p_request_id;
      RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_FINAL_CREDIT');
    END IF;

    UPDATE account_entitlements
    SET credit_reserved_microusd = credit_reserved_microusd - v_request.reserved_microusd,
        credit_balance_microusd = credit_balance_microusd - v_customer_cost,
        updated_at = now()
    WHERE user_id = p_user_id;
    INSERT INTO credit_ledger (user_id, request_id, amount_microusd, kind, note)
    VALUES (
      p_user_id, p_request_id, -v_customer_cost, 'designer_charge',
      v_request.operation || ' via ' || v_request.model
    );
  END IF;

  IF v_template_id IS NULL THEN
    INSERT INTO custom_templates (user_id, name, settings)
    VALUES (p_user_id, p_template_payload->>'title', p_template_payload->'settings')
    RETURNING id INTO v_template_id;
  ELSE
    UPDATE custom_templates
    SET name = p_template_payload->>'title',
        settings = p_template_payload->'settings',
        updated_at = now()
    WHERE id = v_template_id;
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM custom_template_versions
  WHERE custom_template_id = v_template_id;

  INSERT INTO custom_template_versions (
    custom_template_id, user_id, version_number, css, html_cover,
    html_content, html_ending, settings_snapshot, raw_slides, ai_message, source
  ) VALUES (
    v_template_id, p_user_id, v_version_number, p_template_payload->>'css',
    p_template_payload->>'htmlCover', p_template_payload->>'htmlContent',
    p_template_payload->>'htmlEnding', p_template_payload->'settings',
    p_template_payload->'rawSlides', COALESCE(p_template_payload->>'aiMessage', ''),
    v_request.operation
  ) RETURNING id INTO v_version_id;

  UPDATE custom_templates
  SET current_version_id = v_version_id, updated_at = now()
  WHERE id = v_template_id;

  UPDATE template_designer_requests
  SET template_id = v_template_id,
      status = 'completed',
      provider_usage = COALESCE(p_provider_usage, '[]'::jsonb),
      provider_cost_microusd = p_provider_cost_microusd,
      customer_cost_microusd = v_customer_cost,
      completed_at = now()
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'templateId', v_template_id,
    'versionNumber', v_version_number,
    'customerCostMicroUsd', v_customer_cost
  );
END;
$$;

CREATE OR REPLACE FUNCTION fail_template_designer_request_internal(
  p_user_id uuid,
  p_request_id uuid,
  p_provider_usage jsonb,
  p_provider_cost_microusd bigint,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request template_designer_requests;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_provider_cost_microusd < 0 THEN RAISE EXCEPTION 'INVALID_COST'; END IF;

  SELECT * INTO v_request
  FROM template_designer_requests
  WHERE id = p_request_id AND user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'reserved' THEN RETURN; END IF;

  IF v_request.reservation_type = 'trial' THEN
    UPDATE account_entitlements
    SET free_template_generations_reserved = free_template_generations_reserved - 1,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE account_entitlements
    SET credit_reserved_microusd = credit_reserved_microusd - v_request.reserved_microusd,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  UPDATE template_designer_requests
  SET status = 'failed',
      provider_usage = COALESCE(p_provider_usage, '[]'::jsonb),
      provider_cost_microusd = p_provider_cost_microusd,
      customer_cost_microusd = 0,
      error_message = left(p_error_message, 500),
      completed_at = now()
  WHERE id = p_request_id;
END;
$$;

REVOKE ALL ON FUNCTION begin_template_designer_request_internal(uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION complete_template_designer_request_internal(uuid, uuid, jsonb, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION fail_template_designer_request_internal(uuid, uuid, jsonb, bigint, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION begin_template_designer_request_internal(uuid, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION complete_template_designer_request_internal(uuid, uuid, jsonb, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION fail_template_designer_request_internal(uuid, uuid, jsonb, bigint, text) TO service_role;
