const Book = require('../models/book');
const Paper = require('../models/paper');
const BorrowLog = require('../models/borrowLog');
const DownloadLog = require('../models/downloadLog');
const logger = require('../config/logger');
const { request } = require('express');
const path = require('path');
const { url } = require('inspector');

class UserController {
    // 论文操作
    static async uploadPaper(req, res, next) {
        try {
            let paperData = {
                ...req.body,
                userId: req.user.id,
                fileUrl: req.body.fileUrl
            };

            if (req.body.localFilePath) {
                const filePath = req.body.localFilePath
                const fileName = path.basename(filePath)
                await Paper.uploadFile('library-management-papers', filePath)
                paperData.fileUrl = `internalFileServer/${fileName}`;
            }

            const paper = await Paper.create(paperData);
            logger.info(`用户 ${req.user.username} 上传了新论文: ${paper.title}`);

            res.status(200).json({
                code: 200,
                msg: '论文上传成功',
                data: paper
            });
        } catch (error) {
            res.status(400).json({
                code: 404,
                message: '论文上传失败, 可能是指定了本地文件但是文件不存在'
            })
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

            // 更新下载次数 生成下载日志
            await Paper.incrementDownloadCount(existingPaper.id);
            await DownloadLog.create({
                userId: req.user.id,
                paperId: existingPaper.id,
                paperTitle: existingPaper.title,
                paperAuthor: existingPaper.author,
                downloadDate: new Date()
            });

            logger.info(`用户 ${req.user.username} 下载了论文: ${existingPaper.title}`);
            
            if (req.query.noDownload == 'true') {
                return res.status(200).json({
                    code: 200,
                    msg: '论文下载成功',
                    data: existingPaper,
                    fileUrl: existingPaper.fileUrl
                });    
            }

            const urlRoot  = existingPaper.fileUrl.split("/")[0];
            const fileName = path.basename(existingPaper.fileUrl);
            if (urlRoot === 'internalFileServer') {
                await Paper.downloadFile(
                    'library-management-papers', 
                    fileName, 
                    'localPapers/downloaded/' + fileName
                );
            } else {
                try {
                    await Paper.downloadFileExternal(
                        existingPaper.fileUrl,
                        'localPapers/downloaded/' + fileName
                    );
                } catch (error) {
                    return res.status(201).json({
                        code: 201,
                        msg: '论文查询成功但无法下载',
                        data: existingPaper,
                        fileUrl: existingPaper.fileUrl
                    }); 
                }
            }

            res.status(200).json({
                code: 200,
                msg: '论文下载成功',
                data: existingPaper,
                fileUrl: existingPaper.fileUrl,
                filePath: 'localPapers/downloaded/' + fileName
            });

        } catch (error) {
            logger.error(`论文下载失败: ${error.message}`);
            next(error);
        }
    }

    static async getDownloadLogs(req, res, next) {
        try {
            const { paperId, paperTitle, paperAuthor, downloadDate } = req.query;
            const id = null;
            const userId = req.user.id;

            const queryParams = { id, userId, paperId, paperTitle, paperAuthor, downloadDate };
            const findDownloadLogs = await DownloadLog.findByQuery(queryParams);

            res.json({
                code: 200,
                msg: "查询成功",
                data: findDownloadLogs,
                total: findDownloadLogs.length,
            });
        } catch (error) {
            logger.error(`查询下载记录失败: ${error.message}`);
            next(error);
        }
    }

    // 查询操作
    static async getBooks(req, res, next) {
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

    static async getPapers(req, res, next) {
        try {
            const { id, title, author, category } = req.query;
            const queryParams = { id, title, author, category };
            queryParams.userId = req.user.id;

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
            const { id } = req.query;
            const existingBookbook = await Book.findById(id);

            if (!existingBookbook) {
                return res.status(404).json({ code: 404, message: '图书不存在' });
            }

            const availableQuantity = await Book.getAvailableQuantity(id);
            if (availableQuantity <= 0) {
                return res.status(400).json({ code: 400, message: '图书已全部借出' });
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(id, true);
            if (!updatedBook) {
                return res.status(400).json({ code: 400, message: '借阅失败，图书可能已被借出' });
            }

            // 创建借阅记录
            const borrowLog = await BorrowLog.create({
                userId: req.user.id,
                bookId: id,
                bookTitle: updatedBook.title,
                bookAuthor: updatedBook.author,
                bookIsbn: updatedBook.isbn,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
            });

            logger.info(`用户 ${req.user.username} 借阅了图书: ${updatedBook.title}`);
            res.status(200).json({
                code: 200,
                msg: '借阅成功',
                data: borrowLog,
                borrowLogId: borrowLog.id
            });
        } catch (error) {
            next(error);
        }
    }

    static async returnBook(req, res, next) {
        try {
            const borrowId = req.query.borrowId;
            const borrowLog = await BorrowLog.return(borrowId);

            if (!borrowLog) {
                return res.status(404).json({ code: 404, message: '借阅记录不存在' });
            }

            // 更新借出数量
            const updatedBook = await Book.updateLoans(borrowLog.bookId, false);
            if (!updatedBook) {
                return res.status(400).json({ code: 400, message: '归还失败，请联系管理员' });
            }

            logger.info(`用户 ${req.user.username} 归还了图书: ${updatedBook.title}`);
            res.status(200).json({
                code: 200,
                msg: '归还成功',
                data: borrowLog
            });
        } catch (error) {
            next(error);
        }
    }

    static async getBorrowLogs(req, res, next) {
        try {
            const {
                bookId, bookTitle, bookAuthor, bookIsbn,
                borrowDate, dueDate, returnDate,
                status
            } = req.query;
            const id = null;
            const userId = req.user.id;

            const queryParams = {
                id, userId,
                bookId, bookTitle, bookAuthor, bookIsbn,
                borrowDate, dueDate, returnDate,
                status
            };
            const findBorrowLogs = await BorrowLog.findByQuery(queryParams);

            res.json({
                code: 200,
                msg: "查询成功",
                data: findBorrowLogs,
                total: findBorrowLogs.length,
            });
        } catch (error) {
            logger.error(`查询借阅记录失败: ${error.message}`);
            next(error);
        }
    }
}

module.exports = UserController; 