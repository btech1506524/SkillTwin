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
