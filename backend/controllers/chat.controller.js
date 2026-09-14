const { getChatResponse } = require('../services/gemini.service');

async function handleChatMessage(req, res) {
  const { message, subject, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: 'Please include a message or an image.' });
  }

  try {
    const text = await getChatResponse(message, subject, image);
    res.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: "Sarthi couldn't process that right now. Please try again." });
  }
}

module.exports = { handleChatMessage };