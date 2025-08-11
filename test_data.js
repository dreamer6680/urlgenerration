const mysql = require('mysql2/promise');

async function testData() {
  const connection = await mysql.createConnection(
    'mysql://root:bqsqcpp9@dbconn.sealoshzh.site:35853/datafollow'
  );

  try {
    console.log('检查数据库中的数据...');
    
    // 检查click_analytics表中的数据
    const [clickData] = await connection.execute(
      "SELECT COUNT(*) as count FROM click_analytics"
    );
    console.log('click_analytics表中的记录数:', clickData[0].count);
    
    // 如果没有数据，插入一些测试数据
    if (clickData[0].count === 0) {
      console.log('插入测试数据...');
      
      // 先获取一些link_id
      const [links] = await connection.execute(
        "SELECT id FROM link_info LIMIT 3"
      );
      
      if (links.length > 0) {
        // 插入测试点击数据
        for (let i = 0; i < 10; i++) {
          const linkId = links[Math.floor(Math.random() * links.length)].id;
          await connection.execute(
            `INSERT INTO click_analytics 
             (link_id, ip_address, user_agent, referer, utm_source, utm_medium, utm_campaign, clicked_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              linkId,
              `192.168.1.${Math.floor(Math.random() * 255)}`,
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'https://example.com',
              Math.random() > 0.5 ? 'article' : 'video',
              Math.random() > 0.5 ? 'wechat' : 'weibo',
              'test_campaign',
              new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
            ]
          );
        }
        console.log('已插入10条测试数据');
      } else {
        console.log('没有找到link_info数据，无法插入测试数据');
      }
    }
    
    // 检查各个视图的数据
    const [summaryData] = await connection.execute("SELECT * FROM analytics_summary");
    console.log('analytics_summary数据:', summaryData);
    
    const [utmData] = await connection.execute("SELECT * FROM utm_analytics LIMIT 5");
    console.log('utm_analytics数据:', utmData);
    
    const [platformData] = await connection.execute("SELECT * FROM platform_performance LIMIT 5");
    console.log('platform_performance数据:', platformData);
    
    const [dailyData] = await connection.execute("SELECT * FROM daily_analytics ORDER BY click_date DESC LIMIT 5");
    console.log('daily_analytics数据:', dailyData);
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await connection.end();
  }
}

testData();