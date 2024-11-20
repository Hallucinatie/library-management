const { body, param, validationResult } = require('express-validator');

// 验证结果处理
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// 用户注册验证
const userValidationRules = () => [
    body('username').isString().isLength({ min: 3 }).withMessage('用户名至少3个字符'),
    body('password').isString().isLength({ min: 6 }).withMessage('密码至少6个字符'),
    body('email').isEmail().withMessage('无效的电子邮件地址')
];

// 图书验证
const bookValidationRules = () => [
    body('title').isString().notEmpty().withMessage('书名不能为空'),
    body('author').isString().notEmpty().withMessage('作者不能为空'),
    body('isbn').isString().isLength({ min: 10, max: 13 }).withMessage('ISBN必须是10到13位'),
    body('quantity').isInt({ min: 0 }).withMessage('数量必须是非负整数')
];

// 论文验证
const paperValidationRules = () => [
    body('title').isString().notEmpty().withMessage('论文标题不能为空'),
    body('author').isString().notEmpty().withMessage('作者不能为空'),
    body('file_url').isURL().withMessage('无效的文件URL')
];

// ID参数验证
const idParamValidation = () => [
    param('id').isInt().withMessage('ID必须是整数')
];

module.exports = {
    validate,
    userValidationRules,
    bookValidationRules,
    paperValidationRules,
    idParamValidation
}; 