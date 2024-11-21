const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, userValidationRules } = require('../middleware/validator');
const AuthController = require('../controllers/authController');

// 登录验证规则
const loginValidation = [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
];

// 登录路由
router.post('/admin/login', loginValidation, validate, AuthController.adminLogin);
router.post('/user/login', loginValidation, validate, AuthController.userLogin);

// 用户注册路由
router.post('/user/register', userValidationRules(), validate, AuthController.register);

module.exports = router; 