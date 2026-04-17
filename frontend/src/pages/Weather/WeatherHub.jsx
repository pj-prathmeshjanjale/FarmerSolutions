import { useState, useEffect } from "react";
import { 
  Cloud, Droplets, Wind, Thermometer, AlertTriangle, BrainCircuit,
  MapPin, Eye, Activity, Info, RefreshCcw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Markdown from "react-markdown";
import { getWeatherDashboard } from "../../api/weatherApi";
import { getUser } from "../../utils/auth";
import toast from "react-hot-toast";

export default function WeatherIntelligence() {
  const user = getUser();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  // Load default city from user profile if available, else fallback
  useEffect(() => {
    const fetchInitial = async () => {
      const userObj = getUser();
      // Assume farmer profile location isn't neatly stored in local storage, start with generic or IP based later
      // Wait we can just fetch without a city to let backend try to guess, or provide a default
      const defaultCity = "Pune"; 
      setCity(defaultCity);
      await loadWeather(defaultCity);
    };
    fetchInitial();
  }, []);

  const loadWeather = async (targetCity) => {
    if (!targetCity) return;
    try {
      setLoading(true);
      const res = await getWeatherDashboard(targetCity);
      setWeatherData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load weather intelligence");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadWeather(city);
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-10">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Safe destructuring
  const current = weatherData?.current || {};
  const forecast = weatherData?.forecast || [];
  const insights = weatherData?.insights || {};
  const { rainAnalysis, alerts, aiSummary, soilMoistureEstimate } = insights;

  // Sanitize aiSummary for ReactMarkdown
  const sanitizedAdvice = typeof aiSummary === "string" ? aiSummary : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn min-h-screen">
      
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Cloud size={20} />
            <span className="font-semibold tracking-wider uppercase text-sm">Decision Support System</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Weather <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Intelligence</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} className="glass-panel rounded-2xl p-2 flex gap-2 shadow-sm border-slate-200 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter District or Village" 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {loading ? <RefreshCcw size={18} className="animate-spin" /> : "Analyze"}
          </button>
        </form>
      </div>

      {weatherData && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Raw Data & Charts) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="metric-card-premium p-5 rounded-2xl shadow-sm">
                  <div className="text-indigo-500 mb-2"><Thermometer size={20} /></div>
                  <p className="text-3xl font-black text-slate-800">{Math.round(current.temperature)}°C</p>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Temp</p>
                </div>
                <div className="metric-card-premium p-5 rounded-2xl shadow-sm">
                  <div className="text-blue-500 mb-2"><Droplets size={20} /></div>
                  <p className="text-3xl font-black text-slate-800">{current.humidity}%</p>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Humidity</p>
                </div>
                <div className="metric-card-premium p-5 rounded-2xl shadow-sm">
                  <div className="text-slate-500 mb-2"><Wind size={20} /></div>
                  <p className="text-3xl font-black text-slate-800">{Math.round(current.windSpeed)}</p>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Wind (km/h)</p>
                </div>
                <div className="metric-card-premium p-5 rounded-2xl shadow-sm">
                  <div className="text-indigo-400 mb-2"><Eye size={20} /></div>
                  <p className="text-3xl font-black text-slate-800">{current.visibility}</p>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Visibility</p>
                </div>
              </div>

              {/* Rain & Alerts Banner */}
              <div className="grid sm:grid-cols-2 gap-4">
                {rainAnalysis?.expected ? (
                  <div className="bg-blue-50/80 border border-blue-200 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                      <Droplets size={18} /> Rain Imminent
                    </div>
                    <p className="text-sm font-medium text-blue-900/80">
                      {rainAnalysis.intensity.charAt(0).toUpperCase() + rainAnalysis.intensity.slice(1)} intensity expected around {rainAnalysis.nextRainDate}.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                      <Droplets size={18} /> Dry Spell
                    </div>
                    <p className="text-sm font-medium text-amber-900/80">
                      No significant rain expected for the next 5 days.
                    </p>
                  </div>
                )}

                <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <Activity size={18} /> Soil Moisture Est.
                  </div>
                  <p className="text-sm font-medium text-emerald-900/80">
                    {soilMoistureEstimate || "Adequate moisture level detected based on humidity."}
                  </p>
                </div>
              </div>

              {/* Forecast Area Chart */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">5-Day Temperature Trend</h2>
                    <p className="text-sm text-slate-500 mt-1">Daily Highs and Lows (°C)</p>
                  </div>
                </div>
                
                <div className="h-[300px] w-full min-h-[300px]">
                  {forecast && forecast.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} 
                          tickMargin={12} axisLine={false} tickLine={false}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return d.toLocaleDateString(undefined, {weekday: 'short'});
                          }} 
                        />
                        <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                          labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'})}
                        />
                        <Area type="monotone" name="High" dataKey="maxTemp" stroke="#4f46e5" strokeWidth={3} fill="url(#colorMax)" />
                        <Area type="monotone" name="Low" dataKey="minTemp" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorMin)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">Forecast unavailable</div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (AI & Alerts) */}
            <div className="space-y-6">
              
              {/* Critical Alerts */}
              {alerts && alerts.length > 0 && (
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertTriangle size={80} className="text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900 text-lg mb-4 flex items-center gap-2 relative z-10">
                    <AlertTriangle size={20} className="text-red-600" /> Weather Alerts
                  </h3>
                  <div className="space-y-3 relative z-10">
                    {alerts.map((al, i) => (
                      <div key={i} className="bg-white/80 p-3 rounded-xl text-sm font-medium text-red-800 shadow-sm border border-red-100">
                        <span className="uppercase text-[10px] tracking-widest font-black text-red-500 block mb-1">{al.type} WARNING</span>
                        {al.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Strategic Advisory */}
              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-indigo-900/10 flex flex-col h-[500px] lg:h-[600px] border border-slate-800">
                <div className="p-6 bg-gradient-to-r from-indigo-900/60 to-slate-900 border-b border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">AI Agronomist</h2>
                    <p className="text-xs text-indigo-200/60 font-medium">Strategic Action Plan</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 ai-advice-container text-sm leading-relaxed overflow-y-auto custom-scrollbar">
                  {sanitizedAdvice ? (
                    <>
                      <div className="animate-fadeIn text-slate-300">
                        <Markdown>
                          {sanitizedAdvice}
                        </Markdown>
                      </div>
                      <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit size={12} /> Personalized for your {user?.role || 'Farmer'} Profile
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-indigo-400 animate-spin mb-4"></div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Synthesizing Strategy...</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
