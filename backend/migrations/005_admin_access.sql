-- Add server-controlled account roles. Existing accounts stay students by default.
SET @account_role_column = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'account_role'
);
SET @account_role_sql = IF(@account_role_column = 0,
  'ALTER TABLE users ADD COLUMN account_role ENUM(''student'', ''admin'') NOT NULL DEFAULT ''student'' AFTER graduation_year',
  'SELECT 1');
PREPARE account_role_stmt FROM @account_role_sql;
EXECUTE account_role_stmt;
DEALLOCATE PREPARE account_role_stmt;

SET @account_role_index = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_account_role'
);
SET @account_role_index_sql = IF(@account_role_index = 0,
  'CREATE INDEX idx_users_account_role ON users (account_role)',
  'SELECT 1');
PREPARE account_role_index_stmt FROM @account_role_index_sql;
EXECUTE account_role_index_stmt;
DEALLOCATE PREPARE account_role_index_stmt;
