const pool = require('../config/database');

class BorrowLog {
    // 创建借阅记录
    static async create(borrowData) {
        const { user_id, book_id, borrow_date, due_date } = borrowData;
        const query = `
            INSERT INTO borrow_logs (user_id, book_id, borrow_date, due_date, status)
            VALUES ($1, $2, $3, $4, 'borrowed')
            RETURNING *
        `;
        const values = [user_id, book_id, borrow_date || new Date(), due_date];
        const { rows } = await pool.query(query, values);
        return rows[0];
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
        return rows[0];
    }

    // 删除借阅记录
    static async delete(id) {
        const query = 'DELETE FROM borrow_logs WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
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
        return rows;
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
        return rows;
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
        return rows;
    }
}

module.exports = BorrowLog; 