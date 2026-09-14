require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsMiddleware);
app.use(express.json({ limit: '5mb' })); // 5mb allows image uploads for AI chat

app.use('/api/chat', require('./routes/chat.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Scora backend is running' });
});

app.listen(PORT, () => {
  console.log(`Scora backend running on http://localhost:${PORT}`);
});