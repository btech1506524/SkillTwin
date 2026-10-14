-- Role-driven skill catalogue. This migration is additive and safe to rerun.
-- Keep each skill in skills once; role relevance lives in career_role_skills.

SET @role_skill_required_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'career_role_skills'
    AND COLUMN_NAME = 'is_required'
);
SET @role_skill_required_sql = IF(@role_skill_required_exists = 0,
  'ALTER TABLE career_role_skills ADD COLUMN is_required BOOLEAN NOT NULL DEFAULT TRUE AFTER required_level',
  'SELECT 1');
PREPARE role_skill_required_stmt FROM @role_skill_required_sql;
EXECUTE role_skill_required_stmt;
DEALLOCATE PREPARE role_skill_required_stmt;

INSERT INTO skills (skill_name, category, description) VALUES
  ('Programming Fundamentals', 'common', 'Variables, control flow, functions, and writing clear programs.'),
  ('Data Structures & Algorithms', 'common', 'Core data structures, algorithm design, and complexity analysis.'),
  ('Object-Oriented Programming (Java/C++)', 'common', 'Classes, interfaces, composition, and object-oriented design.'),
  ('DBMS & SQL Queries', 'common', 'Relational data modeling, SQL, and database fundamentals.'),
  ('Operating Systems & Linux', 'common', 'Processes, memory, filesystems, and command-line Linux.'),
  ('Computer Networks', 'common', 'Networking layers, HTTP, DNS, and communication fundamentals.'),
  ('Git and GitHub', 'common', 'Version control, branches, commits, and collaboration workflows.'),
  ('Problem Solving', 'common', 'Breaking down technical problems and evaluating solutions.'),
  ('Communication', 'soft', 'Explaining ideas clearly in writing and conversation.'),
  ('Teamwork', 'soft', 'Working constructively with others toward a shared outcome.'),
  ('Critical Thinking', 'soft', 'Evaluating evidence and reasoning through trade-offs.'),
  ('Time Management', 'soft', 'Planning and prioritizing work reliably.'),
  ('Adaptability', 'soft', 'Learning new approaches and responding to changing needs.'),
  ('Presentation Skills', 'soft', 'Presenting technical work to an audience.'),
  ('Technical Documentation', 'soft', 'Writing useful technical guides and project notes.'),
  ('HTML', 'core', 'Semantic markup for accessible web pages.'),
  ('CSS', 'core', 'Responsive layouts, styling, and modern CSS fundamentals.'),
  ('JavaScript', 'core', 'Browser and server-side JavaScript fundamentals.'),
  ('Responsive Design', 'core', 'Building interfaces that adapt to different devices.'),
  ('Web Accessibility', 'core', 'Designing and testing interfaces for inclusive access.'),
  ('Frontend Testing', 'core', 'Testing user interfaces and browser behavior.'),
  ('Node.js and Express.js', 'core', 'Building server applications and APIs with Node.js.'),
  ('REST APIs', 'core', 'Designing and consuming resource-oriented HTTP APIs.'),
  ('Database Design', 'core', 'Modeling data and designing reliable relational schemas.'),
  ('Authentication and Authorization', 'core', 'Protecting accounts and enforcing access controls.'),
  ('API Testing', 'core', 'Verifying API behavior, errors, and edge cases.'),
  ('Backend Security', 'core', 'Securing server-side applications and sensitive data.'),
  ('React.js & Frontend', 'core', 'Building component-based user interfaces with React.'),
  ('Cloud Platforms & Deployment', 'specialized', 'Deploying applications to cloud hosting platforms.'),
  ('Docker and Containers', 'specialized', 'Packaging and running applications in containers.'),
  ('CI/CD', 'specialized', 'Automating builds, checks, and application delivery.'),
  ('System Design Fundamentals', 'specialized', 'Designing scalable services and system components.'),
  ('Python', 'core', 'Python programming for applications, automation, and analysis.'),
  ('Statistics & Data Analysis', 'core', 'Statistical reasoning and analytical methods.'),
  ('Data Cleaning', 'core', 'Validating, transforming, and preparing datasets.'),
  ('Data Visualization', 'core', 'Communicating findings with clear visual representations.'),
  ('Excel and Spreadsheets', 'core', 'Analyzing and organizing data in spreadsheets.'),
  ('Power BI and Tableau', 'specialized', 'Building interactive business intelligence reports.'),
  ('Linear Algebra Fundamentals', 'core', 'Vectors, matrices, and linear algebra for machine learning.'),
  ('Machine Learning', 'core', 'Supervised and unsupervised learning methods.'),
  ('Data Preprocessing', 'core', 'Preparing input data for modeling and analysis.'),
  ('Model Evaluation', 'core', 'Measuring model quality and validating generalization.'),
  ('Machine Learning Libraries', 'specialized', 'Using established Python libraries for machine learning.'),
  ('Web Security', 'core', 'Recognizing and preventing common web application vulnerabilities.'),
  ('Cryptography Fundamentals', 'core', 'Using cryptographic concepts and primitives safely.'),
  ('Vulnerability Assessment', 'core', 'Identifying, documenting, and prioritizing vulnerabilities.'),
  ('Security Principles', 'core', 'Applying least privilege, defense in depth, and secure design.'),
  ('Operating-System Security', 'core', 'Hardening operating systems and understanding host security.')
