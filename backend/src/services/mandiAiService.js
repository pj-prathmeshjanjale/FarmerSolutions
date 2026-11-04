import { getFarmerContext } from "./farmerService.js";
import { getBestMandi, getTrends } from "./mandiService.js";
import { createGroqChatCompletion } from "../utils/groqClient.js";

/**
 * Generate AI recommendation for selling crops based on market data
 */
export const generateSellRecommendation = async (userId, crop, state, language = "en", userPrompt = "") => {
  try {
    // 1. Fetch Farmer Context safely
    let farmerContext = null;
    try {
      if (userId) {
        farmerContext = await getFarmerContext(userId);
      }
    } catch (profileErr) {
      console.warn("Could not fetch farmer profile context for mandi recommendation:", profileErr.message);
    }
    
    // 2. Fetch Market Context
    let bestMandiResult = { success: false };
    let trendsResult = { success: false };
    try {
      bestMandiResult = await getBestMandi({ crop, state });
      trendsResult = await getTrends({ crop, state, days: 7 });
    } catch (mandiErr) {
      console.warn("Could not fetch mandi market data:", mandiErr.message);
    }
    
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

    const promptInstructions = userPrompt && userPrompt.trim() !== ""
      ? `TASK:
Answer the farmer's specific inquiry: "${userPrompt.trim()}"
Use the live market trends, best mandi rates, and farmer profile provided above to deliver an actionable, predictive response.
Provide:
1. Direct answer with clear prediction or strategic recommendation (e.g. SELL NOW, WAIT, or PARTIAL SELL if relevant).
2. Rate comparisons or market highlights.
3. Realistic risk vs reward analysis.
4. Actionable advice for maximizing profit.`
      : `TASK:
Based on the market trends and best mandi data provided, suggest to the farmer:
1. A clear recommendation: SELL NOW, WAIT, or PARTIAL SELL.
2. The best nearby Mandi and its current price.
3. A detailed but simple reasoning.
4. Expert tip for better profits.`;

    const systemPrompt = `SYSTEM:
You are an expert AI Concierge and agricultural market advisor for Indian farmers. 

CONTEXT (JSON):
${JSON.stringify(systemContext, null, 2)}

${promptInstructions}

CRITICAL INSTRUCTIONS:
- You MUST reply entirely and ONLY in ${targetLang}. 
- Use actual native script characters for Hindi/Marathi.
- Format using Markdown with clear headers like:
    ### 📢 Recommendation / Analysis
    ### 📍 Optimal Market / Rates
    ### 💡 Market Outlook
    ### 🚀 Pro Tip
- Use bullet points for easy reading.
- Keep it professional, empathetic, and data-driven.
- Do not output raw JSON data.`;

    const userMessageContent = userPrompt && userPrompt.trim() !== ""
      ? userPrompt.trim()
      : `Please advise me on selling my ${crop} crop in ${state}.`;

    const completion = await createGroqChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent }
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
