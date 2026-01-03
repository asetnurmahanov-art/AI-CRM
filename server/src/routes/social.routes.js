
const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

// GET /api/social/accounts
router.get('/accounts', socialController.getAccounts);

// GET /api/social/messages
router.get('/messages', socialController.getMessages);

// POST /api/social/reply
router.post('/reply', socialController.sendReply);

module.exports = router;
