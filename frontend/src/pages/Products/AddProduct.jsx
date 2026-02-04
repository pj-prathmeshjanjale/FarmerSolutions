import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../../components/ImageUploader";

export default function AddProduct() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        brand: "",
        category: "seed",
        price: "",
        stock: "",
        suitableCrops: "",
        suitableSoil: ""
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.brand || !form.price || !form.stock) {
            setError("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("brand", form.brand);
            formData.append("category", form.category);
            formData.append("price", form.price);
            formData.append("stock", form.stock);
            formData.append("suitableCrops", form.suitableCrops);
            formData.append("suitableSoil", form.suitableSoil);

            // Append images
            images.forEach((image) => {
                formData.append("images", image);
            });

            await api.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("✅ Product added successfully and sent for admin approval!");
            navigate("/dashboard");

        } catch (err) {
            setError(err.response?.data?.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📦 List Authenticated Product
                </h1>
                <p className="text-slate-500 mt-1 text-sm italic">Register industrial-grade seeds, fertilizers, or pesticides.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* IMAGE UPLOADER */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
                        <ImageUploader onImagesSelected={setImages} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Hybrid Wheat Seeds"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="e.g. AgriCorp"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="seed">Seeds</option>
                            <option value="fertilizer">Fertilizers</option>
                            <option value="pesticide">Pesticides</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
                            <input
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
                            <input
                                name="stock"
                                type="number"
                                value={form.stock}
                                onChange={handleChange}
                                placeholder="e.g. 100"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Suitable Crops (Comma separated)</label>
                        <input
                            name="suitableCrops"
                            value={form.suitableCrops}
                            onChange={handleChange}
                            placeholder="Wheat, Rice, Cotton"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Suitable Soil (Comma separated)</label>
                        <input
                            name="suitableSoil"
                            value={form.suitableSoil}
                            onChange={handleChange}
                            placeholder="Alluvial, Black, Clay"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition"
                    >
                        {loading ? "Registering..." : "Register Product for Approval"}
                    </button>
                </form>
            </div>
        </div>
    );
}
