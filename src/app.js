require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const guestRoutes = require('./routes/guest');
const { testConnection } = require('./config/database');

const app = express();

// 中间件配置
app.use(helmet()); // 安全头设置
app.use(cors()); // 跨域支持
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 添加根路由，用于测试API是否正常工作
app.get('/', (req, res) => {
    res.json({ 
        message: 'API 服务器正常运行',
        endpoints: {
            admin: '/admin/*',
            user: '/user/*',
            guest: '/guest/*'
        }
    });
});

// 路由配置
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/guest', guestRoutes);

// 错误处理中间件
app.use(errorHandler);

// 默认错误处理 - 放在所有路由之后
app.use((req, res) => {
    res.status(404).json({ 
        message: '未找到请求的资源',
        requestedPath: req.path,
        method: req.method
    });
});

// 测试数据库连接
testConnection().catch(console.error);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app; 