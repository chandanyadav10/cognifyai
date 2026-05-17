const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Safe JSON parse
 */
const safeParse = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON Parse Failed:\n", text);
    throw new Error("Invalid JSON from AI");
  }
};

/**
 * Build prompt
 */
const buildPrompt = (content, config) => {
  const {
    totalQuestions = 10,
    difficulty = "medium",
    questionTypes = {},
  } = config;

  const types = [];
  if (questionTypes.mcq) types.push("MCQ");
  if (questionTypes.truefalse) types.push("True/False");
  if (questionTypes.short) types.push("Short Answer");
  if (questionTypes.fillblank) types.push("Fill in the Blank");

  if (types.length === 0) types.push("MCQ");

  return `
You are an expert educator.

Generate exactly ${totalQuestions} questions.
Difficulty: ${difficulty}
Types: ${types.join(", ")}

Content:
"""
${content.slice(0, 2000)}
"""

Return ONLY JSON:
{
  "questions": [
    {
      "type": "mcq",
      "questionText": "...",
      "options": ["A","B","C","D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}
`;
};

/**
 * 1️⃣ GEMINI CALL
 */
const callGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const response = await result.response;
  return response.text();
};

/**
 * 2️⃣ OPENROUTER FALLBACK
 */
const callOpenRouter = async (prompt) => {
  const res = await axios.post(
    OPENROUTER_URL,
    {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    }
  );

  return res.data.choices[0].message.content;
};

/**
 * MAIN FUNCTION (SMART FLOW)
 */
const generateQuestions = async (content, config = {}) => {
  const prompt = buildPrompt(content, config);

  // 🔁 Try Gemini first
  try {
    console.log("⚡ Trying Gemini...");
    const text = await callGemini(prompt);
    const parsed = safeParse(text);

    if (!parsed.questions) throw new Error("Invalid format");

    console.log("✅ Gemini Success");
    return parsed.questions;

  } catch (geminiError) {
    console.warn("⚠️ Gemini Failed:", geminiError.message);
  }

  // 🔁 Retry Gemini once (optional)
  try {
    console.log("🔁 Retrying Gemini...");
    await sleep(3000);

    const text = await callGemini(prompt);
    const parsed = safeParse(text);

    if (!parsed.questions) throw new Error("Invalid format");

    console.log("✅ Gemini Retry Success");
    return parsed.questions;

  } catch (retryError) {
    console.warn("⚠️ Gemini Retry Failed");
  }

  // 🚀 FINAL FALLBACK → OpenRouter
  try {
    console.log("🚀 Switching to OpenRouter...");
    const text = await callOpenRouter(prompt);
    const parsed = safeParse(text);

    if (!parsed.questions) throw new Error("Invalid format");

    console.log("✅ OpenRouter Success");
    return parsed.questions;

  } catch (finalError) {
    console.error("🔥 All AI Providers Failed");
    throw new Error("AI service unavailable");
  }
};

module.exports = { generateQuestions };