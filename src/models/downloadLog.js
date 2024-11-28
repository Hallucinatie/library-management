const { pool } = require('../config/database');

class DownloadLog {
    // 转换为驼峰命名
    static _convertToCamelCase(log) {
        if (!log) return null;
        return {
            id: log.id,
            userId: log.user_id,
            paperId: log.paper_id,
            paperTitle: log.paper_title,
            paperAuthor: log.paper_author,
            downloadDate: log.download_date,
            createdAt: log.created_at,
        };
    }

    // 转换为蛇形命名
    static _convertToSnakeCase(logData) {
        const converted = {};
        if (logData.id) converted.id = logData.id;
        if (logData.userId) converted.user_id = logData.userId;
        if (logData.paperId) converted.paper_id = logData.paperId;
        if (logData.paperTitle) converted.paper_title = logData.paperTitle;
        if (logData.paperAuthor) converted.paper_author = logData.paperAuthor;
        if (logData.downloadDate) converted.download_date = logData.downloadDate;
        if (logData.createdAt) converted.created_at = logData.createdAt;

        return converted;
    }

    // 创建借阅记录
    static async create(downloadData) {
        const snakeCaseData = this._convertToSnakeCase(downloadData);
        const query = `
            INSERT INTO download_logs (user_id, paper_id, paper_title, paper_author, download_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            snakeCaseData.user_id,
            snakeCaseData.paper_id,
            snakeCaseData.paper_title,
            snakeCaseData.paper_author,
            snakeCaseData.download_date
        ];
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    // 删除借阅记录
    static async delete(id) {
        const query = 'DELETE FROM download_logs WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 根据ID获取借阅记录
    static async findByQuery(queryParams = {}) {
        let query = "SELECT * FROM download_logs WHERE 1=1";
        const values = [];
        let paramCount = 1;
    
        // borrowDate, dueDate, returnDate, status
        // 精确匹配字段
        const equalFields = {
            id: "id",
            userId: "user_id",
            paperId: "paper_id"
        };

        Object.entries(equalFields).forEach(([param, field]) => {
            if (queryParams[param]) {
                query += ` AND ${field} = $${paramCount}`;
                values.push(queryParams[param]);
                paramCount++;
            }
        });
    
        // 模糊匹配其他字段
        const likeFields = {
            paperTitle: "paper_title",
            paperAuthor: "paper_author",
            downloadDate: "download_date",
        };
    
        Object.entries(likeFields).forEach(([param, field]) => {
            if (queryParams[param]) {
                query += ` AND ${field} ILIKE $${paramCount}`;
                values.push(`%${queryParams[param]}%`);
                paramCount++;
            }
        });
    
        query += " ORDER BY created_at ASC";
    
        const { rows } = await pool.query(query, values);
        return rows.map((row) => this._convertToCamelCase(row));
    }
    
}

module.exports = DownloadLog; 