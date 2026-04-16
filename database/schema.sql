CREATE DATABASE IF NOT EXISTS batch_counselling_system;
USE batch_counselling_system;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'counsellor', 'student') NOT NULL,
  department VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS counsellors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(120),
  experience_years INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  type ENUM('Regular Batch', 'Remedial Batch', 'Advanced Batch', 'Special Monitoring Batch') NOT NULL,
  capacity INT NOT NULL DEFAULT 40,
  counsellor_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL UNIQUE,
  roll_no VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  academic_score DECIMAL(5,2) DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  backlogs INT DEFAULT 0,
  interest_area ENUM('Technical', 'Non-technical') DEFAULT 'Technical',
  goal_type ENUM('Placement', 'Higher studies') DEFAULT 'Placement',
  learning_ability ENUM('Fast', 'Moderate', 'Slow') DEFAULT 'Moderate',
  behaviour_score DECIMAL(5,2) DEFAULT 50,
  current_batch_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (current_batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late') NOT NULL,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  exam_name VARCHAR(100) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  exam_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  counsellor_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  progress_rating DECIMAL(4,2) DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS counselling_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  counsellor_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  agenda TEXT,
  status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  predicted_batch ENUM('Regular Batch', 'Remedial Batch', 'Advanced Batch', 'Special Monitoring Batch') NOT NULL,
  risk_level ENUM('Low', 'Medium', 'High') NOT NULL,
  recommendation TEXT,
  score_breakdown JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_students_batch ON students(current_batch_id);
CREATE INDEX idx_students_attendance ON students(attendance_percentage);
CREATE INDEX idx_students_academic ON students(academic_score);
CREATE INDEX idx_predictions_student_date ON ai_predictions(student_id, created_at);
