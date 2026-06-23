const db = require('../database');

class UserRepository {
    async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    async findByUsername(username) {
        const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        return rows[0];
    }

    async findById(id) {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    async create({ fullName, username, email, passwordHash }) {
        const { rows } = await db.query(
            'INSERT INTO users (full_name, username, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
            [fullName, username, email, passwordHash]
        );
        return rows[0];
    }

    async updateRefreshToken(userId, token) {
        await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [token, userId]);
    }

    async updateProfile(userId, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${i++}`);
            values.push(value);
        }

        values.push(userId);
        const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`;
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = new UserRepository();
