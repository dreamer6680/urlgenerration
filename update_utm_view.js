const mysql = require('mysql2/promise');

async function updateUTMView() {
  const connection = await mysql.createConnection('mysql://root:bqsqcpp9@dbconn.sealoshzh.site:35853/datafollow');

  try {
    console.log('正在更新UTM分析视图...');
    
    // 删除旧视图
    await connection.execute('DROP VIEW IF EXISTS utm_analytics');
    console.log('已删除旧的utm_analytics视图');
    
    // 创建新视图
    const createViewSQL = `
      CREATE VIEW utm_analytics AS
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
      GROUP BY utm_source, utm_medium, utm_content, utm_campaign, utm_workflow
    `;
    
    await connection.execute(createViewSQL);
    console.log('已创建新的utm_analytics视图');
    
    // 测试新视图
    const [rows] = await connection.execute('SELECT * FROM utm_analytics LIMIT 5');
    console.log('新视图数据预览:', rows);
    
  } catch (error) {
    console.error('更新视图失败:', error);
  } finally {
    await connection.end();
  }
}

updateUTMView();