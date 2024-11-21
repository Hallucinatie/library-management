const { pool } = require('../config/database');

class Book {
    // 创建新书籍
    static async create(bookData) {
        const { title, author, isbn, quantity, description, category, publisher, publishDate, location } = bookData;
        const query = `
            INSERT INTO books (title, author, isbn, quantity, description, category, publisher, publishDate, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [title, author, isbn, quantity, description, category, publisher, publishDate, location];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新书籍信息
    static async update(id, bookData) {
        const { title, author, isbn, quantity, description, category, publisher, publishDate, location } = bookData;
        const query = `
            UPDATE books 
            SET title = $1, author = $2, isbn = $3, quantity = $4, description = $5,
                category = $6, publisher = $7, publishDate = $8, location = $9
            WHERE id = $10
            RETURNING *
        `;
        const values = [title, author, isbn, quantity, description, category, publisher, publishDate, location, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
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