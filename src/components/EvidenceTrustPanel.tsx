import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, Database, Sliders, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_SOURCES, EVIDENCE_ITEMS } from '../data/provenanceData';
import { ProvenanceBadgeType } from '../types';

export const EvidenceTrustPanel: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ProvenanceBadgeType | 'ALL'>('ALL');

  const getBadgeStyle = (category: ProvenanceBadgeType) => {
    switch (category) {
      case 'VERIFIED SOURCE':
        return 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
      case 'USER DATA':
        return 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300';
      case 'SIMULATED':
        return 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300';
      case 'ASSUMPTION':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
    }
  };

  const filteredItems = activeFilter === 'ALL'
    ? EVIDENCE_ITEMS
    : EVIDENCE_ITEMS.filter(item => item.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-lg font-bold text-white tracking-wide">
              Evidence, Sources & Technical Limitations
            </h2>
          </div>
          <span className="text-xs font-telemetry text-slate-400">
            Scientific Provenance Ledger
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          To prevent deceptive performance claims, all data in this application is strictly partitioned into verified external literature, user-provided telemetry, and explicit software-in-the-loop simulation assumptions.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(['ALL', 'VERIFIED SOURCE', 'USER DATA', 'SIMULATED', 'ASSUMPTION'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-telemetry font-medium transition ${
                activeFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Official Primary Literature Citations Grid */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider font-telemetry flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Primary Literature & Public Provenance Citations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OFFICIAL_SOURCES.map((src, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-display font-semibold text-white">{src.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-telemetry border ${getBadgeStyle(src.badge)}`}>
                    {src.badge}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{src.desc}</p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-telemetry text-[11px] pt-1"
              >
                <span>Access verified source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Evidence Items */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-telemetry">
          Detailed Provenance Statements ({filteredItems.length} items)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-telemetry font-bold border ${getBadgeStyle(item.category)}`}>
                  {item.category}
                </span>
                {item.citationLabel && (
                  <span className="text-[10px] font-telemetry text-slate-500">
                    Ref: {item.citationLabel}
                  </span>
                )}
              </div>

              <h4 className="font-display font-bold text-white text-sm">
                {item.title}
              </h4>

              <p className="text-xs font-medium text-slate-300">
                {item.summary}
              </p>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {item.details}
              </p>

              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-telemetry underline underline-offset-4"
                >
                  <span>Verify at external source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Student Research Ethics & Honest Science Declaration */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-telemetry font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          Student Research Project Ethics & Transparency Statement
        </div>
        <p className="text-slate-300 leading-relaxed">
          This prototype was engineered for academic research presentation in satellite systems engineering. It adheres strictly to reproducible computational science: all code, data loaders, and anomaly detectors are transparent and deterministic. No performance claims (such as &quot;100% detection rate&quot; or &quot;zero false alarms&quot;) are made. Ground-truth evaluation metrics are withheld whenever labeled annotations are absent.
        </p>
      </div>
    </div>
  );
};
