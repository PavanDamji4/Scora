const cors = require('cors');

// Dynamically allows localhost and 127.0.0.1 origins on any port for smooth local dev
const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('capacitor://')
    ) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow during development
  },
  credentials: true,
});

module.exports = corsMiddleware;