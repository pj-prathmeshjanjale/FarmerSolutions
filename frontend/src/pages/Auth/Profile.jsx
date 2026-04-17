import { useState, useEffect } from "react";
import api from "../../api/axios";
import { getUser } from "../../utils/auth";
import { toast } from "react-hot-toast";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form Data States
    const [authData, setAuthData] = useState({ name: "", email: "" });
    const [farmerData, setFarmerData] = useState({
        phone: "", village: "", taluka: "", district: "", state: "", pincode: "",
        soilType: "", irrigationType: "", budgetRange: "", farmingExperience: "", farmSize: "",
        waterSource: "", soilPH: "", lastCropSeason: ""
    });

    useEffect(() => {
        const storedUser = getUser();
        if (storedUser) {
            setUser(storedUser);
            setAuthData({ name: storedUser.name, email: storedUser.email });
            if (storedUser.role === 'farmer') {
                fetchFarmerProfile();
            }
        }
    }, []);

    const fetchFarmerProfile = async () => {
        try {
            const res = await api.get("/farmer/profile");
            if (res.data.success && res.data.profile) {
                setFarmerData(prev => ({ ...prev, ...res.data.profile }));
            }
        } catch (err) {
            console.error("No farmer profile found or error fetching.");
        }
    };

    const handleAuthChange = (e) => setAuthData({ ...authData, [e.target.name]: e.target.value });
    const handleFarmerChange = (e) => setFarmerData({ ...farmerData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // 1. Update Base Auth User
            const resAuth = await api.put("/auth/profile", authData);
            if (resAuth.data.success) {
                const updatedUser = { ...user, ...resAuth.data.user };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            // 2. Update Farmer Metrics if role matches
            if (user.role === 'farmer') {
                // formatting nums
                const payload = {
                  ...farmerData,
                  farmingExperience: farmerData.farmingExperience ? Number(farmerData.farmingExperience) : 0,
                  farmSize: farmerData.farmSize ? Number(farmerData.farmSize) : 0,
                  soilPH: farmerData.soilPH ? Number(farmerData.soilPH) : undefined,
                };
                // Clean empty string enums
                if(!payload.soilType) delete payload.soilType;
                if(!payload.irrigationType) delete payload.irrigationType;
                if(!payload.budgetRange) delete payload.budgetRange;
                if(!payload.waterSource) delete payload.waterSource;
                if(!payload.lastCropSeason) delete payload.lastCropSeason;

                await api.post("/farmer/profile", payload);
            }

            toast.success("Profile fully updated!");
            setIsEditing(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Operation failed";
            toast.error(msg);
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
            {/* Header */}
            <div className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your identity and operational metrics.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Wizard Sidebar */}
                <div className="md:col-span-1 space-y-2 relative">
                    <button 
                       onClick={() => setStep(1)} 
                       className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        1. Identity Details
                    </button>
                    {user.role === 'farmer' && (
                        <button 
                          onClick={() => setStep(2)} 
                          className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 2 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                           2. Agricultural Specs
                        </button>
                    )}
                </div>

                {/* Form Logic */}
                <div className="md:col-span-3">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        
                        {/* Step 1: Base Auth & Contact */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Identity Details</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                        <input type="text" name="name" value={authData.name} onChange={handleAuthChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                        <input type="email" name="email" value={authData.email} onChange={handleAuthChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                    </div>
                                    
                                    {/* Farmer Contact Fields */}
                                    {user.role === 'farmer' && (
                                     <>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Structure</label>
                                            <input type="text" name="phone" placeholder="+91 XXXXX XXXXX" value={farmerData.phone} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">District / Region</label>
                                            <input type="text" name="district" placeholder="e.g. Pune" value={farmerData.district} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                                            <input type="text" name="state" placeholder="e.g. Maharashtra" value={farmerData.state} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                        </div>
                                     </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Agricultural Engine Context */}
                        {step === 2 && user.role === 'farmer' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Farming Specifications <span className="ml-2 text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">AI Synchronized</span></h3>
                                <p className="text-sm text-slate-500 mb-8">This data directly powers your personalized AI dashboard recommendations.</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1 border rounded-lg p-1 bg-slate-50">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 px-3 pt-2">Soil Type</label>
                                        <select name="soilType" value={farmerData.soilType} onChange={handleFarmerChange} disabled={!isEditing} className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 outline-none">
                                            <option value="">Select Soil...</option>
                                            <option value="black">Black Soil (Regur)</option>
                                            <option value="red">Red Soil</option>
                                            <option value="alluvial">Alluvial</option>
                                            <option value="sandy">Sandy / Arid</option>
                                            <option value="clay">Clay</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 border rounded-lg p-1 bg-slate-50">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 px-3 pt-2">Irrigation</label>
                                        <select name="irrigationType" value={farmerData.irrigationType} onChange={handleFarmerChange} disabled={!isEditing} className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 outline-none">
                                            <option value="">Select Irrigation...</option>
                                            <option value="drip">Drip Irrigation</option>
                                            <option value="sprinkler">Sprinklers</option>
                                            <option value="canal">Canal System</option>
                                            <option value="rainfed">Rainfed (Monsoon)</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1 border rounded-lg p-1 bg-slate-50">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 px-3 pt-2">Water Source</label>
                                        <select name="waterSource" value={farmerData.waterSource} onChange={handleFarmerChange} disabled={!isEditing} className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 outline-none">
                                            <option value="">Select Water Source...</option>
                                            <option value="borewell">Borewell</option>
                                            <option value="canal">Canal</option>
                                            <option value="rainfed">Rainfed</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 border rounded-lg p-1 bg-slate-50">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 px-3 pt-2">Last Crop Season</label>
                                        <select name="lastCropSeason" value={farmerData.lastCropSeason} onChange={handleFarmerChange} disabled={!isEditing} className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 outline-none">
                                            <option value="">Select Season...</option>
                                            <option value="kharif">Kharif (Monsoon)</option>
                                            <option value="rabi">Rabi (Winter)</option>
                                            <option value="zaid">Zaid (Summer)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 border rounded-lg p-1 bg-slate-50">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 px-3 pt-2">Budget Range</label>
                                        <select name="budgetRange" value={farmerData.budgetRange} onChange={handleFarmerChange} disabled={!isEditing} className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 outline-none">
                                            <option value="">Select Budget...</option>
                                            <option value="low">Low (Economy)</option>
                                            <option value="medium">Medium (Standard)</option>
                                            <option value="high">High (Premium)</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Soil PH (0-14)</label>
                                        <input type="number" min="0" max="14" step="0.1" name="soilPH" placeholder="7.0" value={farmerData.soilPH} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Farm Size (Acres)</label>
                                        <input type="number" min="0" name="farmSize" placeholder="10" value={farmerData.farmSize} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
                                        <input type="number" min="0" name="farmingExperience" placeholder="5" value={farmerData.farmingExperience} onChange={handleFarmerChange} readOnly={!isEditing} className={`w-full px-4 py-3 rounded-lg border ${isEditing ? "border-slate-300 focus:border-slate-500 bg-white" : "border-transparent bg-slate-50 text-slate-500"}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Controls */}
                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-sm font-bold text-slate-400">Step {step} of {user.role === 'farmer' ? 2 : 1}</div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm">
                                        {loading ? "Syncing..." : "Save Configuration"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
