const cors = require('cors');

// Origins allowed to call the backend
// WEB_ORIGIN env var = your Netlify URL e.g. https://scora-app.netlify.app
const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'capacitor://',
];

// Add the production Netlify URL from env if set
if (process.env.WEB_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.WEB_ORIGIN);
}

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed =
      ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1');

    if (allowed) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
});

module.exports = corsMiddleware;
