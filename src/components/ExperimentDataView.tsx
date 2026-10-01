/**
 * ExperimentDataView.tsx
 * Compact technical view combining Telemetry, Fault Detectors, Evaluation Metrics, and Python Pipeline.
 */

import React, { useState } from 'react';
import { TelemetryLab } from './TelemetryLab';
import { FaultDetectorLab } from './FaultDetectorLab';
import { ResultsEvaluation } from './ResultsEvaluation';
import { EmbeddedInference } from './EmbeddedInference';
import {
  TelemetryDataPoint,
  TelemetryChannelMeta,
  DatasetMeta,
  DetectionResult,
  StatisticalDetectorConfig,
  IsolationForestConfig,
  HybridDetectorConfig,
  EvaluationMetrics,
  DetectorRunLog
} from '../types';
import { Activity, Sliders, BarChart3, Code2, Database } from 'lucide-react';

interface ExperimentDataViewProps {
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  datasetMeta: DatasetMeta;
  onLoadDataset: (id: string) => void;
  onUserCsvLoaded: (result: {
    dataPoints: TelemetryDataPoint[];
    channels: TelemetryChannelMeta[];
    meta: DatasetMeta;
  }) => void;
  activeDetectorType: 'statistical' | 'ml' | 'hybrid';
  onSelectDetectorType: (type: 'statistical' | 'ml' | 'hybrid') => void;
  statConfig: StatisticalDetectorConfig;
  setStatConfig: React.Dispatch<React.SetStateAction<StatisticalDetectorConfig>>;
  mlConfig: IsolationForestConfig;
  setMlConfig: React.Dispatch<React.SetStateAction<IsolationForestConfig>>;
  hybridConfig: HybridDetectorConfig;
  setHybridConfig: React.Dispatch<React.SetStateAction<HybridDetectorConfig>>;
  onExecuteRun: () => void;
  detectionResult: DetectionResult | null;
  metrics: EvaluationMetrics | null;
  runLogs: DetectorRunLog[];
  onClearLogs: () => void;
  activeDetectorName: string;
}

export const ExperimentDataView: React.FC<ExperimentDataViewProps> = ({
  dataPoints,
  channels,
  selectedChannelId,
  onSelectChannel,
  datasetMeta,
  onLoadDataset,
  onUserCsvLoaded,
  activeDetectorType,
  onSelectDetectorType,
  statConfig,
  setStatConfig,
  mlConfig,
  setMlConfig,
  hybridConfig,
  setHybridConfig,
  onExecuteRun,
  detectionResult,
  metrics,
  runLogs,
  onClearLogs,
  activeDetectorName
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'telemetry' | 'detectors' | 'evaluation' | 'embedded'>('telemetry');

  const activeChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-display font-bold text-white tracking-wide">
            Experiment Telemetry & Detector Lab
          </h2>
          <p className="text-xs text-slate-400 font-telemetry mt-0.5">
            Ingest custom CSVs, tune detector hyper-parameters, inspect confusion matrices, and review embedded C/Python artifacts.
          </p>
        </div>

        {/* Compact Sub-Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 overflow-x-auto text-xs font-telemetry">
          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & CSV</span>
          </button>

          <button
            onClick={() => setActiveSubTab('detectors')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'detectors'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Detectors (Z / ML)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evaluation')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'evaluation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Evaluation & Logs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('embedded')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'embedded'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Embedded & Python</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Telemetry Lab (CSV Upload & Charting) */}
      {activeSubTab === 'telemetry' && (
        <TelemetryLab
          dataPoints={dataPoints}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={onSelectChannel}
          activeDatasetMeta={datasetMeta}
          onLoadDataset={onLoadDataset}
          onUserCsvLoaded={onUserCsvLoaded}
          detectionResult={detectionResult}
          detectorName={activeDetectorName}
        />
      )}

      {/* Sub-Tab 2: Fault Detectors Lab */}
      {activeSubTab === 'detectors' && (
        <FaultDetectorLab
          activeDetectorType={activeDetectorType}
          onSelectDetectorType={onSelectDetectorType}
          statConfig={statConfig}
          setStatConfig={setStatConfig}
          mlConfig={mlConfig}
          setMlConfig={setMlConfig}
          hybridConfig={hybridConfig}
          setHybridConfig={setHybridConfig}
          onExecuteRun={onExecuteRun}
          currentResult={detectionResult}
          metrics={metrics}
          hasGroundTruthLabels={datasetMeta.hasGroundTruthLabels}
          activeChannelName={activeChannel ? `${activeChannel.name} (${activeChannel.id})` : selectedChannelId}
        />
      )}

      {/* Sub-Tab 3: Quantitative Results & Evaluation */}
      {activeSubTab === 'evaluation' && (
        <ResultsEvaluation
          metrics={metrics}
          hasGroundTruthLabels={datasetMeta.hasGroundTruthLabels}
          runLogs={runLogs}
          onClearLogs={onClearLogs}
          currentDetectorName={activeDetectorName}
        />
      )}

      {/* Sub-Tab 4: Embedded C/C++ Inference & Python Pipeline */}
      {activeSubTab === 'embedded' && (
        <EmbeddedInference />
      )}
    </div>
  );
};
