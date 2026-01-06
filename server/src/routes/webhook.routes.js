const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// GET /api/webhook/instagram - Verification
router.get('/instagram', webhookController.verifyInstagramWebhook);

// POST /api/webhook/instagram - Event Notification
router.post('/instagram', webhookController.handleInstagramEvent);

module.exports = router;
