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

const normalizeUrl = (url) => (url ? url.trim().replace(/\/+$/, '') : '');

const allowedOrigins = [
    normalizeUrl(process.env.CLIENT_URL),
    normalizeUrl(process.env.FRONTEND_URL),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
].filter(Boolean);

if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((u) => {
        const norm = normalizeUrl(u);
        if (norm && !allowedOrigins.includes(norm)) {
            allowedOrigins.push(norm);
        }
    });
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normOrigin = normalizeUrl(origin);
        const isAllowed = allowedOrigins.some(allowed => normOrigin === allowed || normOrigin.endsWith('.vercel.app'));
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn('CORS request from origin:', origin);
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/rooms', roomRoutes);

const db = require('./database');

// Health & Info endpoints
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Finova API is running' });
});

app.get('/api/health', async (req, res) => {
    const isDbConnected = await db.testConnection();
    res.json({
        success: true,
        message: 'Finova API is running',
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('new-expense', (data) => {
        io.to(data.roomId).emit('expense-added', data.expense);
    });

    socket.on('new-message', (data) => {
        io.to(data.roomId).emit('message-received', data.message);
    });

    socket.on('member-joined', (data) => {
        io.to(data.roomId).emit('new-member', data.member);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

const initializeDatabase = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                full_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                profile_photo TEXT,
                currency_preference TEXT DEFAULT '₹',
                theme_preference TEXT DEFAULT 'dark',
                refresh_token TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database schema (users table) verified.');
    } catch (err) {
        console.error('Schema initialization error:', err.message);
    }
};

const startServer = async () => {
    server.listen(PORT, '0.0.0.0', async () => {
        console.log(`Finova Server running on port ${PORT} (0.0.0.0)`);
        console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

        const isDbConnected = await db.testConnection();
        if (isDbConnected) {
            await initializeDatabase();
        } else {
            console.warn('Database connection warning: PostgreSQL not immediately connected. Health check will report status.');
        }
    });
};

startServer();
