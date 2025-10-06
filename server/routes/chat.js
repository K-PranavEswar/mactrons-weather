const router = require('express').Router();
const axios = require('axios');
const ChatbotData = require('../models/chatbotData.model');

// Handle POST requests to /api/chat/
router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!userMessage) {
    return res.status(400).json({ message: 'No message provided.' });
  }

  try {
    // Perform a case-insensitive search for a matching question in the database
    const dbResponse = await ChatbotData.findOne({
      question: new RegExp('^' + userMessage + '$', 'i')
    });

    if (dbResponse) {
      // If a direct match is found, return the pre-trained answer
      return res.json({
        message: dbResponse.answer,
        session_id: req.body.session_id
      });
    }

    // --- Fallback to Gemini API if no match is found ---
    if (!geminiApiKey) {
      // If the API key is missing, send the old default response
      return res.json({
        message: "That's a great question, but my advanced AI features are not configured. (Missing GEMINI_API_KEY on the server)",
        session_id: req.body.session_id
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    // Construct a detailed prompt for the Gemini model
    const prompt = `You are ParadeWatch, a friendly and helpful AI assistant specializing in planning events with the best weather in India. Your main goal is to help users plan events.

A user has asked a question that is not in your trained knowledge base: "${userMessage}"

- If the question is about weather (like "is it raining?"), answer it for their likely location (assume a major Indian city if not specified) and ask if they are planning an event.
- If it's a general knowledge question (like "Football"), provide a short, helpful answer and then gently guide the conversation back to event planning.
- Always be friendly and conversational.

Example for weather: "Yes, it's currently raining in Mumbai. Are you planning an event here? I can help you find a day with better weather!"
Example for general topic: "Football is a popular sport played with a ball between two teams of 11 players. Speaking of games, are you planning a sports event? I can help you find a sunny day for it!"

Now, answer the user's question: "${userMessage}"`;

    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Call the Gemini API
    const geminiResponse = await axios.post(apiUrl, payload);
    const generatedText = geminiResponse.data.candidates[0]?.content?.parts[0]?.text;

    if (generatedText) {
      res.json({
        message: generatedText,
        session_id: req.body.session_id
      });
    } else {
      throw new Error("No content received from Gemini API.");
    }

  } catch (error) {
    console.error("❌ Error in chat route:", error.response ? error.response.data : error.message);
    res.status(500).json({
      message: 'Sorry, I encountered an error while trying to respond.'
    });
  }
});

module.exports = router;


// 2.  **Add API Key to Server `.env`:** Open the `.env` file located in your **`server`** directory and add your Gemini API key. It's important that this is done on the server, not the frontend, to keep your key secure.
//     ```
//     # In server/.env
//     GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    

