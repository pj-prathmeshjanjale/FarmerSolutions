import { useState } from "react";
import { askChatbot } from "../../api/chatbotApi";
import ReactMarkdown from "react-markdown";

export default function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askChatbot(input, language);

      const botMessage = {
        sender: "bot",
        text: res.data.reply
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-lg h-[80vh] rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/30">
          <h2 className="font-semibold text-slate-900">🤖 AI Assistant</h2>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm rounded-lg bg-white/60 border px-2 py-1"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>

            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender === "user"
                ? "ml-auto bg-sky-600 text-white"
                : "mr-auto bg-white/80 text-slate-800"
                }`}
            >
              <ReactMarkdown
                components={{
                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mt-2 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mt-2 space-y-1" {...props} />,
                  strong: ({ node, ...props }) => <span className="font-bold text-slate-900" {...props} />,
                  h1: ({ node, ...props }) => <h3 className="font-bold text-lg mt-2 mb-1" {...props} />,
                  h2: ({ node, ...props }) => <h4 className="font-bold text-base mt-2 mb-1" {...props} />,
                  h3: ({ node, ...props }) => <h5 className="font-semibold text-sm mt-2" {...props} />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-slate-500">AI is typing...</div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/30 flex gap-2">
          <input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl bg-white/60 border px-4 py-2 text-sm focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="rounded-xl bg-sky-600 px-4 text-white text-sm hover:bg-sky-700"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
