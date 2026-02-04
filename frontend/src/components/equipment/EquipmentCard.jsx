import { useNavigate } from "react-router-dom";

export default function EquipmentCard({ equipment }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/equipment/${equipment._id}`)}
      className="
        cursor-pointer
        rounded-2xl
        bg-white/70 backdrop-blur
        border border-white/30
        shadow-lg shadow-black/5
        overflow-hidden
        transition hover:scale-[1.02]
      "
    >
      <img
        src={equipment.images?.[0]}
        alt={equipment.name}
        className="h-48 w-full object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {equipment.name}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2">
          {equipment.description}
        </p>

        <p className="mt-2 text-emerald-600 font-medium">
          ₹{equipment.pricePerDay}/day
        </p>

        <p className="text-xs text-slate-500">
          Location: {equipment.location}
        </p>
      </div>
    </div>
  );
}
