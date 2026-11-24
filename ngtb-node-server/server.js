'use strict';

const path = require('path');
const express = require('express'); // import express
const https = require('https');
const cors = require('cors'); // import cors
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
  });
}
const app = express(); // creating an express app
const fs = require('fs');
const morgan = require('morgan'); //logging that Tyler wanted to implement to see unwanted connections
//const PORT = 8080; // setting the port, default to 3000 if not specified
const PORT = 443; 
const maxLoggedErrorLength = 1000;
const WORKATO_BASE = "https://genie-api.workato.com/api/v1";

function loggableErrorBody(body) {
  return body.length > maxLoggedErrorLength
    ? `${body.slice(0, maxLoggedErrorLength)}...`
    : body;
}

console.log('Starting');
app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse JSON request bodies
app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, '../ngtb-frontend/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../ngtb-frontend/build', 'index.html'));
  });

//API route to communicate with HemTree Genie via Workato
app.post("/api/generate-conversation", async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme || typeof theme !== "string" || theme.length > 200) {
      return res.status(400).json({ error: "Invalid theme" });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.WORKATO_API_KEY}`,
      "X-IDP-User-ID": process.env.WORKATO_USER_ID,
      "Content-Type": "application/json"
    };


    // Create a new conversation
    const conversationResponse = await fetch(`${WORKATO_BASE}/genies/${encodeURIComponent(process.env.GENIE_HANDLE)}/chat/conversations`, {
      method: "POST",
      headers
    });

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      console.error("Workato conversation creation failed:", {
        status: conversationResponse.status,
        body: loggableErrorBody(errorText),
        credentials: {
          workatoApiKey: Boolean(process.env.WORKATO_API_KEY),
          workatoUserId: Boolean(process.env.WORKATO_USER_ID),
          genieHandle: Boolean(process.env.GENIE_HANDLE)
        }
      });
      return res.status(conversationResponse.status).json({ error: `Failed to create conversation: ${errorText}` });
    }

    const conversationBody = await conversationResponse.json();
    const conversationId =
      conversationBody.conversation_id ??
      conversationBody.conversationId ??
      conversationBody.id ??
      conversationBody.result?.conversation_id ??
      conversationBody.result?.conversationId ??
      conversationBody.result?.id ??
      conversationBody.conversation?.id ??
      conversationBody.conversation?.conversation_id;

    if (typeof conversationId !== "string" || conversationId.length === 0) {
      console.error("Workato conversation creation returned an unexpected response:", {
        body: loggableErrorBody(JSON.stringify(conversationBody))
      });
      return res.status(502).json({ error: "Failed to determine the Workato conversation ID" });
    }

    console.log("Workato conversation created:", { conversationId });

    // Send theme to the conversation
    const messageResponse = await fetch(`${WORKATO_BASE}/genies/${encodeURIComponent(process.env.GENIE_HANDLE)}/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: theme, stream: true })
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error("Workato message request failed:", {
        status: messageResponse.status,
        body: loggableErrorBody(errorText),
        conversationId
      });
      return res.status(messageResponse.status).json({ error: `Failed to send theme: ${errorText}` });
    }

    console.log("Workato message stream opened:", { conversationId });

    // Forward the streaming response to the client
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const reader = messageResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
      res.end();
      console.log("Workato message stream closed:", { conversationId });
    }
  } catch (error) {
    console.error("Error in /api/generate-conversation:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.end();
    }
  }
});

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
