const { Pool } = require('pg');
require('dotenv').config();

// 创建数据库连接池
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20, // 连接池最大连接数
    idleTimeoutMillis: 30000, // 连接最大空闲时间
    connectionTimeoutMillis: 2000, // 连接超时时间
});

// 测试数据库连接
pool.on('connect', () => {
    console.log('数据库连接成功');
});

pool.on('error', (err) => {
    console.error('数据库连接错误:', err);
});

// 测试连接函数
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('数据库连接测试成功');
        client.release();
    } catch (err) {
        console.error('数据库连接测试失败:', err);
    }
};

// 导出连接池和测试函数
module.exports = {
    pool,
    testConnection
}; 