-- 添加点击统计和分析功能的数据库表
USE `datafollow`;

-- 创建点击统计表
CREATE TABLE IF NOT EXISTS `click_analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `link_id` INT NOT NULL,
  `clicked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `referer` VARCHAR(512),
  `utm_source` VARCHAR(50),
  `utm_medium` VARCHAR(50),
  `utm_content` VARCHAR(100),
  `utm_campaign` VARCHAR(100),
  `utm_workflow` VARCHAR(255),
  FOREIGN KEY (`link_id`) REFERENCES `link_info`(`id`) ON DELETE CASCADE,
  INDEX `idx_link_id` (`link_id`),
  INDEX `idx_clicked_at` (`clicked_at`),
  INDEX `idx_utm_source` (`utm_source`),
  INDEX `idx_utm_medium` (`utm_medium`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建统计汇总视图
CREATE VIEW `analytics_summary` AS
SELECT 
  l.id as link_id,
  l.project_code,
  l.source_type,
  l.platform,
  l.short_url,
  l.long_url,
  l.created_at as link_created_at,
  COUNT(c.id) as total_clicks,
  COUNT(DISTINCT DATE(c.clicked_at)) as active_days,
  MAX(c.clicked_at) as last_clicked_at,
  MIN(c.clicked_at) as first_clicked_at
FROM link_info l
LEFT JOIN click_analytics c ON l.id = c.link_id
GROUP BY l.id, l.project_code, l.source_type, l.platform, l.short_url, l.long_url, l.created_at;

-- 创建UTM参数统计视图
CREATE VIEW `utm_analytics` AS
SELECT 
  utm_source,
  utm_medium,
  utm_content,
  utm_campaign,
  utm_workflow,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT link_id) as unique_links,
  COUNT(DISTINCT ip_address) as unique_visitors,
  COUNT(DISTINCT DATE(clicked_at)) as active_days,
  MIN(clicked_at) as first_click,
  MAX(clicked_at) as last_click,
  ROUND(COUNT(*) / COUNT(DISTINCT link_id), 2) as avg_clicks_per_link,
  ROUND(COUNT(DISTINCT ip_address) / COUNT(*) * 100, 2) as conversion_rate
FROM click_analytics
WHERE utm_source IS NOT NULL
GROUP BY utm_source, utm_medium, utm_content, utm_campaign, utm_workflow;

-- 创建每日统计视图
CREATE VIEW `daily_analytics` AS
SELECT 
  DATE(clicked_at) as click_date,
  utm_source,
  utm_medium,
  COUNT(*) as daily_clicks,
  COUNT(DISTINCT link_id) as unique_links_clicked,
  COUNT(DISTINCT ip_address) as unique_visitors
FROM click_analytics
GROUP BY DATE(clicked_at), utm_source, utm_medium
ORDER BY click_date DESC;

-- 创建平台效果统计视图
CREATE VIEW `platform_performance` AS
SELECT 
  p.platform,
  p.abbreviation,
  COUNT(c.id) as total_clicks,
  COUNT(DISTINCT c.link_id) as links_with_clicks,
  COUNT(DISTINCT DATE(c.clicked_at)) as active_days,
  AVG(daily_clicks.clicks_per_day) as avg_daily_clicks
FROM platform p
LEFT JOIN link_info l ON p.platform = l.platform
LEFT JOIN click_analytics c ON l.id = c.link_id
LEFT JOIN (
  SELECT 
    link_id,
    DATE(clicked_at) as click_date,
    COUNT(*) as clicks_per_day
  FROM click_analytics
  GROUP BY link_id, DATE(clicked_at)
) daily_clicks ON l.id = daily_clicks.link_id
GROUP BY p.platform, p.abbreviation;