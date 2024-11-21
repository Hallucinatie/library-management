const Book = require('../models/book');
const Paper = require('../models/paper');
const User = require('../models/user');
const BorrowLog = require('../models/borrowLog');
const logger = require('../config/logger');
const pool = require('../config/database').pool;
const bcrypt = require('bcrypt');

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
            const paperData = {
                ...req.body,
                userId: req.user.id  // 这里自动绑定当前登录用户的ID
            };

            const paper = await Paper.create(paperData);
            logger.info(`新论文已添加: ${paper.title}`);
            res.status(201).json({
                code: 201,
                msg: '论文添加成功',
                data: paper
            });
        } catch (error) {
            logger.error(`添加论文失败: ${error.message}`);
            next(error);
        }
    }

    static async updatePaper(req, res, next) {
        try {
            // 首先检查论文是否存在
            const existingPaper = await Paper.findById(req.params.id);
            if (!existingPaper) {
                return res.status(404).json({
                    code: 404,
                    msg: '未找到该论文',
                    data: null
                });
            }
            // logger.info(`existingPaper.userId: ${existingPaper.userid}, req.user.id: ${req.user.id}`);

            // 检查是否有权限修改（只能修改自己创建的论文）
            // PostgreSQL 返回的列名是小写的
            if (existingPaper.userid !== req.user.id) {
                return res.status(403).json({
                    code: 403,
                    msg: '没有权限修改此论文',
                    data: null
                });
            }

            const paper = await Paper.update(req.params.id, req.body);

            logger.info(`论文已更新: ${paper.title}`);

            res.json({
                code: 200,
                msg: '论文更新成功',
                data: paper
            });
        } catch (error) {
            logger.error(`更新论文失败: ${error.message}`);

            if (error.message === '论文文件已存在') {
                return res.status(400).json({
                    code: 400,
                    msg: error.message,
                    data: null
                });
            }

            next(error);
        }
    }

    static async deletePaper(req, res, next) {
        try {
            // 首先检查论文是否存在
            const existingPaper = await Paper.findById(req.params.id);
            if (!existingPaper) {
                return res.status(404).json({
                    code: 404,
                    msg: '未找到该论文',
                    data: null
                });
            }

            // 检查是否有权限删除（只能删除自己创建的论文）
            if (existingPaper.userid !== req.user.id) {
                return res.status(403).json({
                    code: 403,
                    msg: '没有权限删除此论文',
                    data: null
                });
            }

            // 执行删除操作
            const paper = await Paper.delete(req.params.id);
            
            logger.info(`论文已删除: ${paper.title}, ID: ${paper.id}, 删除者: ${req.user.username}`);
            
            res.json({
                code: 200,
                msg: '论文删除成功',
                data: {
                    id: paper.id,
                    title: paper.title
                }
            });
        } catch (error) {
            logger.error(`删除论文失败: ${error.message}`);
            next(error);
        }
    }

    static async getPapers(req, res, next) {
        try {
            const { id, title, author, category } = req.query;

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
                    COUNT(*) as totalBorrows,
                    COUNT(DISTINCT userId) as uniqueUsers,
                    COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as activeBorrows
                FROM borrowLogs
            `);

            // 获取资源统计
            const resourceStats = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM books) as totalBooks,
                    (SELECT COUNT(*) FROM papers) as totalPapers
            `);

            res.json({
                borrowing: {
                    totalBorrows: parseInt(borrowStats.rows[0].totalborrows),
                    uniqueUsers: parseInt(borrowStats.rows[0].uniqueusers),
                    activeBorrows: parseInt(borrowStats.rows[0].activeborrows)
                },
                resources: {
                    totalBooks: parseInt(resourceStats.rows[0].totalbooks),
                    totalPapers: parseInt(resourceStats.rows[0].totalpapers)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async registerAdmin(req, res, next) {
        try {
            const { username, password, email } = req.body;

            // 检查用户名是否已存在
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    code: 400,
                    msg: '用户名已存在',
                    data: null
                });
            }

            // 检查邮箱是否已存在
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    code: 400,
                    msg: '邮箱已被使用',
                    data: null
                });
            }

            // 加密密码
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 创建新管理员用户
            const newAdmin = await User.create({
                username,
                password: hashedPassword,
                email,
                role: 'admin',
                status: 'active'
            });

            logger.info(`管理员 ${req.user.username} 创建了新管理员账号: ${username}`);

            // 返回创建的管理员信息（不包含密码）
            res.status(201).json({
                code: 201,
                msg: '管理员账号创建成功',
                data: {
                    id: newAdmin.id,
                    username: newAdmin.username,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    status: newAdmin.status
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController; 