import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import BankConnectCard from "../../components/BankConnectCard";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchSellerData();
    }, []);

    const fetchSellerData = async () => {
        try {
            setLoading(true);
            const [profileRes, productsRes, ordersRes] = await Promise.all([
                api.get("/seller/profile"),
                api.get("/products/my"),
                api.get("/orders/seller")
            ]);
            setProfile(profileRes.data.profile);
            setProducts(productsRes.data.products);
            setOrders(ordersRes.data.orders);
        } catch (error) {
            console.error("Error fetching seller data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const stats = [
        {
            label: "Total Revenue",
            value: `₹${orders.reduce((s, o) => s + o.amount, 0).toLocaleString()}`,
            icon: TrendingUp,
            trend: "+12.5%",
            color: "text-emerald-600"
        },
        {
            label: "Active Orders",
            value: orders.filter(o => o.status === "PLACED").length,
            icon: ShoppingCart,
            color: "text-blue-600"
        },
        {
            label: "Total Products",
            value: products.length,
            icon: Package,
            color: "text-purple-600"
        },
        {
            label: "Inventory Units",
            value: products.reduce((s, p) => s + p.stock, 0),
            icon: LayoutDashboard,
            color: "text-slate-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">{profile?.businessName || "Seller Dashboard"}</h1>
                            {profile?.verificationStatus === "approved" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <CheckCircle2 size={12} />
                                    Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                    <AlertCircle size={12} />
                                    Pending Verification
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 mt-2 text-sm">Manage your products, track orders, and view sales performance.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/seller/orders")}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            Orders
                        </button>
                        <button
                            onClick={() => navigate("/add-product")}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                {stat.trend && (
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Products Table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900">Inventory</h3>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <Search size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </div>

                            {products.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Package size={24} />
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900">No products listed</h4>
                                    <p className="text-sm text-slate-500 mt-1 mb-4">Get started by adding your first product.</p>
                                    <button
                                        onClick={() => navigate("/add-product")}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                    >
                                        Add Product →
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider bg-slate-50/50">
                                                <th className="px-6 py-3 font-medium">Product</th>
                                                <th className="px-6 py-3 font-medium">Price</th>
                                                <th className="px-6 py-3 font-medium">Stock</th>
                                                <th className="px-6 py-3 font-medium">Status</th>
                                                <th className="px-6 py-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {products.map((product) => (
                                                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                                                                {product.images?.[0] ? (
                                                                    <img src={product.images[0]?.startsWith("http") ? product.images[0] : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${product.images[0]}`} className="w-full h-full object-cover rounded-lg" alt="" />
                                                                ) : product.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{product.name}</p>
                                                                <p className="text-xs text-slate-500">{product.brand}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">₹{product.price}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600"
                                                            }`}>
                                                            {product.stock} units
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {product.status === 'approved' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                Live
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                Review
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Bank Connect */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4">Financials</h3>
                            <BankConnectCard
                                user={profile}
                                onUpdate={(updatedUser) => setProfile({ ...profile, ...updatedUser })}
                            />
                        </div>

                        {/* Recent Activity / Simplified Orders */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Recent Orders</h3>
                                <button onClick={() => navigate("/seller/orders")} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View All</button>
                            </div>

                            <div className="space-y-4">
                                {orders.slice(0, 4).map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                                                {order.product?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{order.product?.name}</p>
                                                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">₹{order.amount}</p>
                                            <span className={`text-[10px] font-medium capitalize ${order.status === "DELIVERED" ? "text-slate-500" : "text-emerald-600"
                                                }`}>
                                                {order.status.toLowerCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <p className="text-sm text-slate-400 italic text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

