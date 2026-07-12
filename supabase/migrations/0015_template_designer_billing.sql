-- Paid, prepaid AI Template Designer. No payment gateway: staff use the
-- two admin functions below from the Supabase Dashboard SQL editor.

CREATE TABLE IF NOT EXISTS account_entitlements (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_plan text NOT NULL DEFAULT 'free' CHECK (current_plan IN ('free', 'paid')),
  subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'expired', 'canceled')),
  subscription_activated_at timestamptz,
  subscription_expires_at timestamptz,
  free_template_generations_used integer NOT NULL DEFAULT 0 CHECK (free_template_generations_used BETWEEN 0 AND 2),
  free_template_generations_reserved integer NOT NULL DEFAULT 0 CHECK (free_template_generations_reserved BETWEEN 0 AND 2),
  credit_balance_microusd bigint NOT NULL DEFAULT 0 CHECK (credit_balance_microusd >= 0),
  credit_reserved_microusd bigint NOT NULL DEFAULT 0 CHECK (credit_reserved_microusd >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS template_designer_model_limits (
  model text PRIMARY KEY,
  reserve_microusd bigint NOT NULL CHECK (reserve_microusd > 0),
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Conservative pre-authorisation only. Final billing uses OpenRouter usage.cost + 20%.
INSERT INTO template_designer_model_limits (model, reserve_microusd) VALUES
  ('deepseek/deepseek-v4-flash', 5000000),
  ('tencent/hy3', 5000000),
  ('deepseek/deepseek-v4-pro', 5000000),
  ('xiaomi/mimo-v2.5', 5000000),
  ('minimax/minimax-m3', 5000000)
ON CONFLICT (model) DO NOTHING;

CREATE TABLE IF NOT EXISTS custom_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  settings jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_template_id uuid NOT NULL REFERENCES custom_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number >= 1),
  css text NOT NULL,
  html_cover text NOT NULL,
  html_content text NOT NULL,
  html_ending text NOT NULL,
  settings_snapshot jsonb NOT NULL,
  raw_slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_message text NOT NULL DEFAULT '',
  source text NOT NULL CHECK (source IN ('generate', 'edit')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(custom_template_id, version_number)
);

ALTER TABLE custom_templates ADD COLUMN IF NOT EXISTS current_version_id uuid;
ALTER TABLE custom_template_versions ADD COLUMN IF NOT EXISTS raw_slides jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS template_designer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES custom_templates(id) ON DELETE SET NULL,
  operation text NOT NULL CHECK (operation IN ('generate', 'edit')),
  model text NOT NULL,
  reservation_type text NOT NULL CHECK (reservation_type IN ('trial', 'credit')),
  reserved_microusd bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'completed', 'failed', 'canceled')),
  provider_usage jsonb NOT NULL DEFAULT '[]'::jsonb,
  provider_cost_microusd bigint NOT NULL DEFAULT 0,
  customer_cost_microusd bigint NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id uuid REFERENCES template_designer_requests(id) ON DELETE SET NULL,
  amount_microusd bigint NOT NULL,
  kind text NOT NULL CHECK (kind IN ('manual_topup', 'designer_charge', 'adjustment')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_templates_user_id_created_at_idx ON custom_templates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS template_designer_requests_user_id_created_at_idx ON template_designer_requests(user_id, created_at DESC);

ALTER TABLE account_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_designer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entitlements_select_own" ON account_entitlements;
DROP POLICY IF EXISTS "custom_templates_select_own" ON custom_templates;
DROP POLICY IF EXISTS "custom_template_versions_select_own" ON custom_template_versions;
DROP POLICY IF EXISTS "template_designer_requests_select_own" ON template_designer_requests;
DROP POLICY IF EXISTS "credit_ledger_select_own" ON credit_ledger;

CREATE POLICY "entitlements_select_own" ON account_entitlements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "custom_templates_select_own" ON custom_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "custom_template_versions_select_own" ON custom_template_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "template_designer_requests_select_own" ON template_designer_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_ledger_select_own" ON credit_ledger FOR SELECT USING (auth.uid() = user_id);

INSERT INTO account_entitlements (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION get_template_designer_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_account account_entitlements;
  v_paid_active boolean;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  SELECT * INTO v_account FROM account_entitlements WHERE user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENTITLEMENT_NOT_FOUND'; END IF;
  v_paid_active := v_account.current_plan = 'paid'
    AND v_account.subscription_status = 'active'
    AND (v_account.subscription_expires_at IS NULL OR v_account.subscription_expires_at > now());
  RETURN jsonb_build_object(
    'plan', v_account.current_plan,
    'subscriptionStatus', CASE
      WHEN v_paid_active THEN 'active'
      WHEN v_account.current_plan = 'paid' AND v_account.subscription_status = 'active' AND v_account.subscription_expires_at <= now() THEN 'expired'
      ELSE v_account.subscription_status
    END,
    'freeUsesRemaining', 2 - v_account.free_template_generations_used - v_account.free_template_generations_reserved,
    'creditBalanceMicroUsd', v_account.credit_balance_microusd - v_account.credit_reserved_microusd,
    'subscriptionExpiresAt', v_account.subscription_expires_at
  );
END;
$$;

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

  IF p_operation = 'generate' AND v_account.free_template_generations_used + v_account.free_template_generations_reserved < 2 THEN
    UPDATE account_entitlements
    SET free_template_generations_reserved = free_template_generations_reserved + 1, updated_at = now()
    WHERE user_id = v_user_id;
    INSERT INTO template_designer_requests (user_id, template_id, operation, model, reservation_type)
    VALUES (v_user_id, p_template_id, p_operation, p_model, 'trial') RETURNING id INTO v_request_id;
    RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'trial');
  END IF;

  v_paid_active := v_account.current_plan = 'paid'
    AND v_account.subscription_status = 'active'
    AND (v_account.subscription_expires_at IS NULL OR v_account.subscription_expires_at > now());
  IF NOT v_paid_active THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE'; END IF;
  IF v_account.credit_balance_microusd - v_account.credit_reserved_microusd < v_reserve THEN RAISE EXCEPTION 'INSUFFICIENT_CREDIT'; END IF;

  UPDATE account_entitlements
  SET credit_reserved_microusd = credit_reserved_microusd + v_reserve, updated_at = now()
  WHERE user_id = v_user_id;
  INSERT INTO template_designer_requests (user_id, template_id, operation, model, reservation_type, reserved_microusd)
  VALUES (v_user_id, p_template_id, p_operation, p_model, 'credit', v_reserve) RETURNING id INTO v_request_id;
  RETURN jsonb_build_object('requestId', v_request_id, 'reservationType', 'credit');
END;
$$;

CREATE OR REPLACE FUNCTION complete_template_designer_request(
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
  v_user_id uuid := auth.uid();
  v_request template_designer_requests;
  v_template_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_customer_cost bigint;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  SELECT * INTO v_request FROM template_designer_requests WHERE id = p_request_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'reserved' THEN RAISE EXCEPTION 'REQUEST_NOT_AVAILABLE'; END IF;
  IF p_provider_cost_microusd < 0 THEN RAISE EXCEPTION 'INVALID_COST'; END IF;

  IF v_request.reservation_type = 'trial' THEN
    UPDATE account_entitlements SET
      free_template_generations_reserved = free_template_generations_reserved - 1,
      free_template_generations_used = free_template_generations_used + 1,
      updated_at = now()
    WHERE user_id = v_user_id;
    v_customer_cost := 0;
  ELSE
    v_customer_cost := CEIL(p_provider_cost_microusd * 1.2)::bigint;
    IF v_customer_cost > v_request.reserved_microusd THEN RAISE EXCEPTION 'RESERVATION_TOO_SMALL'; END IF;
    UPDATE account_entitlements SET
      credit_reserved_microusd = credit_reserved_microusd - v_request.reserved_microusd,
      credit_balance_microusd = credit_balance_microusd - v_customer_cost,
      updated_at = now()
    WHERE user_id = v_user_id;
    INSERT INTO credit_ledger (user_id, request_id, amount_microusd, kind, note)
    VALUES (v_user_id, p_request_id, -v_customer_cost, 'designer_charge', v_request.operation || ' via ' || v_request.model);
  END IF;

  IF v_request.template_id IS NULL THEN
    INSERT INTO custom_templates (user_id, name, settings)
    VALUES (v_user_id, p_template_payload->>'title', p_template_payload->'settings')
    RETURNING id INTO v_template_id;
  ELSE
    v_template_id := v_request.template_id;
    UPDATE custom_templates SET name = p_template_payload->>'title', settings = p_template_payload->'settings', updated_at = now()
    WHERE id = v_template_id AND user_id = v_user_id;
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number FROM custom_template_versions WHERE custom_template_id = v_template_id;
  INSERT INTO custom_template_versions (custom_template_id, user_id, version_number, css, html_cover, html_content, html_ending, settings_snapshot, raw_slides, ai_message, source)
  VALUES (
    v_template_id, v_user_id, v_version_number, p_template_payload->>'css', p_template_payload->>'htmlCover',
    p_template_payload->>'htmlContent', p_template_payload->>'htmlEnding', p_template_payload->'settings', p_template_payload->'rawSlides',
    COALESCE(p_template_payload->>'aiMessage', ''), v_request.operation
  ) RETURNING id INTO v_version_id;
  UPDATE custom_templates SET current_version_id = v_version_id, updated_at = now() WHERE id = v_template_id;

  UPDATE template_designer_requests SET
    template_id = v_template_id, status = 'completed', provider_usage = p_provider_usage,
    provider_cost_microusd = p_provider_cost_microusd, customer_cost_microusd = v_customer_cost, completed_at = now()
  WHERE id = p_request_id;
  RETURN jsonb_build_object('templateId', v_template_id, 'versionNumber', v_version_number, 'customerCostMicroUsd', v_customer_cost);
END;
$$;

CREATE OR REPLACE FUNCTION fail_template_designer_request(p_request_id uuid, p_error_message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_id uuid := auth.uid(); v_request template_designer_requests;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  SELECT * INTO v_request FROM template_designer_requests WHERE id = p_request_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'reserved' THEN RETURN; END IF;
  IF v_request.reservation_type = 'trial' THEN
    UPDATE account_entitlements SET free_template_generations_reserved = free_template_generations_reserved - 1, updated_at = now() WHERE user_id = v_user_id;
  ELSE
    UPDATE account_entitlements SET credit_reserved_microusd = credit_reserved_microusd - v_request.reserved_microusd, updated_at = now() WHERE user_id = v_user_id;
  END IF;
  UPDATE template_designer_requests SET status = 'failed', error_message = left(p_error_message, 500), completed_at = now() WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_set_template_designer_subscription(p_user_id uuid, p_expires_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE account_entitlements SET current_plan = 'paid', subscription_status = 'active', subscription_activated_at = now(), subscription_expires_at = p_expires_at, updated_at = now() WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_grant_template_designer_credit(p_user_id uuid, p_amount_microusd bigint, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_amount_microusd <= 0 THEN RAISE EXCEPTION 'CREDIT_AMOUNT_MUST_BE_POSITIVE'; END IF;
  UPDATE account_entitlements SET credit_balance_microusd = credit_balance_microusd + p_amount_microusd, updated_at = now() WHERE user_id = p_user_id;
  INSERT INTO credit_ledger (user_id, amount_microusd, kind, note) VALUES (p_user_id, p_amount_microusd, 'manual_topup', p_note);
END;
$$;

REVOKE ALL ON FUNCTION admin_set_template_designer_subscription(uuid, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_grant_template_designer_credit(uuid, bigint, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO brand_kits (user_id) VALUES (NEW.id);
  INSERT INTO user_preferences (user_id, content_mode)
  VALUES (NEW.id, CASE WHEN NEW.raw_user_meta_data->>'content_mode' = 'medical' THEN 'medical' ELSE 'general' END);
  INSERT INTO account_usage (user_id) VALUES (NEW.id);
  INSERT INTO account_entitlements (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
