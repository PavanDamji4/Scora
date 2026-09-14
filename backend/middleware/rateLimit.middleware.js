const rateLimit = require('express-rate-limit');

// Limits each logged-in student to 30 AI questions per day.
// Keyed by Firebase UID (set by auth.middleware before this runs),
// not by IP — since multiple students could share a network/IP at school.
const chatRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30,
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: {
    error: "You've reached today's limit of 30 questions. Try again tomorrow!",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = chatRateLimiter;