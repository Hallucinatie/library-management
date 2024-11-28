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
            loansCount: book.loans_count,
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
        if ('title' in bookData) converted.title = bookData.title;
        if ('author' in bookData) converted.author = bookData.author;
        if ('isbn' in bookData) converted.isbn = bookData.isbn;
        if ('quantity' in bookData) converted.quantity = bookData.quantity;
        if ('loans' in bookData) converted.loans = bookData.loans;
        if ('loansCount' in bookData) converted.loans_count = bookData.loansCount;
        if ('description' in bookData) converted.description = bookData.description;
        if ('category' in bookData) converted.category = bookData.category;
        if ('publisher' in bookData) converted.publisher = bookData.publisher;

        return converted;
    }

    // 修改现有方法以使用转换函数
    static async create(bookData) {
        const snakeCaseData = this._convertToSnakeCase(bookData);

        const query = `
            INSERT INTO books (title, author, isbn, quantity, loans, loans_count, description, 
                             category, publisher, publish_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            bookData.title,
            bookData.author,
            bookData.isbn,
            bookData.quantity,
            0,  // initial loans
            0,  // initial loans count.
            bookData.description,
            bookData.category,
            bookData.publisher,
            snakeCaseData.publish_date
        ];

        try {
            const { rows } = await pool.query(query, values);
            return this._convertToCamelCase(rows[0]);
        } catch (error) {
            // TODO: 给图书添加一致性检查
            if (error.code === '23505') {
                throw new Error('图书已存在');
            }
            throw error;
        }
    }

    static async update(id, bookData) {
        const snakeCaseData = this._convertToSnakeCase(bookData);
        const updateFields = [];
        const values = [id];
        let paramCount = 2;

        Object.entries(snakeCaseData).forEach(([key, value]) => {
            updateFields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        if (updateFields.length === 0) {
            return null;
        }

        const query = `
            UPDATE books 
            SET ${updateFields.join(', ')},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        try {
            const { rows } = await pool.query(query, values);
            return this._convertToCamelCase(rows[0]);
        } catch (error) {
            if (error.code == '23505') {
                throw new Error('图书文件已存在');
            }
            throw error;
        }
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

    static async findByQuery(queryParams = {}) {
        let query = 'SELECT * FROM books WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (queryParams.id) {
            query += ` AND id = $${paramCount}`;
            values.push(queryParams.id);
            paramCount++;
        }

        const likeFields = {
            title: 'title',
            author: 'author',
            category: 'category',
            isbn: 'isbn',
        };

        Object.entries(likeFields).forEach(([param, field]) => {
            if (queryParams[param]) {
                query += ` AND ${field} ILIKE $${paramCount}`;
                values.push(`%${queryParams[param]}%`);
                paramCount++;
            }
        });

        query += ' ORDER BY created_at ASC';

        const { rows } = await pool.query(query, values);
        return rows.map(row => this._convertToCamelCase(row));
    }


    static async delete(id) {
        const query = `
            DELETE FROM books 
            WHERE id = $1 
            RETURNING *
            `;

        try {
            const { rows } = await pool.query(query, [id]);
            return this._convertToCamelCase(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    static async updateLoans(id, increment = true) {
        const query = `
            UPDATE books 
            SET loans = loans ${increment ? '+' : '-'} 1, loans_count = loans_count + 1
            WHERE id = $1 AND 
                  ${increment ? 'loans < quantity' : 'loans > 0'}
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    static async getAvailableQuantity(id) {
        const query = 'SELECT quantity - loans as available FROM books WHERE id = $1'; // AND status = 1';
        const { rows } = await pool.query(query, [id]);
        return rows[0]?.available || 0;
    }
}

module.exports = Book; 