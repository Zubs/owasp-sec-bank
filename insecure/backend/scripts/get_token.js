const https = require('https');

// Configuration
const LOGIN_URL = 'https://owasp-sec-bank-insecure.onrender.com/api/auth/login';
const PAYLOAD = JSON.stringify({
    username: 'username',
    password: 'password'
});

const req = https.request(LOGIN_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': PAYLOAD.length
    }
}, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`Login failed: Status ${res.statusCode}`);
                console.error(data);
                process.exit(1);
            }

            const json = JSON.parse(data);
            if (!json.token) {
                console.error('No token found in response');
                process.exit(1);
            }

            // MAGIC: This command tells GitHub Actions to set an environment variable
            // that is accessible in subsequent steps (like the ZAP scan)
            const token = `Bearer ${json.token}`;
            // Use standard GITHUB_ENV file to set variable
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_ENV, `ZAP_AUTH_HEADER_VALUE=${token}\n`);

            console.log('Successfully acquired token and set ZAP_AUTH_HEADER_VALUE');

        } catch (e) {
            console.error('Error parsing JSON:', e);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
});

req.write(PAYLOAD);
req.end();
