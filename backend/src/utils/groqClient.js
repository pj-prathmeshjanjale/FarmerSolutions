import Groq from "groq-sdk";

// Candidate models in order of priority:
// 1. User/env defined GROQ_MODEL (if specified)
// 2. "openai/gpt-oss-20b" (reliable, fast, high context, active on Groq)
// 3. "qwen/qwen3.8-27b" (strong multilingual reasoning fallback)
// 4. "openai/gpt-oss-120b" (large scale fallback)
const getCandidateModels = () => {
  const models = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b"
  ].filter(Boolean);

  return [...new Set(models)];
};

/**
 * Creates a chat completion with automatic model fallback if a model is deprecated or unavailable.
 * @param {object} params - Parameters for groq.chat.completions.create (messages, temperature, etc.)
 * @returns {Promise<object>} Groq chat completion response
 */
export const createGroqChatCompletion = async (params) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  const groq = new Groq({ apiKey });
  const candidates = getCandidateModels();

  let lastError = null;

  for (const model of candidates) {
    try {
      const completion = await groq.chat.completions.create({
        ...params,
        model
      });
      return completion;
    } catch (err) {
      lastError = err;
      console.warn(`Groq request with model "${model}" failed: ${err.message}. Attempting fallback if available...`);
    }
  }

  throw lastError;
};
