import { useState } from "react";
import ChatbotModal from "../modals/ChatbotModal";
import { Sparkles } from "lucide-react";

export default function FloatingAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* The Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
                aria-label="Open AI Assistant"
            >
                {/* Optional Pulse Ring */}
                <span className="absolute inset-0 rounded-full bg-slate-900 opacity-20 group-hover:animate-ping"></span>
                <Sparkles size={24} className="text-emerald-400" />
            </button>

            {/* The Existing Chatbot Modal */}
            <ChatbotModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
            />
        </>
    );
}
