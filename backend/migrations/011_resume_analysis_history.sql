-- Store analysis results only; uploaded files and extracted resume text are never persisted.
CREATE TABLE IF NOT EXISTS resume_analyses (
  analysis_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  report_name VARCHAR(80) NOT NULL,
  source_type ENUM('pasted_text', 'text_file', 'pdf_file') NOT NULL DEFAULT 'pasted_text',
  role_name VARCHAR(120) NOT NULL,
  match_percentage TINYINT UNSIGNED NOT NULL,
  analysis_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_resume_analyses_user_created (user_id, created_at, analysis_id),
  CONSTRAINT fk_resume_analysis_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
