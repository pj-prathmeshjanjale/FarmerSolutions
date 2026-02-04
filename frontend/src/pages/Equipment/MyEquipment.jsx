import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function MyEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEquipment();
  }, []);

  const fetchMyEquipment = async () => {
    try {
      const res = await api.get("/equipment/my");
      setEquipment(res.data.equipment);
    } catch (err) {
      console.error("Failed to fetch equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment listing?")) return;

    try {
      await api.delete(`/equipment/${id}`);
      setEquipment(equipment.filter((item) => item._id !== id));
      alert("Equipment deleted successfully!");
    } catch (err) {
      console.error("Failed to delete equipment", err);
      alert(err.response?.data?.message || "Failed to delete equipment");
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          🧾 My Equipment
        </h1>

        <Link
          to="/add-equipment"
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm"
        >
          + Add Equipment
        </Link>
      </div>

      {equipment.length === 0 ? (
        <p className="text-slate-500">
          No equipment listed yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipment.map((item) => (
            <div
              key={item._id}
              className="rounded-xl bg-white shadow border p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-medium text-slate-900">
                  {item.name}
                </h3>

                <p className="text-sm text-slate-600 mt-1">
                  {item.location}
                </p>

                <p className="mt-2 text-sm font-medium text-emerald-600">
                  ₹{item.pricePerDay} / day
                </p>

                <p
                  className={`mt-1 text-xs font-semibold ${item.availability
                      ? "text-green-600"
                      : "text-red-500"
                    }`}
                >
                  {item.availability ? "Available" : "Not Available"}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
