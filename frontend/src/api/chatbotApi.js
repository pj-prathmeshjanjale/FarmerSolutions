import api from "./axios";

export const askChatbot = (message, language) => {
  return api.post("/chatbot", {
    message,
    language
  });
};
