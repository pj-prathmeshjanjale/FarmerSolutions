import { useNavigate } from "react-router-dom";

export default function MandiModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl p-6 text-center animate-fadeIn">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Smart Market</h2>
        <p className="text-slate-500 mb-6 text-sm">
          We've upgraded our mandi prices dashboard. Check out the new trends, AI advice, and community updates!
        </p>
        
        <button
          onClick={() => {
            onClose();
            navigate("/mandi");
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-medium mb-3 transition"
        >
          Go to Market Dashboard
        </button>
        
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
          Close
        </button>
      </div>
    </div>
  );
}
