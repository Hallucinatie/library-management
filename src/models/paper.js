const { pool } = require('../config/database');

class Paper {
    // 创建新论文
    static async create(paperData) {
        const { title, author, abstract, keywords, fileUrl, isPublic, userId, category, publicationDate } = paperData;
        const query = `
            INSERT INTO papers (
                title, author, abstract, keywords, fileUrl, isPublic, 
                userId, category, publicationDate
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            title, author, abstract, keywords, fileUrl, isPublic, 
            userId, category, publicationDate
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新论文信息
    static async update(id, paperData) {
        const { title, author, abstract, keywords, fileUrl, isPublic, category, publicationDate } = paperData;
        const query = `
            UPDATE papers 
            SET title = $1, author = $2, abstract = $3, keywords = $4,
                fileUrl = $5, isPublic = $6, category = $7, publicationDate = $8
            WHERE id = $9
            RETURNING *
        `;
        const values = [
            title, author, abstract, keywords, fileUrl, isPublic,
            category, publicationDate, id
        ];
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
            ? 'SELECT * FROM papers WHERE isPublic = true ORDER BY createdAt DESC'
            : 'SELECT * FROM papers ORDER BY createdAt DESC';
        const { rows } = await pool.query(query);
        return rows;
    }

    // 根据ID获取论文
    static async findById(id) {
        const query = 'SELECT * FROM papers WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 更新下载次数
    static async incrementDownloadCount(id) {
        const query = `
            UPDATE papers 
            SET downloadCount = downloadCount + 1 
            WHERE id = $1 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取用户的论文
    static async findByUserId(userId) {
        const query = 'SELECT * FROM papers WHERE userId = $1 ORDER BY createdAt DESC';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }
}

module.exports = Paper; 