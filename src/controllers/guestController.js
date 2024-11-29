const Book = require('../models/book');
const Paper = require('../models/paper');
const logger = require('../config/logger');

class GuestController {
    // 浏览公开论文
    static async browsePapers(req, res, next) {
        try {
            const { id, title, author, category } = req.query;
            const queryParams = { id, title, author, category };
            // 设置userId为-1，表示游客
            queryParams.userId = -1;
            const papers = await Paper.findByQuery(queryParams);

            res.json({
                code: 200,
                msg: '查询成功',
                data: papers,
                total: papers.length
            });
        } catch (error) {
            logger.error(`查询论文失败: ${error.message}`);
            next(error);
        }
    }

    // 浏览公开图书
    static async browseBooks(req, res, next) {
        try {
            const { id, title, author, isbn, category } = req.query;
            const queryParams = { id, title, author, isbn, category };
            const books = await Book.findByQuery(queryParams);

            res.json({
                code: 200,
                msg: '查询成功',
                data: books,
                total: books.length
            });
        } catch (error) {
            logger.error(`查询书籍失败: ${error.message}`);
            next(error);
        }
    }
}

module.exports = GuestController; 