import { callGroqAI } from "../services/groqService.js";

// ===============================
// Rule-based knowledge base
// ===============================
const knowledgeBase = {
  en: {
    fertilizer_cotton:
      "For cotton crops, fertilizers rich in Nitrogen and Potash are recommended.",
    seed_cotton:
      "Hybrid cotton seeds from approved brands are suitable for better yield.",
    irrigation:
      "Proper irrigation depends on soil type and crop stage.",
    platform_help:
      "You can buy seeds, pesticides, rent equipment, and view crop recommendations on this platform."
  },
  hi: {
    fertilizer_cotton:
      "कपास की फसल के लिए नाइट्रोजन और पोटाश युक्त उर्वरक उपयुक्त होते हैं।",
    seed_cotton:
      "अच्छी पैदावार के लिए प्रमाणित हाइब्रिड कपास बीज उपयोग करें।",
    irrigation:
      "सिंचाई मिट्टी के प्रकार और फसल की अवस्था पर निर्भर करती है।",
    platform_help:
      "इस प्लेटफॉर्म पर आप बीज, कीटनाशक खरीद सकते हैं और उपकरण किराए पर ले सकते हैं।"
  },
  mr: {
    fertilizer_cotton:
      "कापस पिकासाठी नायट्रोजन आणि पोटॅशयुक्त खत उपयुक्त असते.",
    seed_cotton:
      "चांगल्या उत्पादनासाठी प्रमाणित हायब्रिड कापूस बियाणे वापरा.",
    irrigation:
      "सिंचन मातीचा प्रकार आणि पिकाच्या अवस्थेवर अवलंबून असते.",
    platform_help:
      "या प्लॅटफॉर्मवर तुम्ही बियाणे, कीटकनाशके खरेदी करू शकता आणि उपकरणे भाड्याने घेऊ शकता."
  }
};

// ===============================
// Detect intent
// ===============================
const detectIntent = (message) => {
  const msg = message.toLowerCase();

  if (
    msg.includes("fertilizer") ||
    msg.includes("उर्वरक") ||
    msg.includes("खत")
  ) return "fertilizer_cotton";

  if (
    msg.includes("seed") ||
    msg.includes("बीज") ||
    msg.includes("बियाणे")
  ) return "seed_cotton";

  if (
    msg.includes("irrigation") ||
    msg.includes("सिंचाई") ||
    msg.includes("सिंचन")
  ) return "irrigation";

  if (
    msg.includes("platform") ||
    msg.includes("प्लेटफॉर्म") ||
    msg.includes("अ‍ॅप")
  ) return "platform_help";

  return null; // IMPORTANT
};

// ===============================
// Chatbot controller
// ===============================
export const askChatbot = async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const lang = language || "en";

    // 1️⃣ Try rule-based logic
    const intent = detectIntent(message);

    if (intent && knowledgeBase[lang] && knowledgeBase[lang][intent]) {
      return res.status(200).json({
        success: true,
        reply: knowledgeBase[lang][intent],
        source: "rule-based"
      });
    }

    // 2️⃣ Fallback to Grok AI
    const groqResponse = await callGroqAI({
      question: message
    });

    return res.status(200).json({
      success: true,
      reply: groqResponse.answer,
      source: "groq-ai"
    });


  } catch (error) {
    console.error("Chatbot Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Chatbot service error"
    });
  }
};
