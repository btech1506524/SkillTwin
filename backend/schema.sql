CREATE DATABASE IF NOT EXISTS skilltwin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skilltwin;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  college VARCHAR(200) NULL,
  branch VARCHAR(160) NULL,
  semester TINYINT UNSIGNED NOT NULL DEFAULT 5,
  target_role VARCHAR(120) NOT NULL DEFAULT 'Software Developer',
  cgpa DECIMAL(3,2) NULL,
  readiness_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  graduation_year SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  skill_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_skill_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  proficiency_level VARCHAR(24) NOT NULL DEFAULT 'Beginner',
  proficiency_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  years_experience DECIMAL(4,1) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_skill (user_id, skill_id),
  CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_roles (
  role_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  average_salary DECIMAL(12,2) NULL,
  demand_level VARCHAR(24) NULL
);

CREATE TABLE IF NOT EXISTS career_role_skills (
  role_id INT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  required_level VARCHAR(24) NOT NULL DEFAULT 'Intermediate',
  importance TINYINT UNSIGNED NOT NULL DEFAULT 3,
  PRIMARY KEY (role_id, skill_id),
  FOREIGN KEY (role_id) REFERENCES career_roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmaps (
  roadmap_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  roadmap_title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'Not Started',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES career_roles(role_id)
);

CREATE TABLE IF NOT EXISTS user_milestones (
  milestone_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  milestone_key VARCHAR(80) NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_milestone (user_id, milestone_key),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT IGNORE INTO skills (skill_name, category) VALUES
('Data Structures & Algorithms', 'Core CS'),
('Object-Oriented Programming (Java/C++)', 'Core CS'),
('DBMS & SQL Queries', 'Database'),
('Operating Systems & Linux', 'Core CS'),
('Computer Networks', 'Core CS'),
('React.js & Frontend', 'Development'),
('Node.js & REST APIs', 'Development'),
('Git, Docker & CI/CD', 'DevOps'),
('System Design Fundamentals', 'Architecture');

INSERT IGNORE INTO career_roles (role_name, description, demand_level) VALUES
('Software Developer', 'Core software engineering and computer science fundamentals.', 'High'),
('Frontend Developer', 'Modern browser application development.', 'High'),
('Backend Developer', 'APIs, data, and server-side systems.', 'High'),
('Full Stack Developer', 'End-to-end web product development.', 'High'),
('AI / ML Engineer', 'Applied machine learning and AI engineering.', 'High'),
('Data Analyst', 'Data preparation, querying, and analysis.', 'High');

INSERT IGNORE INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.category IN ('Core CS', 'Architecture') THEN 'Advanced' ELSE 'Intermediate' END,
  CASE WHEN s.category IN ('Core CS', 'Development') THEN 4 ELSE 3 END
FROM career_roles r CROSS JOIN skills s;
