const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const { GoogleAuth } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());


// Google Cloud Dialogflow API configuration
const projectId = "we-ai-442218";
const location = "us-central1";
const agentId = "6e63cb11-8f42-4c9a-9f2c-fe3e0b41ccdd";

// Google Cloud authentication
const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const generateSessionId = () => `session-${Date.now()}-${Math.random()}`;

// Generate token API
app.get("/generateToken", async (req, res) => {
  try {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    res.status(200).json({ token: tokenResponse.token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ message: "Failed to generate token." });
  }
});

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { query, token } = req.body;

    if (!query || !token) {
      return res.status(400).json({ error: "Query and token are required" });
    }

    const sessionId = generateSessionId();

    const requestPayload = {
      queryInput: {
        languageCode: "en",
        text: {
          text: query,
        },
      },
    };

    const url = `https://${location}-dialogflow.googleapis.com/v3/projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}:detectIntent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error from Dialogflow:", data);
      return res.status(response.status).json(data);
    }

    const fulfillmentMessages = data.queryResult.responseMessages || [];
    const textResponse = fulfillmentMessages
      .map((msg) => msg.text?.text?.join(" "))
      .join(" ");

    return res.json({ response: textResponse || "No response from Dialogflow." });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});