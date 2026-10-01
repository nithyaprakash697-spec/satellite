import React from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Cpu, Radio, Zap, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MissionOverviewProps {
  onNavigate: (tabId: string) => void;
}

export const MissionOverview: React.FC<MissionOverviewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Primary Hero Section with Technical Spacecraft Illustration */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 lg:p-8 relative overflow-hidden bg-aerospace-grid">
        {/* Subtle radial ambient light */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Software-in-the-loop demonstration
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Autonomous In-Orbit Anomaly Detection & Adaptive System Recovery
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              This lab explores how real spacecraft telemetry can support onboard anomaly detection and a simulated recovery policy. It does not represent flight-qualified satellite software.
            </p>

            {/* Mission Objective Statement */}
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-300 space-y-2">
              <div className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] font-telemetry flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Primary Mission Objective
              </div>
              <p className="text-slate-300">
                Demonstrate an autonomous closed-loop edge autonomy pipeline for small satellites: ingest continuous flight telemetry, execute real-time causal anomaly detectors (statistical Z-score and machine learning), isolate the affected subsystem, and orchestrate automated simulated reconfiguration to sustain safe operations.
              </p>
            </div>

            {/* Pipeline Step Sequence: Detect -> Diagnose -> Reconfigure -> Continue */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-telemetry mb-2">
                Operational Pipeline Sequence
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div 
                  onClick={() => onNavigate('detection')}
                  className="p-3 rounded-lg bg-slate-950/60 border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transition"
                >
                  <div className="text-[10px] text-cyan-400 font-telemetry font-bold">PHASE 1</div>
                  <div className="font-display font-semibold text-white text-sm">1. Detect</div>
                  <p className="text-[11px] text-slate-400 mt-1">Statistical Z-score & Isolation Forest</p>
                </div>

                <div 
                  onClick={() => onNavigate('reconfig')}
                  className="p-3 rounded-lg bg-slate-950/60 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition"
                >
                  <div className="text-[10px] text-amber-400 font-telemetry font-bold">PHASE 2</div>
                  <div className="font-display font-semibold text-white text-sm">2. Diagnose</div>
                  <p className="text-[11px] text-slate-400 mt-1">Subsystem root-cause isolation</p>
                </div>

                <div 
                  onClick={() => onNavigate('reconfig')}
                  className="p-3 rounded-lg bg-slate-950/60 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer transition"
                >
                  <div className="text-[10px] text-indigo-400 font-telemetry font-bold">PHASE 3</div>
                  <div className="font-display font-semibold text-white text-sm">3. Reconfigure</div>
                  <p className="text-[11px] text-slate-400 mt-1">Switch redundant bus & safety paths</p>
                </div>

                <div 
                  onClick={() => onNavigate('reconfig')}
                  className="p-3 rounded-lg bg-slate-950/60 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition"
                >
                  <div className="text-[10px] text-emerald-400 font-telemetry font-bold">PHASE 4</div>
                  <div className="font-display font-semibold text-white text-sm">4. Continue</div>
                  <p className="text-[11px] text-slate-400 mt-1">Return to validated safe operation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Restrained Vector Spacecraft Diagram */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm aspect-square bg-[#060a12] rounded-xl border border-slate-800/90 p-4 relative flex flex-col items-center justify-center">
              {/* Technical axes and reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-full h-[1px] bg-slate-700" />
                <div className="absolute h-full w-[1px] bg-slate-700" />
                <div className="w-48 h-48 rounded-full border border-dashed border-cyan-500/30" />
              </div>

              {/* Clean SVG CubeSat Representation */}
              <svg viewBox="0 0 320 280" className="w-full h-full max-w-[280px]">
                {/* Orbital track curve */}
                <path d="M 20,240 Q 160,80 300,120" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
                
                {/* Left Solar Panel Array */}
                <g className="transition-transform duration-700 hover:scale-105">
                  <polygon points="40,110 110,95 110,165 40,180" fill="#0f2b48" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="63" y1="105" x2="63" y2="175" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                  <line x1="86" y1="100" x2="86" y2="170" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                  <line x1="40" y1="145" x2="110" y2="130" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                </g>

                {/* Right Solar Panel Array */}
                <g className="transition-transform duration-700 hover:scale-105">
                  <polygon points="210,95 280,110 280,180 210,165" fill="#0f2b48" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="233" y1="100" x2="233" y2="170" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                  <line x1="256" y1="105" x2="256" y2="175" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                  <line x1="210" y1="130" x2="280" y2="145" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                </g>

                {/* Satellite 3U Chassis (Bus) */}
                <polygon points="120,70 190,50 200,190 130,210" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                <polygon points="110,95 120,70 130,210 120,235" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                
                {/* SEPP Processing Card Compartment */}
                <rect x="135" y="90" width="48" height="36" rx="3" fill="#0a192f" stroke="#06b6d4" strokeWidth="1.2" />
                <text x="142" y="105" fill="#06b6d4" fontSize="8" fontFamily="monospace" fontWeight="bold">SEPP SoC</text>
                <text x="142" y="117" fill="#94a3b8" fontSize="7" fontFamily="monospace">Cyclone V</text>

                {/* EPS / Battery Section */}
                <rect x="135" y="135" width="48" height="30" rx="3" fill="#172554" stroke="#3b82f6" strokeWidth="1" />
                <text x="142" y="148" fill="#60a5fa" fontSize="7" fontFamily="monospace">EPS / BATT</text>
                <text x="142" y="158" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">Dual Bus</text>

                {/* Optical payload aperture / camera */}
                <circle cx="170" cy="180" r="7" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="170" cy="180" r="3" fill="#38bdf8" />

                {/* UHF/S-Band Antennas */}
                <line x1="155" y1="60" x2="155" y2="25" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="155" cy="23" r="2.5" fill="#38bdf8" />

                <line x1="180" y1="53" x2="205" y2="25" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="205" cy="25" r="2" fill="#a855f7" />
              </svg>

              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-telemetry pt-2 border-t border-slate-800">
                <span>MODEL: 3U REFERENCE CUBESAT</span>
                <span className="text-cyan-400">STATUS: NOMINAL</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Architectural reference layout based on documented ESA OPS-SAT design
            </p>
          </div>
        </div>
      </div>

      {/* Core Technology & Non-Claims Warning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold font-display text-sm">
            <Cpu className="w-4 h-4" />
            Software-in-the-Loop Prototype
          </div>
          <p className="text-slate-400 leading-relaxed">
            This application is an educational engineering demonstration for student satellite-systems research. It executes simulated detector pipelines and reconfiguration policies in software.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold font-display text-sm">
            <AlertCircle className="w-4 h-4" />
            Strict Technical Honesty
          </div>
          <p className="text-slate-400 leading-relaxed">
            Not flight-qualified, NASA-certified, or connected to an active spacecraft. Does not physically reconfigure hardware transistors or fabricate scientific telemetry measurements.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold font-display text-sm">
            <Zap className="w-4 h-4" />
            Caltech Research Heritage
          </div>
          <p className="text-slate-400 leading-relaxed">
            Caltech self-healing circuit research (Dr. Sengupta & Dr. Hajimiri) serves as conceptual inspiration for autonomous sensing and path switching, not physical chip reproduction.
          </p>
        </div>
      </div>

      {/* Fast Navigation Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="text-xs text-slate-300">
          Ready to explore? Step through the hardware reference, upload telemetry, test detectors, or inject simulated faults.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('hardware')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            Hardware Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('telemetry')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            Open Telemetry Lab
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
