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
  account_role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  KEY idx_users_account_role (account_role),
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
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
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
('Python', 'AI / ML'),
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
       WHEN s.skill_name IN ('Object-Oriented Programming (Java/C++)', 'DBMS & SQL Queries', 'Operating Systems & Linux', 'Python') THEN 'Intermediate'
       ELSE 'Beginner' END,
  CASE WHEN s.skill_name IN ('Machine Learning', 'Statistics & Data Analysis', 'Data Structures & Algorithms') THEN 'Critical'
       WHEN s.skill_name = 'Python' THEN 'High' ELSE 'Medium' END
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

-- Compatible with both the original SkillTwin assessment tables and a fresh install.

-- Compatible with both the original SkillTwin assessment tables and a fresh install.

-- Compatible with both the original SkillTwin assessment tables and a fresh install.

-- Compatible with both the original SkillTwin assessment tables and a fresh install.
CREATE TABLE IF NOT EXISTS assessments (
  assessment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assessment_name VARCHAR(150) NOT NULL,
  assessment_key VARCHAR(80) NULL UNIQUE,
  title VARCHAR(180) NULL,
  description TEXT NULL,
  skill_id INT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  passing_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assessment_id INT NOT NULL,
  question_key VARCHAR(80) NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500) NULL,
  option_b VARCHAR(500) NULL,
  option_c VARCHAR(500) NULL,
  option_d VARCHAR(500) NULL,
  options_json JSON NULL,
  correct_answer CHAR(1) NULL,
  correct_option_key VARCHAR(40) NULL,
  explanation TEXT NULL,
  marks DECIMAL(5,2) NOT NULL DEFAULT 1,
  points TINYINT UNSIGNED NOT NULL DEFAULT 1,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_assessment_question (assessment_id, question_key),
  CONSTRAINT fk_assessment_question_assessment FOREIGN KEY (assessment_id)
    REFERENCES assessments(assessment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_results (
  result_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  assessment_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  question_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_assessment_results_user_date (user_id, completed_at),
  CONSTRAINT fk_assessment_result_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_assessment_result_assessment FOREIGN KEY (assessment_id)
    REFERENCES assessments(assessment_id) ON DELETE CASCADE
);

-- Add the Phase 10 fields to legacy tables, retaining their rows and columns.
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessments' AND COLUMN_NAME='assessment_key')=0,
  'ALTER TABLE assessments ADD COLUMN assessment_key VARCHAR(80) NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessments' AND COLUMN_NAME='title')=0,
  'ALTER TABLE assessments ADD COLUMN title VARCHAR(180) NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessments' AND COLUMN_NAME='category')=0,
  'ALTER TABLE assessments ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT ''General''', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessments' AND COLUMN_NAME='is_active')=0,
  'ALTER TABLE assessments ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='question_key')=0,
  'ALTER TABLE assessment_questions ADD COLUMN question_key VARCHAR(80) NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='options_json')=0,
  'ALTER TABLE assessment_questions ADD COLUMN options_json JSON NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='correct_option_key')=0,
  'ALTER TABLE assessment_questions ADD COLUMN correct_option_key VARCHAR(40) NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='explanation')=0,
  'ALTER TABLE assessment_questions ADD COLUMN explanation TEXT NULL', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='points')=0,
  'ALTER TABLE assessment_questions ADD COLUMN points TINYINT UNSIGNED NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_questions' AND COLUMN_NAME='position')=0,
  'ALTER TABLE assessment_questions ADD COLUMN position SMALLINT UNSIGNED NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='assessment_results' AND COLUMN_NAME='question_count')=0,
  'ALTER TABLE assessment_results ADD COLUMN question_count SMALLINT UNSIGNED NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE migration_stmt FROM @sql; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;

UPDATE assessments
SET assessment_key = CONCAT('legacy-', assessment_id),
    title = assessment_name
WHERE assessment_key IS NULL;

UPDATE assessment_questions
SET question_key = CONCAT('legacy-q-', question_id),
    options_json = JSON_ARRAY(
      JSON_OBJECT('key','a','text',option_a), JSON_OBJECT('key','b','text',option_b),
      JSON_OBJECT('key','c','text',option_c), JSON_OBJECT('key','d','text',option_d)
    ),
    correct_option_key = LOWER(correct_answer),
    explanation = COALESCE(explanation, 'Review the related concept and try another assessment attempt.'),
    points = GREATEST(1, LEAST(255, ROUND(marks))),
    position = question_id
WHERE question_key IS NULL;

-- Add the unique keys when upgrading legacy tables (fresh installs already have them).
SET @assessment_key_index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessments' AND INDEX_NAME IN ('assessment_key', 'uq_assessment_key')
);
SET @assessment_key_index_sql = IF(@assessment_key_index_exists = 0,
  'ALTER TABLE assessments ADD UNIQUE KEY uq_assessment_key (assessment_key)', 'SELECT 1');
PREPARE assessment_key_index_stmt FROM @assessment_key_index_sql;
EXECUTE assessment_key_index_stmt;
DEALLOCATE PREPARE assessment_key_index_stmt;

SET @assessment_question_index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessment_questions' AND INDEX_NAME = 'uq_assessment_question'
);
SET @assessment_question_index_sql = IF(@assessment_question_index_exists = 0,
  'ALTER TABLE assessment_questions ADD UNIQUE KEY uq_assessment_question (assessment_id, question_key)', 'SELECT 1');
PREPARE assessment_question_index_stmt FROM @assessment_question_index_sql;
EXECUTE assessment_question_index_stmt;
DEALLOCATE PREPARE assessment_question_index_stmt;

