const express = require("express");

const cors = require("cors");
const app = express();
//Use alternate port as 3000 is used by the React frontend
const port = Number(process.env.PORT) || 3001;
const workatoWebhookUrl = process.env.WORKATO_WEBHOOK_URL;
const jobs = new Map();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

console.log(`Server is running on http://localhost:${port}`);

app.use(express.static(__dirname));

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