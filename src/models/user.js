const { pool } = require('../config/database');

class User {
    // 创建新用户
    static async create(userData) {
        const { username, password, email, role, status } = userData;
        const query = `
            INSERT INTO users (username, password, email, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, role, status, createdAt
        `;
        const values = [username, password, email, role || 'user', status || 'active'];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 更新用户信息
    static async update(id, userData) {
        const { username, email, status } = userData;
        const query = `
            UPDATE users 
            SET username = $1, email = $2, status = $3
            WHERE id = $4
            RETURNING id, username, email, role, status, updatedAt
        `;
        const values = [username, email, status, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // 删除用户
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 获取所有用户
    static async findAll() {
        const query = `
            SELECT id, username, email, role, status, createdAt 
            FROM users 
            ORDER BY createdAt DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    // 根据ID获取用户
    static async findById(id) {
        const query = `
            SELECT id, username, email, role, status, createdAt 
            FROM users 
            WHERE id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // 根据用户名查找用户
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await pool.query(query, [username]);
        return rows[0];
    }
}

module.exports = User; 