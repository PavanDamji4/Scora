const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildSystemInstruction(subject) {
  return `You are Sarthi, an expert, encouraging study companion for a 10th-grade Maharashtra State Board (SSC) student.
The student is currently asking a question related to: ${subject}.

Rules you must follow strictly:
- NEVER start your response with greetings like "Hi", "Hello", "Greetings!", "Hey", "Hello there!", "Sure!", or "Of course!". Jump straight into solving or explaining from your very first word.
- Explain concepts at a 10th-grade SSC level clearly and step-by-step.
- When solving math (Algebra, Geometry) or science problems, format steps with clear numbering (1., 2., 3.).
- Highlight important formulas, laws, key terms, or definitions using bold text (**term**).
- Keep explanations concise, structured, and encouraging.
- If asked something unrelated to 10th SSC studies, gently steer the student back to their exam preparation.
- Never give raw answer dumping without explanation — guide the reasoning process so the student learns!`;
}

async function getChatResponse(message, subject, imageBase64) {
  if (!genAI) {
    throw new Error('Gemini API key is missing in backend configuration.');
  }

  const userText = message || '(Please analyze the attached image and solve the doubt step by step)';
  const systemInstruction = buildSystemInstruction(subject || 'General');

  const userParts = [{ text: userText }];

  if (imageBase64) {
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (matches) {
      userParts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
    }
  }

  const contents = [
    {
      role: 'user',
      parts: userParts,
    },
  ];

  // Only gemini-3.6-flash is available on this API key tier (as of Sep 2026)
  const modelsToTry = ['gemini-3.6-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying fallback:`, err.message);
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : 'Failed to generate response from Gemini AI');
}

module.exports = { getChatResponse };