ON DUPLICATE KEY UPDATE
  category = VALUES(category), description = VALUES(description);

-- Fold common legacy aliases into the canonical skill rows instead of keeping
-- duplicate versions of SQL, React, OOP, and DSA. Student ratings are merged
-- by retaining the stronger reported score and experience value.
DROP TEMPORARY TABLE IF EXISTS tmp_skill_aliases;
CREATE TEMPORARY TABLE tmp_skill_aliases (
  old_name VARCHAR(160) NOT NULL PRIMARY KEY,
  canonical_name VARCHAR(160) NOT NULL
);
INSERT INTO tmp_skill_aliases (old_name, canonical_name) VALUES
  ('Data Structures and Algorithms', 'Data Structures & Algorithms'),
  ('C++', 'Object-Oriented Programming (Java/C++)'),
  ('Java', 'Object-Oriented Programming (Java/C++)'),
  ('React', 'React.js & Frontend'),
  ('SQL', 'DBMS & SQL Queries');

INSERT INTO user_skills (user_id, skill_id, proficiency_level, proficiency_score, years_experience)
SELECT us.user_id, canonical.skill_id,
       CASE WHEN us.proficiency_score >= 100 THEN 'Expert'
            WHEN us.proficiency_score >= 75 THEN 'Advanced'
            WHEN us.proficiency_score >= 50 THEN 'Intermediate' ELSE 'Beginner' END,
       us.proficiency_score, us.years_experience
FROM user_skills us
JOIN skills legacy ON legacy.skill_id = us.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name
JOIN skills canonical ON canonical.skill_name = alias.canonical_name
ON DUPLICATE KEY UPDATE
  proficiency_score = GREATEST(user_skills.proficiency_score, VALUES(proficiency_score)),
  proficiency_level = CASE
    WHEN GREATEST(user_skills.proficiency_score, VALUES(proficiency_score)) >= 100 THEN 'Expert'
    WHEN GREATEST(user_skills.proficiency_score, VALUES(proficiency_score)) >= 75 THEN 'Advanced'
    WHEN GREATEST(user_skills.proficiency_score, VALUES(proficiency_score)) >= 50 THEN 'Intermediate'
    ELSE 'Beginner' END,
  years_experience = GREATEST(user_skills.years_experience, VALUES(years_experience));

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT mapping.role_id, canonical.skill_id, mapping.required_level, mapping.is_required, mapping.importance
FROM career_role_skills mapping
JOIN skills legacy ON legacy.skill_id = mapping.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name
JOIN skills canonical ON canonical.skill_name = alias.canonical_name
ON DUPLICATE KEY UPDATE
  required_level = IF(FIELD(VALUES(required_level), 'Beginner', 'Intermediate', 'Advanced', 'Expert') >
                      FIELD(career_role_skills.required_level, 'Beginner', 'Intermediate', 'Advanced', 'Expert'),
                      VALUES(required_level), career_role_skills.required_level),
  is_required = GREATEST(career_role_skills.is_required, VALUES(is_required)),
  importance = IF(FIELD(VALUES(importance), 'Low', 'Medium', 'High', 'Critical') >
                   FIELD(career_role_skills.importance, 'Low', 'Medium', 'High', 'Critical'),
                   VALUES(importance), career_role_skills.importance);

