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
