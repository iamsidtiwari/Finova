const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';

        // 1. Validation
        if (!fullName || !username || !normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (fullName, username, email, password) are required'
            });
        }

        // 2. Check email uniqueness
        const emailExists = await userRepository.findByEmail(normalizedEmail);
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // 3. Check username uniqueness
        const usernameExists = await userRepository.findByUsername(username);
        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userRepository.create({ fullName, username, email: normalizedEmail, passwordHash });

        const { accessToken, refreshToken } = generateTokens(user);
        await userRepository.updateRefreshToken(user.id, refreshToken);

        // Strip sensitive fields before sending to frontend
        const safeUser = { ...user };
        delete safeUser.password_hash;
        delete safeUser.refresh_token;

        res.status(201).json({
            success: true,
            user: safeUser,
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: err.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await userRepository.findByEmail(normalizedEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Account not found. Please sign up first.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        await userRepository.updateRefreshToken(user.id, refreshToken);

        // Strip sensitive fields before sending to frontend
        const safeUser = { ...user };
        delete safeUser.password_hash;
        delete safeUser.refresh_token;

        res.json({
            success: true,
            user: safeUser,
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: err.message
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.sendStatus(401);

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await userRepository.findById(decoded.id);

        if (!user || user.refresh_token !== token) return res.sendStatus(403);

        const { accessToken, refreshToken } = generateTokens(user);
        await userRepository.updateRefreshToken(user.id, refreshToken);

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.sendStatus(403);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        delete user.password_hash;
        delete user.refresh_token;
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await userRepository.updateProfile(req.user.id, req.body);
        delete user.password_hash;
        delete user.refresh_token;
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
