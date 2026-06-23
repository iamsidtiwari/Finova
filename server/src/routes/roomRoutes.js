const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', roomController.getRooms);
router.post('/', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.get('/:id', roomController.getRoomDetails);
router.post('/:id/expenses', roomController.addExpense);

module.exports = router;
