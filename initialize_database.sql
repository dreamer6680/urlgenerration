-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `datafollow`;
USE `datafollow`;

-- 创建platforms表
CREATE TABLE IF NOT EXISTS `platform` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `platform` VARCHAR(50) NOT NULL UNIQUE,
  `abbreviation` VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建source_types表
CREATE TABLE IF NOT EXISTS `sourcetype` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sourcetype` VARCHAR(50) NOT NULL UNIQUE,
  `en` VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建workflows表
CREATE TABLE IF NOT EXISTS `workflow` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_code` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(100),
  `url` VARCHAR(255) UNIQUE,
  `workflow` JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建links表，用于短链接管理
CREATE TABLE IF NOT EXISTS `link_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_code` VARCHAR(50) NOT NULL,
  `source_type` VARCHAR(20) NOT NULL,
  `platform` VARCHAR(50) NOT NULL,
  `short_url` VARCHAR(255) NOT NULL UNIQUE,
  `long_url` VARCHAR(512) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_code`) REFERENCES `workflow`(`project_code`) ON DELETE CASCADE,
  FOREIGN KEY (`source_type`) REFERENCES `sourcetype`(`sourcetype`) ON DELETE CASCADE,
  FOREIGN KEY (`platform`) REFERENCES `platform`(`platform`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建users表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `role` ENUM('admin', 'user', 'guest') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

CREATE VIEW `link_workflow_info` AS
select `l`.`id`           AS `id`,
       `l`.`created_at`   AS `created_at`,
       `l`.`source_type`  AS `source_type`,
       `l`.`platform`     AS `platform_name`,
       `l`.`project_code` AS `project_code`,
       `w`.`description`  AS `description`,
       `l`.`short_url`    AS `short_url`,
       `l`.`long_url`     AS `long_url`
from (`datafollow`.`link_info` `l` join `datafollow`.`workflow` `w` on ((`l`.`project_code` = `w`.`project_code`)));

CREATE VIEW `platformmatch` AS
select `l`.`id`           AS `id`,
       `l`.`created_at`   AS `created_at`,
       `l`.`source_type`  AS `source_type`,
       `l`.`platform`     AS `platform_name`,
       `l`.`project_code` AS `project_code`,
       `l`.`short_url`    AS `short_url`,
       `l`.`long_url`     AS `long_url`,
       `p`.`abbreviation` AS `abbreviation`
from (`datafollow`.`link_info` `l` join `datafollow`.`platform` `p` on ((`l`.`platform` = `p`.`platform`)));