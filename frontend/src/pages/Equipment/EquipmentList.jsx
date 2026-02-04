import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function EquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await api.get("/equipment");
        setEquipments(res.data.equipment); // 👈 IMPORTANT
      } catch (err) {
        console.error("Failed to fetch equipment", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            🚜 Equipment on Rent
          </h1>
          <p className="mt-1 text-slate-600">
            Browse farming equipment available for rent
          </p>
        </div>
        <button
          onClick={() => navigate("/add-equipment")}
          className="
            rounded-xl bg-emerald-600/90 px-5 py-2.5
            text-sm text-white font-medium
            shadow-lg shadow-emerald-600/20
            hover:bg-emerald-700 transition
          "
        >
          + Add Equipment
        </button>
      </div>

      {loading && (
        <p className="mt-10 text-slate-500">Loading equipment...</p>
      )}

      {!loading && equipments.length === 0 && (
        <p className="mt-10 text-slate-500">
          No equipment available right now
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipments.map((eq) => (
          <div
            key={eq._id}
            className="
              rounded-2xl
              bg-white/70 backdrop-blur-md
              border border-white/30
              shadow-lg shadow-black/5
              overflow-hidden
              transition hover:scale-[1.02]
            "
          >
            <img
              src={eq.images[0]}
              alt={eq.name}
              className="h-44 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {eq.name}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {eq.location}
              </p>

              <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                {eq.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-emerald-600">
                  ₹{eq.pricePerDay}/day
                </span>

                <button
                  onClick={() => navigate(`/equipment/${eq._id}`)}
                  className="
                rounded-lg
                bg-emerald-600/90
                px-3 py-1.5
                text-sm text-white
                hover:bg-emerald-700
            "
                >
                  View Details
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
