USE skilltwin;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT NULL,
  target_user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_admin_audit_created (created_at, audit_id),
  KEY idx_admin_audit_target (target_user_id, created_at),
  CONSTRAINT fk_admin_audit_actor FOREIGN KEY (actor_user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_admin_audit_target FOREIGN KEY (target_user_id)
    REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
