const { pool } = require('../config/database');

class Paper {
    // 创建新论文
    static async create(paperData) {
        const {
            title,
            author,
            abstract = null,
            keywords = [],
            fileUrl,
            isPublic = false,
            userId,
            category = null,
            publicationDate = new Date()
        } = paperData;

        const query = `
            INSERT INTO papers (
                title, author, abstract, keywords, fileUrl, isPublic, 
                userId, category, publicationDate
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const processedKeywords = Array.isArray(keywords) ? keywords :
            (typeof keywords === 'string' ? [keywords] : []);

        const values = [
            title,
            author,
            abstract,
            processedKeywords,
            fileUrl,
            isPublic,
            userId,
            category,
            publicationDate
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('论文文件已存在');
            }
            throw error;
        }
    }

    // 更新论文信息
    static async update(id, paperData) {
        // 首先检查论文是否存在
        const existingPaper = await this.findById(id);
        if (!existingPaper) {
            return null;
        }

        // 构建更新字段
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // 动态构建更新字段
        if (paperData.title !== undefined) {
            updateFields.push(`title = $${paramCount}`);
            values.push(paperData.title);
            paramCount++;
        }

        if (paperData.author !== undefined) {
            updateFields.push(`author = $${paramCount}`);
            values.push(paperData.author);
            paramCount++;
        }

        if (paperData.abstract !== undefined) {
            updateFields.push(`abstract = $${paramCount}`);
            values.push(paperData.abstract);
            paramCount++;
        }

        if (paperData.keywords !== undefined) {
            const processedKeywords = Array.isArray(paperData.keywords)
                ? paperData.keywords
                : (typeof paperData.keywords === 'string' ? [paperData.keywords] : []);
            updateFields.push(`keywords = $${paramCount}`);
            values.push(processedKeywords);
            paramCount++;
        }

        if (paperData.fileUrl !== undefined) {
            updateFields.push(`fileUrl = $${paramCount}`);
            values.push(paperData.fileUrl);
            paramCount++;
        }

        if (paperData.isPublic !== undefined) {
            updateFields.push(`isPublic = $${paramCount}`);
            values.push(paperData.isPublic);
            paramCount++;
        }

        if (paperData.category !== undefined) {
            updateFields.push(`category = $${paramCount}`);
            values.push(paperData.category);
            paramCount++;
        }

        if (paperData.publicationDate !== undefined) {
            updateFields.push(`publicationDate = $${paramCount}`);
            values.push(paperData.publicationDate);
            paramCount++;
        }

        // 如果没有要更新的字段，直接返回现有论文
        if (updateFields.length === 0) {
            return existingPaper;
        }

        // 添加 ID 到值数组
        values.push(id);

        const query = `
            UPDATE papers 
            SET ${updateFields.join(', ')},
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('论文文件已存在');
            }
            throw error;
        }
    }

    // 删除论文
    static async delete(id) {
        const query = `
            DELETE FROM papers 
            WHERE id = $1 
            RETURNING id, title, author, fileUrl
        `;
        
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
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

    // 在 Paper 类中添加新的查询方法
    static async findByQuery(queryParams = {}) {
        let query = 'SELECT * FROM papers WHERE 1=1';
        const values = [];
        let paramCount = 1;

        // 构建动态查询条件
        if (queryParams.id) {
            query += ` AND id = $${paramCount}`;
            values.push(queryParams.id);
            paramCount++;
        }

        if (queryParams.title) {
            query += ` AND title ILIKE $${paramCount}`;
            values.push(`%${queryParams.title}%`);
            paramCount++;
        }

        if (queryParams.author) {
            query += ` AND author ILIKE $${paramCount}`;
            values.push(`%${queryParams.author}%`);
            paramCount++;
        }

        if (queryParams.category) {
            query += ` AND category ILIKE $${paramCount}`;
            values.push(`%${queryParams.category}%`);
            paramCount++;
        }

        query += ' ORDER BY createdAt ASC';

        const { rows } = await pool.query(query, values);
        return rows;
    }
}

module.exports = Paper; 