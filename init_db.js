const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const connectionString = 'mysql://root:bqsqcpp9@dbconn.sealoshzh.site:35853';
  
  try {
    console.log('正在连接MySQL服务器...');
    const connection = await mysql.createConnection(connectionString);
    
    console.log('MySQL服务器连接成功!');
    
    // 首先创建数据库（如果不存在）
    console.log('创建数据库 datafollow...');
    await connection.query('CREATE DATABASE IF NOT EXISTS `datafollow`');
    await connection.query('USE `datafollow`');
    console.log('已选择数据库 datafollow');
    
    // 读取SQL初始化脚本
    const sqlFile = path.join(__dirname, 'initialize_database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // 更好的SQL语句分割方式
    const statements = [];
    let currentStatement = '';
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 跳过注释和空行
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // 如果行以分号结尾，表示语句结束
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // 添加最后一个语句（如果没有以分号结尾）
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`准备执行 ${statements.length} 条SQL语句...`);
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() && !statement.includes('CREATE DATABASE') && !statement.includes('USE `datafollow`')) {
        try {
          console.log(`执行第 ${i + 1} 条语句...`);
          await connection.query(statement);
        } catch (error) {
          console.error(`执行第 ${i + 1} 条语句时出错:`, error.message);
          console.error('语句内容:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('数据库初始化完成!');
    
    // 验证表是否创建成功
    const [tables] = await connection.query('SHOW TABLES');
    console.log('已创建的表:');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });
    
    await connection.end();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initializeDatabase();