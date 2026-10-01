import React, { useState } from 'react';
import { Download, CheckCircle, AlertTriangle, Clock, History, FileText } from 'lucide-react';
import { EvaluationMetrics, DetectorRunLog } from '../types';

interface ResultsEvaluationProps {
  metrics: EvaluationMetrics | null;
  hasGroundTruthLabels: boolean;
  runLogs: DetectorRunLog[];
  onClearLogs: () => void;
  currentDetectorName: string;
}

export const ResultsEvaluation: React.FC<ResultsEvaluationProps> = ({
  metrics,
  hasGroundTruthLabels,
  runLogs,
  onClearLogs,
  currentDetectorName
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const exportAsJson = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      evaluationMetrics: metrics,
      hasGroundTruthLabels,
      experimentHistory: runLogs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satellite_fault_detection_results_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadNotice('Exported results as JSON file.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const exportAsCsv = () => {
    let csv = 'Run_ID,Timestamp,Dataset,Channel,Detector,Parameters,Samples,Anomalies,Accuracy,Precision,Recall,F1_Score,FPR,FNR,Latency_Sec\n';
    runLogs.forEach((log) => {
      const m = log.metrics;
      csv += `"${log.id}","${log.timestamp}","${log.datasetName}","${log.channelId}","${log.detectorName}","${log.parameters.replace(/"/g, '""')}",${log.sampleCount},${log.anomalyCount},${m ? m.accuracy : 'N/A'},${m ? m.precision : 'N/A'},${m ? m.recall : 'N/A'},${m ? m.f1Score : 'N/A'},${m ? m.falseAlarmRate : 'N/A'},${m ? m.missRate : 'N/A'},${m && m.detectionLatencySec !== null ? m.detectionLatencySec : 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satellite_experiment_log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadNotice('Exported experiment log as CSV file.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="font-display text-lg font-bold text-white tracking-wide">
            Detection Results & Quantitative Evaluation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical confusion matrix, operational latency, and reproducible experiment logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAsCsv}
            disabled={runLogs.length === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-telemetry text-slate-200 border border-slate-700 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={exportAsJson}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-telemetry text-white font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Main Metrics or Missing Labels Banner */}
      {!hasGroundTruthLabels || !metrics ? (
        <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-display text-base font-bold text-slate-200">
            Ground-truth labels unavailable — evaluation metrics cannot be verified.
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            The active dataset does not contain an annotated anomaly ground-truth column. In accordance with strict scientific guidelines, accuracy, precision, recall, and confusion matrix counts are not fabricated.
          </p>
          <div className="text-[11px] font-telemetry text-cyan-400">
            To view verified classification metrics, select a benchmark with known ground-truth labels (e.g. OPS-SAT Documented Channels Baseline or ESA Anomaly Benchmark).
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* High-Level Classification Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-telemetry">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
              <div className="text-xl font-bold text-white mt-1">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">Overall agreement</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Precision</span>
              <div className="text-xl font-bold text-cyan-300 mt-1">
                {(metrics.precision * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">TP / (TP + FP)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Recall (Sensitivity)</span>
              <div className="text-xl font-bold text-emerald-300 mt-1">
                {(metrics.recall * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">TP / (TP + FN)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">F1 Score</span>
              <div className="text-xl font-bold text-indigo-300 mt-1">
                {metrics.f1Score.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-400">Harmonic mean</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">False Alarm Rate</span>
              <div className="text-xl font-bold text-amber-300 mt-1">
                {(metrics.falseAlarmRate * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">FPR: FP / Negatives</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Miss Rate</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {(metrics.missRate * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">FNR: FN / Positives</span>
            </div>
          </div>

          {/* Operational Latency & Confusion Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confusion Matrix Visualization */}
            <div className="lg:col-span-7 rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider font-telemetry">
                  Confusion Matrix ({currentDetectorName})
                </h3>
                <span className="text-xs font-telemetry text-slate-400">
                  Total Evaluated: {metrics.totalEvaluated} samples
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs font-telemetry">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-800 bg-slate-950/40 text-slate-400"></th>
                      <th className="p-2 border border-slate-800 bg-slate-950/60 text-slate-300 font-semibold" colSpan={2}>
                        GROUND TRUTH ACTUAL
                      </th>
                    </tr>
                    <tr>
                      <th className="p-2 border border-slate-800 bg-slate-950/40 text-slate-400">DETECTOR PREDICTION</th>
                      <th className="p-2 border border-slate-800 bg-slate-950/40 text-rose-400 font-semibold">
                        ACTUAL ANOMALY (1)
                      </th>
                      <th className="p-2 border border-slate-800 bg-slate-950/40 text-emerald-400 font-semibold">
                        ACTUAL NOMINAL (0)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="p-3 border border-slate-800 bg-slate-950/40 text-rose-400 font-semibold">
                        PREDICTED ANOMALY (ALARM)
                      </th>
                      {/* True Positive */}
                      <td className="p-4 border border-slate-800 bg-emerald-950/30 text-white font-bold text-base">
                        <div className="text-emerald-400">{metrics.truePositives}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          True Positive (TP)
                        </div>
                      </td>
                      {/* False Positive */}
                      <td className="p-4 border border-slate-800 bg-amber-950/30 text-white font-bold text-base">
                        <div className="text-amber-400">{metrics.falsePositives}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          False Alarm (FP)
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="p-3 border border-slate-800 bg-slate-950/40 text-emerald-400 font-semibold">
                        PREDICTED NOMINAL (SILENT)
                      </th>
                      {/* False Negative */}
                      <td className="p-4 border border-slate-800 bg-rose-950/30 text-white font-bold text-base">
                        <div className="text-rose-400">{metrics.falseNegatives}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Missed Event (FN)
                        </div>
                      </td>
                      {/* True Negative */}
                      <td className="p-4 border border-slate-800 bg-slate-950/60 text-white font-bold text-base">
                        <div className="text-slate-300">{metrics.trueNegatives}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          True Negative (TN)
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detection Latency & Operational Safety Card */}
            <div className="lg:col-span-5 rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider font-telemetry">
                  On-Board Detection Latency
                </h3>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-telemetry text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Onset-to-Alarm Lag</span>
                  <div className="text-2xl font-bold text-cyan-300 mt-1">
                    {metrics.detectionLatencySamples !== null ? (
                      <>
                        {metrics.detectionLatencySamples}{' '}
                        <span className="text-xs font-normal text-slate-400">samples</span>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Equivalent Time Delay:</span>
                  <span className="text-white font-semibold">
                    {metrics.detectionLatencySec !== null ? `${metrics.detectionLatencySec} seconds` : 'Undetected'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Latency measures elapsed cadence steps between the true physical onset of the anomaly and the detector’s first confirmed flag.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-400 font-telemetry">Operational Trade-off:</span>
                <p>
                  Increasing window size $W$ or min-consecutive steps $k$ dampens false alarms ($FP$) at the expense of adding detection latency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experiment Run History Log */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider font-telemetry">
              Reproducible Experiment Run History
            </h3>
          </div>
          {runLogs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs text-slate-400 hover:text-slate-200 transition font-telemetry"
            >
              Clear Log
            </button>
          )}
        </div>

        {runLogs.length === 0 ? (
          <div className="text-xs text-slate-400 font-telemetry py-4 text-center">
            No detector runs recorded yet in current session. Execute a detector above to record an experiment run.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-telemetry border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">DETECTOR</th>
                  <th className="py-2 px-3">DATASET / CHANNEL</th>
                  <th className="py-2 px-3">PARAMETERS</th>
                  <th className="py-2 px-3 text-right">ANOMALIES</th>
                  <th className="py-2 px-3 text-right">PRECISION</th>
                  <th className="py-2 px-3 text-right">RECALL</th>
                  <th className="py-2 px-3 text-right">F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {runLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2 px-3 text-slate-400">{log.timestamp.slice(11, 19)}</td>
                    <td className="py-2 px-3 font-semibold text-cyan-300">{log.detectorName}</td>
                    <td className="py-2 px-3 text-slate-200">{log.datasetName} ({log.channelId})</td>
                    <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{log.parameters}</td>
                    <td className="py-2 px-3 text-right text-rose-400 font-bold">{log.anomalyCount}</td>
                    <td className="py-2 px-3 text-right text-slate-200">
                      {log.metrics ? `${(log.metrics.precision * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200">
                      {log.metrics ? `${(log.metrics.recall * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-indigo-300">
                      {log.metrics ? log.metrics.f1Score.toFixed(3) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
