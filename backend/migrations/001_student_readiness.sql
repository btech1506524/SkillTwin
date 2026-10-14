USE skilltwin;

DELIMITER //
CREATE PROCEDURE migrate_student_readiness_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'semester'
  ) THEN
    ALTER TABLE users ADD COLUMN semester TINYINT UNSIGNED NOT NULL DEFAULT 5 AFTER branch;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'target_role'
  ) THEN
    ALTER TABLE users ADD COLUMN target_role VARCHAR(120) NOT NULL DEFAULT 'Software Developer' AFTER semester;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'cgpa'
  ) THEN
    ALTER TABLE users ADD COLUMN cgpa DECIMAL(3,2) NULL AFTER target_role;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'readiness_score'
  ) THEN
    ALTER TABLE users ADD COLUMN readiness_score TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER cgpa;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'user_skills' AND index_name = 'uq_user_skill'
  ) THEN
    ALTER TABLE user_skills ADD UNIQUE KEY uq_user_skill (user_id, skill_id);
  END IF;
END//
DELIMITER ;

CALL migrate_student_readiness_columns();
DROP PROCEDURE migrate_student_readiness_columns;
