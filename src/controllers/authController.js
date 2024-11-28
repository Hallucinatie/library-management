const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');
const util = require('util');

const JWT_SECRET = process.env.JWT_SECRET;

const verificationCodes = {}; // 临时存储验证码，实际项目中可以使用 Redis 或数据库
class AuthController {
    // 统一的登录处理
    static async login(req, res, next) {
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

            logger.info(`用户 ${username} (${user.role}) 登录成功`);
            res.setHeader('Authorization', `Bearer ${token}`);

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

    
    //发送验证码
    static async sendCode(req,res,next) {
        try{
            const {email} =req.body;
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    code: 401,
                    msg: '该邮箱未注册',
                    data: null
                });
            }

            const code=Math.floor(1000 + Math.random() * 9000).toString();
            const currentTime = Date.now();  // 获取当前时间戳
            verificationCodes[email] = {
                code:code,
                timestamp:currentTime
            };// 存储验证码

            let transporter = nodemailer.createTransport({
                host: 'smtp.qq.com',
                secureConnection: true, // use SSL
                port: 465,
                secure: true, // secure:true for port 465, secure:false for port 587
                auth: {
                    user: '1691506185@qq.com',
                    pass: 'gzsxbqbzqckwcjgc' // QQ邮箱需要使用授权码
                }
            });

            let mailOptions = {
                from: `1691506185@qq.com`, // 发件人
                to: email, // 收件人
                subject: `Hello ✔`, // 主题
                text: `图书馆登录`, // plain text body
                html: `<b>您的验证码是:${code}</b>`, // html body
            };

            const sendMailPromise = util.promisify(transporter.sendMail.bind(transporter));
            await sendMailPromise(mailOptions); 

            res.json({
                code: 200,
                msg: '验证码已发送，请检查邮箱',
                data: null
            });
        }catch (error) {
            next(error);
        }
    }

    static async loginbyemail(req, res, next) {
        try {
            const { email, code } = req.body;

            // 查找用户
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    code: 401,
                    msg: '该邮箱未注册',
                    data: null
                });
            }
            
            // 验证验证码
            const currentTime = Date.now();
            const storedCode = verificationCodes[email];

            if (!storedCode) {
                return res.status(401).json({
                    code: 401,
                    msg: '验证码未发送或已过期',
                    data: null
                });
            }

            const codeAge = currentTime - storedCode.timestamp; // 计算验证码的存活时间
            const expirationTime = 1 * 60 * 1000; // 1分钟 = 10 * 60 * 1000 毫秒
            if (codeAge > expirationTime) {
                // 如果验证码过期
                delete verificationCodes[email]; // 删除过期的验证码
                return res.status(401).json({
                    code: 401,
                    msg: '验证码已过期，请重新获取',
                    data: null
                });
            }
            if (code!==storedCode.code) {
                return res.status(401).json({
                    code: 401,
                    msg: '验证码错误',
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

            logger.info(`用户 ${user.username} (${user.role}) 登录成功`);
            res.setHeader('Authorization', `Bearer ${token}`);

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


    // 用户注册
    static async register(req, res, next) {
        try {
            const { username, password, email } = req.body;

            // 检查用户名是否已存在
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    code: 400,
                    msg: '用户名已存在',
                    data: null
                });
            }

            // 检查邮箱是否已存在
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    code: 400,
                    msg: '邮箱已被使用',
                    data: null
                });
            }

            // 加密密码
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 创建新用户
            const newUser = await User.create({
                username,
                password: hashedPassword,
                email,
                role: 'user',
                status: 'active'
            });

            logger.info(`新用户注册: ${username}`);

            // 返回创建的用户信息（不包含密码）
            res.status(200).json({
                code: 200,
                msg: '注册成功',
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController; 