'use strict';

const path = require('path');
const express = require('express'); // import express
const https = require('https');
const cors = require('cors'); // import cors
const app = express(); // creating an express app
const fs = require('fs');
//const PORT = 8080; // setting the port, default to 3000 if not specified
const PORT = 443; 

console.log('Starting');
// app.use(cors()); // enable CORS for all routes

// app.use(express.static(path.join(__dirname, '../ngtb-frontend/build')));

//app.use((req, res) => {
//    res.status(200).send('Hello, world!');
//});

const privateKey =fs.readFileSync('certs/ngtblights.gonzaga.edu.key');
const certificate = fs.readFileSync('certs/ngtblights.gonzaga.edu.chain.crt');


const httpsServer = https.createServer({
  key: privateKey,
  cert: certificate
});
httpsServer.use(cors());
httpsServer.use(express.static(path.join(__dirname, '../ngtb-frontend/build')));

// Start the server
//app.listen(PORT, () => {
httpsServer.listen(PORT, () => {
    console.log('App listening on port ${PORT}');
    console.log('Press Ctrl+C to quit.');
});
