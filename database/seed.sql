USE batch_counselling_system;

INSERT INTO users (name, email, password_hash, role, department)
VALUES
('Admin User', 'admin@college.edu', '$2a$10$Z0wRBCNom8u4.zAde0VsCeb9B14O5wqkqc/ezhwag9HQ3oaGUCAD2', 'admin', 'Administration'),
('Counsellor One', 'counsellor1@college.edu', '$2a$10$Z0wRBCNom8u4.zAde0VsCeb9B14O5wqkqc/ezhwag9HQ3oaGUCAD2', 'counsellor', 'CSE'),
('Counsellor Two', 'counsellor2@college.edu', '$2a$10$Z0wRBCNom8u4.zAde0VsCeb9B14O5wqkqc/ezhwag9HQ3oaGUCAD2', 'counsellor', 'ECE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO counsellors (user_id, specialization, experience_years)
SELECT id, 'Academic Mentoring', 5 FROM users WHERE email = 'counsellor1@college.edu'
ON DUPLICATE KEY UPDATE specialization = VALUES(specialization);

INSERT INTO counsellors (user_id, specialization, experience_years)
SELECT id, 'Behavioral Coaching', 7 FROM users WHERE email = 'counsellor2@college.edu'
ON DUPLICATE KEY UPDATE specialization = VALUES(specialization);

INSERT INTO batches (name, type, capacity, counsellor_id)
SELECT 'Advanced Achievers', 'Advanced Batch', 40, (SELECT id FROM users WHERE email = 'counsellor1@college.edu')
UNION ALL
SELECT 'Regular Growth', 'Regular Batch', 45, (SELECT id FROM users WHERE email = 'counsellor2@college.edu')
UNION ALL
SELECT 'Remedial Support', 'Remedial Batch', 35, (SELECT id FROM users WHERE email = 'counsellor2@college.edu')
UNION ALL
SELECT 'Special Monitoring Unit', 'Special Monitoring Batch', 30, (SELECT id FROM users WHERE email = 'counsellor1@college.edu');

INSERT INTO students
(roll_no, name, email, academic_score, attendance_percentage, backlogs, interest_area, goal_type, learning_ability, behaviour_score)
VALUES
('CSE001', 'Aarav N', 'aarav@student.edu', 86, 92, 0, 'Technical', 'Placement', 'Fast', 82),
('CSE002', 'Diya M', 'diya@student.edu', 71, 78, 1, 'Technical', 'Higher studies', 'Moderate', 74),
('CSE003', 'Rohan K', 'rohan@student.edu', 52, 63, 3, 'Non-technical', 'Placement', 'Slow', 55),
('CSE004', 'Isha P', 'isha@student.edu', 90, 96, 0, 'Technical', 'Higher studies', 'Fast', 88),
('CSE005', 'Vikram S', 'vikram@student.edu', 58, 48, 4, 'Non-technical', 'Placement', 'Slow', 46)
ON DUPLICATE KEY UPDATE name = VALUES(name);
