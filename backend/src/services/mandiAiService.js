import Groq from "groq-sdk";
import { getFarmerContext } from "./farmerService.js";
import { getBestMandi, getTrends } from "./mandiService.js";

/**
 * Generate AI recommendation for selling crops based on market data
 */
export const generateSellRecommendation = async (userId, crop, state, language = "en") => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // 1. Fetch Farmer Context
    const farmerContext = await getFarmerContext(userId);
    
    // 2. Fetch Market Context
    const bestMandiResult = await getBestMandi({ crop, state });
    const trendsResult = await getTrends({ crop, state, days: 7 });
    
    const systemContext = {
      userContext: farmerContext || "No profile found",
      marketContext: {
        crop,
        state,
        bestMarket: bestMandiResult.success ? bestMandiResult.data : "No recent data",
        recentTrends: trendsResult.success ? trendsResult.trends : "No trend data"
      }
    };
    
    const languageMap = {
      en: "English",
      hi: "Hindi (in native Devanagari script, e.g., 'नमस्ते')",
      mr: "Marathi (in native Devanagari script, e.g., 'नमस्कार')"
    };
    const targetLang = languageMap[language] || "English";

    const systemPrompt = `SYSTEM:
You are an expert agricultural market advisor for Indian farmers. 

CONTEXT (JSON):
${JSON.stringify(systemContext, null, 2)}

TASK:
Based on the market trends and best mandi data provided, suggest to the farmer:
1. A clear recommendation: SELL NOW, WAIT, or PARTIAL SELL.
2. The best nearby Mandi and its current price.
3. A detailed but simple reasoning.
4. Expert tip for better profits.

CRITICAL INSTRUCTIONS:
- You MUST reply entirely and ONLY in ${targetLang}. 
- Use actual native script characters for Hindi/Marathi.
- Format using Markdown with clear headers like:
    ### 📢 Recommendation
    ### 📍 Optimal Market
    ### 💡 Market Analysis
    ### 🚀 Pro Tip
- Use bullet points for easy reading.
- Keep it professional, empathetic, and data-driven.
- Do not output raw JSON data.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please advise me on selling my ${crop} crop in ${state}.` }
      ],
      temperature: 0.3
    });

    return {
      success: true,
      recommendation: completion.choices[0].message.content
    };
  } catch (error) {
    console.error("Mandi AI Service Error:", error.message);
    return {
      success: false,
      recommendation: "Our AI advisor is currently analyzing the markets and is unavailable right now."
    };
  }
};
