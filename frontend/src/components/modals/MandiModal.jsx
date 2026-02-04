import { useState } from "react";
import { getMandiPrices } from "../../api/mandiApi";

export default function MandiModal({ isOpen, onClose }) {
  const [crop, setCrop] = useState("");
  const [market, setMarket] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const fetchMandiPrice = async () => {
    if (!crop.trim() || !market.trim()) {
      setError("Please enter crop and market");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getMandiPrices(crop, market);
      setData(res.data);
    } catch (err) {
      setData(null);
      setError("Mandi price data not available");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            💰 Check Mandi Prices
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Enter crop (e.g. cotton)"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="
              w-full rounded-xl
              bg-white/60 border border-white/40
              px-4 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500
            "
          />

          <input
            type="text"
            placeholder="Enter market (e.g. pune)"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="
              w-full rounded-xl
              bg-white/60 border border-white/40
              px-4 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500
            "
          />
        </div>

        {/* Action */}
        <button
          onClick={fetchMandiPrice}
          className="
            mt-4 w-full rounded-xl
            bg-emerald-600 py-2
            text-white text-sm font-medium
            hover:bg-emerald-700 transition
          "
        >
          Get Price
        </button>

        {/* Result */}
        <div className="mt-4 text-sm">
          {loading && (
            <p className="text-slate-500">Fetching mandi prices...</p>
          )}

          {error && (
            <p className="text-red-500">{error}</p>
          )}

          {!loading && data && (
            <div className="space-y-1 text-slate-700">
              <p><b>Crop:</b> {data.crop}</p>
              <p><b>Market:</b> {data.market}</p>
              <p><b>Min:</b> ₹{data.prices.min}</p>
              <p><b>Max:</b> ₹{data.prices.max}</p>
              <p><b>Modal:</b> ₹{data.prices.modal}</p>
              <p className="text-xs text-slate-500">
                Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
