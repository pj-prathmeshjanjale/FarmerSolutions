import Groq from "groq-sdk";

export const generateWeatherInsights = async (language, context) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Default to English, map to explicit localized requests if hi/mr
    const languageMap = {
      en: "English",
      hi: "Hindi (in native Devanagari script, e.g., 'नमस्ते')",
      mr: "Marathi (in native Devanagari script, e.g., 'नमस्कार')"
    };
    const targetLang = languageMap[language] || "English";

    // Crop Profile parsing from context
    let farmerStr = "No specific farmer profile linked.";
    if (context.farmerProfile) {
      const p = context.farmerProfile;
      const recentCrops = p.cropHistory?.length > 0 
        ? p.cropHistory.slice(-2).map(c => `${c.crop} (${c.season})`).join(", ") 
        : "No recent crop history";
        
      farmerStr = `Recent Crops: ${recentCrops}. 
      Soil Type: ${p.soilType || "Unknown"}. 
      Irrigation: ${p.irrigationType || "Unknown"}. 
      Farm Size: ${p.farmSize || "Unknown"} acres. 
      Experience: ${p.farmingExperience || 0} years.`;
    }

    const systemPrompt = `SYSTEM:
You are an expert, empathetic agricultural advisor for Indian farmers.

CONTEXT (JSON):
Weather Currently: ${JSON.stringify(context.currentWeather)}
Alerts Generated: ${JSON.stringify(context.alerts)}
Rain Analysis: ${JSON.stringify(context.systemInsights.rainAnalysis)}
Farmer Profile: ${farmerStr}

TASK:
Based on the weather and the farmer profile provided above, generate a highly actionable daily briefing. 
It must be structured like a checklist or tactical brief. 

Include:
1. A brief summary of current weather and imminent risks.
2. Irrigation advice based on temperature/humidity and upcoming rain.
3. Fertilizer/Pesticide timing advice (e.g. avoid if raining soon).
4. Specific crop-aware actions (if crops are known).

CRITICAL INSTRUCTIONS:
- You MUST reply entirely and ONLY in ${targetLang}. 
- Use native script characters for Hindi/Marathi.
- Format using Markdown with clear emojis and headers (e.g., 🌤️ Summary, 💧 Irrigation, 🚜 Farm Actions, ⚠️ Risks).
- Do not output raw JSON data. Be conversational but concise.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Give me my daily agricultural forecast and action plan.` }
      ],
      temperature: 0.3
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("[WeatherAI Error]", error.message);
    return "Our AI Intelligence system is currently processing heavy volumes. Please refer to the raw metrics and alerts above for now.";
  }
};
