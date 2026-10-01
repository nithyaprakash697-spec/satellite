/**
 * HardwareAndSourcesView.tsx
 * Compact reference view for documented satellite hardware, Caltech research inspiration,
 * and source provenance ledger.
 */

import React, { useState } from 'react';
import { HardwareReference } from './HardwareReference';
import { CaltechInspiration } from './CaltechInspiration';
import { EvidenceTrustPanel } from './EvidenceTrustPanel';
import { Shield, BookOpen, ExternalLink, Cpu, Database, CheckCircle, Info } from 'lucide-react';

export const HardwareAndSourcesView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'hardware' | 'caltech' | 'provenance'>('hardware');

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-display font-bold text-white tracking-wide">
              Reference Spacecraft Architecture & Source Citations
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              REFERENCE PROFILE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-telemetry mt-0.5">
            Public specifications from ESA OPS-SAT, Caltech self-healing research context, and verified provenance ledger.
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-telemetry">
          <button
            onClick={() => setActiveSection('hardware')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'hardware'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>OPS-SAT Reference</span>
          </button>

          <button
            onClick={() => setActiveSection('caltech')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'caltech'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Self-Healing Concept</span>
          </button>

          <button
            onClick={() => setActiveSection('provenance')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'provenance'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Evidence Ledger</span>
          </button>
        </div>
      </div>

      {/* Prominent Educational Boundary Notice */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Info className="w-4 h-4" />
          <span>Technical Transparency & Architectural Boundaries</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
            <strong className="text-slate-200 block">Reference Spacecraft Architecture:</strong>
            Hardware specifications are grounded in public European Space Agency (ESA) OPS-SAT documentation. This educational project does not claim physical possession or direct flight connection to OPS-SAT hardware.
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
            <strong className="text-slate-200 block">Self-Healing Conceptual Inspiration:</strong>
            Self-healing in this demonstration refers to closed-loop fault detection and software configuration policy selection. It does <em>not</em> claim physical transistor-level repair or flight-qualified autonomy.
          </div>
        </div>
      </div>

      {/* Section 1: Documented Spacecraft Hardware Reference */}
      {activeSection === 'hardware' && (
        <HardwareReference />
      )}

      {/* Section 2: Caltech Self-Healing Inspiration */}
      {activeSection === 'caltech' && (
        <CaltechInspiration />
      )}

      {/* Section 3: Evidence, Sources & Limitations Ledger */}
      {activeSection === 'provenance' && (
        <EvidenceTrustPanel />
      )}
    </div>
  );
};
