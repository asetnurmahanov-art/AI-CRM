const crypto = require('crypto');
const http = require('http');

const SECRET = 'TEST_SECRET';
const PAYLOAD = JSON.stringify({
    object: 'instagram',
    entry: [
        {
            id: '17841400000000000',
            time: 1716912345678,
            messaging: [
                {
                    sender: {
                        id: '123_SENDER_ID'
                    },
                    recipient: {
                        id: '17841400000000000'
                    },
                    timestamp: 1716912345678,
                    message: {
                        mid: 'm_mid.1234567890',
                        text: 'Hello, I want to buy your AI product!',
                        is_echo: false
                    }
                }
            ]
        }
    ]
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
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(PAYLOAD);
req.end();
