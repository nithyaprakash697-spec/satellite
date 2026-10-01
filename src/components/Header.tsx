import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Satellite, Clock, Compass, FileCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  onOpenTour?: () => void;
  onLaunchQuickTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  onOpenTour,
  onLaunchQuickTour
}) => {
  const selectTab = onSelectTab || setActiveTab || (() => {});
  const launchTour = onOpenTour || onLaunchQuickTour || (() => {});
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'simulation', label: 'MISSION SIMULATION' },
    { id: 'experiment', label: 'EXPERIMENT DATA' },
    { id: 'hardware', label: 'HARDWARE & SOURCES' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a101d]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner with Mission Control Status & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Software-in-the-loop demonstration
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Educational Engineering Prototype
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-telemetry">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{utcTime || 'UTC CLOCK SYNC'}</span>
          </div>
          <button
            onClick={launchTour}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition flex items-center gap-1 font-sans font-medium"
            title="Fast 30-second walkthrough for judges and reviewers"
          >
            <Compass className="w-3.5 h-3.5" />
            30-Sec Tour
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600/20 to-blue-900/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Satellite className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Autonomous Satellite Fault Detection & Reconfiguration Lab
            </h1>
            <p className="text-xs text-slate-400">
              Pipeline: Telemetry → Preprocessing → Statistical & ML Detection → Hybrid Decision → Simulated Reconfiguration
            </p>
          </div>
        </div>

        {/* Global Pipeline Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] font-telemetry text-slate-300">
          <span className="text-cyan-400">Detect</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400">Diagnose</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400">Reconfigure</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400">Continue</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-slate-800/40 py-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => selectTab(item.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
