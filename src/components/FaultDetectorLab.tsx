import React, { useState } from 'react';
import { Sliders, Cpu, GitMerge, Code2, AlertTriangle, Play, CheckCircle, Info, Download } from 'lucide-react';
import {
  StatisticalDetectorConfig,
  IsolationForestConfig,
  HybridDetectorConfig,
  DetectionResult,
  EvaluationMetrics,
  TelemetryDataPoint
} from '../types';
import { PYTHON_TRAINING_SCRIPT_SNIPPET } from '../algorithms/isolationForest';

interface FaultDetectorLabProps {
  activeDetectorType: 'statistical' | 'ml' | 'hybrid';
  onSelectDetectorType: (type: 'statistical' | 'ml' | 'hybrid') => void;
  statConfig: StatisticalDetectorConfig;
  setStatConfig: React.Dispatch<React.SetStateAction<StatisticalDetectorConfig>>;
  mlConfig: IsolationForestConfig;
  setMlConfig: React.Dispatch<React.SetStateAction<IsolationForestConfig>>;
  hybridConfig: HybridDetectorConfig;
  setHybridConfig: React.Dispatch<React.SetStateAction<HybridDetectorConfig>>;
  onExecuteRun: () => void;
  currentResult: DetectionResult | null;
  metrics: EvaluationMetrics | null;
  hasGroundTruthLabels: boolean;
  activeChannelName: string;
}

