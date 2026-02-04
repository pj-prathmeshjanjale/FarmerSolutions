import { useEffect, useState } from "react";
import api from "../../api/axios";
import ChatModal from "../../components/modals/ChatModal";
import { getSocket } from "../../utils/socket";

export default function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    fetchRequests();

    const socket = getSocket();
    if (socket) {
      socket.on("incomingMessage", (msg) => {
        setRequests(prev => prev.map(req => {
          if (req._id === msg.rentalRequest) {
            return { ...req, unreadCount: (req.unreadCount || 0) + 1 };
          }
          return req;
        }));
      });
      return () => socket.off("incomingMessage");
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/rental-requests/owner");
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/rental-requests/${id}/${action}`);
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">
        📥 Incoming Rental Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-slate-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="rounded-xl bg-white border shadow p-4"
            >
              <h3 className="font-medium">{req.equipment?.name || "Deleted Equipment"}</h3>

              <p className="text-sm text-slate-600">
                Requested by: {req.renter?.name || "Unknown User"}
              </p>

              <p className="text-sm mt-1">
                📅 {req.startDate ? new Date(req.startDate).toDateString() : "N/A"} →{" "}
                {req.endDate ? new Date(req.endDate).toDateString() : "N/A"}
              </p>

              {/* UNREAD BADGE */}
              {req.unreadCount > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-red-600">
                    {req.unreadCount} New Message{req.unreadCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}


              <p className="text-sm mt-1">
                💰 ₹{req.proposedPricePerDay} / day
              </p>


              {/* ACTIONS */}
              {req.status === "PENDING" ? (
                <div className="mt-3 flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveChat(req._id);
                      // Reset unread count locally for instant feedback
                      setRequests(prev => prev.map(r =>
                        r._id === req._id ? { ...r, unreadCount: 0 } : r
                      ));
                    }}
                    className="px-4 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    💬 Negotiate
                  </button>

                  <button
                    onClick={() => handleAction(req._id, "accept")}
                    className="px-4 py-1 rounded bg-emerald-600 text-white text-sm"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleAction(req._id, "reject")}
                    className="px-4 py-1 rounded bg-red-500 text-white text-sm"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm font-medium text-slate-600">
                  Status:{" "}
                  <span className="capitalize">{req.status.toLowerCase()}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CHAT MODAL */}
      <ChatModal
        isOpen={!!activeChat}
        rentalRequestId={activeChat}
        onClose={() => setActiveChat(null)}
      />
    </div>
  );
}
