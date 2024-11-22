const { pool } = require('../config/database');

class User {
    // 转换为驼峰命名
    static _convertToCamelCase(user) {
        if (!user) return null;
        return {
            id: user.id,
            username: user.username,
            password: user.password,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }

    // 转换为蛇形命名
    static _convertToSnakeCase(userData) {
        const converted = {};
        if (userData.createdAt) converted.created_at = userData.createdAt;
        if (userData.updatedAt) converted.updated_at = userData.updatedAt;

        // 保持原样的字段
        if (userData.username) converted.username = userData.username;
        if (userData.password) converted.password = userData.password;
        if (userData.email) converted.email = userData.email;
        if (userData.role) converted.role = userData.role;
        if (userData.status) converted.status = userData.status;

        return converted;
    }

    // 创建新用户
    static async create(userData) {
        const snakeCaseData = this._convertToSnakeCase(userData);
        const query = `
            INSERT INTO users (username, password, email, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            userData.username,
            userData.password,
            userData.email,
            userData.role || 'user',
            userData.status || 'active'
        ];
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    // 更新用户信息
    static async update(id, userData) {
        const snakeCaseData = this._convertToSnakeCase(userData);
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
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const { rows } = await pool.query(query, values);
        return this._convertToCamelCase(rows[0]);
    }

    // 删除用户
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 获取所有用户
    static async findAll() {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows.map(row => this._convertToCamelCase(row));
    }

    // 根据ID获取用户
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return this._convertToCamelCase(rows[0]);
    }

    // 根据用户名查找用户
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await pool.query(query, [username]);
        return this._convertToCamelCase(rows[0]);
    }

    // 根据邮箱查找用户
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return this._convertToCamelCase(rows[0]);
    }
}

module.exports = User; 