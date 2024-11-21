const Book = require('../models/book');
const Paper = require('../models/paper');
const logger = require('../config/logger');

class GuestController {
    // 浏览公开论文
    static async browsePapers(req, res, next) {
        try {
            const papers = await Paper.findAll(true); // true 表示只获取公开论文
            const publicPapers = papers.map(paper => ({
                id: paper.id,
                title: paper.title,
                author: paper.author,
                abstract: paper.abstract,
                keywords: paper.keywords,
                category: paper.category,
                publicationDate: paper.publicationDate,
                downloadCount: paper.downloadCount,
                createdAt: paper.createdAt
            }));
            res.json(publicPapers);
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
                description: book.description,
                category: book.category,
                publisher: book.publisher,
                publishDate: book.publishDate,
                createdAt: book.createdAt
            }));
            res.json(publicBooks);
        } catch (error) {
            next(error);
        }
    }

    // 获取论文下载统计
    static async getPaperStats(req, res, next) {
        try {
            const papers = await Paper.findAll(true);
            const stats = {
                totalPapers: papers.length,
                totalDownloads: papers.reduce((sum, paper) => sum + paper.downloadCount, 0),
                categoryStats: papers.reduce((acc, paper) => {
                    acc[paper.category] = (acc[paper.category] || 0) + 1;
                    return acc;
                }, {})
            };
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    // 获取图书统计
    static async getBookStats(req, res, next) {
        try {
            const books = await Book.findAll();
            const stats = {
                totalBooks: books.length,
                totalQuantity: books.reduce((sum, book) => sum + book.quantity, 0),
                categoryStats: books.reduce((acc, book) => {
                    acc[book.category] = (acc[book.category] || 0) + 1;
                    return acc;
                }, {})
            };
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = GuestController; 