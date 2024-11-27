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
            res.status(201).json({
                code: 200,
                msg: '论文上传成功',
                data: paper
            });
        } catch (error) {
            logger.error(`添加论文失败: ${error.message}`);
            next(error);
        }
    }

    static async downloadPaper(req, res, next) {
        try {
            const existingPaper = await Paper.findById(req.params.id);
            if (!existingPaper) {
                return res.status(404).json({ 
                    code: 404,
                    message: '论文不存在' 
                });
            }

            // 更新下载次数
            await Paper.incrementDownloadCount(existingPaper.id);
            
            logger.info(`用户 ${req.user.username} 下载了论文: ${existingPaper.title}`);
            res.status(200).json({
                code: 200,
                msg: '论文下载成功',
                body: existingPaper,
                fileUrl: existingPaper.fileUrl
            });
        } catch (error) {
            logger.error(`删除下载失败: ${error.message}`);
            next(error);
        }
    }

    // 查询操作
    static async getBooks(req, res, next) {
        try {
            const {id, title, author, isbn, category} = req.query;
            
            if(id){
                const book=await Book.findById(id);
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
            if(isbn) queryParams.isbn=isbn;
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

    static async getPapers(req, res, next) {
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
            queryParams.userID = req.user.id;

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

    // 借阅操作
    static async borrowBook(req, res, next) {
        try {
            const { bookId } = req.body;
            const existingBookbook = await Book.findById(bookId);
            
            if (!existingBookbook) {
                return res.status(404).json({code: 404, message: '图书不存在'});
            }
            
            const availableQuantity = await Book.getAvailableQuantity(bookId);
            if (availableQuantity <= 0) {
                return res.status(400).json({code: 400, message: '图书已全部借出'});
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(bookId, true);
            if (!updatedBook) {
                return res.status(400).json({code: 400, message: '借阅失败，图书可能已被借出'});
            }

            // 创建借阅记录
            const borrowLog = await BorrowLog.create({
                userId: req.user.id,
                bookId,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
            });

            logger.info(`用户 ${req.user.username} 借阅了图书: ${updatedBook.title}`);
            res.status(201).json({
                code: 201,
                msg: '借阅成功',
                data: borrowLog,
                borrowLogID: borrowLog.id
            });
        } catch (error) {
            next(error);
        }
    }

    static async returnBook(req, res, next) {
        try {
            const { borrowId } = req.body;
            const borrowLog = await BorrowLog.return(borrowId);
            
            if (!borrowLog) {
                return res.status(404).json({code: 404, message: '借阅记录不存在'});
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(borrowLog.bookId, false);
            if (!updatedBook) {
                return res.status(400).json({code: 400, message: '归还失败，请联系管理员'});
            }

            logger.info(`用户 ${req.user.username} 归还了图书: ${updatedBook.title}`);
            res.status(201).json({
                code: 201,
                msg: '归还成功',
                data: borrowLog
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController; 