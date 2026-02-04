import { useState } from "react";
import api from "../../api/axios";
import { getUser } from "../../utils/auth";
import { X, MapPin, CreditCard, Banknote, ShieldCheck, ChevronRight, Minus, Plus, ShoppingBag, Lock } from "lucide-react";

export default function CheckoutModal({ product, isOpen, onClose, onSuccess }) {
    const user = getUser();
    const [quantity, setQuantity] = useState(1);
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !product) return null;

    const totalAmount = quantity * product.price;

    const handleOnlinePayment = async (order) => {
        try {
            const { data } = await api.post("/payments/create", { orderId: order._id });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY",
                amount: data.razorpayOrder.amount,
                currency: data.razorpayOrder.currency,
                name: "Farm-Solutions",
                description: `Payment for ${product.name}`,
                order_id: data.razorpayOrder.id,
                handler: async (response) => {
                    try {
                        setLoading(true);
                        const verifyRes = await api.post("/payments/verify", {
                            ...response,
                            paymentId: data.paymentId
                        });
                        if (verifyRes.data.success) {
                            onSuccess(order);
                        }
                    } catch (err) {
                        setError("Payment verification failed. Please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#059669",
                },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError("Failed to initialize online payment.");
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!shippingAddress.trim()) {
            setError("Please enter a valid shipping address.");
            return;
        }
        if (quantity > product.stock) {
            setError("Requested quantity exceeds available stock.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await api.post("/orders", {
                productId: product._id,
                quantity,
                paymentMethod,
                shippingAddress
            });

            if (res.data.success) {
                if (paymentMethod === "ONLINE") {
                    await handleOnlinePayment(res.data.order);
                } else {
                    onSuccess(res.data.order);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[95vh] h-[95vh] sm:h-auto overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-bold text-slate-900">Checkout</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                    {/* LEFT: Order Summary (Sticky on Desktop) */}
                    <div className="md:w-5/12 bg-slate-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 flex-shrink-0">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                    <ShoppingBag size={24} className="text-slate-300" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{product.name}</h3>
                                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{product.brand}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{(product.price * quantity).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Shipping</span>
                                <span className="text-emerald-600 font-medium tracking-wide text-xs bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-4 border-t border-slate-200 mt-2">
                                <span>Total To Pay</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Form Details */}
                    <div className="md:w-7/12 p-6 md:p-8 bg-white">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 flex-shrink-0" size={16} />
                                <div>
                                    <p className="font-bold">Order Error</p>
                                    <p className="text-xs mt-1 opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Address Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Shipping Address</label>
                                <div className="relative">
                                    <MapPin className="absolute top-3.5 left-3.5 text-slate-400" size={18} />
                                    <textarea
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Full Name, House No, Area, City, Pincode"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-900 outline-none transition-all resize-none min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className={`
                                        relative group cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all duration-200
                                        ${paymentMethod === "COD" ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"}
                                    `}>
                                        <input
                                            type="radio" name="payment" value="COD"
                                            checked={paymentMethod === "COD"}
                                            onChange={() => setPaymentMethod("COD")}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors ${paymentMethod === "COD" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                                            <Banknote size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block font-bold text-sm text-slate-900">Cash on Delivery</span>
                                            <span className="text-[10px] font-medium text-slate-500">Pay at doorstep</span>
                                        </div>
                                        {paymentMethod === "COD" && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                                    </label>

                                    <label className={`
                                        relative group cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all duration-200
                                        ${paymentMethod === "ONLINE" ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-200"}
                                    `}>
                                        <input
                                            type="radio" name="payment" value="ONLINE"
                                            checked={paymentMethod === "ONLINE"}
                                            onChange={() => setPaymentMethod("ONLINE")}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors ${paymentMethod === "ONLINE" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-400"}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block font-bold text-sm text-slate-900">Pay Online</span>
                                            <span className="text-[10px] font-medium text-slate-500">Fast & Secure</span>
                                        </div>
                                        {paymentMethod === "ONLINE" && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Secure Badge & Payment Icons */}
                        <div className="mt-8">
                            <div className="flex items-center justify-center gap-3 opacity-50 mb-3 grayscale">
                                {/* Pseudocode for payment logos using text/borders for now as we only have Lucide */}
                                <div className="h-6 px-2 border border-slate-300 rounded flex items-center text-[10px] font-bold text-slate-600">VISA</div>
                                <div className="h-6 px-2 border border-slate-300 rounded flex items-center text-[10px] font-bold text-slate-600">MasterCard</div>
                                <div className="h-6 px-2 border border-slate-300 rounded flex items-center text-[10px] font-bold text-slate-600">UPI</div>
                                <div className="h-6 px-2 border border-slate-300 rounded flex items-center text-[10px] font-bold text-slate-600">RuPay</div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium justify-center">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span>Payments are SSL Encrypted & Verified for your security</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Sticky Bottom) */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white z-10">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] relative overflow-hidden group"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="absolute left-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <Lock size={18} className="relative z-10" />
                                <span className="relative z-10">Pay ₹{totalAmount.toLocaleString()}</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                        By placing this order, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
