import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      window.location.href = "/login";

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="
        w-full max-w-md
        rounded-3xl
        bg-white
        border border-slate-100
        shadow-xl shadow-slate-200/50
        p-10
        animate-fadeIn
      ">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm font-medium">Join the future of agriculture today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
          />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">I am a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={`py-3 rounded-xl text-sm font-bold border transition duration-200 ${role === "farmer" ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-3 rounded-xl text-sm font-bold border transition duration-200 ${role === "seller" ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              >
                Seller
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl
              bg-slate-900
              py-4
              font-bold text-white
              shadow-xl shadow-slate-900/20
              hover:bg-slate-800 hover:scale-[1.01]
              active:scale-[0.99]
              transition-all duration-200
            "
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
