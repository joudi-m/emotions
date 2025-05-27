const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const openaiKey = process.env.OPENAI_API_KEY;
const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📩 Feedback Route
app.post('/api/feedback', async (req, res) => {
  const { feedback } = req.body;

  console.log("🚀 Sending feedback to:", googleScriptURL);
  console.log("📨 Feedback content:", feedback);

  try {
    const response = await fetch(googleScriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    });

    res.json({ success: true, message: 'Feedback sent!' });
  } catch (err) {
    console.error("❌ Google Script Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧠 Analyze Route
app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;
  console.log("🔍 Prompt received:", prompt);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert in psychology and emotional health." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    // ✅ Check if OpenAI request failed
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API Error Response:", errorText);
      return res.status(500).json({ success: false, error: "OpenAI request failed." });
    }

    // ✅ Parse JSON safely
    const data = await response.json();
    console.dir(data, { depth: null });

    const message = data?.choices?.[0]?.message?.content || "⚠️ No message received.";
    res.json({ success: true, message });
  } catch (err) {
    console.error("❌ OpenAI Request Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
