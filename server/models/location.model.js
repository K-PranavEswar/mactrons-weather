const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// This defines the data structure for each "location" document in our database
const locationSchema = new Schema({
  name: {
    type: String,      // The city name must be a string
    required: true,    // It is a mandatory field
    unique: true,      // Prevents duplicate city names from being saved
    trim: true,        // Removes any whitespace from the beginning and end
    minlength: 2      // The name must be at least 2 characters long
  },
}, {
  timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Compiles the schema into a model, which is a class used to create documents
const Location = mongoose.model('Location', locationSchema);

// Exports the model so it can be used in other files (like locations.js)
module.exports = Location;