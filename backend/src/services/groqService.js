import Groq from "groq-sdk";

export const callGroqAI = async ({ question }) => {
  try {
    // ✅ Create client INSIDE function (after env is loaded)
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for Indian farmers. " +
            "Reply in very simple language. " +
            "If the question is in Marathi, reply in Marathi. " +
            "If in Hindi, reply in Hindi. " +
            "Otherwise reply in English. " +
            "Avoid technical words. " +
            "IMPORTANT: Format your response using Markdown. " +
            "Use **Bold** for important points. " +
            "Use Bullet points for lists. " +
            "Use ### Headers for sections."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.4
    });

    return {
      success: true,
      answer: completion.choices[0].message.content
    };

  } catch (error) {
    console.error("Groq AI Error:", error.message);

    return {
      success: false,
      answer:
        "सध्या तज्ञ सल्ला उपलब्ध नाही. कृपया स्थानिक कृषी तज्ञांचा सल्ला घ्या."
    };
  }
};
