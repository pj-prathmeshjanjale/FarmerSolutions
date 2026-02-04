import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function RentRequestModal({ isOpen, onClose, equipment }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill price when modal opens
  useEffect(() => {
    if (equipment) {
      setPrice(equipment.pricePerDay);
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const submitRequest = async () => {
    // 🔒 Frontend validation
    if (!startDate || !endDate || !price) {
      setError("Please fill all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Debug (remove later if you want)
      console.log({
        equipmentId: equipment._id,
        startDate,
        endDate,
        proposedPricePerDay: price,
        message
      });

      await api.post("/rental-requests", {
        equipmentId: equipment._id,
        startDate,
        endDate,
        proposedPricePerDay: Number(price),
        message
      });

      alert("✅ Rental request sent successfully");
      onClose();

      // Reset state after success
      setStartDate("");
      setEndDate("");
      setMessage("");

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to send rental request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">

        {/* Header */}
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          🚜 Request Equipment on Rent
        </h2>

        {/* Inputs */}
        <div className="mt-5 space-y-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Proposed price per day"
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <textarea
            rows="3"
            placeholder="Message to owner (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border py-2 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={submitRequest}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-600 text-white py-2 hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
