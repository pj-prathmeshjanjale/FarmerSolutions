import { useEffect, useState } from "react";
import api from "../../api/axios";
import ChatModal from "../../components/modals/ChatModal";
import { getSocket } from "../../utils/socket";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    api.get("/rental-requests/my")
      .then(res => setRequests(res.data.requests))
      .catch(err => console.error(err));

    // Socket Listeners for Real-time Unread Count
    const socket = getSocket();
    if (socket) {
      socket.on("incomingMessage", (msg) => {
        setRequests(prevRequests => prevRequests.map(req => {
          if (req._id === msg.rentalRequest) {
            return { ...req, unreadCount: (req.unreadCount || 0) + 1 };
          }
          return req;
        }));
      });

      return () => {
        socket.off("incomingMessage");
      }
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        📄 My Rental Requests
      </h1>

      {requests.length === 0 && (
        <p className="text-slate-500">No requests yet.</p>
      )}

      {requests.map(req => (
        <div
          key={req._id}
          className="mb-4 rounded-xl bg-white p-4 shadow"
        >
          <p><b>Equipment:</b> {req.equipment?.name}</p>
          <p><b>Status:</b> {req.status}</p>

          {/* UNREAD BADGE */}
          {req.unreadCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 rounded-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold text-red-600">
                {req.unreadCount} New Message{req.unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {req.status === "PENDING" && (
            <button
              onClick={() => {
                setActiveChat(req._id);
                // Reset unread count locally for instant feedback
                setRequests(prev => prev.map(r =>
                  r._id === req._id ? { ...r, unreadCount: 0 } : r
                ));
              }}
              className="mt-3 px-4 py-1 rounded bg-blue-600 text-white text-sm"
            >
              💬 Negotiate
            </button>
          )}
        </div>
      ))}

      {/* CHAT MODAL */}
      <ChatModal
        isOpen={!!activeChat}
        rentalRequestId={activeChat}
        onClose={() => setActiveChat(null)}
      />
    </div>
  );
}
