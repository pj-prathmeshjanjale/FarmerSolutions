import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { getSocket } from "../../utils/socket";
import { useNotifications } from "../../context/NotificationContext";

export default function ChatModal({ isOpen, onClose, rentalRequestId }) {
  const { refreshCount } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // ✅ CORRECT USER ID
  const userId =
    JSON.parse(localStorage.getItem("user"))?.id ||
    JSON.parse(localStorage.getItem("user"))?._id;

  // Fetch chat history
  useEffect(() => {
    if (!isOpen || !rentalRequestId) return;

    api
      .get(`/chat/${rentalRequestId}`)
      .then((res) => {
        setMessages(res.data.messages);
        refreshCount(); // Clear unread count for this user
      })
      .catch((err) => console.error(err));


    // Socket Join Room & Listeners
    const socket = getSocket();
    if (socket) {
      socket.emit("joinRoom", rentalRequestId);
      socket.on("newMessage", (msg) => {
        // Prevent duplicates if API also returns it (though API here is only for history)
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    }

    return () => {
      if (socket) socket.off("newMessage");
    };
  }, [isOpen, rentalRequestId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/chat/send", {
        rentalRequestId,
        message: text
      });

      // setMessages((prev) => [...prev, res.data.chatMessage]); 👈 REMOVED (Socket handles it)
      setText("");
    } catch {
      alert("Message failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <div className="w-full max-w-md h-[80vh] bg-white rounded-xl shadow-lg flex flex-col">

        {/* HEADER */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">Negotiation Chat</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
          {messages.map((msg) => {
            const senderId =
              typeof msg.sender === "string"
                ? msg.sender
                : msg.sender?._id;

            const isMe = senderId === userId;

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[70%] px-3 py-2 text-sm rounded-2xl
                    ${isMe
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"}
                  `}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
