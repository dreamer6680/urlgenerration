#!/bin/bash
set -e

echo "===== 数据流应用启动脚本 ====="

# 启动MySQL服务器
echo "正在启动MySQL数据库..."
# 在后台启动MySQL
/entrypoint.sh mysqld &

# 等待MySQL服务就绪
echo "等待MySQL启动完成..."
max_attempts=30
counter=0
while ! mysqladmin ping -h"localhost" -u"root" -p"password" --silent; do
    sleep 2
    counter=$((counter+1))
    echo "尝试连接MySQL... (${counter}/${max_attempts})"
    
    if [ $counter -ge $max_attempts ]; then
        echo "MySQL启动超时，请检查日志"
        exit 1
    fi
done
echo "MySQL已成功启动！"

# 数据库设置 - 可以在这里进行额外的数据库初始化
echo "数据库初始化完成"

# 设置环境变量
export NODE_ENV=production
export DB_HOST=dbconn.sealosbja.site
export DB_USER=root
export DB_PASSWORD=zpn84sx9
export DB_DATABASE=datafollow
export DB_PORT=42606
export DATABASE_URL="mysql://root:zpn84sx9@dbconn.sealosbja.site:42606/datafollow"
export PORT=3000
export HOSTNAME="0.0.0.0"

# 启动Next.js应用
echo "启动Next.js应用..."
cd /app

if [ -d "./.next/standalone" ]; then
    echo "使用独立模式运行应用..."
    node .next/standalone/server.js
else
    echo "使用标准模式运行应用..."
    node .next/server/app/api/projects/route.js
fi 