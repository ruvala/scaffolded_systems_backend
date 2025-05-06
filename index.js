const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/feedback', async (req, res) => {
  const { goal, preconditions } = req.body;

  const prompt = `
You are a Theory of Change expert. Analyze the logic of the following outcome map.

End goal: "${goal}"
Preconditions: ${preconditions.map(p => `"${p}"`).join(', ')}

Provide feedback on the following:
- Logical gaps in the preconditions
- Systemic barriers that may block progress
- Missing intangible factors (e.g., trust, awareness, equity)
- Unstated assumptions

Respond only in plain text. Do not address the user, do not explain what you're doing, and do not use bold text or any formatting. Keep the response concise and direct.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        { role: "system", content: "You are a helpful Theory of Change assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    res.json({ feedback: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
