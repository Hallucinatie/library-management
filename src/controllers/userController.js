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
                user_id: req.user.id
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
            // 这里应该有文件下载的具体实现
            logger.info(`用户 ${req.user.username} 下载了论文: ${paper.title}`);
            res.json({ file_url: paper.file_url });
        } catch (error) {
            next(error);
        }
    }

    // 图书操作
    static async borrowBook(req, res, next) {
        try {
            const { book_id } = req.body;
            const book = await Book.findById(book_id);
            
            if (!book) {
                return res.status(404).json({ message: '图书不存在' });
            }
            
            if (book.quantity <= 0) {
                return res.status(400).json({ message: '图书库存不足' });
            }

            // 创建借阅记录
            const borrowLog = await BorrowLog.create({
                user_id: req.user.id,
                book_id,
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
            });

            // 更新图书库存
            await Book.update(book_id, { 
                ...book, 
                quantity: book.quantity - 1 
            });

            logger.info(`用户 ${req.user.username} 借阅了图书: ${book.title}`);
            res.status(201).json(borrowLog);
        } catch (error) {
            next(error);
        }
    }

    static async returnBook(req, res, next) {
        try {
            const { borrow_id } = req.body;
            const borrowLog = await BorrowLog.return(borrow_id);
            
            if (!borrowLog) {
                return res.status(404).json({ message: '借阅记录不存在' });
            }

            // 更新图书库存
            const book = await Book.findById(borrowLog.book_id);
            await Book.update(borrowLog.book_id, {
                ...book,
                quantity: book.quantity + 1
            });

            logger.info(`用户 ${req.user.username} 归还了图书: ${book.title}`);
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