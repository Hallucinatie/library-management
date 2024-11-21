const Book = require('../models/book');
const Paper = require('../models/paper');
const BorrowLog = require('../models/borrowLog');
const logger = require('../config/logger');

class UserController {
    // 论文操作
    static async uploadPaper(req, res, next) {
        try {
            const paperData = {
                ...req.body,
                userId: req.user.id,
                fileUrl: req.body.fileUrl
            };
            const paper = await Paper.create(paperData);
            logger.info(`用户 ${req.user.username} 上传了新论文: ${paper.title}`);
            res.status(201).json(paper);
        } catch (error) {
            next(error);
        }
    }

    static async downloadPaper(req, res, next) {
        try {
            const paper = await Paper.findById(req.params.id);
            if (!paper) {
                return res.status(404).json({ message: '论文不存在' });
            }

            // 更新下载次数
            await Paper.incrementDownloadCount(paper.id);
            
            logger.info(`用户 ${req.user.username} 下载了论文: ${paper.title}`);
            res.json({ fileUrl: paper.fileUrl });
        } catch (error) {
            next(error);
        }
    }

    // 借阅操作
    static async borrowBook(req, res, next) {
        try {
            const { bookId } = req.body;
            const book = await Book.findById(bookId);
            
            if (!book) {
                return res.status(404).json({ message: '图书不存在' });
            }
            
            const availableQuantity = await Book.getAvailableQuantity(bookId);
            if (availableQuantity <= 0) {
                return res.status(400).json({ message: '图书已全部借出' });
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(bookId, true);
            if (!updatedBook) {
                return res.status(400).json({ message: '借阅失败，图书可能已被借出' });
            }

            // 创建借阅记录
            const borrowLog = await BorrowLog.create({
                userId: req.user.id,
                bookId,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
            });

            logger.info(`用户 ${req.user.username} 借阅了图书: ${book.title}`);
            res.status(201).json(borrowLog);
        } catch (error) {
            next(error);
        }
    }

    static async returnBook(req, res, next) {
        try {
            const { borrowId } = req.body;
            const borrowLog = await BorrowLog.return(borrowId);
            
            if (!borrowLog) {
                return res.status(404).json({ message: '借阅记录不存在' });
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(borrowLog.bookId, false);
            if (!updatedBook) {
                return res.status(400).json({ message: '归还失败，请联系管理员' });
            }

            logger.info(`用户 ${req.user.username} 归还了图书: ${updatedBook.title}`);
            res.json(borrowLog);
        } catch (error) {
            next(error);
        }
    }

    // 查询操作
    static async getBooks(req, res, next) {
        try {
            const books = await Book.findAll();
            res.json(books);
        } catch (error) {
            next(error);
        }
    }

    static async getPapers(req, res, next) {
        try {
            const papers = await Paper.findAll();
            res.json(papers);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController; 