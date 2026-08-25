const http = require('http');

const BASE = 'http://localhost:5000';

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, data: raw }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    const unique = Date.now();

    // 1. Health
    console.log('\n=== 1. Health Check ===');
    const health = await request('GET', '/api/health');
    console.log(`Status: ${health.status}`, health.data);

    // 2. Register
    console.log('\n=== 2. Register ===');
    const reg = await request('POST', '/api/auth/register', {
        fullName: 'Test User',
        username: `testuser_${unique}`,
        email: `test_${unique}@example.com`,
        password: 'password123',
    });
    console.log(`Status: ${reg.status}`, JSON.stringify(reg.data, null, 2));

    // 3. Duplicate email
    console.log('\n=== 3. Duplicate Email ===');
    const dup = await request('POST', '/api/auth/register', {
        fullName: 'Test User 2',
        username: `testuser2_${unique}`,
        email: `test_${unique}@example.com`,
        password: 'password123',
    });
    console.log(`Status: ${dup.status}`, dup.data);

    // 4. Duplicate username
    console.log('\n=== 4. Duplicate Username ===');
    const dupUser = await request('POST', '/api/auth/register', {
        fullName: 'Test User 3',
        username: `testuser_${unique}`,
        email: `test3_${unique}@example.com`,
        password: 'password123',
    });
    console.log(`Status: ${dupUser.status}`, dupUser.data);

    // 5. Login success
    console.log('\n=== 5. Login (correct) ===');
    const login = await request('POST', '/api/auth/login', {
        email: `test_${unique}@example.com`,
        password: 'password123',
    });
    console.log(`Status: ${login.status}`, JSON.stringify(login.data, null, 2));

    // 6. Login wrong password
    console.log('\n=== 6. Login (wrong password) ===');
    const badPwd = await request('POST', '/api/auth/login', {
        email: `test_${unique}@example.com`,
        password: 'wrongpassword',
    });
    console.log(`Status: ${badPwd.status}`, badPwd.data);

    // 7. Login wrong email
    console.log('\n=== 7. Login (wrong email) ===');
    const badEmail = await request('POST', '/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123',
    });
    console.log(`Status: ${badEmail.status}`, badEmail.data);

    // Verify no password_hash in responses
    console.log('\n=== 8. Verify no password_hash leaked ===');
    const regHasHash = reg.data?.user?.password_hash !== undefined;
    const loginHasHash = login.data?.user?.password_hash !== undefined;
    console.log(`Registration leaks password_hash: ${regHasHash}`);
    console.log(`Login leaks password_hash: ${loginHasHash}`);

    console.log('\n=== ALL TESTS COMPLETE ===');
}

main().catch(console.error);
