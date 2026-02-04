import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders/seller");
            setOrders(res.data.orders);
        } catch (err) {
            console.error("Failed to fetch seller orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const statusOptions = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-fadeIn">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incoming Orders</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage product fulfillment and logistics.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Revenue</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                        ₹{orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Loading orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-slate-400 font-bold">No product orders received yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Product / Buyer</th>
                                <th className="px-6 py-4 text-left">Quantity</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="bg-white group transition-transform hover:scale-[1.01]">
                                    <td className="px-6 py-6 rounded-l-[2rem] border-y border-l border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner uppercase font-black text-slate-400">
                                                {order.product?.name[0]}
                                            </div>
                                            <div>
                                                <div>
                                                    <p className="font-black text-slate-900 truncate max-w-[150px]">{order.product?.name}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                                                        Buyer: {order.farmer?.name} ({order.paymentMethod || "COD"})
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-2 leading-relaxed italic max-w-[200px]">
                                                        📍 {order.shippingAddress}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-y border-slate-50">
                                        <p className="font-black text-slate-900">{order.quantity}</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Units</p>
                                    </td>
                                    <td className="px-6 py-6 border-y border-slate-50">
                                        <p className="font-black text-slate-900">₹{order.amount}</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Total</p>
                                    </td>
                                    <td className="px-6 py-6 border-y border-slate-50">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${order.status === "DELIVERED" ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-600"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 rounded-r-[2rem] border-y border-r border-slate-50 text-right">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                disabled={updating === order._id || order.status === "DELIVERED"}
                                                onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                value={order.status}
                                                className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
