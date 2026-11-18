'use strict';

const path = require('path');
const express = require('express'); // import express
const https = require('https');
const cors = require('cors'); // import cors
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = express(); // creating an express app
const fs = require('fs');
const morgan = require('morgan'); //logging that Tyler wanted to implement to see unwanted connections
//const PORT = 8080; // setting the port, default to 3000 if not specified
const PORT = 443; 
const jobs = new Map();
const workatoWebhookUrl = process.env.WORKATO_WEBHOOK_URL;

console.log('Starting');
app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse JSON request bodies
app.use(morgan('combined'));


app.use("/api/agent-callback", express.text({ type: "*/*" }));

/**
 * Endpoint for sending requests to Workato and receiving asynchronous responses.
 * @param {object} req - The Express request object containing the text and jobId.
 * @param {object} res - The Express response object used to send a response back to the client.
 * References: Currently posted to by sendWebhook in ngtb-frontend/src/components/custom.js upon clicking of submit button
   in experimental field.
 */
app.post("/api/genie", async (req, res) => {
  if (!workatoWebhookUrl) {
    return res.status(500).json({ error: "WORKATO_WEBHOOK_URL is not configured" });
  }

  const { text, jobId } = req.body;

  if (!text || !jobId) {
    return res.status(400).json({ error: "text and jobId are required" });
  }

  try {
    const response = await fetch(workatoWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, jobId })
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Workato returned ${response.status}`
      });
    }

    return res.status(202).json({ accepted: true, jobId });
  } catch (error) {
    return res.status(502).json({ error: "Unable to contact Workato" });
  }
});

/**
 * Endpoint for handling callbacks from Workato. Expects a JSON object or plain-text result containing a jobId and response.
 * @param {object} req - The Express request object containing the callback data from Workato.
 * @param {object} res - The Express response object used to send a response back to Workato.
 * References: Currently linked to REC | NGTBLights | HTTP Sender. Line 3 sends JSON {jobId, response} to this post route. 
 */
app.post("/api/agent-callback", (req, res) => {
  let callback = req.body;

  if (!callback) {
    return res.status(400).json({ error: "Callback body is required" });
  }

  if (typeof callback === "string") {
    try {
      callback = JSON.parse(callback);
    } catch {
      callback = { result: callback };
    }
  }

  const { jobId, response } = callback;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  jobs.set(jobId, {
    status: "complete",
    result: response ?? callback
  });

  res.json({ ok: true });
});

/**
 * Endpoint for retrieving the status and result of a previously submitted job.
 * @param {object} req - The Express request object containing the jobId as a URL parameter.
 * @param {object} res - The Express response object used to send the job status and result back to the client.
 * References: Not currently used by any part of the application.
 */
app.get("/api/jobs/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});

app.use(express.static(path.join(__dirname, '../ngtb-frontend/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../ngtb-frontend/build', 'index.html'));
  });
//app.use((req, res) => {
//    res.status(200).send('Hello, world!');
//});

const privateKey = fs.readFileSync('certs/ngtblights.gonzaga.edu.key');
const certificate = fs.readFileSync('certs/ngtblights.gonzaga.edu.chain.crt');


const httpsServer = https.createServer({
  key: privateKey,
  cert: certificate
}, app);

// Start the server
//app.listen(PORT, () => {
httpsServer.listen(PORT, () => {
    console.log('App listening on port ${PORT}');
    console.log('Press Ctrl+C to quit.');
});
