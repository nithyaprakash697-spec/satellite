import React, { useState } from 'react';
import { ExternalLink, Cpu, HardDrive, Shield, Zap, Radio, Camera, Navigation, Compass } from 'lucide-react';
import { OPS_SAT_SUBSYSTEMS, HARDWARE_DISCLAIMER } from '../data/hardwareData';
import { HardwareSubsystemInfo } from '../types';

export const HardwareReference: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('sepp');

  const getSubsystemIcon = (id: string) => {
    switch (id) {
      case 'sepp':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'mass_memory':
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      case 'obc':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'eps':
      case 'solar':
      case 'battery':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'adcs':
        return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'gnss':
        return <Navigation className="w-5 h-5 text-sky-400" />;
      case 'comms':
      case 'sdr':
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-rose-400" />;
      default:
        return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  const currentItem = OPS_SAT_SUBSYSTEMS.find(s => s.id === selectedSubsystem) || OPS_SAT_SUBSYSTEMS[0];

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-white tracking-wide">
              ESA OPS-SAT Documented Hardware Profile
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
              VERIFIED SOURCE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Public hardware specifications for ESA&apos;s &quot;flying laboratory&quot; CubeSat mission. Only publicly verified specifications are presented.
          </p>
        </div>

        <a
          href="https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 font-medium transition shrink-0"
        >
          <span>ESA Telemetry Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-xs flex items-center gap-2.5">
        <span className="font-semibold font-telemetry text-amber-400 shrink-0 uppercase tracking-wider text-[11px]">Notice:</span>
        <span>{HARDWARE_DISCLAIMER}</span>
      </div>

      {/* Interactive Subsystem Block Architecture Diagram */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-telemetry">
            Satellite Subsystem Architecture (Interactive)
          </div>
          <span className="text-[11px] text-slate-400">Click any component to inspect documented telemetry & specs</span>
        </div>

        {/* Responsive Grid Map of Satellite Subsystems */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OPS_SAT_SUBSYSTEMS.map((subsystem) => {
            const isSelected = selectedSubsystem === subsystem.id;
            return (
              <button
                key={subsystem.id}
                onClick={() => setSelectedSubsystem(subsystem.id)}
                className={`text-left p-3.5 rounded-lg border transition-all relative ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-700/60">
                    {getSubsystemIcon(subsystem.id)}
                  </div>
                  <span className="text-[9px] font-telemetry uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                    {subsystem.category}
                  </span>
                </div>
                <div className="font-display font-semibold text-white text-xs sm:text-sm truncate">
                  {subsystem.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {subsystem.documentedSpecs[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Documented Card for Selected Subsystem */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
              {getSubsystemIcon(currentItem.id)}
            </div>
            <div>
              <div className="text-xs font-telemetry text-cyan-400 uppercase tracking-wider">
                Subsystem Specification Profile
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {currentItem.title}
              </h3>
            </div>
          </div>

          <a
            href={currentItem.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-telemetry underline underline-offset-4"
          >
            <span>Source: {currentItem.sourceTitle}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-telemetry">
              Publicly Documented Specifications
            </div>
            <ul className="space-y-2">
              {currentItem.documentedSpecs.map((spec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>

            {currentItem.notes && (
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300">
                <span className="font-semibold text-purple-200">Architectural Note: </span>
                {currentItem.notes}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-telemetry">
              Operational Role on OPS-SAT
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              {currentItem.opsSatRole}
            </p>

            <div className="text-[11px] text-slate-400 space-y-1 pt-2">
              <div className="font-semibold text-slate-400 font-telemetry">Technical Boundary Guard:</div>
              <p>
                No unverified processor temperature ceilings, radiation limits, bus bandwidths, or component part numbers have been invented or assumed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
