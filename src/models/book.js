const { pool } = require('../config/database');

class Book {
    // 创建新书籍
    static async create(bookData) {
        const { title, author, isbn, quantity, description, category, publisher, publishDate } = bookData;
        const query = `
            INSERT INTO books (title, author, isbn, quantity, loans, description, category, publisher, publishDate)
            VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [title, author, isbn, quantity, description, category, publisher, publishDate];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新书籍信息
    static async update(id, bookData) {
        const { title, author, isbn, quantity, description, category, publisher, publishDate } = bookData;
        const query = `
            UPDATE books 
            SET title = $1, author = $2, isbn = $3, quantity = $4, description = $5,
                category = $6, publisher = $7, publishDate = $8
            WHERE id = $9
            RETURNING *
        `;
        const values = [title, author, isbn, quantity, description, category, publisher, publishDate, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新借出数量
    static async updateLoans(id, increment = true) {
        const query = `
            UPDATE books 
            SET loans = loans ${increment ? '+' : '-'} 1
            WHERE id = $1 AND 
                  ${increment ? 'loans < quantity' : 'loans > 0'}
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取可借数量
    static async getAvailableQuantity(id) {
        const query = 'SELECT quantity - loans as available FROM books WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0]?.available || 0;
    }

    // 删除书籍
    static async delete(id) {
        const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取所有书籍
    static async findAll() {
        const query = 'SELECT * FROM books ORDER BY createdAt DESC';
        const { rows } = await pool.query(query);
        return rows;
    }

    // 根据ID获取书籍
    static async findById(id) {
        const query = 'SELECT * FROM books WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Book; 