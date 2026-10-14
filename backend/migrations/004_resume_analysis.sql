-- Ensure AI / ML resume analysis includes the Python requirement on upgraded databases.
INSERT IGNORE INTO skills (skill_name, category)
VALUES ('Python', 'AI / ML');

INSERT IGNORE INTO career_role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id, 'Intermediate', 'High'
FROM career_roles r
JOIN skills s ON s.skill_name = 'Python'
WHERE r.role_name = 'AI / ML Engineer';
