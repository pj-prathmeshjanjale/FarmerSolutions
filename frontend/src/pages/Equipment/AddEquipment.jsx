import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../../components/ImageUploader";

export default function AddEquipment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "tractor",
    description: "",
    pricePerDay: "",
    shippingCharge: "",
    location: "",
    negotiable: true
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagesSelected = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const submitEquipment = async () => {
    if (!form.name || !form.pricePerDay || !form.location) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create FormData
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("pricePerDay", form.pricePerDay);
      formData.append("shippingCharge", form.shippingCharge || 0);
      formData.append("location", form.location);
      formData.append("negotiable", form.negotiable);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Need to set Content-Type to multipart/form-data? 
      // Axios usually sets it automatically with FormData
      await api.post("/equipment", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ Equipment added successfully");
      navigate("/my-equipment");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        🚜 Add Equipment
      </h1>

      <div className="space-y-3">

        <input
          name="name"
          placeholder="Equipment name"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        />

        <select
          name="category"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        >
          <option value="tractor">Tractor</option>
          <option value="harvester">Harvester</option>
          <option value="rotavator">Rotavator</option>
          <option value="sprayer">Sprayer</option>
          <option value="other">Other</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        />

        <input
          name="pricePerDay"
          type="number"
          placeholder="Price per day (₹)"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        />

        <input
          name="shippingCharge"
          type="number"
          placeholder="Shipping charge (₹)"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location (e.g. Pune)"
          className="w-full rounded-lg border px-3 py-2"
          onChange={handleChange}
        />

        {/* New Image Uploader */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
        <ImageUploader onImagesSelected={handleImagesSelected} />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={submitEquipment}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 text-white py-2 mt-4"
        >
          {loading ? "Adding..." : "Add Equipment"}
        </button>

      </div>
    </div>
  );
}
