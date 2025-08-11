const mysql = require('mysql2/promise');

async function checkViews() {
  const connection = await mysql.createConnection(
    'mysql://root:bqsqcpp9@dbconn.sealoshzh.site:35853/datafollow'
  );

  try {
    console.log('检查数据库视图...');
    
    // 检查所有视图
    const [views] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'datafollow'"
    );
    
    console.log('现有视图:', views.map(v => v.TABLE_NAME));
    
    // 检查platform_performance视图的结构
    try {
      const [columns] = await connection.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'datafollow' AND TABLE_NAME = 'platform_performance'"
      );
      console.log('platform_performance视图的列:', columns.map(c => c.COLUMN_NAME));
    } catch (error) {
      console.log('platform_performance视图不存在或有问题:', error.message);
    }
    
    // 检查click_analytics表的结构
    try {
      const [clickColumns] = await connection.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'datafollow' AND TABLE_NAME = 'click_analytics'"
      );
      console.log('click_analytics表的列:', clickColumns.map(c => c.COLUMN_NAME));
    } catch (error) {
      console.log('click_analytics表不存在:', error.message);
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkViews();