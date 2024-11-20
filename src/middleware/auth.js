const jwt = require('jsonwebtoken');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证管理员权限的中间件
const adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: '需要管理员权限' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的认证令牌' });
    }
};

// 验证普通用户权限的中间件
const userAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的认证令牌' });
    }
};

module.exports = { adminAuth, userAuth }; 