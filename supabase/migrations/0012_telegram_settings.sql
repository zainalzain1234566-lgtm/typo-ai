-- Migration 0012: Telegram integration — per-user bot token + chat_id
-- Idempotent: safe to re-run
-- =============================================================

-- ============ Add Telegram columns to user_preferences ============
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS telegram_bot_token text;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS telegram_chat_id text;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS telegram_enabled boolean NOT NULL DEFAULT false;

-- ============ Extend export_records CHECK to allow 'telegram' ============
ALTER TABLE export_records DROP CONSTRAINT IF EXISTS export_records_export_type_check;
ALTER TABLE export_records ADD CONSTRAINT export_records_export_type_check
  CHECK (export_type IN ('single_png', 'zip', 'telegram'));
