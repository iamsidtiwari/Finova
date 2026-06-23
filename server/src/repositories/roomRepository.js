const db = require('../database');

class RoomRepository {
    async findById(id) {
        const { rows } = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
        return rows[0];
    }

    async findByInviteCode(code) {
        const { rows } = await db.query('SELECT * FROM rooms WHERE invite_code = $1', [code]);
        return rows[0];
    }

    async findAllByUser(userId) {
        const { rows } = await db.query(
            `SELECT r.*, rm.role 
             FROM rooms r 
             JOIN room_members rm ON r.id = rm.room_id 
             WHERE rm.user_id = $1`,
            [userId]
        );
        return rows;
    }

    async create({ name, description, type, inviteCode, ownerId, currency }) {
        const { rows } = await db.query(
            'INSERT INTO rooms (name, description, type, invite_code, owner_id, currency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, type, inviteCode, ownerId, currency]
        );
        return rows[0];
    }

    async addMember(roomId, userId, role = 'Member') {
        const { rows } = await db.query(
            'INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
            [roomId, userId, role]
        );
        return rows[0];
    }

    async removeMember(roomId, userId) {
        await db.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);
    }

    async updateMemberRole(roomId, userId, role) {
        await db.query('UPDATE room_members SET role = $1 WHERE room_id = $2 AND user_id = $3', [role, roomId, userId]);
    }

    async getMembers(roomId) {
        const { rows } = await db.query(
            `SELECT rm.*, u.full_name, u.username, u.profile_photo 
             FROM room_members rm 
             JOIN users u ON rm.user_id = u.id 
             WHERE rm.room_id = $1`,
            [roomId]
        );
        return rows;
    }
}

class RoomExpenseRepository {
    async create({ roomId, paidBy, categoryId, amount, description, date }) {
        const { rows } = await db.query(
            'INSERT INTO room_expenses (room_id, paid_by, category_id, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [roomId, paidBy, categoryId, amount, description, date]
        );
        return rows[0];
    }

    async addSplit({ expenseId, userId, amount, percent, shares, splitType }) {
        await db.query(
            'INSERT INTO expense_splits (expense_id, user_id, amount, percent, shares, split_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [expenseId, userId, amount, percent, shares, splitType]
        );
    }

    async getExpensesByRoom(roomId) {
        const { rows } = await db.query(
            `SELECT re.*, u.full_name as paid_by_name 
             FROM room_expenses re 
             JOIN users u ON re.paid_by = u.id 
             WHERE re.room_id = $1 
             ORDER BY re.date DESC, re.created_at DESC`,
            [roomId]
        );
        return rows;
    }

    async getSplitsByExpense(expenseId) {
        const { rows } = await db.query(
            `SELECT es.*, u.full_name 
             FROM expense_splits es 
             JOIN users u ON es.user_id = u.id 
             WHERE es.expense_id = $1`,
            [expenseId]
        );
        return rows;
    }
}

module.exports = {
    roomRepository: new RoomRepository(),
    roomExpenseRepository: new RoomExpenseRepository(),
};
