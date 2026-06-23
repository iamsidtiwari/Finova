const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const auth = require('../middlewares/auth');

router.use(auth);

// Subjects
router.get('/subjects', financeController.getSubjects);
router.post('/subjects', financeController.createSubject);
router.put('/subjects/:id', financeController.updateSubject);
router.delete('/subjects/:id', financeController.deleteSubject);

// Expenses
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', financeController.createExpense);
router.put('/expenses/:id', financeController.updateExpense);
router.delete('/expenses/:id', financeController.deleteExpense);

module.exports = router;
