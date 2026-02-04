import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import FarmerDashboard from "./pages/Dashboard/FarmerDashboard";
import SellerDashboard from "./pages/Dashboard/SellerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import { isLoggedIn, getUser } from "./utils/auth";
import EquipmentList from "./pages/Equipment/EquipmentList";
import EquipmentDetails from "./pages/Equipment/EquipmentDetails";
import AddEquipment from "./pages/Equipment/AddEquipment";
import MyEquipment from "./pages/Equipment/MyEquipment";

import OwnerRequests from "./pages/Rental/OwnerRequests";
import MyRequests from "./pages/Rental/MyRequests";

import AddProduct from "./pages/Products/AddProduct";
import ProductMarketplace from "./pages/Products/ProductMarketplace";
import Profile from "./pages/Auth/Profile";
import MyOrders from "./pages/Orders/MyOrders";
import SellerOrders from "./pages/Orders/SellerOrders";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { initiateSocketConnection, disconnectSocket } from "./utils/socket";
import { useNotifications } from "./context/NotificationContext";
import Preloader from "./components/common/Preloader";

export default function App() {
  const user = getUser();
  const { incrementCount } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn() && user) {
      const socket = initiateSocketConnection(user.id || user._id);

      socket.on("incomingMessage", (data) => {
        // Show notification if it's not from me
        const currentUserId = user.id || user._id;
        const senderId = data.sender?._id || data.sender;

        if (senderId === currentUserId) return;

        // Increment global notification count
        incrementCount();

        toast((t) => (

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">New Message</span>
              <button onClick={() => toast.dismiss(t.id)} className="text-[10px] text-slate-400">✕</button>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              <span className="text-emerald-700">{data.sender?.name}</span>: {data.message}
            </p>
          </div>
        ), {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: '1.5rem',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #f1f5f9',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            padding: '1rem'
          }
        });
      });

      return () => disconnectSocket();
    }
  }, [isLoggedIn()]);

  return (
    <>
      {loading && <Preloader onFinish={() => setLoading(false)} />}

      {!loading && (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 animate-fadeIn">
          <Toaster />
          <Navbar />

          <main className="flex-1">
            <Routes>

              {/* Default Route */}
              <Route
                path="/"
                element={
                  isLoggedIn() ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Route */}
              <Route
                path="/dashboard"
                element={
                  isLoggedIn() ? (
                    (() => {
                      const user = getUser();
                      if (user?.role === "admin") return <AdminDashboard />;
                      if (user?.role === "seller") return <SellerDashboard />;
                      return <FarmerDashboard />;
                    })()
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/equipment"
                element={
                  isLoggedIn() ? (
                    <EquipmentList />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              <Route path="/add-equipment" element={<AddEquipment />} />

              <Route path="/my-equipment" element={<MyEquipment />} />
              <Route path="/owner-requests" element={<OwnerRequests />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/marketplace" element={<ProductMarketplace />} />
              <Route
                path="/profile"
                element={
                  isLoggedIn() ? <Profile /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/my-orders"
                element={
                  isLoggedIn() ? <MyOrders /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/seller/orders"
                element={
                  isLoggedIn() ? <SellerOrders /> : <Navigate to="/login" />
                }
              />

            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
}
