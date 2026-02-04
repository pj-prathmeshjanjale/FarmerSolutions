import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import CheckoutModal from "../../components/modals/CheckoutModal";
import { Search, Filter, ShoppingBag, Sprout, Layers, Droplets, X, ChevronRight } from "lucide-react";

export default function ProductMarketplace() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Lock body scroll when mobile filter is open
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileFilterOpen]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/products");
            setProducts(res.data.products);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuySuccess = () => {
        setSelectedProduct(null);
        setShowSuccess(true);
        setTimeout(() => {
            navigate("/my-orders");
        }, 2000);
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === "all" || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = [
        { id: "all", label: "All Products", icon: <Layers size={18} /> },
        { id: "seed", label: "Premium Seeds", icon: <Sprout size={18} /> },
        { id: "fertilizer", label: "Fertilizers", icon: <ShoppingBag size={18} /> },
        { id: "pesticide", label: "Pesticides", icon: <Droplets size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agri Marketplace</h1>
                                <p className="text-slate-500 text-xs mt-0.5 font-medium">Verified inputs for better yield.</p>
                            </div>
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg active:scale-95 transition-transform"
                            >
                                <Filter size={20} />
                            </button>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Desktop Sidebar Filters */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-slate-900">
                                <Filter size={18} />
                                <span className="font-bold text-sm uppercase tracking-wider">Filters</span>
                            </div>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilterCategory(cat.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${filterCategory === cat.id
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                                : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {cat.icon}
                                            {cat.label}
                                        </div>
                                        {filterCategory === cat.id && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Drawer (Overlay) */}
                    {isMobileFilterOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                                onClick={() => setIsMobileFilterOpen(false)}
                            ></div>

                            {/* Drawer */}
                            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl animate-slideInRight flex flex-col">
                                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="p-2 text-slate-500 hover:bg-white rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-5 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</p>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setFilterCategory(cat.id);
                                                    setIsMobileFilterOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${filterCategory === cat.id
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : "text-slate-600 border border-transparent hover:bg-slate-50"
                                                    }`}
                                            >
                                                <span className={filterCategory === cat.id ? "text-emerald-600" : "text-slate-400"}>
                                                    {cat.icon}
                                                </span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5 border-t border-slate-100 bg-slate-50">
                                    <button
                                        onClick={() => {
                                            setFilterCategory("all");
                                            setIsMobileFilterOpen(false);
                                        }}
                                        className="w-full py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse delay-75 border border-slate-100"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                                <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or search query.</p>
                                <button
                                    onClick={() => { setFilterCategory("all"); setSearchQuery(""); }}
                                    className="mt-6 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((p) => (
                                    <div
                                        key={p._id}
                                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                    >
                                        {/* Image Area */}
                                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                            <img
                                                src={p.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/90 backdrop-blur text-xs font-semibold text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm capitalize">
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500 mb-1">{p.brand}</p>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                        {p.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Attributes (Soil/Crops) */}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {p.suitableCrops?.[0] && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                        <Sprout size={12} /> {p.suitableCrops[0]}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</p>
                                                    <p className="text-xl font-bold text-slate-900">₹{p.price.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedProduct(p)}
                                                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-slate-200 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <CheckoutModal
                isOpen={!!selectedProduct}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onSuccess={handleBuySuccess}
            />

            {/* SUCCESS OVERLAY */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 transform animate-scaleIn">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
                        <p className="text-slate-500 mb-6">Your order has been successfully placed.</p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-progress"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-wider">Redirecting...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple Icon Component for Success Modal
const CheckCircleIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
