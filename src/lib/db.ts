import mysql from 'mysql2/promise';

// 声明全局变量类型
declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
}

// 获取数据库配置
const getDbConfig = () => {
  // 优先使用 DATABASE_URL 环境变量
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    console.log('使用 DATABASE_URL 连接数据库');
    return { uri: databaseUrl };
  }
  else {
    console.log('使用单独的配置参数连接数据库');
    return {uri: 'mysql://root:zpn84sx9@dbconn.sealosbja.site:42606/datafollow'}
  }

  // 否则使用单独的配置参数
  return {
    host: process.env.DB_HOST || 'dbconn.sealosbja.site',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'zpn84sx9',
    database: process.env.DB_NAME || 'datafollow',
    port: process.env.DB_PORT || 42606
  };
};

// 获取数据库连接池
const getPool = (): mysql.Pool => {
  // 检查全局变量中是否已存在连接池
  if (!global.mysqlPool) {
    console.log('创建新的数据库连接池...');
    
    const config = getDbConfig();
    
    // 根据配置类型创建连接池
    if ('uri' in config && config.uri) {
      console.log(`使用连接字符串连接数据库...`);
      global.mysqlPool = mysql.createPool(config.uri);
    } else {
      const standardConfig = config as {
        host: string;
        user: string;
        password: string;
        database: string;
      };
      console.log(`连接到: ${standardConfig.host}/${standardConfig.database} (${standardConfig.user})`);
      global.mysqlPool = mysql.createPool({
        host: standardConfig.host,
        user: standardConfig.user,
        password: standardConfig.password,
        database: standardConfig.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
  }
  
  return global.mysqlPool;
};

// 测试连接方法
async function testConnection(): Promise<boolean> {
  try {
    if (!global.mysqlPool) return false;
    
    const connection = await global.mysqlPool.getConnection();
    console.log('数据库连接成功!');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败!', error);
    return false;
  }
}

// 初始化数据库表结构
async function initDatabase(): Promise<boolean> {
  try {
    console.log('开始初始化数据库表结构...');
    
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      // 开启事务
      await connection.beginTransaction();
      
      // 创建平台表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS platform (
          id INT AUTO_INCREMENT PRIMARY KEY,
          platform VARCHAR(50) NOT NULL UNIQUE,
          abbreviation VARCHAR(20) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      
      // 创建来源类型表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sourcetype (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sourcetype VARCHAR(50) NOT NULL UNIQUE,
          en VARCHAR(20) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;    
      `);
      
      // 创建项目表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS workflow (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_code VARCHAR(50) NOT NULL UNIQUE,
          description VARCHAR(100),
          url VARCHAR(255) UNIQUE,
          workflow JSON
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      
      // 创建链接表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS link_info (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_code VARCHAR(50) NOT NULL,
          source_type VARCHAR(20) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          short_url VARCHAR(255) NOT NULL UNIQUE,
          long_url VARCHAR(512) NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE,
          FOREIGN KEY (source_type) REFERENCES source_types(sourcetype) ON DELETE CASCADE,
          FOREIGN KEY (platform) REFERENCES platforms(platform) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.execute(`
        CREATE VIEW link_workflow_info AS
        SELECT 
          l.id AS id,
          l.created_at AS created_at,
          l.source_type AS source_type,
          l.platform AS platform_name,
          l.project_code AS project_code,
          w.description AS description,
          l.short_url AS short_url,
          l.long_url AS long_url
        FROM link_info l
        JOIN workflow w ON l.project_code = w.project_code;
      `);

      await connection.execute(`
        CREATE VIEW platformmatch AS
        SELECT 
          l.id AS id,
          l.created_at AS created_at,
          l.source_type AS source_type,
          l.platform AS platform_name,
          l.project_code AS project_code,
          l.short_url AS short_url,
          l.long_url AS long_url,
          p.abbreviation AS abbreviation
        FROM link_info l
        JOIN platform p ON l.platform = p.platform;
      `);
    
      // 添加默认平台数据
      await connection.execute(`
        INSERT IGNORE INTO platform (platform, abbreviation)
        VALUES 
          ('知乎', 'zh'),
          ('微信公众号', 'wx'),
          ('微博', 'wb'),
          ('小红书', 'xhs'),
          ('抖音', 'dy')
      `);
      
      // 添加默认来源类型
      await connection.execute(`
        INSERT IGNORE INTO source_types (sourcetype, en)
        VALUES 
          ('文章', 'article'),
          ('视频', 'video'),
          ('直播', 'live'),
          ('广告', 'ad'),
          ('社区', 'community')
      `);
      
      // 提交事务
      await connection.commit();
      console.log('数据库初始化成功!');
      return true;
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error('数据库初始化失败:', error);
      return false;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('初始化过程中出错:', error);
    return false;
  }
}

// 连接并初始化数据库
async function connectAndInit(): Promise<boolean> {
  try {
    // 先测试连接
    const connected = await testConnection();
    if (!connected) {
      console.error('数据库连接失败，无法初始化数据库');
      return false;
    }
    
    // 初始化数据库
    return await initDatabase();
  } catch (error) {
    console.error('连接并初始化数据库失败:', error);
    return false;
  }
}

// 在应用启动时初始化连接池
const pool = getPool();

// 执行SQL查询的辅助函数
export async function query(sql: string, params: any[] = []) {
  try {
    // 使用全局连接池
    const [results] = await getPool().execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    console.error('SQL:', sql);
    console.error('参数:', params);
    throw error;
  }
}

export { pool, connectAndInit };
export default pool; 