import { useState, useEffect } from "react";
import { 
  getMandiPrices, 
  getMandiTrends, 
  getBestMandi, 
  getAIRecommendation, 
  getSystemStatus,
  submitCommunityPrice,
  getCommunityPrices,
  deleteCommunityPrice
} from "../../api/mandiApi";
import ReactMarkdown from "react-markdown";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import toast from "react-hot-toast";
import { 
  TrendingUp, 
  MapPin, 
  Search, 
  Bot, 
  Sparkles, 
  MessageSquare,
  Activity,
  Clock,
  ArrowUpRight,
  Trash2
} from "lucide-react";

export default function MandiMarket() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [crop, setCrop] = useState("soyabean");
  const [stateName, setStateName] = useState("maharashtra");
  const [mandiFilter, setMandiFilter] = useState("");
  
  const [prices, setPrices] = useState([]);
  const [communityPricesList, setCommunityPricesList] = useState([]);
  const [trends, setTrends] = useState([]);
  const [bestMandi, setBestMandi] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [sysStatus, setSysStatus] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form states for community pricing
  const [commPrice, setCommPrice] = useState("");
  const [commLocation, setCommLocation] = useState("");
  
  useEffect(() => {
    fetchSystemStatus();
    fetchData();
    // eslint-disable-next-line
  }, [crop, stateName, mandiFilter]);

  const fetchSystemStatus = async () => {
    try {
      const res = await getSystemStatus();
      setSysStatus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await getMandiPrices({ crop, state: stateName, mandi: mandiFilter, limit: 10 });
      setPrices(pRes.data?.data || []);

      const cRes = await getCommunityPrices({ crop, state: stateName, location: mandiFilter, limit: 5 });
      setCommunityPricesList(cRes.data?.data || []);

      const tRes = await getMandiTrends(crop, stateName, 7);
      setTrends(tRes.data?.trends || []);

      const bRes = await getBestMandi(crop, stateName);
      if (bRes.data?.success) {
        setBestMandi(bRes.data.data);
      } else {
        setBestMandi(null);
      }
      
      setAiAdvice(""); // reset AI advice on new crop
    } catch (err) {
      toast.error("Failed to load market data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAiAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await getAIRecommendation(crop, stateName);
      if (res.data?.success) {
        setAiAdvice(res.data.recommendation);
      } else {
        toast.error("AI is unavailable.");
      }
    } catch (err) {
      toast.error("AI recommendation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommunitySubmit = async (e) => {
    e.preventDefault();
    if (!commPrice || !commLocation) return toast.error("Price and Location required");

    try {
      await submitCommunityPrice({ crop, state: stateName, location: commLocation, price: Number(commPrice) });
      toast.success("Price submitted! Helps the community.");
      setCommPrice("");
      setCommLocation("");
      fetchData(); // refresh list
    } catch (err) {
      toast.error("Failed to submit price.");
    }
  };

  const handleDeleteCommunityPrice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this price entry?")) return;
    try {
      await deleteCommunityPrice(id);
      toast.success("Price entry deleted.");
      fetchData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete price.");
    }
  };

  // Calculate summary metrics
  const currentAvg = trends.length > 0 ? trends[trends.length - 1]?.avgModalPrice : 0;
  const prevAvg = trends.length > 1 ? trends[trends.length - 2]?.avgModalPrice : currentAvg;
  const trendDelta = currentAvg - prevAvg;
  const trendPercent = prevAvg ? ((trendDelta / prevAvg) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn min-h-screen">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Activity size={20} />
            <span className="font-semibold tracking-wider uppercase text-sm">Market Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Commodity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Insights</span>
          </h1>
          {sysStatus && (
            <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
              <Clock size={12} className="text-slate-400" />
              Live Feed Updated: {sysStatus.lastUpdated ? new Date(sysStatus.lastUpdated).toLocaleTimeString() : "N/A"}
            </div>
          )}
        </div>

        {/* Market Selector Bar */}
        <div className="glass-panel rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-sm border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={crop} 
              onChange={(e) => setCrop(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-3 rounded-xl bg-white/80 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="soyabean">Soyabean</option>
              <option value="paddy">Paddy / Rice</option>
              <option value="wheat">Wheat</option>
              <option value="cotton">Cotton</option>
              <option value="groundnut">Groundnut</option>
              <option value="mustard">Mustard</option>
              <option value="maize">Maize (Corn)</option>
              <option value="onion">Onion</option>
              <option value="potato">Potato</option>
              <option value="tomato">Tomato</option>
              <option value="tur">Tur (Arhar)</option>
              <option value="urad">Urad</option>
              <option value="moong">Moong</option>
              <option value="gram">Gram (Chana)</option>
              <option value="bajra">Bajra</option>
              <option value="jowar">Jowar</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={stateName} 
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g., maharashtra" 
              className="w-full sm:w-48 pl-10 pr-4 py-3 rounded-xl bg-white/80 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={mandiFilter} 
              onChange={(e) => setMandiFilter(e.target.value)}
              placeholder="Taluka (Opt.)" 
              className="w-full sm:w-36 pl-10 pr-4 py-3 rounded-xl bg-white/80 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
            />
          </div>
          <button 
            onClick={fetchData}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
          >
            Analyze
          </button>
        </div>
      </div>

      {/* Market Pulse Summary Row */}
      {!loading && bestMandi && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">State Avg Price</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{currentAvg || '--'}</h3>
            </div>
            <div className={`flex items-center gap-1 font-bold ${trendDelta >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'} px-3 py-1.5 rounded-lg`}>
              {trendDelta >= 0 ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
              {Math.abs(trendPercent)}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Peak Price Recorded</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{bestMandi.maxPrice}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="bg-gradient-premium p-6 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col justify-center text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mt-10 -mr-10 transition-transform group-hover:scale-150"></div>
            <p className="text-emerald-400 font-medium text-xs mb-1 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Top Recommended Market
            </p>
            <h3 className="text-2xl font-bold capitalize truncate pr-8">{bestMandi.mandi}</h3>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-slate-100">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Aggregating market intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Visualizations Column */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Chart Area */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Price Volatility Index</h2>
                  <p className="text-sm text-slate-500 mt-1">7-day modal price movement across major markets</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Avg Price</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-200"></span> Price Range</div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} tickMargin={12} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b', marginBottom: '8px' }}
                      />
                      <Area type="monotone" dataKey="maxPrice" stroke="#cbd5e1" strokeDasharray="5 5" fill="#f8fafc" fillOpacity={1} />
                      <Area type="monotone" dataKey="minPrice" stroke="#e2e8f0" strokeDasharray="5 5" fill="#ffffff" fillOpacity={1} />
                      <Area type="monotone" dataKey="avgModalPrice" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-medium">No trend data available for this selection</div>
                )}
              </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Market Activity Log</h2>
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4">Market Location</th>
                      <th className="pb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trading Range (₹)</th>
                      <th className="pb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modal Price</th>
                      <th className="pb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {prices.length > 0 ? prices.map((p, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors group">
                        <td className="py-4 pl-4 font-bold capitalize text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          {p.mandi}
                        </td>
                        <td className="py-4 text-sm font-medium text-slate-500">{p.minPrice} - {p.maxPrice}</td>
                        <td className="py-4 font-black text-slate-900 text-base">₹{p.modalPrice}</td>
                        <td className="py-4 text-sm text-slate-400 font-medium">{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    )) : <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No recent rates found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>

          {/* Side Column: AI & Community */}
          <div className="space-y-8">
            
            {/* AI Concierge Component */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-indigo-900/10 flex flex-col h-[500px]">
              <div className="p-6 bg-gradient-to-r from-indigo-900/40 to-slate-900 border-b border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Bot size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">AI Concierge <Sparkles size={14} className="text-indigo-400" /></h2>
                  <p className="text-xs text-indigo-200/60 font-medium">Predictive Market Analysis</p>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                {!aiAdvice ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4 ring-4 ring-slate-800/50">
                      <Activity size={28} />
                    </div>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-xs">
                      Generate a personalized, data-driven report on whether to liquidate your {crop} holdings or hold for better margins.
                    </p>
                    <button 
                      onClick={handleGetAiAdvice}
                      disabled={aiLoading}
                      className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
                         <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                      ) : (
                        <><Sparkles size={18} /> Generate Report</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel-dark p-5 rounded-2xl ai-advice-container animate-fadeIn">
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
              
              {aiAdvice && (
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                  <button 
                    onClick={() => setAiAdvice("")} 
                    className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    Clear Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Community Feed */}
            <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <MessageSquare size={100} className="text-emerald-600" />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-emerald-900 mb-2">Crowdsourced Data</h2>
                <p className="text-sm text-emerald-700/70 font-medium mb-6">Real prices verified by the farmer network</p>
                
                {communityPricesList.length > 0 ? (
                  <ul className="space-y-4 mb-6">
                    {communityPricesList.map((cp, i) => (
                      <li key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-emerald-50">
                        <div>
                          <p className="font-bold text-slate-800 capitalize">{cp.location}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            {cp.userId?.name || 'Farmer'} 
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              Trust {cp.trustScore}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-black text-lg text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">₹{cp.price}</div>
                          {currentUser && cp.userId?._id === currentUser.id && (
                            <button 
                              onClick={() => handleDeleteCommunityPrice(cp._id)}
                              className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-emerald-700/50 text-sm font-medium mb-6 p-4 bg-emerald-100/30 rounded-2xl text-center">No community reports for this selection.</p>}

                <form onSubmit={handleCommunitySubmit} className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-100 flex gap-2">
                  <input type="text" placeholder="Village" value={commLocation} onChange={e => setCommLocation(e.target.value)} className="w-[45%] px-3 py-2.5 rounded-xl text-sm font-medium border-none focus:ring-0 bg-transparent text-slate-700 placeholder-slate-400 outline-none" required />
                  <div className="w-[1px] bg-emerald-100 my-2"></div>
                  <input type="number" placeholder="₹" value={commPrice} onChange={e => setCommPrice(e.target.value)} className="w-[30%] px-3 py-2.5 rounded-xl text-sm font-bold border-none focus:ring-0 bg-transparent text-emerald-700 placeholder-emerald-300 outline-none" required />
                  <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20">Add</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
