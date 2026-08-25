const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

// NeonDB requires SSL connections. Enable SSL when DATABASE_URL contains
// 'neon.tech' or when running in production.
const useSSL = connectionString && (connectionString.includes('neon.tech') || isProduction);

const pool = new Pool({
    connectionString,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL Database');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Check your PostgreSQL credentials in .env and ensure the PostgreSQL service is running.');
        return false;
    }
};

pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err.message || err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    testConnection,
};
