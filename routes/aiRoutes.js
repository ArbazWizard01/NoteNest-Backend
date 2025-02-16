const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Secure API key from environment variables (DO NOT expose in code)
const apiKey =
  process.env.GOOGLE_AI_KEY || "AIzaSyBHatBxmW0JvvmpHbDRL3Es81PcG8AEaKk";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  systemInstruction:
    "You are an AI for a note-taking app. Predict the next word or sentence. Keep the tone concise and formal. Avoid irrelevant suggestions.",
});

const generationConfig = {
  temperature: 0.7, // Lower for more predictable responses
  maxOutputTokens: 50,
  responseMimeType: "text/plain",
};

// AI Prediction Route
router.post("/", async (req, res) => {
  console.log("Received request body:", req.body); // Debug log
  const { userInput } = req.body;

  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ message: "Invalid or missing input" });
  }

  try {
    const chatSession = model.startChat({ generationConfig });
    const result = await chatSession.sendMessage(userInput);
    const responseText = result.response.text();

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI processing error" });
  }
});

module.exports = router