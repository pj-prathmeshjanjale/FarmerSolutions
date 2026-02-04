import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm font-medium">Enter your credentials to access your farm</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
            />
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          New to the platform?{" "}
          <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 transition">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
