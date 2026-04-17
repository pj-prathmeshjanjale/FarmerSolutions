import { useState, useRef } from "react";
import { askChatbot } from "../../api/chatbotApi";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

export default function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("mr"); // Default to Marathi visually
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async (textToSend) => {
    // Ensure we safely extract the string, bypassing React Click Events if triggered via the button incorrectly
    const finalMessage = typeof textToSend === 'string' ? textToSend : input;
    
    if (!finalMessage || !finalMessage.trim()) return;

    const userMessage = {
      sender: "user",
      text: finalMessage
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askChatbot(finalMessage, language);

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

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Your browser does not support Voice Recognition. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Map internal language codes to BCP 47 Speech API codes
    const speechLangMap = {
      "en": "en-IN",
      "hi": "hi-IN",
      "mr": "mr-IN" 
    };
    
    recognition.lang = speechLangMap[language] || "mr-IN";
    recognition.continuous = false;
    recognition.interimResults = true; // ENABLE REAL-TIME LIVE TEXT

    recognition.onstart = () => {
      setIsListening(true);
      setInput(""); // Clear bar when starting
      toast("Listening... Speak now", { icon: '🎙️' });
    };

    // Keep track of the live sentence
    recognition.onresult = (event) => {
      let currentTranscript = "";
      let isFinalResult = false;

      // Chrome builds the entire sentence in event.results from index 0
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinalResult = true;
        }
      }

      // Show live changes in the input box immediately!
      setInput(currentTranscript);

      // Confirmed final word/sentence, send off!
      if (isFinalResult) {
         setIsListening(false);
         recognition.stop();
         sendMessage(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow it in browser settings.");
      } else if (event.error === 'no-speech') {
        toast("No speech detected. Please check your browser's microphone settings (URL bar) and ensure the correct mic is selected.", { icon: '🔇' });
      } else {
        toast.error(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-lg h-[80vh] rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/30 bg-white/50">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            🤖 Virtual Krushi Mitra
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-bold uppercase tracking-widest text-slate-600 rounded-lg bg-white/80 border border-slate-200 px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="mr">Marathi</option>
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                 <div className="text-4xl mb-4">🌾</div>
                 <h3 className="font-bold text-slate-700">How can I help your farm today?</h3>
                 <p className="text-xs text-slate-500 mt-2 max-w-xs block">Type a message below or tap the microphone to speak in your local language.</p>
             </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] shadow-sm ${msg.sender === "user"
                ? "ml-auto bg-emerald-600 text-white rounded-br-sm"
                : "mr-auto bg-white/90 text-slate-800 border border-white/40 rounded-bl-sm"
                }`}
            >
              <ReactMarkdown
                components={{
                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mt-2 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mt-2 space-y-1" {...props} />,
                  strong: ({ node, ...props }) => <span className={`font-bold ${msg.sender === 'user' ? 'text-white' : 'text-slate-900'}`} {...props} />,
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
            <div className="mr-auto max-w-[85%] px-4 py-3 rounded-2xl bg-white/90 text-slate-800 border border-white/40 rounded-bl-sm flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/30 bg-white/50 flex gap-2">
          
          <button
            onClick={startListening}
            title="Speak"
            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl shadow-sm transition-all ${
                isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {/* Microphone Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </button>

          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl bg-white border-2 border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage(null)}
          />
          <button
            onClick={() => sendMessage(null)}
            disabled={isListening || (!input.trim() && !loading)}
            className="rounded-xl bg-slate-900 px-5 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
