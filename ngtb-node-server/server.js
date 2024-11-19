'use strict';

const path = require('path');
const express = require('express'); // import express
const cors = require('cors'); // import cors
const app = express(); // creating an express app
const PORT = 8080; // setting the port, default to 3000 if not specified

app.use(cors()); // enable CORS for all routes

app.use(express.static(path.join(__dirname, '../ngtb-frontend/build')));

app.use((req, res) => {
    res.status(200).send('Hello, world!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});