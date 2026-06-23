const { roomRepository, roomExpenseRepository } = require('../repositories/roomRepository');
const settlementService = require('../services/settlementService');
const crypto = require('crypto');

exports.createRoom = async (req, res) => {
    try {
        const inviteCode = 'FIN-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const room = await roomRepository.create({ ...req.body, inviteCode, ownerId: req.user.id });
        await roomRepository.addMember(room.id, req.user.id, 'Owner');
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const room = await roomRepository.findByInviteCode(inviteCode);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const member = await roomRepository.addMember(room.id, req.user.id);
        res.json({ room, member });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'Already a member' });
        res.status(500).json({ message: err.message });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const rooms = await roomRepository.findAllByUser(req.user.id);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { roomId, amount, description, date, splits, splitType } = req.body;

        // 1. Create Room Expense
        const expense = await roomExpenseRepository.create({
            roomId,
            paidBy: req.user.id,
            amount,
            description,
            date: date || new Date()
        });

        // 2. Create Splits
        // splits: [{ userId, amount, percent, shares }]
        for (const split of splits) {
            await roomExpenseRepository.addSplit({
                expenseId: expense.id,
                userId: split.userId,
                amount: split.amount,
                percent: split.percent,
                shares: split.shares,
                splitType
            });
        }

        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRoomDetails = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await roomRepository.findById(roomId);
        const members = await roomRepository.getMembers(roomId);
        const expenses = await roomExpenseRepository.getExpensesByRoom(roomId);

        // Enrich expenses with splits
        const enrichedExpenses = await Promise.all(expenses.map(async (e) => {
            const splits = await roomExpenseRepository.getSplitsByExpense(e.id);
            return { ...e, splits };
        }));

        // Calculate settlements
        const settlements = await settlementService.getRoomSettlements(enrichedExpenses, members);

        res.json({ room, members, expenses: enrichedExpenses, settlements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
