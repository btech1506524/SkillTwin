CREATE TABLE IF NOT EXISTS oauth_identities (
  identity_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider ENUM('google', 'microsoft') NOT NULL,
  provider_subject VARCHAR(255) NOT NULL,
  email VARCHAR(254) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_oauth_provider_subject (provider, provider_subject),
  KEY idx_oauth_identities_user (user_id),
  CONSTRAINT fk_oauth_identity_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_login_attempts (
  state_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  provider ENUM('google', 'microsoft') NOT NULL,
  nonce CHAR(43) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  code_verifier VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  link_user_id INT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_oauth_attempt_expiry (expires_at),
  CONSTRAINT fk_oauth_attempt_user FOREIGN KEY (link_user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_login_codes (
  code_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_oauth_login_code_expiry (expires_at),
  CONSTRAINT fk_oauth_login_code_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
