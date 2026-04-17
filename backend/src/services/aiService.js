import Groq from "groq-sdk";
import axios from "axios";
import { getFarmerContext } from "./farmerService.js";
import MandiPrice from "../models/MandiPrice.js";

// Fetch weather
const getLocalWeather = async (location) => {
  if (!location || location === "Unknown") return "Weather data unavailable";
  try {
    let city = location.includes(",") ? location : `${location},IN`;
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );
    const data = response.data;
    return `${data.weather[0].description}, ${data.main.temp}°C, Humidity: ${data.main.humidity}%`;
  } catch (err) {
    return "Weather data unavailable at the moment";
  }
};

// Fetch Mandi 
// Simply grabs recent top markets for a quick glance if possible
const getRecentMandiContext = async () => {
  try {
     const prices = await MandiPrice.find({}).sort({ date: -1 }).limit(3).lean();
     if (prices.length === 0) return "No recent mandi prices available.";
     return prices.map(p => `${p.crop} at ${p.market}: ₹${p.modalPrice}/${p.unit}`).join(" | ");
  } catch (err) {
    return "Mandi data unavailable.";
  }
};

export const generateContextualResponse = async (userId, userMessage, userLanguage) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 1. Fetch Structural Data
    const farmerContext = await getFarmerContext(userId);
    let weatherContext = "Unknown";
    let mandiContext = "Unknown";

    if (farmerContext && farmerContext.location !== "Unknown") {
      weatherContext = await getLocalWeather(farmerContext.location);
    }
    mandiContext = await getRecentMandiContext();

    // 2. Build strict JSON Context payload
    const systemContext = {
      userContext: farmerContext || "No profile found",
      localCondition: {
        weather: weatherContext,
        mandiRates: mandiContext
      }
    };
    
    // Map language code to full string for the AI explicitly
    const languageMap = {
      en: "English",
      hi: "Hindi (in native Devanagari script, e.g., 'नमस्ते')",
      mr: "Marathi (in native Devanagari script, e.g., 'नमस्कार')"
    };
    const targetLang = languageMap[userLanguage] || "English";

    const systemPrompt = `SYSTEM:
You are an expert agricultural advisor for Indian farmers.

USER CONTEXT (JSON):
${JSON.stringify(systemContext, null, 2)}

TASK:
Provide precise, region-aware, and actionable farming advice based strictly on the JSON context provided. 
If the user's question is unrelated to farming, politely guide them back.
CRITICAL INSTRUCTION: You MUST reply entirely and ONLY in ${targetLang}. 
Do NOT use Romanized/English script for Marathi or Hindi (e.g., do not write "Namaskar"). You MUST write in actual native script characters.
Use Markdown formatting: **Bold**, bullet points, ### Headers.
Do not output the JSON context back to the user. Just the final advice.`;

    // 3. Call AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.3
    });

    return {
      success: true,
      answer: completion.choices[0].message.content
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return {
      success: false,
      answer: "I am temporarily unable to connect to the agricultural knowledge base. Please try again shortly."
    };
  }
};
