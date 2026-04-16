CREATE DATABASE IF NOT EXISTS batch_counselling_system;
CREATE USER IF NOT EXISTS 'batch_admin'@'localhost' IDENTIFIED BY '@Shan2006';
CREATE USER IF NOT EXISTS 'batch_admin'@'127.0.0.1' IDENTIFIED BY '@Shan2006';
ALTER USER 'batch_admin'@'localhost' IDENTIFIED BY '@Shan2006';
ALTER USER 'batch_admin'@'127.0.0.1' IDENTIFIED BY '@Shan2006';
GRANT ALL PRIVILEGES ON batch_counselling_system.* TO 'batch_admin'@'localhost';
GRANT ALL PRIVILEGES ON batch_counselling_system.* TO 'batch_admin'@'127.0.0.1';
FLUSH PRIVILEGES;