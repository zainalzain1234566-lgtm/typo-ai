-- Paid accounts always use their own credit. Free accounts receive two
-- new-template generations only; they cannot use AI edits.

UPDATE template_designer_model_limits
SET reserve_microusd = 1000000, updated_at = now()
WHERE is_active;

CREATE OR REPLACE FUNCTION begin_template_designer_request(p_operation text, p_model text, p_template_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_account account_entitlements;
  v_reserve bigint;
  v_request_id uuid;
  v_paid_active boolean;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_operation NOT IN ('generate', 'edit') THEN RAISE EXCEPTION 'INVALID_OPERATION'; END IF;
  IF p_template_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM custom_templates WHERE id = p_template_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'TEMPLATE_NOT_FOUND';
  END IF;

  SELECT * INTO v_account FROM account_entitlements WHERE user_id = v_user_id FOR UPDATE;
  SELECT reserve_microusd INTO v_reserve FROM template_designer_model_limits WHERE model = p_model AND is_active;
  IF v_reserve IS NULL THEN RAISE EXCEPTION 'MODEL_NOT_AVAILABLE'; END IF;

  v_paid_active := v_account.current_plan = 'paid'
    AND v_account.subscription_status = 'active'
    AND (v_account.subscription_expires_at IS NULL OR v_account.subscription_expires_at > now());

  IF v_paid_active THEN
    IF v_account.credit_balance_microusd - v_account.credit_reserved_microusd < v_reserve THEN RAISE EXCEPTION 'INSUFFICIENT_CREDIT'; END IF;
    UPDATE account_entitlements
    SET credit_reserved_microusd = credit_reserved_microusd + v_reserve, updated_at = now()
    WHERE user_id = v_user_id;
    INSERT INTO template_designer_requests (user_id, template_id, operation, model, reservation_type, reserved_microusd)
    VALUES (v_user_id, p_template_id, p_operation, p_model, 'credit', v_reserve) RETURNING id INTO v_request_id;
    RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'credit');
  END IF;

  IF p_operation = 'generate' AND v_account.free_template_generations_used + v_account.free_template_generations_reserved < 2 THEN
    UPDATE account_entitlements
    SET free_template_generations_reserved = free_template_generations_reserved + 1, updated_at = now()
    WHERE user_id = v_user_id;
    INSERT INTO template_designer_requests (user_id, template_id, operation, model, reservation_type)
    VALUES (v_user_id, p_template_id, p_operation, p_model, 'trial') RETURNING id INTO v_request_id;
    RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'trial');
  END IF;

  RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE';
END;
$$;
