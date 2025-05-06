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
You are an expert in Theory of Change.
Goal: "${goal}"
Preconditions: ${preconditions.map(p => `"${p}"`).join(', ')}

Provide feedback on:
- Gaps in the logic or causal flow
- Systemic barriers
- Missing intangible needs (trust, awareness, equity)
- Potential assumptions the user may be making

Keep your response short and sweet. No yapping. 
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
