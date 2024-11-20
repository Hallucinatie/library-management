const Book = require('../models/book');
const Paper = require('../models/paper');
const User = require('../models/user');
const BorrowLog = require('../models/borrowLog');
const logger = require('../config/logger');
const pool = require('../config/database').pool;

class AdminController {
    // 书籍管理
    static async addBook(req, res, next) {
        try {
            const book = await Book.create(req.body);
            logger.info(`新书籍已添加: ${book.title}`);
            res.status(201).json(book);
        } catch (error) {
            next(error);
        }
    }

    static async updateBook(req, res, next) {
        try {
            const book = await Book.update(req.params.id, req.body);
            if (!book) {
                return res.status(404).json({ message: '未找到该书籍' });
            }
            logger.info(`书籍已更新: ${book.title}`);
            res.json(book);
        } catch (error) {
            next(error);
        }
    }

    static async deleteBook(req, res, next) {
        try {
            const book = await Book.delete(req.params.id);
            if (!book) {
                return res.status(404).json({ message: '未找到该书籍' });
            }
            logger.info(`书籍已删除: ${book.title}`);
            res.json({ message: '书籍删除成功' });
        } catch (error) {
            next(error);
        }
    }

    static async getBooks(req, res, next) {
        try {
            const books = await Book.findAll();
            res.json(books);
        } catch (error) {
            next(error);
        }
    }

    // 论文管理
    static async addPaper(req, res, next) {
        try {
            const paper = await Paper.create(req.body);
            logger.info(`新论文已添加: ${paper.title}`);
            res.status(201).json(paper);
        } catch (error) {
            next(error);
        }
    }

    static async updatePaper(req, res, next) {
        try {
            const paper = await Paper.update(req.params.id, req.body);
            if (!paper) {
                return res.status(404).json({ message: '未找到该论文' });
            }
            logger.info(`论文已更新: ${paper.title}`);
            res.json(paper);
        } catch (error) {
            next(error);
        }
    }

    static async deletePaper(req, res, next) {
        try {
            const paper = await Paper.delete(req.params.id);
            if (!paper) {
                return res.status(404).json({ message: '未找到该论文' });
            }
            logger.info(`论文已删除: ${paper.title}`);
            res.json({ message: '论文删除成功' });
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

    // 用户管理
    static async addUser(req, res, next) {
        try {
            const user = await User.create(req.body);
            logger.info(`新用户已添加: ${user.username}`);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req, res, next) {
        try {
            const user = await User.update(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({ message: '未找到该用户' });
            }
            logger.info(`用户已更新: ${user.username}`);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const user = await User.delete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: '未找到该用户' });
            }
            logger.info(`用户已删除: ${user.username}`);
            res.json({ message: '用户删除成功' });
        } catch (error) {
            next(error);
        }
    }

    static async getUsers(req, res, next) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    // 借阅管理
    static async deleteBorrowLog(req, res, next) {
        try {
            const borrowLog = await BorrowLog.delete(req.params.id);
            if (!borrowLog) {
                return res.status(404).json({ message: '未找到该借阅记录' });
            }
            logger.info(`借阅记录已删除: ID ${borrowLog.id}`);
            res.json({ message: '借阅记录删除成功' });
        } catch (error) {
            next(error);
        }
    }

    static async getBorrowLogs(req, res, next) {
        try {
            const borrowLogs = await BorrowLog.findAll();
            res.json(borrowLogs);
        } catch (error) {
            next(error);
        }
    }

    // 统计信息
    static async getStatistics(req, res, next) {
        try {
            // 获取借阅统计
            const borrowStats = await pool.query(`
                SELECT 
                    COUNT(*) as total_borrows,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as active_borrows
                FROM borrow_logs
            `);

            // 获取资源统计
            const resourceStats = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM books) as total_books,
                    (SELECT COUNT(*) FROM papers) as total_papers
            `);

            res.json({
                borrowing: borrowStats.rows[0],
                resources: resourceStats.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController; 