const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AuthController {
    // 管理员登录
    static async adminLogin(req, res, next) {
        try {
            const { username, password } = req.body;

            // 查找用户
            const user = await User.findByUsername(username);
            if (!user || user.role !== 'admin') {
                return res.status(401).json({
                    code: 401,
                    msg: '用户名或密码错误',
                    data: null
                });
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    code: 401,
                    msg: '用户名或密码错误',
                    data: null
                });
            }

            // 检查用户状态
            if (user.status !== 'active') {
                return res.status(403).json({
                    code: 403,
                    msg: '账户已被禁用',
                    data: null
                });
            }

            // 生成 JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.info(`管理员 ${username} 登录成功`);
            
            // 返回用户信息和token
            res.json({
                code: 200,
                msg: '登录成功',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            next(error);
        }
    }

    // 普通用户登录
    static async userLogin(req, res, next) {
        try {
            const { username, password } = req.body;

            // 查找用户
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    code: 401,
                    msg: '用户名或密码错误',
                    data: null
                });
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    code: 401,
                    msg: '用户名或密码错误',
                    data: null
                });
            }

            // 检查用户状态
            if (user.status !== 'active') {
                return res.status(403).json({
                    code: 403,
                    msg: '账户已被禁用',
                    data: null
                });
            }

            // 生成 JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.info(`用户 ${username} 登录成功`);
            
            // 返回用户信息和token
            res.json({
                code: 200,
                msg: '登录成功',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController; 