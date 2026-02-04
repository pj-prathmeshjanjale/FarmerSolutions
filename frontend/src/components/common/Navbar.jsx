import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUser, logout } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    const baseLinks = [
      { label: "Marketplace", path: "/marketplace", icon: "🛒" },
      { label: "Rent Equipment", path: "/equipment", icon: "🚜" },
    ];

    if (!user) return baseLinks;

    const authLinks = [
      ...baseLinks,
      { label: "My Orders", path: "/my-orders", icon: "📋" },
    ];

    if (user.role === "seller") {
      authLinks.push({ label: "Track Orders", path: "/seller/orders", icon: "📦" });
    }

    // Both Farmers and Sellers can rent out their own equipment
    authLinks.push({ label: "Incoming Rentals", path: "/owner-requests", icon: "📥" });
    // Both can rent other people's equipment
    authLinks.push({ label: "My Rentals", path: "/my-requests", icon: "🚜" });

    return authLinks;
  };

  const navLinks = getNavLinks();

  const NavItem = ({ link, onClick }) => (
    <Link
      to={link.path}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition group
        ${location.pathname === link.path
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{link.icon}</span>
        <span className="uppercase tracking-tighter">{link.label}</span>
      </div>

      {link.label === "Incoming Rentals" && unreadCount.owner > 0 && (
        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-200 animate-pulse">
          {unreadCount.owner > 9 ? "9+" : unreadCount.owner}
        </span>
      )}

      {link.label === "My Rentals" && unreadCount.renter > 0 && (
        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-200 animate-pulse">
          {unreadCount.renter > 9 ? "9+" : unreadCount.renter}
        </span>
      )}
    </Link>
  );


  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">

        {/* Left Side: Hamburger & Brand */}
        <div className="flex items-center gap-4">
          {loggedIn && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600"
              aria-label="Toggle Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-center group">
                <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`h-0.5 w-full bg-current rounded-full transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          )}

          <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-emerald-700 leading-none tracking-tight">
                Farmers
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">One Stop Solution</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth/Profile */}
        <div className="flex items-center gap-4">
          {!loggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">LOGIN</Link>
              <Link to="/register" className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">GET STARTED</Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pr-3 bg-slate-50 border border-slate-200 rounded-full hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-bold leading-none uppercase">{user?.role}</p>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                </div>
                <span className={`text-[10px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Authenticated Account</p>
                    <h4 className="font-bold text-slate-900">{user?.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigate("/profile"); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition">
                      👤 My Details
                    </button>
                    <button onClick={() => { navigate("/dashboard"); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition mt-1">
                      🚀 My Dashboard
                    </button>
                    <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition mt-1">
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger Menu Drawer */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn p-4">
              <div className="space-y-2">
                <button
                  onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition
                    ${location.pathname === "/dashboard" ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="text-xl">🏠</span>
                  <span className="uppercase tracking-tighter">HOME</span>
                </button>
                <div className="h-px bg-slate-100 my-2" />
                {navLinks.map((link) => (
                  <NavItem
                    key={link.path}
                    link={link}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
