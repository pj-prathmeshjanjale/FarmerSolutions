import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import RentRequestModal from "../../components/modals/RentRequestModal";
import ImageCarousel from "../../components/ImageCarousel";

export default function EquipmentDetails() {
  const { id } = useParams();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRentModal, setShowRentModal] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/${id}`);
        setEquipment(res.data.equipment);
      } catch (err) {
        console.error("Failed to fetch equipment", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  if (loading) {
    return <p className="p-10 text-slate-500">Loading...</p>;
  }

  if (!equipment) {
    return <p className="p-10 text-red-500">Equipment not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fadeIn">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* IMAGE */}
        <ImageCarousel images={equipment.images} />

        {/* DETAILS */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {equipment.name}
          </h1>

          <p className="mt-1 text-slate-600">📍 {equipment.location}</p>

          <p className="mt-4 text-slate-700">
            {equipment.description}
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <p>💰 <b>₹{equipment.pricePerDay}/day</b></p>
            <p>🚚 Shipping: ₹{equipment.shippingCharge}</p>
            <p>🤝 Negotiable: {equipment.negotiable ? "Yes" : "No"}</p>
            <p>👤 Owner: {equipment.owner?.name}</p>
          </div>

          {/* 🔴 IMPORTANT BUTTON */}
          <button
            onClick={() => {
              console.log("Request Rent clicked"); // debug
              setShowRentModal(true);
            }}
            className="
              mt-6 w-full
              rounded-xl
              bg-emerald-600
              py-3 text-white font-medium
              hover:bg-emerald-700
            "
          >
            Request for Rent
          </button>
        </div>
      </div>

      {/* ✅ MODAL MUST BE HERE */}
      <RentRequestModal
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
        equipment={equipment}
      />

    </div>
  );
}
