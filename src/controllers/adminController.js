const Book = require("../models/book");
const Paper = require("../models/paper");
const User = require("../models/user");
const BorrowLog = require("../models/borrowLog");
const DownloadLog = require("../models/downloadLog");
const logger = require("../config/logger");
const pool = require("../config/database").pool;
const bcrypt = require("bcrypt");

class AdminController {
  // 书籍管理
  static async addBook(req, res, next) {
    try {
      const bookData = {
        ...req.body,
        userId: req.user.id, // 这里自动绑定当前登录用户的ID，通过解析token获取
      };

      const book = await Book.create(bookData);
      logger.info(`新书籍已添加: ${book.title}`);
      res.status(200).json({
        code: 200,
        msg: "书籍添加成功",
        data: book,
      });
    } catch (error) {
      logger.error(`添加书籍失败: ${error.message}`);
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    try {
      const existingBook = await Book.findById(req.params.id);
      if (!existingBook) {
        return res.status(404).json({
          code: 404,
          msg: "未找到该书籍",
          data: null,
        });
      }

      const book = await Book.update(req.params.id, req.body);

      logger.info(`书籍已更新: ${book.title}`);
      res.json({
        code: 200,
        msg: "书籍更新成功",
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      const existingBook = await Book.findById(req.params.id);
      if (!existingBook) {
        return res.status(404).json({
          code: 404,
          msg: "未找到该书籍",
          data: null,
        });
      }

      const book = await Book.delete(req.params.id);

      logger.info(
        `书籍已删除: ${book.title}, ID: ${book.id}, 删除者: ${req.user.username}`
      );
      res.json({
        code: 200,
        msg: "书籍删除成功",
        data: {
          id: book.id,
          title: book.title,
        },
      });
    } catch (error) {
      logger.error(`删除书籍失败: ${error.message}`);
      next(error);
    }
  }

  static async getBooks(req, res, next) {
    try {
      const { id, title, author, isbn, category } = req.query;
      const queryParams = { id, title, author, isbn, category };

      const books = await Book.findByQuery(queryParams);

      if (books.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: "未找到符合条件的书籍",
          data: null,
        });
      }

      res.json({
        code: 200,
        msg: "查询成功",
        data: books,
        total: books.length,
      });
    } catch (error) {
      logger.error(`查询书籍失败: ${error.message}`);
      next(error);
    }
  }

  // 论文管理
  static async addPaper(req, res, next) {
    try {
      const paperData = {
        ...req.body,
        userId: req.user.id, // 这里自动绑定当前登录用户的ID
      };

      const paper = await Paper.create(paperData);
      logger.info(`新论文已添加: ${paper.title}`);
      res.status(200).json({
        code: 200,
        msg: "论文添加成功",
        data: paper,
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
          msg: "未找到该论文",
          data: null,
        });
      }

      const paper = await Paper.update(req.params.id, req.body);

      logger.info(`论文已更新: ${paper.title}`);

      res.json({
        code: 200,
        msg: "论文更新成功",
        data: paper,
      });
    } catch (error) {
      logger.error(`更新论文失败: ${error.message}`);

      if (error.message === "论文文件已存在") {
        return res.status(400).json({
          code: 400,
          msg: error.message,
          data: null,
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
          msg: "未找到该论文",
          data: null,
        });
      }

      // 执行删除操作
      const paper = await Paper.delete(req.params.id);

      logger.info(
        `论文已删除: ${paper.title}, ID: ${paper.id}, 删除者: ${req.user.username}`
      );

      res.json({
        code: 200,
        msg: "论文删除成功",
        data: {
          id: paper.id,
          title: paper.title,
        },
      });
    } catch (error) {
      logger.error(`删除论文失败: ${error.message}`);
      next(error);
    }
  }

  static async getPapers(req, res, next) {
    try {
      const { id, title, author, category } = req.query;
      const queryParams = { id, title, author, category };

      const papers = await Paper.findByQuery(queryParams);

      if (papers.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: "未找到符合条件的论文",
          data: null,
        });
      }

