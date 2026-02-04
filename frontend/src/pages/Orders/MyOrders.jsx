import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Package, Truck, CheckCircle, Clock, AlertCircle, Calendar, MapPin, XCircle, Search, Filter } from "lucide-react";
import { generateInvoice } from "../../utils/invoiceGenerator";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders/my");
            setOrders(res.data.orders);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await api.put(`/orders/${id}/cancel`);
            if (res.data.success) fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel order.");
        }
    };

    const handleInvoice = (order) => {
        generateInvoice(order);
    };

    const getStatusBadge = (status) => {
        const styles = {
            PLACED: "bg-blue-50 text-blue-700 border-blue-100",
            PENDING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-100",
            CONFIRMED: "bg-purple-50 text-purple-700 border-purple-100",
            SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
            DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
            CANCELLED: "bg-red-50 text-red-700 border-red-100",
        };

        const icons = {
            PLACED: <Package size={14} />,
            PENDING_PAYMENT: <Clock size={14} />,
            CONFIRMED: <CheckCircle size={14} />,
            SHIPPED: <Truck size={14} />,
            DELIVERED: <CheckCircle size={14} />,
            CANCELLED: <XCircle size={14} />,
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PLACED}`}>
                {icons[status] || <AlertCircle size={14} />}
                {status.replace("_", " ")}
            </span>
        );
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.product?.name || order.equipment?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Purchase History</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage and track your recent orders.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter size={16} />
                        Filter Status
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-slate-100"></div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Package size={24} />
                        </div>
                        <h3 className="text-slate-900 font-medium">No orders found</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-6">Looks like you haven't bought anything yet.</p>
                        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                            Browse Products <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const item = order.product || order.equipment;
                            const isRental = order.orderType === "RENT";
                            const formattedDate = new Date(order.createdAt).toLocaleDateString();

                            return (
                                <div key={order._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="p-6 flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                                        {/* Image */}
                                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100">
                                            {item?.images?.[0] ? (
                                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 text-center lg:text-left">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                                                <h3 className="font-semibold text-slate-900 text-lg">{item?.name || "Unknown Item"}</h3>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">{isRental ? "Equipment Rental" : `Brand: ${item?.brand || "Generic"}`}</p>

                                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span>Placed on {formattedDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} className="text-slate-400" />
                                                    <span>Qty: {order.quantity} {isRental ? "Days" : "Units"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span className="truncate max-w-[200px]" title={order.shippingAddress}>{order.shippingAddress || "Digital Delivery"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Actions */}
                                        <div className="flex flex-col items-center lg:items-end gap-4 min-w-[150px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 pl-0 lg:pl-6 w-full lg:w-auto">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">Total Amount</p>
                                                <p className="text-xl font-bold text-slate-900">₹{order.amount.toLocaleString()}</p>
                                            </div>

                                            <div className="flex gap-2 w-full lg:w-auto">
                                                {["PLACED", "PENDING_PAYMENT"].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancel(order._id)}
                                                        className="flex-1 lg:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleInvoice(order)}
                                                        className="flex-1 lg:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                                                    >
                                                        Invoice
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