UPDATE roadmap_milestones milestone
JOIN skills legacy ON legacy.skill_id = milestone.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name
JOIN skills canonical ON canonical.skill_name = alias.canonical_name
SET milestone.skill_id = canonical.skill_id;
UPDATE assessments assessment
JOIN skills legacy ON legacy.skill_id = assessment.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name
JOIN skills canonical ON canonical.skill_name = alias.canonical_name
SET assessment.skill_id = canonical.skill_id;
DELETE user_skill FROM user_skills user_skill
JOIN skills legacy ON legacy.skill_id = user_skill.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name;
DELETE mapping FROM career_role_skills mapping
JOIN skills legacy ON legacy.skill_id = mapping.skill_id
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name;
DELETE legacy FROM skills legacy
JOIN tmp_skill_aliases alias ON alias.old_name = legacy.skill_name;
DROP TEMPORARY TABLE tmp_skill_aliases;

INSERT INTO career_roles (role_name, description, demand_level) VALUES
  ('Cybersecurity Engineer', 'Protects systems and applications through secure design, testing, and incident readiness.', 'High')
ON DUPLICATE KEY UPDATE description = VALUES(description), demand_level = VALUES(demand_level);

-- Normalize legacy catalog categories while retaining their existing skill IDs.
UPDATE skills SET category = 'common' WHERE skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)',
  'DBMS & SQL Queries', 'Operating Systems & Linux', 'Computer Networks',
  'Programming Fundamentals', 'Git and GitHub', 'Problem Solving'
);
UPDATE skills SET category = 'soft' WHERE skill_name IN (
  'Communication', 'Teamwork', 'Critical Thinking', 'Time Management', 'Adaptability',
  'Presentation Skills', 'Technical Documentation'
);

-- Common skills appear in each role configuration but remain one shared skill row.
INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('Data Structures & Algorithms', 'DBMS & SQL Queries') THEN 'Intermediate' ELSE 'Beginner' END,
       TRUE,
       CASE WHEN s.skill_name IN ('Data Structures & Algorithms', 'DBMS & SQL Queries', 'Programming Fundamentals') THEN 'High' ELSE 'Medium' END
FROM career_roles r
JOIN skills s ON s.skill_name IN (
  'Programming Fundamentals', 'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)',
  'DBMS & SQL Queries', 'Operating Systems & Linux', 'Computer Networks', 'Git and GitHub', 'Problem Solving'
)
WHERE r.role_name IN ('Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI / ML Engineer', 'Data Analyst', 'Cybersecurity Engineer')
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

-- Shared soft skills are available for each role but are optional.
INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id, 'Intermediate', FALSE, 'Low'
FROM career_roles r JOIN skills s ON s.category = 'soft'
WHERE r.role_name IN ('Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI / ML Engineer', 'Data Analyst', 'Cybersecurity Engineer')
ON DUPLICATE KEY UPDATE is_required = FALSE, importance = 'Low';

