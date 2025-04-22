import pool from './db.js';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 读取SQL文件
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // 按语句分割SQL内容
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // 获取连接
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    
    try {
      // 顺序执行SQL语句
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`执行SQL: ${statement.trim().substring(0, 50)}...`);
          await connection.query(statement);
        }
      }
      console.log('数据库初始化完成');
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 执行初始化
initDatabase(); 