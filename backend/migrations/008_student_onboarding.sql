-- Persist onboarding completion while keeping established accounts accessible.
SET @onboarding_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'onboarding_completed_at'
);
SET @onboarding_sql = IF(@onboarding_column_exists = 0,
  'ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP NULL DEFAULT NULL',
  'SELECT 1');
PREPARE onboarding_stmt FROM @onboarding_sql;
EXECUTE onboarding_stmt;
DEALLOCATE PREPARE onboarding_stmt;

-- Existing accounts are treated as established. New registrations omit this
-- column and remain in onboarding until profile and skill data are saved. Only
-- backfill on the same first run that creates the column, so rerunning this
-- migration cannot mark later registrations as complete.
SET @onboarding_backfill_sql = IF(@onboarding_column_exists = 0,
  'UPDATE users SET onboarding_completed_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE onboarding_completed_at IS NULL',
  'SELECT 1');
PREPARE onboarding_backfill_stmt FROM @onboarding_backfill_sql;
EXECUTE onboarding_backfill_stmt;
DEALLOCATE PREPARE onboarding_backfill_stmt;

-- Registration captures only identity credentials. Student-specific academic
-- values are nullable until the authenticated onboarding form saves them.
ALTER TABLE users MODIFY semester TINYINT UNSIGNED NULL DEFAULT NULL;
ALTER TABLE users MODIFY target_role VARCHAR(120) NULL DEFAULT NULL;
