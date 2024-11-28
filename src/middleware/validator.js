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
    body('email').isEmail().withMessage('无效的电子邮件地址'),
    body('role').optional().isIn(['admin', 'user']).withMessage('无效的角色'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('无效的状态')
];

// 图书验证
const bookValidationRules = () => [
    body('title').isString().notEmpty().withMessage('书名不能为空'),
    body('author').isString().notEmpty().withMessage('作者不能为空'),
    body('isbn').isString().isLength({ min: 10, max: 13 }).withMessage('ISBN必须是10到13位'),
    body('quantity').isInt({ min: 0 }).withMessage('数量必须是非负整数'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('publisher').optional().isString(),
    body('publishDate').optional().isISO8601().withMessage('出版日期格式无效')
];

// 论文验证
const paperValidationRules = () => [
    body('title').isString().notEmpty().withMessage('论文标题不能为空'),
    body('author').isString().notEmpty().withMessage('作者不能为空'),
    body('abstract').optional().isString().withMessage('摘要必须是字符串'),
    body('keywords').optional({ nullable: true }).isArray().withMessage('关键词必须是数组'),
    body('fileUrl').isURL().withMessage('无效的文件URL'),
    body('isPublic').optional().isBoolean().withMessage('isPublic必须是布尔值'),
    body('category').optional({ nullable: true }).isString().withMessage('分类必须是字符串'),
    body('publicationDate').optional().isISO8601().withMessage('发布日期格式无效')
];

// ID参数验证
const idParamValidation = () => [
    param('id').isInt().withMessage('ID必须是整数')
];

// 借阅验证
const borrowValidationRules = () => [
    body('bookId').isInt().withMessage('图书ID必须是整数'),
    body('dueDate').optional().isISO8601().withMessage('归还日期格式无效')
];

// 管理员注册验证规则
const adminRegisterValidation = [
    body('username')
        .isString()
        .isLength({ min: 3 })
        .withMessage('用户名至少3个字符')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('用户名只能包含字母、数字和下划线'),
    body('password')
        .isString()
        .isLength({ min: 6 })
        .withMessage('密码至少6个字符')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage('密码必须包含字母和数字'),
    body('email')
        .isEmail()
        .withMessage('无效的电子邮件地址')
];

// 用户注册验证规则
const registerValidation = [
    body('username').isString().isLength({ min: 3 }).withMessage('用户名至少3个字符'),
    body('password').isString().isLength({ min: 6 }).withMessage('密码至少6个字符'),
    body('email')
        .isEmail()
        .withMessage('无效的电子邮件地址')
];

// 用户更新验证规则
const adminUpdateUserRules = () => [
    body('username')
        .optional()
        .isString()
        .isLength({ min: 3 })
        .withMessage('用户名至少3个字符')
        .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
        .withMessage('用户名只能包含字母、数字、下划线和中文'),
    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('无效的状态'),
    body('resetPassword')
        .optional()
        .isBoolean()
        .withMessage('resetPassword必须是布尔值')
];

module.exports = {
    validate,
    userValidationRules,
    bookValidationRules,
    paperValidationRules,
    idParamValidation,
    borrowValidationRules,
    adminRegisterValidation,
    registerValidation,
    adminUpdateUserRules
}; 