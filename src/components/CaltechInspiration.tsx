import React from 'react';
import { ExternalLink, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export const CaltechInspiration: React.FC = () => {
  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-display text-base font-bold text-white tracking-wide">
            Research Inspiration: Caltech Self-Healing Circuits
          </h3>
        </div>
        <a
          href="https://www.caltech.edu/about/news/creating-indestructible-self-healing-circuits-38815"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-telemetry underline underline-offset-4"
        >
          <span>Caltech News Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mandatory Exact Quote & Scientific Translation */}
      <blockquote className="p-4 rounded-lg bg-slate-950 border-l-2 border-indigo-500 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
        &quot;Caltech researchers demonstrated a self-healing integrated-circuit power amplifier that used sensors, a control system, and adjustable circuit elements to recover useful operation after component damage. This project adapts the general idea of sensing degradation and selecting a valid operating configuration to a satellite-level software simulation.&quot;
      </blockquote>

      {/* Explicit Non-Claims Guardrails Box */}
      <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-telemetry flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Technical Integrity & Non-Claims Boundaries
        </div>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>No Physical Transistor Reproduction:</strong> This educational software does not claim to reproduce the physical Caltech silicon power amplifier chip.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>Macro vs Micro Scope:</strong> This project simulates macro-level satellite subsystem cross-strapping policies (e.g. switching DC-DC power converters or thermal throttling), not reconfiguring 100,000 physical on-chip transistors.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>Conceptual Adaptation:</strong> The analogy is architectural: moving from an open-loop failure mode to an autonomous closed-loop sense-diagnose-reconfigure loop.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