export const FaultDetectorLab: React.FC<FaultDetectorLabProps> = ({
  activeDetectorType,
  onSelectDetectorType,
  statConfig,
  setStatConfig,
  mlConfig,
  setMlConfig,
  hybridConfig,
  setHybridConfig,
  onExecuteRun,
  currentResult,
  metrics,
  hasGroundTruthLabels,
  activeChannelName
}) => {
  const [showPythonScript, setShowPythonScript] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const copyScript = () => {
    navigator.clipboard.writeText(PYTHON_TRAINING_SCRIPT_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Detector Selector Navigation */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-wide">
              Onboard Fault Detection Laboratory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare deterministic statistical methods, machine learning isolation trees, and multi-detector hybrid logic.
            </p>
          </div>

          <button
            onClick={onExecuteRun}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Re-run Active Detector
          </button>
        </div>

        {/* 3 Detector Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Statistical Detector Card */}
          <button
            onClick={() => onSelectDetectorType('statistical')}
            className={`p-4 rounded-xl border text-left transition relative ${
              activeDetectorType === 'statistical'
                ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry uppercase text-cyan-400 font-bold">METHOD A</span>
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-display font-semibold text-white text-sm mt-1">
              Statistical Z-Score
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Causal rolling-window statistical mean & variance envelope with consecutive anomaly filtering.
            </p>
          </button>

          {/* Machine Learning (Isolation Forest) Card */}
          <button
            onClick={() => onSelectDetectorType('ml')}
            className={`p-4 rounded-xl border text-left transition relative ${
              activeDetectorType === 'ml'
                ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry uppercase text-indigo-400 font-bold">METHOD B</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-display font-semibold text-white text-sm mt-1">
              Isolation Forest (ML)
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Faithful TypeScript tree isolation implementation (Liu et al. 2008) or user precomputed model scores.
            </p>
          </button>

          {/* Hybrid Decision Card */}
          <button
            onClick={() => onSelectDetectorType('hybrid')}
            className={`p-4 rounded-xl border text-left transition relative ${
              activeDetectorType === 'hybrid'
                ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry uppercase text-amber-400 font-bold">METHOD C</span>
              <GitMerge className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display font-semibold text-white text-sm mt-1">
              Hybrid Decision Logic
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dual-stage fusion: Statistical Anomaly {hybridConfig.logic} Machine Learning Anomaly.
            </p>
          </button>
        </div>
      </div>

      {/* Active Detector Configuration Panel */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
        {activeDetectorType === 'statistical' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Statistical Z-Score Parameter Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates causal Z-score Z_t = (|x_t - μ_t|) / σ_t across previous window samples.
                </p>
              </div>
              <span className="text-xs font-telemetry text-cyan-400 font-semibold">
                Target: {activeChannelName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Window Size Slider */}
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Window Size (W)</span>
                  <span className="text-cyan-400 font-bold font-telemetry">{statConfig.windowSize} samples</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={statConfig.windowSize}
                  onChange={(e) => setStatConfig(prev => ({ ...prev, windowSize: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Preceding valid samples used to compute rolling mean (μ) and standard deviation (σ).
                </p>
              </div>

              {/* Z-Score Threshold Slider */}
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Z-Score Threshold (Z_thresh)</span>
                  <span className="text-cyan-400 font-bold font-telemetry">±{statConfig.zThreshold.toFixed(1)} σ</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.5"
                  step="0.1"
                  value={statConfig.zThreshold}
                  onChange={(e) => setStatConfig(prev => ({ ...prev, zThreshold: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Deviations greater than this multiple of standard deviation trigger alarms.
                </p>
              </div>

              {/* Min Consecutive Anomalies */}
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Min Consecutive (k)</span>
                  <span className="text-cyan-400 font-bold font-telemetry">{statConfig.minConsecutive} step(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={statConfig.minConsecutive}
                  onChange={(e) => setStatConfig(prev => ({ ...prev, minConsecutive: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Debounce filter: suppresses single-cycle spikes to minimize false alarms.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDetectorType === 'ml' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  Isolation Forest ML Engine
                  <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                    Faithful TypeScript Implementation
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Constructs ensemble of random isolation trees (iTrees). Shorter average path lengths $h(x)$ correspond to higher anomaly scores.
                </p>
              </div>

              <button
                onClick={() => setShowPythonScript(!showPythonScript)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-telemetry flex items-center gap-1.5 transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showPythonScript ? 'Hide Python Script' : 'View Scikit-Learn Training Script'}
              </button>
            </div>

            {/* Scientific Integrity Note regarding Browser vs Python ML */}
            <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
              <div className="font-semibold text-indigo-300 font-telemetry flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Scientific Grounding Notice:
              </div>
              <p>
                This detector uses a faithful in-browser reproduction of the Liu, Ting & Zhou (2008) Isolation Forest algorithm with recursive feature splitting and exact $c(n)$ normalization. It does not use simulated random numbers. If you upload a CSV with a <code className="text-white bg-slate-900 px-1 py-0.5 rounded">ml_anomaly_score</code> column, the precomputed scores are used directly.
              </p>
            </div>

            {showPythonScript && (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-telemetry text-slate-400">
                    python/train_isolation_forest.py (Scikit-Learn Reference)
                  </span>
                  <button
                    onClick={copyScript}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 transition font-telemetry"
                  >
                    {copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="text-[11px] font-telemetry text-slate-300 overflow-x-auto p-3 bg-slate-900/90 rounded max-h-56 leading-relaxed">
                  {PYTHON_TRAINING_SCRIPT_SNIPPET}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Contamination Rate</span>
                  <span className="text-indigo-400 font-bold font-telemetry">{(mlConfig.contamination * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={mlConfig.contamination}
                  onChange={(e) => setMlConfig(prev => ({ ...prev, contamination: Number(e.target.value) }))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Expected proportion of anomalies in dataset to calibrate score threshold.
                </p>
              </div>

              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Number of iTrees (Ensemble)</span>
                  <span className="text-indigo-400 font-bold font-telemetry">{mlConfig.nTrees} trees</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={mlConfig.nTrees}
                  onChange={(e) => setMlConfig(prev => ({ ...prev, nTrees: Number(e.target.value) }))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Higher tree counts increase isolation stability and reduce sample variance.
                </p>
              </div>

              <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-telemetry">Score Threshold (s_crit)</span>
                  <span className="text-indigo-400 font-bold font-telemetry">{mlConfig.scoreThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.85"
                  step="0.01"
                  value={mlConfig.scoreThreshold}
                  onChange={(e) => setMlConfig(prev => ({ ...prev, scoreThreshold: Number(e.target.value) }))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Theoretical threshold: $s &gt; 0.60$ signifies an isolated anomaly.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDetectorType === 'hybrid' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Hybrid Dual-Stage Decision Logic
                </h3>
                <p className="text-xs text-slate-400">
                  Combines high-speed Statistical Z-Score with multi-dimensional Isolation Forest.
                </p>
              </div>
              <div className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-telemetry font-bold">
                DEFAULT: OR (Original Satellite Experiment)
              </div>
            </div>

            {/* Logic Gate Toggle (OR vs AND) */}
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-200 font-telemetry">
                  ACTIVE COMBINATION GATE:
                </div>
                <div className="text-slate-400">
                  {hybridConfig.logic === 'OR' ? (
                    <span>
                      <strong className="text-amber-400">OR Logic (Union):</strong> Triggers if EITHER Statistical Z-Score OR Isolation Forest flags an anomaly. Maximizes recall and safety.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-cyan-400">AND Logic (Intersection):</strong> Triggers only if BOTH Statistical Z-Score AND Isolation Forest agree. Minimizes false alarms.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 shrink-0">
                <button
                  onClick={() => setHybridConfig({ logic: 'OR' })}
                  className={`px-4 py-1.5 rounded text-xs font-telemetry font-bold transition ${
                    hybridConfig.logic === 'OR'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  OR GATE (∪)
                </button>
                <button
                  onClick={() => setHybridConfig({ logic: 'AND' })}
                  className={`px-4 py-1.5 rounded text-xs font-telemetry font-bold transition ${
                    hybridConfig.logic === 'AND'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AND GATE (∩)
                </button>
              </div>
            </div>

            {/* Formula Visualization */}
            <div className="p-4 rounded-lg bg-slate-950 font-telemetry text-xs sm:text-sm text-center border border-slate-800">
              <span className="text-slate-400">Hybrid Flag: </span>
              <span className="text-cyan-300 font-bold">Flag_Stat(W={statConfig.windowSize}, Z={statConfig.zThreshold})</span>
              <span className="text-amber-400 font-extrabold mx-2">
                [{hybridConfig.logic}]
              </span>
              <span className="text-indigo-300 font-bold">Flag_iForest(n={mlConfig.nTrees}, s_crit={mlConfig.scoreThreshold})</span>
            </div>
          </div>
        )}

        {/* Live Detector Output Summary */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-telemetry">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">ANOMALIES FLAGGED:</span>
            <span className="text-sm font-bold text-rose-400">
              {currentResult ? currentResult.indices.length : 0} points
            </span>
          </div>

          <div className="flex items-center gap-4">
            {metrics ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">PRECISION:</span>
                  <span className="text-slate-200 font-bold">{(metrics.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">RECALL:</span>
                  <span className="text-slate-200 font-bold">{(metrics.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">F1 SCORE:</span>
                  <span className="text-cyan-300 font-bold">{metrics.f1Score.toFixed(3)}</span>
                </div>
              </>
            ) : (
              <span className="text-slate-400">
                Ground-truth labels unavailable — evaluation metrics cannot be verified.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
