CREATE TABLE IF NOT EXISTS saved_career_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  KEY idx_saved_career_roles_role (role_id),
  CONSTRAINT fk_saved_career_roles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_career_roles_role
    FOREIGN KEY (role_id) REFERENCES career_roles(role_id) ON DELETE CASCADE
);
