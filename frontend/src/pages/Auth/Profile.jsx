import { useState, useEffect } from "react";
import api from "../../api/axios";
import { getUser } from "../../utils/auth";
import { toast } from "react-hot-toast";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = getUser();
        if (storedUser) {
            setUser(storedUser);
            setFormData({ name: storedUser.name, email: storedUser.email });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.put("/auth/profile", formData);

            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.user };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                toast.success("Profile updated successfully");
                setIsEditing(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn">
            {/* Page Header */}
            <div className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your personal information and security preferences.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Sidebar / Identity */}
                <div className="md:col-span-1 space-y-6">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 mb-4 border border-slate-200">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mt-2 capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {user.role} Account
                        </span>
                        <p className="text-xs text-slate-400 mt-4">
                            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Security Status</h3>
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Account Secured
                        </div>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-8">
                            {/* Personal Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all ${isEditing
                                                ? "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                                                : "border-transparent bg-slate-50 text-slate-500"}`}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all ${isEditing
                                                ? "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                                                : "border-transparent bg-slate-50 text-slate-500"}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-end gap-3 animate-fadeIn">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ name: user.name, email: user.email });
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                                >
                                    {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
