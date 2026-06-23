const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    testConnection,
};
