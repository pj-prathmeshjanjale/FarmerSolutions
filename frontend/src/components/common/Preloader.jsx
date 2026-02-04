import React, { useEffect, useState } from "react";

const Preloader = ({ onFinish }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onFinish, 800); // Wait for exit animation
        }, 2500); // Run for 2.5 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F0FDF4] transition-all duration-700 ${exiting ? "opacity-0 translate-y-[-100%]" : "opacity-100"
                }`}
        >
            <div className="relative w-64 h-40">
                {/* Tractor SVG Animation */}
                <div className="absolute inset-0 animate-bounce-slight">
                    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl">
                        {/* Body */}
                        <path
                            d="M40,90 L40,60 L90,60 L90,90 Z"
                            fill="#10B981"
                            stroke="#065F46"
                            strokeWidth="2"
                        />
                        <path
                            d="M90,60 L130,60 L150,90 L90,90 Z"
                            fill="#10B981"
                            stroke="#065F46"
                            strokeWidth="2"
                        />
                        {/* Cabin */}
                        <path
                            d="M50,60 L50,30 L100,30 L100,60 Z"
                            fill="rgba(255,255,255,0.5)"
                            stroke="#065F46"
                            strokeWidth="2"
                        />
                        <path d="M55,30 L55,60" stroke="#065F46" strokeWidth="1" />
            /* Roof */
                        <path
                            d="M45,30 L105,30"
                            stroke="#047857"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        {/* Exhaust */}
                        <path
                            d="M120,60 L120,40"
                            stroke="#374151"
                            strokeWidth="4"
                            className="animate-pulse"
                        />
                        <circle cx="120" cy="35" r="3" fill="#6B7280" className="animate-ping" />

                        {/* Big Wheel */}
                        <g className="animate-spin-slow" style={{ transformOrigin: "65px 110px" }}>
                            <circle cx="65" cy="110" r="25" fill="#1F2937" stroke="#000" strokeWidth="2" />
                            <circle cx="65" cy="110" r="10" fill="#F59E0B" />
                            <path d="M65,85 L65,135 M40,110 L90,110" stroke="#4B5563" strokeWidth="2" />
                        </g>

                        {/* Small Wheel */}
                        <g className="animate-spin-fast" style={{ transformOrigin: "140px 110px" }}>
                            <circle cx="140" cy="110" r="15" fill="#1F2937" stroke="#000" strokeWidth="2" />
                            <circle cx="140" cy="110" r="6" fill="#F59E0B" />
                            <path d="M140,95 L140,125 M125,110 L155,110" stroke="#4B5563" strokeWidth="2" />
                        </g>
                    </svg>
                </div>

                {/* Speed Lines / Dirt */}
                <div className="absolute bottom-0 left-[-20px] flex gap-2 animate-slide-left">
                    <div className="w-8 h-1 bg-emerald-300 rounded-full opacity-50"></div>
                    <div className="w-4 h-1 bg-emerald-400 rounded-full opacity-70"></div>
                </div>
            </div>

            <h1 className="mt-8 text-2xl font-black text-emerald-800 uppercase tracking-widest animate-pulse">
                Farm Solutions
            </h1>
            <p className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-[0.2em]">
                Cultivating Future...
            </p>

            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        .animate-spin-fast {
          animation: spin 0.8s linear infinite;
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 0.5s ease-in-out infinite;
        }
        @keyframes slide-left {
          0% { transform: translateX(100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0; }
        }
        .animate-slide-left {
          animation: slide-left 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default Preloader;
