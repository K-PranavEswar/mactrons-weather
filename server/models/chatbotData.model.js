const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatbotDataSchema = new Schema({
  intent: { type: String, required: true },
  question: { type: String, required: true, unique: true, trim: true },
  answer: { type: String, required: true },
}, {
  timestamps: true,
});

// The fix is here: The third argument tells Mongoose the exact collection name to use.
const ChatbotData = mongoose.model('ChatbotData', chatbotDataSchema, 'training_data');

module.exports = ChatbotData;

