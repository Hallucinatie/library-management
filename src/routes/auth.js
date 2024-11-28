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

// 统一的登录路由
router.post('/login', loginValidation, validate, AuthController.login);

router.post('/getcode',AuthController.sendCode);
router.post('/loginbyemail',AuthController.loginbyemail);
// 用户注册路由
router.post('/register', userValidationRules(), validate, AuthController.register);

module.exports = router; 