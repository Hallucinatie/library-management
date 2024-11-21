const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const AuthController = require('../controllers/authController');

// 登录验证规则
const loginValidation = [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
];

// 登录路由
router.post('/admin/login', loginValidation, validate, AuthController.adminLogin);
router.post('/user/login', loginValidation, validate, AuthController.userLogin);

module.exports = router; 