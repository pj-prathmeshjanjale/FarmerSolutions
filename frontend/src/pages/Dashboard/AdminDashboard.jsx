import { useState, useEffect } from "react";
import api from "../../api/axios";
import DetailsModal from "../../components/DetailsModal";

export default function AdminDashboard() {
    const [activeSection, setActiveSection] = useState("sellers"); // 'sellers' or 'products'
    const [statusFilter, setStatusFilter] = useState("pending"); // 'pending', 'approved', 'rejected'

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeSection, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = activeSection === "sellers"
                ? `/admin/sellers?status=${statusFilter}`
                : `/admin/products?status=${statusFilter}`;

            const response = await api.get(endpoint);
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

        try {
            const endpoint = activeSection === "sellers"
                ? `/admin/seller-status/${id}`
                : `/admin/product-status/${id}`;

            await api.put(endpoint, { status: newStatus });

            // Remove item from list if view is different from new status (e.g. approved item moving out of pending list)
            if (statusFilter !== newStatus) {
                setData(prev => prev.filter(item => item._id !== id));
            }

            // Close modal if open
            setIsModalOpen(false);
        } catch (error) {
            alert(`Error updating status: ${error.response?.data?.message || error.message}`);
        }
    };

    const openDetails = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Manage sellers and products across the platform.</p>

            {/* Main Tabs (Sellers vs Products) */}
            <div className="flex gap-6 mt-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveSection("sellers")}
                    className={`pb-3 px-2 font-medium text-lg transition ${activeSection === "sellers" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Diagnostic Sellers
                </button>
                <button
                    onClick={() => setActiveSection("products")}
                    className={`pb-3 px-2 font-medium text-lg transition ${activeSection === "products" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Products Inventory
                </button>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 mt-6">
                {["pending", "approved", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize
                            ${statusFilter === status
                                ? "bg-slate-900 text-white shadow-md"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="mt-6">
                {loading ? (
                    <div className="p-10 text-center text-slate-500 animate-pulse">Loading data...</div>
                ) : data.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No {statusFilter} {activeSection} found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {data.map((item) => (
                            <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    {activeSection === "sellers" ? (
                                        <>
                                            <h3 className="font-semibold text-lg text-slate-900">{item.businessName}</h3>
                                            <p className="text-sm text-slate-600">Owner: {item.user?.name} ({item.user?.email})</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">License: {item.licenseNumber}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 shrink-0">
                                                {item.images && item.images[0] ? (
                                                    <img src={item.images[0]?.startsWith("http") ? item.images[0] : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${item.images[0]}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                                ) : "📦"}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-900">{item.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    <span className="font-medium text-slate-700">{item.brand}</span> | ₹{item.price} | Stock: {item.stock}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">Sold by: {item.seller?.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => openDetails(item)}
                                        className="text-slate-600 hover:text-emerald-600 font-medium text-sm px-3 py-2 hover:bg-emerald-50 rounded-lg transition"
                                    >
                                        View Details
                                    </button>

                                    {/* Action Buttons based on status */}
                                    {statusFilter === "pending" && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(item._id, "approved")}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(item._id, "rejected")}
                                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {statusFilter === "approved" && (
                                        <button
                                            onClick={() => handleUpdateStatus(item._id, "rejected")}
                                            className="text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                    {statusFilter === "rejected" && (
                                        <button
                                            onClick={() => handleUpdateStatus(item._id, "approved")}
                                            className="text-emerald-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition"
                                        >
                                            Re-instate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={activeSection === "sellers" ? "Seller Details" : "Product Details"}
                data={selectedItem}
                type={activeSection === "sellers" ? "seller" : "product"}
            />
        </div>
    );
}
