const db = require('../database');

class SubjectRepository {
    async findAllByUser(userId) {
        const { rows } = await db.query('SELECT * FROM subjects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return rows;
    }

    async findById(id, userId) {
        const { rows } = await db.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [id, userId]);
        return rows[0];
    }

    async create({ userId, name, icon, color, budgetLimit }) {
        const { rows } = await db.query(
            'INSERT INTO subjects (user_id, name, icon, color, budget_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, name, icon, color, budgetLimit]
        );
        return rows[0];
    }

    async update(id, userId, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${i++}`);
            values.push(value);
        }

        values.push(id, userId);
        const query = `UPDATE subjects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`;
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async delete(id, userId) {
        await db.query('DELETE FROM subjects WHERE id = $1 AND user_id = $2', [id, userId]);
    }
}

class ExpenseRepository {
    async findAllByUser(userId, filters = {}) {
        let query = 'SELECT e.*, s.name as subject_name FROM expenses e LEFT JOIN subjects s ON e.subject_id = s.id WHERE e.user_id = $1';
        const values = [userId];

        if (filters.subjectId) {
            query += ' AND e.subject_id = $' + (values.push(filters.subjectId));
        }
        if (filters.startDate) {
            query += ' AND e.date >= $' + (values.push(filters.startDate));
        }
        if (filters.endDate) {
            query += ' AND e.date <= $' + (values.push(filters.endDate));
        }

        query += ' ORDER BY e.date DESC, e.created_at DESC';
        const { rows } = await db.query(query, values);
        return rows;
    }

    async create({ userId, subjectId, categoryId, amount, note, date, paymentMethod }) {
        const { rows } = await db.query(
            'INSERT INTO expenses (user_id, subject_id, category_id, amount, note, date, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, subjectId, categoryId, amount, note, date, paymentMethod]
        );
        return rows[0];
    }

    async update(id, userId, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${i++}`);
            values.push(value);
        }

        values.push(id, userId);
        const query = `UPDATE expenses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`;
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async delete(id, userId) {
        await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
    }
}

module.exports = {
    subjectRepository: new SubjectRepository(),
    expenseRepository: new ExpenseRepository(),
};