      res.json({
        code: 200,
        msg: "查询成功",
        data: papers,
        total: papers.length,
      });
    } catch (error) {
      logger.error(`查询论文失败: ${error.message}`);
      next(error);
    }
  }

  // 用户管理
  static async addUser(req, res, next) {
    try {
      const { username, password, email } = req.body;

      // 检查用户名是否已存在
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          msg: "用户名已存在",
          data: null,
        });
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          code: 400,
          msg: "邮箱已被使用",
          data: null,
        });
      }

      // 加密密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建新用户
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        role: "user",
        status: "active",
      });

      logger.info(`管理员 ${req.user.username} 创建了新用户: ${username}`);

      // 返回用户信息（不包含密码）
      res.status(200).json({
        code: 200,
        msg: "用户添加成功",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      logger.error(`添加用户失败: ${error.message}`);
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      // 首先检查用户是否存在
      const existingUser = await User.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({
          code: 404,
          msg: '未找到该用户',
          data: null
        });
      }

      const { username, status, resetPassword } = req.body;
      const updateData = {};

      // 如果提供了用户名，检查是否与其他用户重复
      if (username && username !== existingUser.username) {
        const userWithSameUsername = await User.findByUsername(username);
        if (userWithSameUsername) {
          return res.status(400).json({
            code: 400,
            msg: '用户名已存在',
            data: null
          });
        }
        updateData.username = username;
      }

      // 如果要重置密码
      if (resetPassword === true) {
        const saltRounds = 10;
        const defaultPassword = '123456';
        updateData.password = await bcrypt.hash(defaultPassword, saltRounds);
        logger.info(`管理员 ${req.user.username} 重置了用户 ${existingUser.username} 的密码`);
      }

      // 更新状态
      if (status) updateData.status = status;

      // 如果没有任何要更新的字段
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '没有提供任何要更新的字段',
          data: null
        });
      }

      // 执行更新
      const updatedUser = await User.update(req.params.id, updateData);

      logger.info(`用户已更新: ${updatedUser.username}`);

      // 返回更新后的用户信息（不包含密码）
      res.json({
        code: 200,
        msg: '用户更新成功',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      logger.error(`更新用户失败: ${error.message}`);
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const existingUser = await User.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({
          code: 404,
          msg: "未找到该用户",
          data: null,
        });
      }

      const user = await User.delete(req.params.id);

      logger.info(`用户已删除: ${user.username}`);

      res.json({
        code: 200,
        msg: "用户删除成功",
        data: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (error) {
      logger.error(`删除用户失败: ${error.message}`);
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const { id, username, email, role, status } = req.query;
      const queryParams = { id, username, email, role, status };
      const users = await User.findByQuery(queryParams);

      if (users.length == 0) {
        return res.json({
          code: 404,
          msg: "未找到符合所有条件的用户",
          data: null,
        });
      }

      res.json({
        code: 200,
        msg: "查询成功",
        data: users,
        total: users.length,
      });
    } catch (error) {
      logger.error(`查询用户失败: ${error.message}`);
      next(error);
    }
  }

  // 借阅管理
    static async deleteBorrowLog(req, res, next) {
        try {
            const borrowLogId = req.params.id;
            const borrowLog = await BorrowLog.delete(borrowLogId);
            if (!borrowLog) {
                return res.status(404).json({ code: 404, message: "未找到该借阅记录" });
            }
            logger.info(`借阅记录已删除: ID ${borrowLog.id}`);
            res.status(200).json({
                code: 200,
                msg: "借阅记录删除成功",
                data: borrowLog
            });
        } catch (error) {
            next(error);
        }
    }

    static async getBorrowLogs(req, res, next) {
        try {
            const { id, userId, 
                bookId, bookTitle, bookAuthor, bookIsbn, 
                borrowDate, dueDate, returnDate, 
                status } = req.query;

            const queryParams = { id, userId, 
                bookId, bookTitle, bookAuthor, bookIsbn, 
                borrowDate, dueDate, returnDate, 
                status };
            const findBorrowLogs = await BorrowLog.findByQuery(queryParams);
                
            if (findBorrowLogs.length === 0) {
                return res.status(404).json({
                code: 404,
                messsage: "未找到符合条件的借阅记录",
                });
            }

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

  // 下载管理
    static async deleteDownloadLog(req, res, next) {
        try {
            const downloadLogId = req.params.id;
            const downloadLog = await DownloadLog.delete(downloadLogId);
            if (!downloadLog) {
                return res.status(404).json({ code: 404, message: "未找到该下载记录" });
            }
            logger.info(`下载记录已删除: ID ${downloadLog.id}`);
            res.status(200).json({
                code: 200,
                msg: "下载记录删除成功",
                data: downloadLog
            });
        } catch (error) {
            next(error);
        }
    }

    static async getDownloadLogs(req, res, next) {
        try {
            const { id, userId, paperId, paperTitle, paperAuthor, downloadDate } = req.query;

            const queryParams = { id, userId, paperId, paperTitle, paperAuthor, downloadDate };
            const findDownloadLogs = await DownloadLog.findByQuery(queryParams);

            if (findDownloadLogs.length === 0) {
                return res.status(404).json({
                code: 404,
                messsage: "未找到符合条件的下载记录",
                });
            }

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

  // 统计信息
  static async getStatistics(req, res, next) {
    try {
      // So I guess it's the begining of the end, or the end of the begining?
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
          activeBorrows: parseInt(borrowStats.rows[0].activeborrows),
        },
        resources: {
          totalBooks: parseInt(resourceStats.rows[0].totalbooks),
          totalPapers: parseInt(resourceStats.rows[0].totalpapers),
        },
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
          msg: "用户名已存在",
          data: null,
        });
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          code: 400,
          msg: "邮箱已被使用",
          data: null,
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
        role: "admin",
        status: "active",
      });

      logger.info(
        `管理员 ${req.user.username} 创建了新管理员账号: ${username}`
      );

      // 返回创建的管理员信息（不包含密码）
      res.status(200).json({
        code: 200,
        msg: "管理员账号创建成功",
        data: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          status: newAdmin.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

    static async clearLocalPaperCache(req, res, next) {
        try {

            const cleanedFiles = await Paper.clearDirectory('localPapers/');

            res.json({
                code: 200,
                msg: "清空成功",
                data: cleanedFiles
            });

        } catch (error) {
            logger.error(`本地论文缓存清空失败: ${error.message}`);
            next(error);
        }
    }
}

module.exports = AdminController;
