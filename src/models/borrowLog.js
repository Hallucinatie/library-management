const { pool } = require('../config/database');

class BorrowLog {
    // 创建借阅记录
    static async create(borrowData) {
        const { userId, bookId, borrowDate, dueDate } = borrowData;
        const query = `
            INSERT INTO borrowLogs (userId, bookId, borrowDate, dueDate, status)
            VALUES ($1, $2, $3, $4, 'borrowed')
            RETURNING *
        `;
        const values = [userId, bookId, borrowDate || new Date(), dueDate];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新借阅状态（还书）
    static async return(id) {
        const query = `
            UPDATE borrowLogs 
            SET status = 'returned', returnDate = CURRENT_TIMESTAMP
            WHERE id = $1 AND status = 'borrowed'
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 删除借阅记录
    static async delete(id) {
        const query = 'DELETE FROM borrowLogs WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取所有借阅记录
    static async findAll() {
        const query = `
            SELECT bl.*, u.username, b.title as bookTitle
            FROM borrowLogs bl
            JOIN users u ON bl.userId = u.id
            JOIN books b ON bl.bookId = b.id
            ORDER BY bl.borrowDate DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    // 根据ID获取借阅记录
    static async findById(id) {
        const query = `
            SELECT bl.*, u.username, b.title as book_title
            FROM borrow_logs bl
            JOIN users u ON bl.user_id = u.id
            JOIN books b ON bl.book_id = b.id
            WHERE bl.id = $1
    `   ;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取用户的借阅记录
    static async findByUserId(userId) {
        const query = `
            SELECT bl.*, b.title as bookTitle
            FROM borrowLogs bl
            JOIN books b ON bl.bookId = b.id
            WHERE bl.userId = $1
            ORDER BY bl.borrowDate DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }

    // 获取图书的借阅记录
    static async findByUserId(bookId) {
        const query = `
            SELECT bl.*, b.title as book_title
            FROM borrow_logs bl
            JOIN books b ON bl.book_id = b.id
            WHERE bl.book_id = $1
            ORDER BY bl.borrow_date DESC
        `;
        const { rows } = await pool.query(query, [bookId]);
        return rows;
    }

    // 获取逾期未还的借阅记录
    static async findOverdue() {
        const query = `
            SELECT bl.*, u.username, b.title as bookTitle
            FROM borrowLogs bl
            JOIN users u ON bl.userId = u.id
            JOIN books b ON bl.bookId = b.id
            WHERE bl.status = 'borrowed' 
            AND bl.dueDate < CURRENT_DATE
            ORDER BY bl.dueDate ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    // 计算罚款
    static async calculateFine(id) {
        const query = `
            UPDATE borrowLogs 
            SET fine = CASE 
                WHEN status = 'borrowed' AND dueDate < CURRENT_TIMESTAMP 
                THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - dueDate)) * 1.00
                ELSE fine 
                END
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取用户当前借阅数量
    static async getCurrentBorrowCount(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM borrowLogs
            WHERE userId = $1 AND status = 'borrowed'
        `;
        const { rows } = await pool.query(query, [userId]);
        return parseInt(rows[0].count);
    }
}

module.exports = BorrowLog; 