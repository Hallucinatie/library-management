const Book = require('../models/book');
const Paper = require('../models/paper');
const logger = require('../config/logger');

class GuestController {
    // 浏览公开论文
    static async browsePapers(req, res, next) {
        try {
            const {id, title, author, category} = req.query;

            // 如果指定了 ID，优先按 ID 查询
            if (id) {
                const paper = await Paper.findById(id);
                if (!paper) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到指定ID的论文',
                        data: null
                    });
                }

                // 如果同时指定了其他条件，验证是否匹配
                if (title && !paper.title.toLowerCase().includes(title.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的论文',
                        data: null
                    });
                }
                if (author && !paper.author.toLowerCase().includes(author.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的论文',
                        data: null
                    });
                }
                if (category && !paper.category.toLowerCase().includes(category.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的论文',
                        data: null
                    });
                }

                return res.json({
                    code: 200,
                    msg: '查询成功',
                    data: [paper],
                    total: 1
                });
            }

            // 如果没有指定 ID，则按其他条件查询
            const queryParams = {};
            if (title) queryParams.title = title;
            if (author) queryParams.author = author;
            if (category) queryParams.category = category;
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
            const {id, title, author, isbn, category} = req.query;
            
            if(id) {
                const book = await Book.findById(id);
                if(!book){
                    return res.status(404).json({
                        code: 404,
                        msg:'未找到指定ID的书籍',
                        data: null
                    });
                }

                // 如果同时指定了其他条件，验证是否匹配
                if (title && !book.title.toLowerCase().includes(title.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的书籍',
                        data: null
                    });
                }
                if (author && !book.author.toLowerCase().includes(author.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的书籍',
                        data: null
                    });
                }
                if (isbn && !book.isbn.toLowerCase().includes(isbn.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的书籍',
                        data: null
                    });
                }
                if (category && !book.category.toLowerCase().includes(category.toLowerCase())) {
                    return res.status(404).json({
                        code: 404,
                        msg: '未找到符合所有条件的书籍',
                        data: null
                    });
                }

                return res.json({
                    code: 200,
                    msg: '查询成功',
                    data: [book],
                    total: 1
                });
            }

            // 如果没有指定 ID，则按其他条件查询
            const queryParams = {};
            if (title) queryParams.title = title;
            if (author) queryParams.author = author;
            if (isbn) queryParams.isbn = isbn;
            if (category) queryParams.category = category;

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