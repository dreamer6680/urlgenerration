const mysql = require('mysql2/promise');

async function checkSummaryFields() {
  const connection = await mysql.createConnection(
    'mysql://root:bqsqcpp9@dbconn.sealoshzh.site:35853/datafollow'
  );

  try {
    console.log('检查analytics_summary视图的字段和数据...');
    
    // 检查字段结构
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'datafollow' AND TABLE_NAME = 'analytics_summary'"
    );
    console.log('analytics_summary视图的所有字段:', columns.map(c => c.COLUMN_NAME));
    
    // 查看实际数据
    const [data] = await connection.execute(
      "SELECT * FROM analytics_summary LIMIT 3"
    );
    console.log('analytics_summary实际数据:', JSON.stringify(data, null, 2));
    
    // 检查是否需要计算独立访客数
    const [uniqueVisitors] = await connection.execute(
      "SELECT COUNT(DISTINCT ip_address) as unique_visitors FROM click_analytics"
    );
    console.log('独立访客总数:', uniqueVisitors[0].unique_visitors);
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkSummaryFields();