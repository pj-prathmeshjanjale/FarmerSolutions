import React from "react";

const AuroraBackground = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center">

            {/* Aurora Gradients */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/30 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-cyan-500/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/30 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
            </div>

            {/* Grid Pattern Overlay (Optional for texture) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {children}
            </div>

            <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};

export default AuroraBackground;
