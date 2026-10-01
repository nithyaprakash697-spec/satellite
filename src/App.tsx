/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { MissionSimulationView } from './components/MissionSimulationView';
import { ExperimentDataView } from './components/ExperimentDataView';
import { HardwareAndSourcesView } from './components/HardwareAndSourcesView';
import { QuickTourModal } from './components/QuickTourModal';
import { getDemoTelemetryDataset } from './data/sampleTelemetry';
import { detectStatisticalAnomalies } from './algorithms/statisticalDetector';
import { detectIsolationForestAnomalies } from './algorithms/isolationForest';
import { combineHybridAnomalies } from './algorithms/statisticalDetector';
import { evaluateDetection } from './algorithms/metrics';
import {
  StatisticalDetectorConfig,
  IsolationForestConfig,
  HybridDetectorConfig,
  DetectionResult,
  EvaluationMetrics,
  DetectorRunLog,
  DatasetMeta,
  TelemetryChannelMeta,
  TelemetryDataPoint
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Active Dataset state
  const [datasetId, setDatasetId] = useState<string>('opssat_telemetry_demo');
  const [dataPoints, setDataPoints] = useState<TelemetryDataPoint[]>(() => {
    return getDemoTelemetryDataset('opssat_telemetry_demo').dataPoints;
  });
  const [channels, setChannels] = useState<TelemetryChannelMeta[]>(() => {
    return getDemoTelemetryDataset('opssat_telemetry_demo').channels;
  });
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta>(() => {
    return getDemoTelemetryDataset('opssat_telemetry_demo').meta;
  });
  const [selectedChannelId, setSelectedChannelId] = useState<string>('BATT_V');

  // Detector configurations
  const [activeDetectorType, setActiveDetectorType] = useState<'statistical' | 'ml' | 'hybrid'>('statistical');
  const [statConfig, setStatConfig] = useState<StatisticalDetectorConfig>({
    windowSize: 20,
    zThreshold: 2.5,
    minConsecutive: 2
  });
  const [mlConfig, setMlConfig] = useState<IsolationForestConfig>({
    nTrees: 40,
    subsampleSize: 64,
    contamination: 0.08,
    scoreThreshold: 0.62
  });
  const [hybridConfig, setHybridConfig] = useState<HybridDetectorConfig>({
    logic: 'OR'
  });

  // Detection and experiment run logs
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [runLogs, setRunLogs] = useState<DetectorRunLog[]>([]);

  // Load a preset dataset
  const handleLoadDataset = (id: string) => {
    setDatasetId(id);
    const dataset = getDemoTelemetryDataset(id);
    setDataPoints(dataset.dataPoints);
    setChannels(dataset.channels);
    setDatasetMeta(dataset.meta);
    if (dataset.channels.length > 0) {
      setSelectedChannelId(dataset.channels[0].id);
    }
  };

  // User uploaded CSV handler
  const handleUserCsvLoaded = (result: {
    dataPoints: TelemetryDataPoint[];
    channels: TelemetryChannelMeta[];
    meta: DatasetMeta;
  }) => {
    setDatasetId(result.meta.id);
    setDataPoints(result.dataPoints);
    setChannels(result.channels);
    setDatasetMeta(result.meta);
    if (result.channels.length > 0) {
      setSelectedChannelId(result.channels[0].id);
    }
  };

  // Run the active detector
  const executeDetection = useCallback(() => {
    if (!dataPoints || dataPoints.length === 0) return;

    let res: DetectionResult;
    let detectorName = 'Statistical Z-Score';
    let params = `W=${statConfig.windowSize}, Z=±${statConfig.zThreshold}, k=${statConfig.minConsecutive}`;

    if (activeDetectorType === 'statistical') {
      res = detectStatisticalAnomalies(dataPoints, selectedChannelId, statConfig);
    } else if (activeDetectorType === 'ml') {
      detectorName = 'Isolation Forest';
      params = `Trees=${mlConfig.nTrees}, Contam=${(mlConfig.contamination * 100).toFixed(0)}%, s_crit=${mlConfig.scoreThreshold}`;
      res = detectIsolationForestAnomalies(dataPoints, selectedChannelId, mlConfig);
    } else {
      detectorName = `Hybrid (${hybridConfig.logic})`;
      const statRes = detectStatisticalAnomalies(dataPoints, selectedChannelId, statConfig);
      const mlRes = detectIsolationForestAnomalies(dataPoints, selectedChannelId, mlConfig);
      res = combineHybridAnomalies(statRes, mlRes, hybridConfig.logic, dataPoints.length);
      params = `Stat(W=${statConfig.windowSize}, Z=${statConfig.zThreshold}) ${hybridConfig.logic} iForest(s>${mlConfig.scoreThreshold})`;
    }

    setDetectionResult(res);

    // Calculate metrics and record in experiment log
    const evalMetrics = evaluateDetection(res, dataPoints);
    const newLog: DetectorRunLog = {
      id: `run_${Date.now()}`,
      timestamp: new Date().toISOString(),
      detectorName,
      datasetName: datasetMeta.name,
      channelId: selectedChannelId,
      parameters: params,
      sampleCount: dataPoints.length,
      anomalyCount: res.indices.length,
      metrics: evalMetrics
    };

    setRunLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 runs
  }, [dataPoints, selectedChannelId, activeDetectorType, statConfig, mlConfig, hybridConfig, datasetMeta.name]);

  // Re-run detection when channel or configuration changes
  useEffect(() => {
    executeDetection();
  }, [executeDetection]);

  // Compute live metrics for active detection result
  const activeMetrics: EvaluationMetrics | null = useMemo(() => {
    if (!detectionResult || !dataPoints) return null;
    return evaluateDetection(detectionResult, dataPoints);
  }, [detectionResult, dataPoints]);

  const activeChannel = channels.find(c => c.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* View 1: Mission Simulation (Default Landing Page) */}
        {activeTab === 'simulation' && (
          <MissionSimulationView
            datasetMeta={datasetMeta}
            dataPoints={dataPoints}
            channels={channels}
            onNavigateToData={() => setActiveTab('experiment')}
            onNavigateToHardware={() => setActiveTab('hardware')}
          />
        )}

        {/* View 2: Experiment Data (Telemetry, Detectors, Evaluation, Python Pipeline) */}
        {(activeTab === 'experiment' || activeTab === 'telemetry' || activeTab === 'detection' || activeTab === 'results' || activeTab === 'embedded') && (
          <ExperimentDataView
            dataPoints={dataPoints}
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
            datasetMeta={datasetMeta}
            onLoadDataset={handleLoadDataset}
            onUserCsvLoaded={handleUserCsvLoaded}
            activeDetectorType={activeDetectorType}
            onSelectDetectorType={setActiveDetectorType}
            statConfig={statConfig}
            setStatConfig={setStatConfig}
            mlConfig={mlConfig}
            setMlConfig={setMlConfig}
            hybridConfig={hybridConfig}
            setHybridConfig={setHybridConfig}
            onExecuteRun={executeDetection}
            detectionResult={detectionResult}
            metrics={activeMetrics}
            runLogs={runLogs}
            onClearLogs={() => setRunLogs([])}
            activeDetectorName={
              activeDetectorType === 'statistical'
                ? 'Statistical Z-Score'
                : activeDetectorType === 'ml'
                ? 'Isolation Forest'
                : `Hybrid (${hybridConfig.logic})`
            }
          />
        )}

        {/* View 3: Hardware & Sources (OPS-SAT, Caltech Research, Provenance Ledger) */}
        {(activeTab === 'hardware' || activeTab === 'provenance' || activeTab === 'overview') && (
          <HardwareAndSourcesView />
        )}
      </main>

      {/* 30-Second Quick Tour Modal */}
      <QuickTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Footer with Explicit Disclaimers & Integrity Declarations */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#05080e] py-8 text-xs font-telemetry text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-white font-bold text-sm tracking-wide font-display">
                Autonomous Satellite Fault Detection & Reconfiguration Lab
              </div>
              <div className="text-slate-400 text-xs">
                Educational Engineering Prototype for Student Satellite-Systems Research
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                SOFTWARE-IN-THE-LOOP DEMONSTRATION
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300">
                NOT FLIGHT-QUALIFIED
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                NO TRANSISTOR-LEVEL RECONFIGURATION
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed max-w-5xl border-t border-slate-900 pt-3">
            Hardware specifications are grounded in public European Space Agency (ESA) OPS-SAT documentation. Telemetry anomaly benchmarks reference the curated ESA Anomaly Benchmark (Zenodo 12528696). The Caltech self-healing circuit literature serves as a conceptual inspiration for closed-loop sensing and recovery policies, not a claim of silicon-level reproduction.
          </p>
        </div>
      </footer>
    </div>
  );
}
