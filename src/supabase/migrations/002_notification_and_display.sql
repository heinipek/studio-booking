-- ============================================================
-- Migration 002: Notification preferences + session display title
-- ============================================================

-- Add notification preference to users
ALTER TABLE users
  ADD COLUMN notification_preference TEXT NOT NULL DEFAULT 'email'
  CHECK (notification_preference IN ('email', 'sms', 'both'));

-- Add phone_verified flag (needed for SMS)
ALTER TABLE users
  ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Add display_title to class_sessions
-- Used for studio_reserved sessions to show purpose in schedule (e.g. "Treenit", "Valokuvaustilaisuus")
-- Also usable for regular sessions to override the class_type name if needed
ALTER TABLE class_sessions
  ADD COLUMN display_title TEXT;
