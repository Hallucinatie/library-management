const Book = require('../models/book');
const Paper = require('../models/paper');
const logger = require('../config/logger');

class GuestController {
    // 浏览公开论文
    static async browsePapers(req, res, next) {
        try {
            const papers = await Paper.findAll(true); // true 表示只获取公开论文
            res.json(papers);
        } catch (error) {
            next(error);
        }
    }

    // 浏览公开图书
    static async browseBooks(req, res, next) {
        try {
            const books = await Book.findAll();
            // 只返回基本信息
            const publicBooks = books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description
            }));
            res.json(publicBooks);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = GuestController; 