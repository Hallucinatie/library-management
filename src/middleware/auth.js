const jwt = require('jsonwebtoken');
require('dotenv').config();

// 使用环境变量中的 JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

// 验证管理员权限的中间件
const adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                code: 401,
                msg: '未提供认证令牌',
                data: null
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                code: 403,
                msg: '需要管理员权限',
                data: null
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            msg: '无效的认证令牌',
            data: null
        });
    }
};

// 验证普通用户权限的中间件
const userAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                code: 401,
                msg: '未提供认证令牌',
                data: null
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            msg: '无效的认证令牌',
            data: null
        });
    }
};

module.exports = { adminAuth, userAuth }; 