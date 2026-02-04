import { useState, useEffect } from "react";
import WeatherModal from "../../components/modals/WeatherModal";
import MandiModal from "../../components/modals/MandiModal";
import ChatbotModal from "../../components/modals/ChatbotModal";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getUser } from "../../utils/auth";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showMandiModal, setShowMandiModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get("/orders/my");
      // Only keep top 3 recent orders
      setRecentOrders(res.data.orders.slice(0, 3));
    } catch (err) {
      console.error("Failed to fetch recent orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };



  const cardStyle = `
    cursor-pointer
    rounded-2xl
    bg-white/70 backdrop-blur-md
    border border-white/30
    shadow-lg shadow-black/5
    p-6
    transition-all duration-300
    hover:scale-[1.02]
    hover:shadow-xl
  `;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Farmer"}
        </h1>
        <p className="mt-2 text-slate-500 font-medium">
          Here's what's happening adjusting with your farm today.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Weather */}
        <div onClick={() => setShowWeatherModal(true)} className={cardStyle}>
          <div className="text-3xl">🌤</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Weather
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Tap to check weather
          </p>
        </div>

        {/* 2. Rent Equipment */}
        <div
          onClick={() => navigate("/equipment")}
          className={cardStyle}
        >
          <div className="text-3xl">🚜</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Rent Equipment
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Tractors, tools & more
          </p>
        </div>

        {/* 3. Marketplace */}
        <div
          onClick={() => navigate("/marketplace")}
          className={cardStyle}
        >
          <div className="text-3xl">🛒</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Marketplace
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Buy & sell products
          </p>
        </div>

        {/* 4. List Equipment */}
        <div
          onClick={() => navigate("/add-equipment")}
          className={cardStyle}
        >
          <div className="text-3xl">🏠</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            List Equipment
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Put your equipment on rent
          </p>
        </div>

        {/* 5. AI Assistant */}
        <div onClick={() => setShowChatbot(true)} className={cardStyle}>
          <div className="text-3xl">🤖</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            AI Assistant
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Ask farming questions
          </p>
        </div>

        {/* 6. Orders */}
        <div
          onClick={() => navigate("/my-orders")}
          className={cardStyle}
        >
          <div className="text-3xl">📦</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Orders
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Track your orders
          </p>
        </div>

        {/* 7. Mandi Prices */}
        <div onClick={() => setShowMandiModal(true)} className={cardStyle}>
          <div className="text-3xl">💰</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Mandi Prices
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            Tap to check mandi rates
          </p>
        </div>

        {/* 8. My Equipment (Remaining item) */}
        <div
          onClick={() => navigate("/my-equipment")}
          className={cardStyle}
        >
          <div className="text-3xl">🧾</div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            My Equipment
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            View & manage your listings
          </p>
        </div>
      </div>

      {/* RECENT ORDERS SECTION */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Purchases</h2>
          <button
            onClick={() => navigate("/my-orders")}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
          >
            View All →
          </button>
        </div>

        {loadingOrders ? (
          <div className="h-32 flex items-center justify-center bg-white/50 rounded-3xl border border-slate-100 animate-pulse text-xs font-bold text-slate-400 uppercase tracking-widest">
            Syncing order history...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No recent purchases found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate("/my-orders")}
                className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">📦</div>
                  <div>
                    <h4 className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                      {order.product?.name || order.equipment?.name || "Premium Item"}
                    </h4>

                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{order.amount}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${order.status === "DELIVERED" ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-600"
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <WeatherModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
      />

      <MandiModal
        isOpen={showMandiModal}
        onClose={() => setShowMandiModal(false)}
      />

      <ChatbotModal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />

    </div>
  );
}

