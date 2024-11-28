const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { userAuth } = require('../middleware/auth');

// 所有用户路由都需要用户权限
router.use(userAuth);

// 论文相关路由
router.post('/papers', UserController.uploadPaper);
router.get('/papers/:id/download', UserController.downloadPaper);
router.get('/papers', UserController.getPapers);
router.get('/download-logs', UserController.getDownloadLogs);


// 图书相关路由
router.get('/books', UserController.getBooks);
router.post('/borrow', UserController.borrowBook);
router.post('/return', UserController.returnBook);
router.get('/borrow-logs', UserController.getBorrowLogs);

module.exports = router; 