-- Role-specific skill maps. Existing role mappings are updated in place; optional
-- skills are visible in the picker but do not affect readiness or skill gaps.
INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('HTML', 'CSS', 'JavaScript', 'React.js & Frontend') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Responsive Design', 'Web Accessibility', 'Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'),
       CASE WHEN s.skill_name IN ('HTML', 'CSS', 'JavaScript', 'React.js & Frontend') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'HTML', 'CSS', 'JavaScript', 'React.js & Frontend', 'Responsive Design', 'Web Accessibility',
  'Frontend Testing', 'Git, Docker & CI/CD', 'Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Frontend Developer'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('Node.js and Express.js', 'REST APIs', 'Database Design', 'Authentication and Authorization') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'),
       CASE WHEN s.skill_name IN ('Node.js and Express.js', 'REST APIs', 'Database Design') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Node.js and Express.js', 'REST APIs', 'Database Design', 'Authentication and Authorization',
  'API Testing', 'Backend Security', 'Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Backend Developer'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('HTML', 'CSS', 'JavaScript', 'React.js & Frontend', 'Node.js and Express.js', 'REST APIs', 'DBMS & SQL Queries') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Web Accessibility', 'Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'),
       CASE WHEN s.skill_name IN ('React.js & Frontend', 'Node.js and Express.js', 'REST APIs', 'DBMS & SQL Queries') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'HTML', 'CSS', 'JavaScript', 'React.js & Frontend', 'Node.js and Express.js', 'REST APIs', 'DBMS & SQL Queries',
  'Database Design', 'Authentication and Authorization', 'Frontend Testing', 'Web Accessibility', 'API Testing',
  'Backend Security', 'Docker and Containers', 'CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Full Stack Developer'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('Python', 'Statistics & Data Analysis', 'Data Cleaning', 'Data Visualization', 'Excel and Spreadsheets', 'DBMS & SQL Queries') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Power BI and Tableau', 'Machine Learning Libraries', 'Cloud Platforms & Deployment'),
       CASE WHEN s.skill_name IN ('DBMS & SQL Queries', 'Statistics & Data Analysis', 'Data Cleaning', 'Data Visualization') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Python', 'Statistics & Data Analysis', 'Data Cleaning', 'Data Visualization', 'Excel and Spreadsheets',
  'Power BI and Tableau', 'DBMS & SQL Queries', 'Git and GitHub', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Data Analyst'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('Python', 'Statistics & Data Analysis', 'Machine Learning', 'Data Preprocessing', 'Model Evaluation') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Machine Learning Libraries', 'Cloud Platforms & Deployment', 'Docker and Containers', 'CI/CD'),
       CASE WHEN s.skill_name IN ('Machine Learning', 'Statistics & Data Analysis', 'Model Evaluation') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Python', 'Statistics & Data Analysis', 'Linear Algebra Fundamentals', 'Machine Learning',
  'Data Preprocessing', 'Model Evaluation', 'Machine Learning Libraries', 'Cloud Platforms & Deployment', 'Docker and Containers', 'CI/CD'
)
WHERE r.role_name = 'AI / ML Engineer'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id,
       CASE WHEN s.skill_name IN ('Computer Networks', 'Operating-System Security', 'Security Principles', 'Web Security') THEN 'Intermediate' ELSE 'Beginner' END,
       s.skill_name NOT IN ('Cryptography Fundamentals', 'Vulnerability Assessment', 'Docker and Containers', 'CI/CD', 'Cloud Platforms & Deployment'),
       CASE WHEN s.skill_name IN ('Web Security', 'Security Principles', 'Computer Networks') THEN 'High' ELSE 'Medium' END
FROM career_roles r JOIN skills s ON s.skill_name IN (
  'Computer Networks', 'Operating-System Security', 'Security Principles', 'Web Security',
  'Cryptography Fundamentals', 'Vulnerability Assessment', 'Docker and Containers', 'CI/CD', 'Cloud Platforms & Deployment'
)
WHERE r.role_name = 'Cybersecurity Engineer'
ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), is_required = VALUES(is_required), importance = VALUES(importance);

-- Use a canonical category vocabulary for all remaining legacy rows.
UPDATE skills SET category = 'specialized'
WHERE category NOT IN ('common', 'core', 'soft', 'specialized')
  AND skill_name IN ('Git, Docker & CI/CD', 'System Design Fundamentals', 'Cloud Platforms & Deployment');
UPDATE skills SET category = 'core'
WHERE category NOT IN ('common', 'core', 'soft', 'specialized');
