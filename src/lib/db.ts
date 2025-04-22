import mysql from 'mysql2/promise';

// 获取数据库配置 
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'dreamer',
  database: process.env.DB_NAME || 'datafollow',
};

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
(async function testConnection() {
  try {
    console.log('测试数据库连接...');
    console.log(`连接到: ${dbConfig.host}/${dbConfig.database} (${dbConfig.user})`);
    const connection = await pool.getConnection();
    console.log('数据库连接成功!');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败!', error);
  }
})();

// 执行SQL查询的辅助函数
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    console.error('SQL:', sql);
    console.error('参数:', params);
    throw error;
  }
}

export default pool; 