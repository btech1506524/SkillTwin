-- Expand the role catalogue for profile selection and role-fit comparisons.
-- Keep this insert idempotent so it can be safely retried after a partial run.
INSERT INTO career_roles (role_name, description, demand_level) VALUES
  ('Cybersecurity Engineer', 'Protects systems and applications through secure design, testing, and incident readiness.', 'High'),
  ('DevOps Engineer', 'Automates software delivery and improves the reliability of deployed services.', 'High'),
  ('Cloud Engineer', 'Designs and operates secure, resilient cloud infrastructure.', 'High'),
  ('Data Engineer', 'Builds reliable systems for collecting, transforming, and serving data.', 'High'),
  ('QA Automation Engineer', 'Plans and automates quality checks across user interfaces and APIs.', 'High'),
  ('Mobile App Developer', 'Builds and ships applications for mobile platforms.', 'High'),
  ('UX/UI Designer', 'Researches user needs and designs usable, accessible digital interfaces.', 'High'),
  ('Data Scientist', 'Uses statistical reasoning and machine learning to answer data questions.', 'High')
ON DUPLICATE KEY UPDATE description = VALUES(description), demand_level = VALUES(demand_level);

INSERT INTO skills (skill_name, category, description) VALUES
  ('Programming Fundamentals', 'common', 'Variables, control flow, functions, and writing clear programs.'),
  ('Git and GitHub', 'common', 'Version control, branches, commits, and collaboration workflows.'),
  ('Data Structures & Algorithms', 'common', 'Core data structures, algorithm design, and complexity analysis.'),
  ('Object-Oriented Programming (Java/C++)', 'common', 'Classes, interfaces, composition, and object-oriented design.'),
  ('DBMS & SQL Queries', 'common', 'Relational data modeling, SQL, and database fundamentals.'),
  ('Operating Systems & Linux', 'common', 'Processes, memory, filesystems, and command-line Linux.'),
  ('Computer Networks', 'common', 'Networking layers, HTTP, DNS, and communication fundamentals.'),
  ('Problem Solving', 'common', 'Breaking down technical problems and evaluating solutions.'),
  ('Communication', 'soft', 'Explaining ideas clearly in writing and conversation.'),
  ('Teamwork', 'soft', 'Working constructively with others toward a shared outcome.'),
  ('Critical Thinking', 'soft', 'Evaluating evidence and reasoning through trade-offs.'),
  ('Time Management', 'soft', 'Planning and prioritizing work reliably.'),
  ('Adaptability', 'soft', 'Learning new approaches and responding to changing needs.'),
  ('Presentation Skills', 'soft', 'Presenting technical work to an audience.'),
  ('Technical Documentation', 'soft', 'Writing useful technical guides and project notes.'),
  ('Web Accessibility', 'core', 'Designing and testing interfaces for inclusive access.'),
  ('API Testing', 'core', 'Verifying API behavior, errors, and edge cases.'),
  ('Authentication and Authorization', 'core', 'Protecting accounts and enforcing access controls.'),
  ('Backend Security', 'core', 'Securing server-side applications and sensitive data.'),
  ('Data Cleaning', 'core', 'Validating, transforming, and preparing datasets.'),
  ('Data Preprocessing', 'core', 'Preparing input data for modeling and analysis.'),
  ('Data Visualization', 'core', 'Communicating findings with clear visual representations.'),
  ('Database Design', 'core', 'Modeling data and designing reliable relational schemas.'),
  ('Excel and Spreadsheets', 'core', 'Analyzing and organizing data in spreadsheets.'),
  ('Frontend Testing', 'core', 'Testing user interfaces and browser behavior.'),
  ('Model Evaluation', 'core', 'Measuring model quality and validating generalization.'),
  ('Linear Algebra Fundamentals', 'core', 'Vectors, matrices, and linear algebra for machine learning.'),
  ('Machine Learning Libraries', 'specialized', 'Using established Python libraries for machine learning.'),
  ('Node.js and Express.js', 'core', 'Building server applications and APIs with Node.js.'),
  ('Power BI and Tableau', 'specialized', 'Building interactive business intelligence reports.'),
  ('REST APIs', 'core', 'Designing and consuming resource-oriented HTTP APIs.'),
  ('Responsive Design', 'core', 'Building interfaces that adapt to different devices.'),
  ('Statistics & Data Analysis', 'core', 'Statistical reasoning and analytical methods.'),
  ('Python', 'core', 'Python programming for applications, automation, and analysis.'),
  ('Machine Learning', 'core', 'Supervised and unsupervised learning methods.'),
  ('Security Principles', 'core', 'Least privilege, defense in depth, and secure design.'),
  ('Web Security', 'core', 'Recognizing and preventing common web application vulnerabilities.'),
  ('Operating-System Security', 'core', 'Hardening operating systems and understanding host security.'),
  ('Cryptography Fundamentals', 'core', 'Core cryptographic concepts and safe use of established primitives.'),
  ('Vulnerability Assessment', 'core', 'Finding, documenting, and prioritizing security weaknesses.'),
  ('Identity and Access Management', 'core', 'Designing identity, role, and permission controls.'),
  ('Docker and Containers', 'specialized', 'Packaging and running applications in containers.'),
  ('CI/CD', 'specialized', 'Automating builds, checks, and application delivery.'),
  ('Infrastructure as Code', 'specialized', 'Provisioning infrastructure from reviewable, repeatable definitions.'),
  ('Monitoring and Observability', 'specialized', 'Using metrics, logs, and traces to understand service health.'),
  ('Scripting and Automation', 'specialized', 'Automating repeatable operational tasks with scripts.'),
  ('Cloud Architecture', 'specialized', 'Selecting cloud services and designing reliable cloud systems.'),
  ('Cloud Networking', 'specialized', 'Configuring cloud networks, routes, and service boundaries.'),
  ('Cloud Cost Management', 'specialized', 'Measuring and controlling cloud resource costs.'),
  ('Data Encryption and Storage', 'specialized', 'Choosing storage and protecting data at rest and in transit.'),
  ('Data Pipelines and ETL', 'core', 'Ingesting, transforming, validating, and serving data.'),
  ('Data Warehousing', 'specialized', 'Modeling analytical data for reliable querying.'),
  ('Distributed Data Processing', 'specialized', 'Processing large datasets across parallel systems.'),
  ('Data Quality', 'core', 'Checking datasets for completeness, consistency, and validity.'),
  ('Cloud Data Services', 'specialized', 'Using managed services to store and process data.'),
  ('Test Design', 'core', 'Turning product requirements and risks into useful test cases.'),
  ('Test Automation', 'core', 'Writing stable automated checks for software behavior.'),
  ('Quality Reporting', 'core', 'Summarizing test evidence, product risk, and release confidence.'),
  ('Kotlin or Swift', 'core', 'Programming with a primary native mobile language.'),
  ('Mobile Development Fundamentals', 'core', 'Understanding mobile application structure and lifecycle.'),
  ('Mobile UI and Navigation', 'core', 'Building mobile interfaces and navigation flows.'),
  ('API Integration', 'core', 'Connecting a client application to remote service APIs.'),
  ('Mobile App Testing', 'core', 'Testing mobile behavior across devices and application states.'),
  ('App Release and Store Publishing', 'specialized', 'Preparing signed builds and managing release metadata.'),
  ('User Research', 'core', 'Gathering and interpreting evidence about user needs.'),
  ('Interaction Design', 'core', 'Designing understandable controls, feedback, and task flows.'),
  ('Wireframing and Prototyping', 'core', 'Communicating and testing interface structure before implementation.'),
  ('Usability Testing', 'core', 'Evaluating how effectively people can complete tasks.'),
  ('Design Systems', 'specialized', 'Maintaining reusable interface patterns and design tokens.'),
  ('Visual Design Foundations', 'core', 'Applying hierarchy, typography, spacing, and color consistently.'),
  ('Statistical Modeling', 'core', 'Selecting and interpreting statistical models for data questions.'),
  ('Feature Engineering', 'core', 'Creating and validating model features from source data.'),
  ('Experiment Tracking', 'specialized', 'Recording model inputs, parameters, and evaluation results.'),
  ('Data Storytelling', 'core', 'Explaining analytical results, uncertainty, and implications.')
ON DUPLICATE KEY UPDATE category = VALUES(category), description = VALUES(description);

UPDATE skills SET category = 'common' WHERE skill_name IN (
  'Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)',
  'DBMS & SQL Queries', 'Operating Systems & Linux', 'Computer Networks',
  'Programming Fundamentals', 'Git and GitHub', 'Problem Solving'
);
UPDATE skills SET category = 'soft' WHERE skill_name IN (
  'Communication', 'Teamwork', 'Critical Thinking', 'Time Management', 'Adaptability',
  'Presentation Skills', 'Technical Documentation'
);

-- New roles receive the same shared foundations as existing roles. Keep any
-- stronger role-specific level already assigned by the mapping below.
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
WHERE r.role_name IN (
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI / ML Engineer', 'Data Analyst', 'Cybersecurity Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Data Engineer', 'QA Automation Engineer', 'Mobile App Developer',
  'UX/UI Designer', 'Data Scientist'
)
ON DUPLICATE KEY UPDATE
  required_level = IF(FIELD(VALUES(required_level), 'Beginner', 'Intermediate', 'Advanced', 'Expert') >
                      FIELD(career_role_skills.required_level, 'Beginner', 'Intermediate', 'Advanced', 'Expert'),
                      VALUES(required_level), career_role_skills.required_level),
  is_required = TRUE,
  importance = IF(FIELD(VALUES(importance), 'Low', 'Medium', 'High', 'Critical') >
                  FIELD(career_role_skills.importance, 'Low', 'Medium', 'High', 'Critical'),
                  VALUES(importance), career_role_skills.importance);

-- Soft skills are visible on every role without inflating skill-gap scores.
INSERT IGNORE INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id, 'Intermediate', FALSE, 'Low'
FROM career_roles r JOIN skills s ON s.category = 'soft'
WHERE r.role_name IN (
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI / ML Engineer', 'Data Analyst', 'Cybersecurity Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Data Engineer', 'QA Automation Engineer', 'Mobile App Developer',
  'UX/UI Designer', 'Data Scientist'
);

INSERT INTO career_role_skills (role_id, skill_id, required_level, is_required, importance)
SELECT r.role_id, s.skill_id, m.required_level, m.is_required, m.importance
FROM (
  SELECT 'Cybersecurity Engineer' AS role_name, 'Programming Fundamentals' AS skill_name, 'Beginner' AS required_level, TRUE AS is_required, 'Medium' AS importance
  UNION ALL SELECT 'Cybersecurity Engineer', 'Operating Systems & Linux', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Computer Networks', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Security Principles', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Web Security', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Operating-System Security', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Cryptography Fundamentals', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Vulnerability Assessment', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cybersecurity Engineer', 'Identity and Access Management', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Operating Systems & Linux', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Computer Networks', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Git and GitHub', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Docker and Containers', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'DevOps Engineer', 'CI/CD', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'DevOps Engineer', 'Infrastructure as Code', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Cloud Platforms & Deployment', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Monitoring and Observability', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'DevOps Engineer', 'Scripting and Automation', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cloud Engineer', 'Computer Networks', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cloud Engineer', 'Cloud Architecture', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Cloud Engineer', 'Cloud Networking', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cloud Engineer', 'Identity and Access Management', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'Cloud Engineer', 'Infrastructure as Code', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cloud Engineer', 'Monitoring and Observability', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Cloud Engineer', 'Cloud Cost Management', 'Beginner', TRUE, 'Medium'
  UNION ALL SELECT 'Cloud Engineer', 'Data Encryption and Storage', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'Python', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'DBMS & SQL Queries', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Data Engineer', 'Data Pipelines and ETL', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Data Engineer', 'Data Warehousing', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'Distributed Data Processing', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'Data Quality', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'Cloud Data Services', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Engineer', 'Git and GitHub', 'Intermediate', TRUE, 'Medium'
  UNION ALL SELECT 'QA Automation Engineer', 'Programming Fundamentals', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'QA Automation Engineer', 'JavaScript', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'QA Automation Engineer', 'Test Design', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'QA Automation Engineer', 'Test Automation', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'QA Automation Engineer', 'API Testing', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'QA Automation Engineer', 'CI/CD', 'Beginner', TRUE, 'Medium'
  UNION ALL SELECT 'QA Automation Engineer', 'Quality Reporting', 'Beginner', TRUE, 'Medium'
  UNION ALL SELECT 'Mobile App Developer', 'Programming Fundamentals', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Mobile App Developer', 'Kotlin or Swift', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Mobile App Developer', 'Mobile Development Fundamentals', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Mobile App Developer', 'Mobile UI and Navigation', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Mobile App Developer', 'API Integration', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Mobile App Developer', 'Mobile App Testing', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Mobile App Developer', 'App Release and Store Publishing', 'Beginner', TRUE, 'Medium'
  UNION ALL SELECT 'UX/UI Designer', 'User Research', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'UX/UI Designer', 'Interaction Design', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'UX/UI Designer', 'Wireframing and Prototyping', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'UX/UI Designer', 'Usability Testing', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'UX/UI Designer', 'Design Systems', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'UX/UI Designer', 'Web Accessibility', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'UX/UI Designer', 'Visual Design Foundations', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Python', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Statistics & Data Analysis', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Data Scientist', 'Statistical Modeling', 'Intermediate', TRUE, 'Critical'
  UNION ALL SELECT 'Data Scientist', 'Data Cleaning', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Feature Engineering', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Machine Learning', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Model Evaluation', 'Advanced', TRUE, 'Critical'
  UNION ALL SELECT 'Data Scientist', 'Experiment Tracking', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Data Storytelling', 'Intermediate', TRUE, 'High'
  UNION ALL SELECT 'Data Scientist', 'Linear Algebra Fundamentals', 'Intermediate', TRUE, 'Medium'
) AS m
JOIN career_roles r ON r.role_name = m.role_name
JOIN skills s ON s.skill_name = m.skill_name
ON DUPLICATE KEY UPDATE
  required_level = VALUES(required_level),
  is_required = VALUES(is_required),
  importance = VALUES(importance);
