// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load .env file

// --- Initialization ---
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Parse incoming JSON

// --- MongoDB Connection ---
const uri = process.env.ATLAS_URI;

// Check if URI exists
if (!uri) {
  console.error("❌ MongoDB URI not found. Please check your .env file.");
  process.exit(1);
}

// Log the loaded URI (for debugging only — remove later)
console.log("🔍 Loaded MongoDB URI:", uri);

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB database connection established successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

const connection = mongoose.connection;
connection.on('error', (err) => {
  console.error("❌ MongoDB runtime error:", err);
});

// --- Weather API Route ---
app.get('/api/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured on the server.' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching weather data:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// --- Locations Routes ---
const locationsRouter = require('./routes/locations');
app.use('/api/locations', locationsRouter); // Prefix all location routes with /api/locations

// --- Chatbot Route ---
const chatRouter = require('./routes/chat');
app.use('/api/chat', chatRouter);

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
});

