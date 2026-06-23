const { subjectRepository, expenseRepository } = require('../repositories/financeRepository');

// --- Subjects ---
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await subjectRepository.findAllByUser(req.user.id);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const subject = await subjectRepository.create({ ...req.body, userId: req.user.id });
        res.status(201).json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const subject = await subjectRepository.update(req.params.id, req.user.id, req.body);
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await subjectRepository.delete(req.params.id, req.user.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Expenses ---
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await expenseRepository.findAllByUser(req.user.id, req.query);
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const expense = await expenseRepository.create({ ...req.body, userId: req.user.id });
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const expense = await expenseRepository.update(req.params.id, req.user.id, req.body);
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await expenseRepository.delete(req.params.id, req.user.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
