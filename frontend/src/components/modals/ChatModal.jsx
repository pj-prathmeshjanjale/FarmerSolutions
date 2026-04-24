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

  // Fetch history + join socket room
  useEffect(() => {
    if (!isOpen || !rentalRequestId) return;

    api
      .get(`/chat/${rentalRequestId}`)
      .then((res) => {
        setMessages(res.data.messages);
        refreshCount();
      })
      .catch((err) => console.error(err));

    const socket = getSocket();
    if (!socket) return;

    // Named handler — skip own messages (sender sees via optimistic insert, not socket)
    const handleNewMessage = (msg) => {
      const msgSenderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      if (msgSenderId === userId) return; // Already shown via optimistic insert
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const joinAndListen = () => {
      socket.emit("joinRoom", String(rentalRequestId));
      socket.off("newMessage", handleNewMessage); // remove any stale listener first
      socket.on("newMessage", handleNewMessage);
    };

    if (socket.connected) {
      joinAndListen();
    } else {
      socket.once("connect", joinAndListen);
    }

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("connect", joinAndListen);
    };
  }, [isOpen, rentalRequestId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistic insert — sender sees their own message instantly
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      sender: { _id: userId },
      message: trimmed,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText("");

    try {
      setLoading(true);
      const res = await api.post("/chat/send", {
        rentalRequestId,
        message: trimmed
      });
      // Replace temp message with real one from server
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? res.data.chatMessage : m))
      );
    } catch {
      // Remove failed temp message
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      alert("Message failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
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
