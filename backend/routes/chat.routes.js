const express = require('express');
const router = express.Router();
const verifyAuth = require('../middleware/auth.middleware');
const chatRateLimiter = require('../middleware/rateLimit.middleware');
const { handleChatMessage } = require('../controllers/chat.controller');

// Order matters: verify the student is logged in BEFORE rate limiting,
// since the rate limiter keys off req.user.uid set by verifyAuth.
router.post('/', verifyAuth, chatRateLimiter, handleChatMessage);

module.exports = router;