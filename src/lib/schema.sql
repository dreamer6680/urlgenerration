-- 创建数据库(如果不存在)
CREATE DATABASE IF NOT EXISTS datafollow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE datafollow;

-- 创建链接表
CREATE TABLE IF NOT EXISTS link_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_type VARCHAR(20) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  project_code VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  short_url VARCHAR(255) NOT NULL,
  long_url VARCHAR(512) NOT NULL
); 