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
    static async findById(id) {
        const query = `
            SELECT bl.*, u.username, b.title as book_title
            FROM borrow_logs bl
            JOIN users u ON bl.user_id = u.id
            JOIN books b ON bl.book_id = b.id
            WHERE bl.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 获取用户的借阅记录
    static async findByUserId(userId) {
        const query = `
            SELECT bl.*, b.title as book_title
            FROM borrow_logs bl
            JOIN books b ON bl.book_id = b.id
            WHERE bl.user_id = $1
            ORDER BY bl.borrow_date DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows.map(row => this._convertToCamelCase(row));
    }

    // 获取图书的借阅记录
    static async findByBookId(bookId) {
        const query = `
            SELECT bl.*, b.title as book_title
            FROM borrow_logs bl
            JOIN books b ON bl.book_id = b.id
            WHERE bl.book_id = $1
            ORDER BY bl.borrow_date DESC
        `;
        const { rows } = await pool.query(query, [bookId]);
        return rows.map(row => this._convertToCamelCase(row));
    }

    // 获取逾期未还的借阅记录
    static async findOverdue() {
        const query = `
            SELECT bl.*, u.username, b.title as book_title
            FROM borrow_logs bl
            JOIN users u ON bl.user_id = u.id
            JOIN books b ON bl.book_id = b.id
            WHERE bl.status = 'borrowed' 
            AND bl.due_date < CURRENT_DATE
            ORDER BY bl.due_date ASC
        `;
        const { rows } = await pool.query(query);
        return rows.map(row => this._convertToCamelCase(row));
    }

    // 计算罚款
    static async calculateFine(id) {
        const query = `
            UPDATE borrow_logs 
            SET fine = CASE 
                WHEN status = 'borrowed' AND due_date < CURRENT_TIMESTAMP 
                THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - due_date)) * 1.00
                ELSE fine 
                END
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 获取用户当前借阅数量
    static async getCurrentBorrowCount(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM borrow_logs
            WHERE user_id = $1 AND status = 'borrowed'
        `;
        const { rows } = await pool.query(query, [userId]);
        return parseInt(rows[0].count);
    }
}

module.exports = BorrowLog; 