const pool = require('../config/database');

class Paper {
    // 创建新论文
    static async create(paperData) {
        const { title, author, abstract, file_url, is_public } = paperData;
        const query = `
            INSERT INTO papers (title, author, abstract, file_url, is_public)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [title, author, abstract, file_url, is_public];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新论文信息
    static async update(id, paperData) {
        const { title, author, abstract, file_url, is_public } = paperData;
        const query = `
            UPDATE papers 
            SET title = $1, author = $2, abstract = $3, file_url = $4, is_public = $5
            WHERE id = $6
            RETURNING *
        `;
        const values = [title, author, abstract, file_url, is_public, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 删除论文
    static async delete(id) {
        const query = 'DELETE FROM papers WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取所有论文
    static async findAll(isPublicOnly = false) {
        const query = isPublicOnly 
            ? 'SELECT * FROM papers WHERE is_public = true'
            : 'SELECT * FROM papers';
        const { rows } = await pool.query(query);
        return rows;
    }

    // 根据ID获取论文
    static async findById(id) {
        const query = 'SELECT * FROM papers WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Paper; 