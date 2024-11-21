const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const {
    validate,
    bookValidationRules,
    paperValidationRules,
    userValidationRules,
    idParamValidation
} = require('../middleware/validator');

// 所有管理员路由都需要管理员权限
router.use(adminAuth);

// 书籍管理路由
router.post('/books', bookValidationRules(), validate, AdminController.addBook);
router.put('/books/:id', idParamValidation(), bookValidationRules(), validate, AdminController.updateBook);
router.delete('/books/:id', idParamValidation(), validate, AdminController.deleteBook);
router.get('/books', AdminController.getBooks);

// 论文管理路由
router.post('/papers', paperValidationRules(), validate, AdminController.addPaper);
router.put('/papers/:id', idParamValidation(), paperValidationRules(), validate, AdminController.updatePaper);
router.delete('/papers/:id', idParamValidation(), validate, AdminController.deletePaper);
router.get('/papers', AdminController.getPapers);

// 用户管理路由
router.post('/users', userValidationRules(), validate, AdminController.addUser);
router.put('/users/:id', idParamValidation(), userValidationRules(), validate, AdminController.updateUser);
router.delete('/users/:id', idParamValidation(), validate, AdminController.deleteUser);
router.get('/users', AdminController.getUsers);

// 借阅管理路由
router.delete('/borrow-logs/:id', idParamValidation(), validate, AdminController.deleteBorrowLog);
router.get('/borrow-logs', AdminController.getBorrowLogs);

// 统计信息路由
router.get('/statistics', AdminController.getStatistics);

module.exports = router; 