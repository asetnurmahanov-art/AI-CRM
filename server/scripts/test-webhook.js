const crypto = require('crypto');
const http = require('http');

const SECRET = 'TEST_SECRET';
const PAYLOAD = JSON.stringify({
    object: 'instagram',
    entry: [
        {
            id: '123456789',
            time: Date.now(),
            changes: [
                {
                    value: {
                        text: 'Hello World',
                    },
                    field: 'comments',
                },
            ],
        },
    ],
});

const hmac = crypto.createHmac('sha256', SECRET);
const signature = 'sha256=' + hmac.update(PAYLOAD).digest('hex');

const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/webhook/instagram',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'Content-Length': Buffer.byteLength(PAYLOAD),
    },
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(PAYLOAD);
req.end();
