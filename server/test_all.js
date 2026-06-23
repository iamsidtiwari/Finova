const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('--- Starting Authentication Tests ---\n');

    const randomSuffix = Math.floor(Math.random() * 100000);
    const validEmail = `testuser${randomSuffix}@example.com`;
    const validUsername = `testuser${randomSuffix}`;
    const validPassword = 'Password123!';

    // Test 1: New user registration
    try {
        console.log('Test 1: New user registration');
        const res = await axios.post(`${API_URL}/auth/register`, {
            fullName: 'E2E Test User',
            username: validUsername,
            email: validEmail,
            password: validPassword
        });
        console.log('Result:', res.data.success ? 'Success' : 'Failed');
    } catch (err) {
        console.log('Result: Failed -', err.response?.data || err.message);
    }
    console.log('');

    // Test 2: Duplicate email
    try {
        console.log('Test 2: Duplicate email');
        const res = await axios.post(`${API_URL}/auth/register`, {
            fullName: 'E2E Test User 2',
            username: `anotheruser${randomSuffix}`,
            email: validEmail,
            password: validPassword
        });
        console.log('Result: Failed - Allowed duplicate email unexpectedly');
    } catch (err) {
        console.log('Result Expected Error -', err.response?.data?.message);
    }
    console.log('');

    // Test 3: Duplicate username
    try {
        console.log('Test 3: Duplicate username');
        const res = await axios.post(`${API_URL}/auth/register`, {
            fullName: 'E2E Test User 3',
            username: validUsername,
            email: `anotheremail${randomSuffix}@example.com`,
            password: validPassword
        });
        console.log('Result: Failed - Allowed duplicate username unexpectedly');
    } catch (err) {
        console.log('Result Expected Error -', err.response?.data?.message);
    }
    console.log('');

    // Test 4: Login with wrong password
    try {
        console.log('Test 4: Login with wrong password');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: validEmail,
            password: 'wrongpassword'
        });
        console.log('Result: Failed - Logged in with wrong password unexpectedly');
    } catch (err) {
        console.log('Result Expected Error -', err.response?.data?.message);
    }
    console.log('');

    // Test 5: Login with non-existing account
    try {
        console.log('Test 5: Login with non-existing account');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'nonexistinguser12345@example.com',
            password: validPassword
        });
        console.log('Result: Failed - Logged in with non-existent account unexpectedly');
    } catch (err) {
        console.log('Result Expected Error -', err.response?.data?.message);
    }
    console.log('');

    // Test 6: Login with valid credentials
    try {
        console.log('Test 6: Login with valid credentials');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: validEmail,
            password: validPassword
        });
        console.log('Result:', res.data.success ? 'Success' : 'Failed');
    } catch (err) {
        console.log('Result: Failed -', err.response?.data || err.message);
    }
    console.log('\n--- Authentication Tests Completed ---');
}

runTests();
