import { useState } from "react";
import api from "../api/axios";

export default function BankConnectCard({ user, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: ""
    });

    const isConnected = !!user?.razorpayAccountId;

    const handleConnect = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const res = await api.post("/payments/onboard", formData);

            if (res.data.success) {
                const updatedUser = { ...user, razorpayAccountId: res.data.accountId };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                onUpdate(updatedUser);
                setShowModal(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to connect account");
        } finally {
            setLoading(false);
        }
    };

    if (isConnected) {
        return (
            <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">🏦</div>
                <h3 className="text-lg font-bold">Payouts Active</h3>
                <p className="text-emerald-100 text-sm mt-1">Your bank account is connected.</p>
                <div className="mt-4 bg-emerald-700/50 p-3 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Account ID</p>
                    <p className="font-mono text-sm">{user.razorpayAccountId}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💸</div>
                <h3 className="text-lg font-bold">Start Accepting Payments</h3>
                <p className="text-slate-400 text-sm mt-1">Connect your bank to receive payouts directly.</p>
                <button
                    onClick={() => { setShowModal(true); setError(""); }}
                    className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition shadow-lg"
                >
                    Connect Bank Account
                </button>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
                        <h2 className="text-2xl font-black text-slate-900">Setup Payouts</h2>
                        <p className="text-slate-500 text-sm mt-1 mb-6">Enter details to link your account via Razorpay.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleConnect} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Legal Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                                <input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {loading ? "Connecting..." : "Connect"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
