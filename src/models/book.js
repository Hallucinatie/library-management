const { pool } = require('../config/database');

class Book {
    // 转换为驼峰命名
    static _convertToCamelCase(book) {
        if (!book) return null;
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            quantity: book.quantity,
            loans: book.loans,
            description: book.description,
            category: book.category,
            publisher: book.publisher,
            publishDate: book.publish_date,
            createdAt: book.created_at,
            updatedAt: book.updated_at
        };
    }

    // 转换为蛇形命名
    static _convertToSnakeCase(bookData) {
        const converted = {};
        if (bookData.publishDate) converted.publish_date = bookData.publishDate;
        if (bookData.createdAt) converted.created_at = bookData.createdAt;
        if (bookData.updatedAt) converted.updated_at = bookData.updatedAt;

        // 保持原样的字段
        if (bookData.title) converted.title = bookData.title;
        if (bookData.author) converted.author = bookData.author;
        if (bookData.isbn) converted.isbn = bookData.isbn;
        if (bookData.quantity) converted.quantity = bookData.quantity;
        if (bookData.loans) converted.loans = bookData.loans;
        if (bookData.description) converted.description = bookData.description;
        if (bookData.category) converted.category = bookData.category;
        if (bookData.publisher) converted.publisher = bookData.publisher;

        return converted;
    }

    // 修改现有方法以使用转换函数
    static async create(bookData) {
        const snakeCaseData = this._convertToSnakeCase(bookData);
        const query = `
            INSERT INTO books (title, author, isbn, quantity, loans, description, 
                             category, publisher, publish_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            bookData.title,
            bookData.author,
            bookData.isbn,
            bookData.quantity,
            0,  // initial loans
            bookData.description,
            bookData.category,
            bookData.publisher,
            snakeCaseData.publish_date
        ];
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    static async update(id, bookData) {
        const snakeCaseData = this._convertToSnakeCase(bookData);
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(snakeCaseData).forEach(([key, value]) => {
            updateFields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        values.push(id);
        const query = `
            UPDATE books 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    static async findAll() {
        const query = 'SELECT * FROM books ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows.map(row => this._convertToCamelCase(row));
    }

    static async findById(id) {
        const query = 'SELECT * FROM books WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    static async delete(id) {
        const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    static async updateLoans(id, increment = true) {
        const query = `
            UPDATE books 
            SET loans = loans ${increment ? '+' : '-'} 1
            WHERE id = $1 AND 
                  ${increment ? 'loans < quantity' : 'loans > 0'}
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    static async getAvailableQuantity(id) {
        const query = 'SELECT quantity - loans as available FROM books WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0]?.available || 0;
    }
}

module.exports = Book; 