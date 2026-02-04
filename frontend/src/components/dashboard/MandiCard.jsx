import { useState } from "react";
import { getMandiPrices } from "../../api/mandiApi";

const CROPS = [
  { label: "Cotton", value: "cotton", markets: ["pune", "nagpur"] },
  { label: "Soybean", value: "soybean", markets: ["indore"] },
  { label: "Rice", value: "rice", markets: ["kolhapur"] }
];

export default function MandiCard() {
  const [crop, setCrop] = useState("");
  const [market, setMarket] = useState("");
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedCrop = CROPS.find(c => c.value === crop);

  const fetchPrice = async () => {
    if (!crop || !market) return;

    try {
      setLoading(true);
      const res = await getMandiPrices(crop, market);
      setPrice(res.data);
    } catch (error) {
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/30 shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900">💰 Mandi Prices</h3>

      {/* Selectors */}
      <div className="mt-4 space-y-3">
        <select
          value={crop}
          onChange={(e) => {
            setCrop(e.target.value);
            setMarket("");
            setPrice(null);
          }}
          className="w-full rounded-lg bg-white/60 border px-3 py-2 text-sm"
        >
          <option value="">Select Crop</option>
          {CROPS.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          disabled={!crop}
          className="w-full rounded-lg bg-white/60 border px-3 py-2 text-sm"
        >
          <option value="">Select Market</option>
          {selectedCrop?.markets.map(m => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={fetchPrice}
          disabled={!crop || !market}
          className="w-full rounded-xl bg-emerald-600 py-2 text-white text-sm font-medium hover:bg-emerald-700 transition"
        >
          Get Price
        </button>
      </div>

      {/* Result */}
      <div className="mt-4">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}

        {!loading && price && (
          <div className="text-sm text-slate-700 space-y-1">
            <p>Market: <b>{price.market}</b></p>
            <p>Min: ₹{price.prices.min}</p>
            <p>Max: ₹{price.prices.max}</p>
            <p>Modal: ₹{price.prices.modal}</p>
          </div>
        )}

        {!loading && !price && crop && market && (
          <p className="text-sm text-slate-500">
            No mandi data available
          </p>
        )}
      </div>
    </div>
  );
}
