/**
 * This file uses Express to handle outgoing and incoming HTTP requests.
 * It defines 2 post routes: /api/genie and /api/agent-callback and one get route: /api/jobs/:jobId. They are as follows:
   /api/genie: Endpoint for sending requests to Workato and receiving asynchronous responses (sends user request to hemmTree genie).
   /api/agent-callback: Endpoint for handling callbacks from Workato containing jobId and response (genie sends response back to website).
   /api/jobs/:jobId: Endpoint for retrieving the status and result of a previously submitted job (get jobs that genie has sent).
 */

const express = require("express");

const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = express();
//Use alternate port as 3000 is used by the React frontend
const port = 3001;
const workatoWebhookUrl = process.env.WORKATO_WEBHOOK_URL;
const WORKATO_BASE = "https://genie-api.workato.com/api/v1";
const jobs = new Map();
const maxLoggedErrorLength = 500;

function loggableErrorBody(body) {
  return body.length > maxLoggedErrorLength
    ? `${body.slice(0, maxLoggedErrorLength)}...`
    : body;
}

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

console.log(`Server is running on http://localhost:${port}`);
console.log("Environment configuration:", {
  workatoWebhookUrl: Boolean(workatoWebhookUrl),
  workatoApiKey: Boolean(process.env.WORKATO_API_KEY),
  workatoUserId: Boolean(process.env.WORKATO_USER_ID),
  genieHandle: Boolean(process.env.GENIE_HANDLE)
});

app.use(express.static(__dirname));


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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});