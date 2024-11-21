#!/bin/bash

# 从 .env 文件加载环境变量
export $(cat .env | xargs)

# 使用环境变量连接数据库
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./src/database/drop-tables.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./src/database/schema.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./src/database/init-admin.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./src/database/init-user.sql

# 清理环境变量
unset PGPASSWORD
unset DB_HOST
unset DB_PORT
unset DB_USER
unset DB_PASSWORD
unset DB_NAME
unset JWT_SECRET 