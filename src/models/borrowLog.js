const { pool } = require('../config/database');

class BorrowLog {
    // 转换为驼峰命名
    static _convertToCamelCase(log) {
        if (!log) return null;
        return {
            id: log.id,
            userId: log.user_id,
            bookId: log.book_id,
            borrowDate: log.borrow_date,
            dueDate: log.due_date,
            returnDate: log.return_date,
            status: log.status,
            createdAt: log.created_at,
            updatedAt: log.updated_at,
            // 关联数据的转换
            username: log.username,
            bookTitle: log.book_title
        };
    }

    // 转换为蛇形命名
    static _convertToSnakeCase(logData) {
        const converted = {};
        if (logData.userId) converted.user_id = logData.userId;
        if (logData.bookId) converted.book_id = logData.bookId;
        if (logData.borrowDate) converted.borrow_date = logData.borrowDate;
        if (logData.dueDate) converted.due_date = logData.dueDate;
        if (logData.returnDate) converted.return_date = logData.returnDate;
        if (logData.createdAt) converted.created_at = logData.createdAt;
        if (logData.updatedAt) converted.updated_at = logData.updatedAt;
        if (logData.bookTitle) converted.book_title = logData.bookTitle;

        // 保持原样的字段
        if (logData.status) converted.status = logData.status;
        if (logData.username) converted.username = logData.username;

        return converted;
    }

    // 创建借阅记录
    static async create(borrowData) {
        const snakeCaseData = this._convertToSnakeCase(borrowData);
        const query = `
            INSERT INTO borrow_logs (user_id, book_id, borrow_date, due_date, status)
            VALUES ($1, $2, $3, $4, 'borrowed')
            RETURNING *
        `;
        const values = [
            snakeCaseData.user_id,
            snakeCaseData.book_id,
            snakeCaseData.borrow_date || new Date(),
            snakeCaseData.due_date
        ];
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    // 更新借阅状态（还书）
    static async return(id) {
        const query = `
            UPDATE borrow_logs 
            SET status = 'returned', return_date = CURRENT_TIMESTAMP
            WHERE id = $1 AND status = 'borrowed'
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 删除借阅记录
    static async delete(id) {
        const query = 'DELETE FROM borrow_logs WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 获取所有借阅记录
    static async findAll() {
        const query = `
            SELECT bl.*, u.username, b.title as book_title
            FROM borrow_logs bl
            JOIN users u ON bl.user_id = u.id
            JOIN books b ON bl.book_id = b.id
            ORDER BY bl.borrow_date DESC
        `;
        const { rows } = await pool.query(query);
        return rows.map(row => this._convertToCamelCase(row));
    }

    // 根据ID获取借阅记录
    static async findByQuery(queryParams = {}) {
        let query = "SELECT * FROM borrow_logs WHERE 1=1";
        const values = [];
        let paramCount = 1;
    
        // borrowDate, dueDate, returnDate, status
        // 精确匹配字段
        const equalFields = {
            id: "id",
            userID: "user_id",
            bookID: "book_id"
        };

        Object.entries(equalFields).forEach(([param, field]) => {
            if (queryParams[param]) {
                query += ` AND ${field} = $${paramCount}`;
                values.push(queryParams[param]);
                paramCount++;
            }
        });
    
        // 模糊匹配其他字段
        const likeFields = {
            borrowDate: "borrow_date",
            dueDate: "due_date",
            returnDate: "return_date",
            status: "status"
        };
    
        Object.entries(likeFields).forEach(([param, field]) => {
            if (queryParams[param]) {
                query += ` AND ${field} ILIKE $${paramCount}`;
                values.push(`%${queryParams[param]}%`);
                paramCount++;
            }
        });
    
        query += " ORDER BY created_at DESC";
    
        const { rows } = await pool.query(query, values);
        return rows.map((row) => this._convertToCamelCase(row));
    }
    
}

module.exports = BorrowLog; 