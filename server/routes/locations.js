const router = require('express').Router();
let Location = require('../models/location.model'); // Imports the Mongoose model we created

// --- GET Endpoint: Fetches all saved locations ---
// This code runs when a GET request is made to /api/locations/
router.route('/').get((req, res) => {
  // .find() is a Mongoose method to get all documents from the Location collection
  Location.find()
    .then(locations => res.json(locations)) // Sends the found locations back to the client as JSON
    .catch(err => res.status(400).json('Error: ' + err)); // Sends an error message if something goes wrong
});

// --- POST Endpoint: Adds a new location ---
// This code runs when a POST request is made to /api/locations/add
router.route('/add').post((req, res) => {
  // Gets the location name from the body of the incoming JSON request
  const name = req.body.name;

  // Basic validation to ensure a name was sent
  if (!name) {
    return res.status(400).json('Error: Location name is required.');
  }

  // Creates a new Location instance using the data from the request
  const newLocation = new Location({name});

  // .save() is a Mongoose method to save the new document to the database
  newLocation.save()
    .then(() => res.json('Location added!')) // Sends a success message back to the client
    .catch(err => res.status(400).json('Error: ' + err)); // Sends an error if it fails (e.g., duplicate entry)
});

// Exports the router to be used by server.js
module.exports = router;

