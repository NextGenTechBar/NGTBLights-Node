const express = require("express");

const cors = require("cors");
const app = express();
//Use alternate port as 3000 is used by the React frontend
const port = Number(process.env.PORT) || 3001;
const jobs = new Map();

app.use(cors({ origin: "http://localhost:3000" }));

console.log(`Server is running on http://localhost:${port}`);

app.use(express.static(__dirname));

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

  const { jobId, result } = callback;
  console.log("Parsed callback:", { jobId, result });

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  jobs.set(jobId, {
    status: "complete",
    result: result ?? callback
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