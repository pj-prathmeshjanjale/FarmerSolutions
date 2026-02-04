import { useRef, useEffect } from "react";
import { X } from "lucide-react"; // Assuming lucide-react is installed or use text 'X'

export default function DetailsModal({ isOpen, onClose, title, data, type }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {type === "product" ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {data.images && data.images.map((img, idx) => (
                                    <img key={idx} src={img?.startsWith("http") ? img : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${img}`} alt={`Product ${idx}`} className="w-full h-48 object-cover rounded-xl border border-slate-200" />
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                                    <p className="font-semibold text-slate-900 text-lg">{data.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand</label>
                                    <p className="font-medium text-slate-700">{data.brand}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</label>
                                    <p className="font-semibold text-emerald-600 text-lg">₹{data.price}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</label>
                                    <p className="font-medium text-slate-700">{data.stock} units</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suitable Crops</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {data.suitableCrops && data.suitableCrops.map((crop, i) => (
                                            <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-sm">{crop}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suitable Soil</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {data.suitableSoil && data.suitableSoil.map((soil, i) => (
                                            <span key={i} className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm">{soil}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="font-semibold text-slate-900 mb-2">Seller Details</h3>
                                <p className="text-sm text-slate-600">Name: <span className="font-medium">{data.seller?.name}</span></p>
                                <p className="text-sm text-slate-600">Email: <span className="font-medium">{data.seller?.email}</span></p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{data.businessName}</h3>
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-2 uppercase tracking-wide
                                    ${data.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        data.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {data.verificationStatus}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">License Number</label>
                                    <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-1">{data.licenseNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Owner Name</label>
                                    <p className="font-medium text-slate-900 mt-1">{data.user?.name}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                                    <p className="text-slate-600 mt-1">{data.address || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
                                    <p className="text-emerald-600 font-medium mt-1">{data.user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
