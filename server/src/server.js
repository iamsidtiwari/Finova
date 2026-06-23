require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/rooms', roomRoutes);

// Placeholder Routes
app.get('/', (req, res) => {
    res.json({ message: 'Finova API is running' });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Real-time updates
    socket.on('new-expense', (data) => {
        // data: { roomId, expense }
        io.to(data.roomId).emit('expense-added', data.expense);
    });

    socket.on('new-message', (data) => {
        // data: { roomId, message }
        io.to(data.roomId).emit('message-received', data.message);
    });

    socket.on('member-joined', (data) => {
        io.to(data.roomId).emit('new-member', data.member);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const { testConnection } = require('./database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
        console.error('Server startup aborted due to database connection failure.');
        process.exit(1);
    }

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