CREATE TABLE IF NOT EXISTS assessment_result_answers (
  result_answer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_key VARCHAR(40) NOT NULL,
  correct_option_key VARCHAR(40) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_awarded TINYINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_result_question (result_id, question_id),
  CONSTRAINT fk_result_answer_result FOREIGN KEY (result_id)
    REFERENCES assessment_results(result_id) ON DELETE CASCADE,
  CONSTRAINT fk_result_answer_question FOREIGN KEY (question_id)
    REFERENCES assessment_questions(question_id) ON DELETE CASCADE
);

INSERT IGNORE INTO assessments (assessment_name, assessment_key, title, description, category, total_questions)
VALUES ('Computer Science Fundamentals', 'cs-fundamentals-01', 'Computer Science Fundamentals',
        'Check your understanding of core data structures, databases, operating systems and networking.',
        'Computer Science', 10);

INSERT IGNORE INTO assessment_questions
  (assessment_id, question_key, question_text, option_a, option_b, option_c, option_d,
   options_json, correct_answer, correct_option_key, explanation, marks, points, position)
SELECT assessment_id, q.question_key, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
       JSON_ARRAY(JSON_OBJECT('key','a','text',q.option_a),JSON_OBJECT('key','b','text',q.option_b),
                  JSON_OBJECT('key','c','text',q.option_c),JSON_OBJECT('key','d','text',q.option_d)),
       q.correct_option_key, q.correct_option_key, q.explanation, 1, 1, q.position
FROM assessments
CROSS JOIN (
  SELECT 'q01' question_key, 'Which data structure is most suitable for implementing a FIFO queue?' question_text,
    'Stack' option_a,'Queue' option_b,'Binary search tree' option_c,'Heap' option_d,
    'b' correct_option_key,'A queue removes items in the same order they were added: first in, first out.' explanation,1 position
  UNION ALL SELECT 'q02','What is the average time complexity of lookup in a well-distributed hash table?','O(1)','O(log n)','O(n)','O(n log n)','a','With a good hash function and limited collisions, lookup is constant time on average.',2
  UNION ALL SELECT 'q03','Which SQL clause filters groups after aggregate functions are calculated?','WHERE','ORDER BY','HAVING','LIMIT','c','HAVING filters grouped rows after GROUP BY and aggregate calculation.',3
  UNION ALL SELECT 'q04','What does a database transaction provide when it is atomic?','All operations succeed or none are applied','Queries always run in parallel','Data is automatically encrypted','Every query returns a row','a','Atomicity means a transaction is committed as a whole or rolled back as a whole.',4
  UNION ALL SELECT 'q05','Which normal form primarily removes partial dependency on part of a composite key?','First normal form','Second normal form','Third normal form','Boyce-Codd normal form','b','Second normal form requires first normal form and removes partial dependencies on a candidate key.',5
  UNION ALL SELECT 'q06','Which CPU scheduling algorithm can cause starvation for low-priority processes?','Round robin','First come, first served','Priority scheduling','Shortest remaining time','c','A continuous stream of higher-priority processes can indefinitely delay a low-priority process.',6
  UNION ALL SELECT 'q07','What is the main purpose of virtual memory?','To let processes use a larger logical address space than physical RAM','To permanently store application files','To replace CPU registers','To remove the need for a file system','a','Virtual memory maps process address spaces to physical memory and secondary storage.',7
  UNION ALL SELECT 'q08','At which OSI layer does IP routing primarily operate?','Data link','Network','Transport','Application','b','IP addressing and packet routing are network-layer responsibilities.',8
  UNION ALL SELECT 'q09','Which transport protocol provides ordered, reliable byte-stream delivery?','UDP','IP','TCP','ARP','c','TCP provides reliable, ordered delivery using acknowledgements and retransmission.',9
  UNION ALL SELECT 'q10','What is the worst-case time complexity of binary search on a sorted array?','O(1)','O(log n)','O(n)','O(n²)','b','Each comparison halves the remaining search interval, yielding logarithmic time.',10
) q
WHERE assessment_key = 'cs-fundamentals-01';

UPDATE assessments a
SET a.total_questions = (SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id = a.assessment_id)
WHERE a.assessment_key = 'cs-fundamentals-01';
USE skilltwin;

-- Keep existing roadmap snapshots; mark newly generated snapshots as current.
SET @roadmap_current_column = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roadmaps' AND COLUMN_NAME = 'is_current'
);
SET @roadmap_current_sql = IF(@roadmap_current_column = 0,
  'ALTER TABLE roadmaps ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE roadmap_current_stmt FROM @roadmap_current_sql;
EXECUTE roadmap_current_stmt;
DEALLOCATE PREPARE roadmap_current_stmt;

CREATE TABLE IF NOT EXISTS roadmap_milestones (
  milestone_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  roadmap_id INT NOT NULL,
  skill_id INT NOT NULL,
  sequence_no SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  outcome TEXT NOT NULL,
  description TEXT NOT NULL,
  priority_score SMALLINT UNSIGNED NOT NULL,
  estimated_hours SMALLINT UNSIGNED NOT NULL,
  status ENUM('Planned', 'In Progress', 'Completed') NOT NULL DEFAULT 'Planned',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roadmap_skill (roadmap_id, skill_id),
  UNIQUE KEY uq_roadmap_sequence (roadmap_id, sequence_no),
  CONSTRAINT fk_roadmap_milestone_roadmap FOREIGN KEY (roadmap_id)
    REFERENCES roadmaps(roadmap_id) ON DELETE CASCADE,
  CONSTRAINT fk_roadmap_milestone_skill FOREIGN KEY (skill_id)
    REFERENCES skills(skill_id) ON DELETE CASCADE
);

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
