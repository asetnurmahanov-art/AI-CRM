const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.qrCodes = new Map();
    }

    async getSession(sessionId = 'default') {
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }

        const authPath = path.join(process.cwd(), 'data', 'auth', sessionId);
        if (!fs.existsSync(path.dirname(authPath))) {
            fs.mkdirSync(path.dirname(authPath), { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                const qrDataURL = await qrcode.toDataURL(qr);
                this.qrCodes.set(sessionId, qrDataURL);
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('WhatsApp connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
                if (shouldReconnect) {
                    this.getSession(sessionId);
                } else {
                    this.sessions.delete(sessionId);
                    this.qrCodes.delete(sessionId);
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connection opened');
                this.qrCodes.delete(sessionId);
            }
        });

        this.sessions.set(sessionId, sock);
        return sock;
    }

    getQRCode(sessionId = 'default') {
        return this.qrCodes.get(sessionId);
    }

    async isConnected(sessionId = 'default') {
        const sock = this.sessions.get(sessionId);
        return sock?.user ? true : false;
    }
}

module.exports = new WhatsAppService();
