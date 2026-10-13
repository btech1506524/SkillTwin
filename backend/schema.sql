CREATE DATABASE IF NOT EXISTS skilltwin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skilltwin;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
  skill_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_skill_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level VARCHAR(24) NOT NULL DEFAULT 'Beginner',
  proficiency_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  years_experience DECIMAL(4,1) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_skill (user_id, skill_id),
  CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_roles (
  role_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  average_salary DECIMAL(12,2) NULL,
  demand_level VARCHAR(24) NULL
);

CREATE TABLE IF NOT EXISTS career_role_skills (
  role_id INT NOT NULL,
  skill_id INT NOT NULL,
  required_level VARCHAR(24) NOT NULL DEFAULT 'Intermediate',
  importance ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  PRIMARY KEY (role_id, skill_id),
  FOREIGN KEY (role_id) REFERENCES career_roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmaps (
  roadmap_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  roadmap_title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'Not Started',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES career_roles(role_id)
);

CREATE TABLE IF NOT EXISTS user_milestones (
  milestone_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
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
('System Design Fundamentals', 'Architecture'),
('HTML', 'Frontend'),
('CSS', 'Frontend'),
('JavaScript', 'Frontend'),
('Machine Learning', 'AI / ML'),
('Statistics & Data Analysis', 'Analytics'),
('Cloud Platforms & Deployment', 'DevOps');

INSERT IGNORE INTO career_roles (role_name, description, demand_level) VALUES
('Software Developer', 'Core software engineering and computer science fundamentals.', 'High'),
('Frontend Developer', 'Modern browser application development.', 'High'),
('Backend Developer', 'APIs, data, and server-side systems.', 'High'),
('Full Stack Developer', 'End-to-end web product development.', 'High'),
('AI / ML Engineer', 'Applied machine learning and AI engineering.', 'High'),
('Data Analyst', 'Data preparation, querying, and analysis.', 'High');

DELETE FROM career_role_skills;

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE
    WHEN s.skill_name IN ('Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries') THEN 'Advanced'
    WHEN s.skill_name IN ('Operating Systems & Linux', 'Computer Networks') THEN 'Intermediate'
    WHEN s.skill_name IN ('React.js & Frontend', 'Node.js & REST APIs', 'Git, Docker & CI/CD', 'System Design Fundamentals') THEN 'Intermediate'
    ELSE 'Beginner'
  END,
  CASE WHEN s.skill_name IN ('Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries') THEN 'Critical' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries',
  'Operating Systems & Linux', 'Computer Networks', 'React.js & Frontend', 'Node.js & REST APIs',
  'Git, Docker & CI/CD', 'System Design Fundamentals'
)
WHERE r.role_name = 'Software Developer';

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.skill_name IN ('React.js & Frontend', 'HTML', 'CSS', 'JavaScript') THEN 'Advanced'
       WHEN s.skill_name IN ('Object-Oriented Programming (Java/C++)', 'Git, Docker & CI/CD', 'System Design Fundamentals') THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('React.js & Frontend', 'HTML', 'CSS', 'JavaScript') THEN 'Critical' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'React.js & Frontend',
  'Git, Docker & CI/CD', 'System Design Fundamentals', 'HTML', 'CSS', 'JavaScript'
)
WHERE r.role_name = 'Frontend Developer';

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.skill_name IN ('Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries',
                              'Operating Systems & Linux', 'Computer Networks', 'Node.js & REST APIs', 'Git, Docker & CI/CD',
                              'System Design Fundamentals') THEN 'Advanced'
       WHEN s.skill_name = 'Cloud Platforms & Deployment' THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('Node.js & REST APIs', 'DBMS & SQL Queries', 'System Design Fundamentals') THEN 'Critical' ELSE 'High' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries',
  'Operating Systems & Linux', 'Computer Networks', 'Node.js & REST APIs', 'Git, Docker & CI/CD',
  'System Design Fundamentals', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Backend Developer';

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.skill_name IN ('DBMS & SQL Queries', 'React.js & Frontend', 'Node.js & REST APIs') THEN 'Advanced'
       WHEN s.skill_name IN ('Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'Git, Docker & CI/CD',
                              'System Design Fundamentals', 'HTML', 'CSS', 'JavaScript', 'Cloud Platforms & Deployment') THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('React.js & Frontend', 'Node.js & REST APIs', 'DBMS & SQL Queries') THEN 'Critical' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries',
  'React.js & Frontend', 'Node.js & REST APIs', 'Git, Docker & CI/CD', 'System Design Fundamentals',
  'HTML', 'CSS', 'JavaScript', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Full Stack Developer';

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.skill_name IN ('Data Structures & Algorithms', 'Machine Learning', 'Statistics & Data Analysis') THEN 'Advanced'
       WHEN s.skill_name IN ('Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries', 'Operating Systems & Linux') THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('Machine Learning', 'Statistics & Data Analysis', 'Data Structures & Algorithms') THEN 'Critical' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries',
  'Operating Systems & Linux', 'Python', 'Machine Learning', 'Statistics & Data Analysis'
)
WHERE r.role_name = 'AI / ML Engineer';

INSERT INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id,
  CASE WHEN s.skill_name IN ('DBMS & SQL Queries', 'Statistics & Data Analysis') THEN 'Advanced'
       WHEN s.skill_name IN ('Python', 'Data Structures & Algorithms') THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('DBMS & SQL Queries', 'Statistics & Data Analysis') THEN 'Critical' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'DBMS & SQL Queries', 'Python', 'Statistics & Data Analysis',
  'Data Structures & Algorithms', 'Git, Docker & CI/CD'
)
WHERE r.role_name = 'Data Analyst';
