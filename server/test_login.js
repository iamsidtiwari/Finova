const http = require('http');

const testLogin = (email, password, label) => {
    const data = JSON.stringify({ email, password });

    const options = {
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`[${label}] Status: ${res.statusCode}, Body: ${body}`);
        });
    });

    req.on('error', (error) => console.error(`[${label}] Error:`, error));
    req.write(data);
    req.end();
};

// 1. Non-existent account
testLogin('nonexistent@example.com', 'password', 'Non-existent');

// 2. Wrong password
testLogin('test@finova.com', 'wrongpassword', 'Wrong Password');
