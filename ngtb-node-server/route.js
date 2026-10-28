/**
 * This file uses Express to handle outgoing and incoming HTTP requests.
 * It defines 2 post routes: /api/genie and /api/agent-callback and one get route: /api/jobs/:jobId. They are as follows:
   /api/genie: Endpoint for sending requests to Workato and receiving asynchronous responses (sends user request to hemmTree genie).
   /api/agent-callback: Endpoint for handling callbacks from Workato containing jobId and response (genie sends response back to website).
   /api/jobs/:jobId: Endpoint for retrieving the status and result of a previously submitted job (get jobs that genie has sent).
 */

const express = require("express");

const cors = require("cors");
const app = express();
//Use alternate port as 3000 is used by the React frontend
const port = Number(process.env.PORT) || 3001;
const workatoWebhookUrl = "https://webhooks.workato.com/webhooks/rest/9aff14d4-3289-42d9-91b4-db436e64bf06/hemmtreewizard-webhook";
const jobs = new Map();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

console.log(`Server is running on http://localhost:${port}`);

app.use(express.static(__dirname));

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
    console.error("Unable to send request to Workato:", error);
    return res.status(502).json({ error: "Unable to contact Workato" });
  }
});

// Workato may send either a JSON object or a plain-text result.
app.use("/api/agent-callback", express.text({ type: "*/*" }));


/**
 * Endpoint for handling callbacks from Workato. Expects a JSON object or plain-text result containing a jobId and response.
 * @param {object} req - The Express request object containing the callback data from Workato.
 * @param {object} res - The Express response object used to send a response back to Workato.
 * References: Currently linked to REC | NGTBLights | HTTP Sender. Line 3 sends JSON {jobId, response} to this post route. 
 */
app.post("/api/agent-callback", (req, res) => {
  console.log("Workato callback received:", req.body);

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
  console.log("Parsed callback:", { jobId, response });

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
  console.log("Job requested:", req.params.jobId);
  const job = jobs.get(req.params.jobId);

  if (!job) {
    console.log("Job not found:", req.params.jobId);
    return res.status(404).json({ error: "Job not found" });
  }

  console.log("Returning job:", job);
  res.json(job);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});