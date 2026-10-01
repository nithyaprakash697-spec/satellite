/**
 * MissionSimulationView.tsx
 * Centerpiece 3D Spacecraft Simulation & Closed-Loop Autonomous Reconfiguration Flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SimTimelineStage,
  FaultType,
  SubsystemId,
  TelemetryDataPoint,
  DatasetMeta,
  TelemetryChannelMeta
} from '../types';
import { Satellite3DView } from './Satellite3DView';
import { SystemArchitectureDiagram } from './SystemArchitectureDiagram';
import {
  SIMULATION_FAULT_SCENARIOS,
  SUBSYSTEM_DEFINITIONS,
  SimulationFaultScenario
} from '../data/simulationScenarios';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Flame,
  Compass,
  Radio,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  Database,
  Cpu,
  ArrowRight,
  Info,
  XCircle,
  Clock,
  Terminal
} from 'lucide-react';

interface MissionSimulationViewProps {
  datasetMeta: DatasetMeta;
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  onNavigateToData: () => void;
  onNavigateToHardware: () => void;
}

export const MissionSimulationView: React.FC<MissionSimulationViewProps> = ({
  datasetMeta,
  dataPoints,
  channels,
  onNavigateToData,
  onNavigateToHardware
}) => {
  // State Machine for the Simulation
  const [stage, setStage] = useState<SimTimelineStage>('nominal');
  const [selectedFaultType, setSelectedFaultType] = useState<FaultType>('power_voltage_drift');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<SubsystemId | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Active scenario model
  const scenario = SIMULATION_FAULT_SCENARIOS[selectedFaultType];

  // Telemetry stream index & live reading simulation
  const [sampleIdx, setSampleIdx] = useState<number>(0);
  const [sparklineValues, setSparklineValues] = useState<number[]>([8.12, 8.11, 8.13, 8.12, 8.10, 8.12, 8.14, 8.12]);

  // Stage timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-progress through the simulation states when running
  useEffect(() => {
    if (isPaused) return;

    if (stage === 'fault_injected') {
      timerRef.current = setTimeout(() => {
        setStage('anomaly_detected');
      }, 3500 / simSpeed);
    } else if (stage === 'anomaly_detected') {
      timerRef.current = setTimeout(() => {
        setStage('diagnosis');
      }, 3500 / simSpeed);
    } else if (stage === 'diagnosis') {
      timerRef.current = setTimeout(() => {
        setStage('reconfiguration');
      }, 4000 / simSpeed);
    } else if (stage === 'reconfiguration') {
      timerRef.current = setTimeout(() => {
        setStage('safe_operation');
      }, 5500 / simSpeed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, isPaused, simSpeed]);

  // Continuous telemetry stream update in nominal / active state
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSampleIdx((prev) => (prev + 1) % (dataPoints.length > 0 ? dataPoints.length : 100));

      // Generate dynamic realistic sparkline based on stage
      setSparklineValues((prev) => {
        let nextVal: number;
        if (stage === 'nominal') {
          nextVal = scenario.nominalStreamVal + (Math.random() - 0.5) * 0.06;
        } else if (stage === 'fault_injected' || stage === 'anomaly_detected') {
          nextVal = scenario.faultStreamVal + (Math.random() - 0.5) * 0.12;
        } else if (stage === 'diagnosis' || stage === 'reconfiguration') {
          // transitioning back
          nextVal = (scenario.faultStreamVal + scenario.recoveredStreamVal) / 2 + (Math.random() - 0.5) * 0.08;
        } else {
          // safe_operation
          nextVal = scenario.recoveredStreamVal + (Math.random() - 0.5) * 0.04;
        }
        return [...prev.slice(1), parseFloat(nextVal.toFixed(2))];
      });
    }, 1200 / simSpeed);

    return () => clearInterval(interval);
  }, [stage, isPaused, simSpeed, scenario, dataPoints.length]);

  // Controls
  const handleInjectFault = (type: FaultType) => {
    setSelectedFaultType(type);
    setSelectedSubsystemId(SIMULATION_FAULT_SCENARIOS[type].affectedSubsystemId);
    setStage('fault_injected');
  };

  const handleResetSimulation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStage('nominal');
    setSelectedSubsystemId(null);
    setIsPaused(false);
  };

  const handleStepForward = () => {
    if (stage === 'nominal') {
      handleInjectFault(selectedFaultType);
    } else if (stage === 'fault_injected') {
      setStage('anomaly_detected');
    } else if (stage === 'anomaly_detected') {
      setStage('diagnosis');
    } else if (stage === 'diagnosis') {
      setStage('reconfiguration');
    } else if (stage === 'reconfiguration') {
      setStage('safe_operation');
    } else {
      setStage('nominal');
    }
  };

  // Status line formatting
  const getStatusLine = () => {
    switch (stage) {
      case 'nominal':
        return { text: 'ALL SYSTEMS NOMINAL', color: 'emerald', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' };
      case 'fault_injected':
        return { text: `FAULT INJECTED: ${scenario.title.toUpperCase()}`, color: 'rose', bg: 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' };
      case 'anomaly_detected':
        return { text: `ANOMALY DETECTED BY ${scenario.detectorTriggered.toUpperCase()}`, color: 'amber', bg: 'bg-amber-500/20 border-amber-500/50 text-amber-300' };
      case 'diagnosis':
        return { text: `DIAGNOSING: ${scenario.subsystemName.toUpperCase()}`, color: 'sky', bg: 'bg-sky-500/20 border-sky-500/50 text-sky-300' };
      case 'reconfiguration':
        return { text: 'AUTONOMOUS RECONFIGURATION: EVALUATING SOFTWARE MODES', color: 'indigo', bg: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' };
      case 'safe_operation':
        return { text: 'AUTONOMOUS RECONFIGURATION VERIFIED: SAFE OPERATING STATE', color: 'emerald', bg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' };
    }
  };

  const status = getStatusLine();
  const selectedConfig = scenario.configOptions.find((c) => c.status === 'selected');

  return (
    <div className="space-y-6">
      {/* 1. TOP MISSION STATUS BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stage === 'nominal' || stage === 'safe_operation' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${stage === 'nominal' || stage === 'safe_operation' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <span className="font-display font-bold text-sm tracking-wider uppercase text-white">
              Spacecraft Mission Simulation
            </span>
          </div>

          <div className={`px-3 py-1 rounded-md text-xs font-telemetry font-semibold border flex items-center gap-2 ${status.bg}`}>
            <span>{status.text}</span>
          </div>
        </div>

        {/* Provenance Badge & Architecture Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-telemetry">
          {/* Source Provenance Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry: <strong className="text-white">{datasetMeta.name.split(' ')[0]}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Fault: <span className="text-amber-300">Simulated</span></span>
            <span className="text-slate-600">|</span>
            <span>Recovery: <span className="text-cyan-300">Software Policy</span></span>
          </div>

          {/* Toggle System Architecture */}
          <button
            onClick={() => setShowArchitecture((prev) => !prev)}
            className={`px-3 py-1 rounded-md border text-xs font-medium transition flex items-center gap-1.5 ${
              showArchitecture
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showArchitecture ? 'Hide Architecture' : 'Show System Architecture'}</span>
          </button>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE OVERLAY DIAGRAM (When toggled) */}
      {showArchitecture && (
        <SystemArchitectureDiagram
          stage={stage}
          faultType={selectedFaultType}
          detectorName={scenario.detectorTriggered}
          selectedConfigName={selectedConfig ? selectedConfig.name : 'Evaluating...'}
        />
      )}

      {/* 2. MAIN 3D SATELLITE CANVAS + CONTEXTUAL OVERLAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Compact Live Subsystems & Telemetry Readout (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live Telemetry Channel Monitor */}
          <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                  Live Telemetry
                </span>
              </div>
              <span className="text-[10px] font-telemetry text-slate-400">
                k={sampleIdx}
              </span>
            </div>

            {/* Active Channel Telemetry Card */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-telemetry">
                <span className="text-slate-400">{scenario.subsystemName.split(' ')[0]} Stream</span>
                <span className="text-cyan-400">{scenario.telemetryChannelId}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-telemetry text-white">
                  {sparklineValues[sparklineValues.length - 1]}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-telemetry ${
                    stage === 'fault_injected' || stage === 'anomaly_detected'
                      ? 'bg-rose-500/20 text-rose-300'
                      : stage === 'safe_operation'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {stage === 'nominal' ? 'NOMINAL' : stage === 'safe_operation' ? 'RESTORED' : 'ANOMALOUS'}
                </span>
              </div>

              {/* Sparkline visualization */}
              <div className="pt-1">
                <div className="h-9 w-full flex items-end gap-1 px-1 py-1 rounded bg-slate-900/60 border border-slate-800/60">
                  {sparklineValues.map((val, idx) => {
                    const min = Math.min(...sparklineValues, scenario.faultStreamVal);
                    const max = Math.max(...sparklineValues, scenario.nominalStreamVal);
                    const range = max - min || 1;
                    const heightPercent = Math.max(15, Math.min(95, ((val - min) / range) * 100));

                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-sm transition-all duration-300 ${
                          stage === 'fault_injected' || stage === 'anomaly_detected'
                            ? 'bg-rose-500'
                            : stage === 'safe_operation'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subsystem Health Matrix */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-telemetry uppercase text-slate-400 tracking-wider">
                Subsystems Status
              </span>
              <div className="space-y-1">
                {SUBSYSTEM_DEFINITIONS.map((sub) => {
                  const isFaultSub = sub.id === scenario.affectedSubsystemId;
                  const isAffected = isFaultSub && stage !== 'nominal' && stage !== 'safe_operation';
                  const isRecovered = isFaultSub && stage === 'safe_operation';
                  const isSelected = sub.id === selectedSubsystemId;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubsystemId(sub.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-telemetry transition text-left border ${
                        isAffected
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                          : isRecovered
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                          : isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAffected
                              ? 'bg-rose-400 animate-ping'
                              : isRecovered
                              ? 'bg-emerald-400'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {isAffected ? 'TRIP' : isRecovered ? 'RECONFIG' : 'OK'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick link to full technical data */}
          <button
            onClick={onNavigateToData}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-telemetry transition flex items-center justify-between"
          >
            <span>Open Quantitative Metrics & CSV</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Center: 3D Satellite Interactive Simulation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Satellite3DView
            stage={stage}
            affectedSubsystemId={stage !== 'nominal' ? scenario.affectedSubsystemId : null}
            selectedSubsystemId={selectedSubsystemId}
            onSelectSubsystem={(id) => setSelectedSubsystemId(id)}
            isPaused={isPaused}
          />

          {/* Educational Concept Banner (Directly under 3D spacecraft) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-medium">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Closed-Loop Software Reconfiguration Principle</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Self-healing in this demonstration means detecting abnormal behavior and selecting a valid operating configuration, task priority, or recovery policy in software. It does <strong>not</strong> mean physically repairing destroyed hardware or magically switching to redundant components.
            </p>
            <p className="text-[10px] text-slate-400 italic">
              Inspired by research on self-healing circuits, where sensing, control, and reconfiguration are used to maintain useful operation after degradation.
            </p>
          </div>
        </div>

        {/* Right Side: Fault Injection & Intelligent Reconfiguration Engine (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Fault Injection Panel */}
          <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                  Inject Fault
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Modeled Scenarios
              </span>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(SIMULATION_FAULT_SCENARIOS) as FaultType[]).map((fType) => {
                const item = SIMULATION_FAULT_SCENARIOS[fType];
                const isSelected = selectedFaultType === fType;

                return (
                  <button
                    key={fType}
                    onClick={() => handleInjectFault(fType)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition border text-xs font-telemetry ${
                      isSelected && stage !== 'nominal'
                        ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-md'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.subsystemName}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reconfiguration Controller & Policy Evaluation Box */}
          <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                  Reconfiguration Engine
                </span>
              </div>
              <span className="text-[10px] font-telemetry text-indigo-300">
                OBC Controller
              </span>
            </div>

            {stage === 'nominal' ? (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white font-display">
                  System Operating Normally
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Select a fault scenario above to observe the closed-loop detection and software reconfiguration process.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Detection Banner */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-telemetry text-slate-400 flex items-center justify-between">
                    <span>Detection Trigger</span>
                    <span className="text-amber-400 font-semibold">{scenario.detectorTriggered}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    {scenario.detectionReason}
                  </div>

                  {/* Expandable Technical Details */}
                  <div>
                    <button
                      onClick={() => setShowTechnicalDetails((prev) => !prev)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-telemetry flex items-center gap-1 pt-1"
                    >
                      <Info className="w-3 h-3" />
                      <span>{showTechnicalDetails ? 'Hide technical scores' : 'Show technical scores'}</span>
                    </button>
                    {showTechnicalDetails && (
                      <div className="mt-1.5 p-2 rounded bg-slate-900 text-[10px] font-telemetry space-y-1 text-slate-400 border border-slate-800">
                        <div>Z-Score: <strong className="text-white">{scenario.zScoreVal}σ</strong> (Threshold: ±2.5σ)</div>
                        <div>iForest Anomaly Score: <strong className="text-white">{scenario.mlScoreVal}</strong> (Threshold: 0.62)</div>
                        <div>Affected Subsystem: <strong className="text-white">{scenario.subsystemName}</strong></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reconfiguration Evaluation Flow */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-telemetry text-slate-400">
                    Evaluating Operating Configurations:
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {scenario.configOptions.map((opt) => {
                      const isEvaluating = stage === 'reconfiguration';
                      const isSelected = opt.status === 'selected';
                      const isRejected = opt.status === 'rejected';

                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            isSelected && (stage === 'reconfiguration' || stage === 'safe_operation')
                              ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200'
                              : isRejected && (stage === 'reconfiguration' || stage === 'safe_operation')
                              ? 'bg-slate-950/60 border-rose-500/30 text-slate-400'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="truncate">{opt.name}</span>
                            {isSelected && (stage === 'reconfiguration' || stage === 'safe_operation') ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-telemetry border border-emerald-500/40">
                                SELECTED
                              </span>
                            ) : isRejected && (stage === 'reconfiguration' || stage === 'safe_operation') ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-telemetry border border-rose-500/30">
                                REJECTED
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-telemetry">
                                EVALUATING
                              </span>
                            )}
                          </div>

                          {isRejected && (stage === 'reconfiguration' || stage === 'safe_operation') && opt.rejectionReason && (
                            <p className="text-[10px] text-rose-400/90 mt-1 leading-snug">
                              {opt.rejectionReason}
                            </p>
                          )}

                          {isSelected && (stage === 'reconfiguration' || stage === 'safe_operation') && (
                            <div className="mt-1.5 pt-1.5 border-t border-emerald-500/30 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-emerald-400">
                                Actions Applied:
                              </span>
                              <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc list-inside">
                                {opt.actionsApplied.map((act, aIdx) => (
                                  <li key={aIdx}>{act}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Outcome Summary */}
                {stage === 'safe_operation' && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reconfiguration Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Telemetry restored to safe boundary. Autonomous mission operations sustained without physical hardware replacement.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM MISSION TIMELINE & SIMULATION CONTROLS */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-xl space-y-4">
        {/* Timeline Sequence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-telemetry">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">
              Mission Simulation Timeline
            </span>
            <span className="text-cyan-400">
              Active Phase: <strong className="text-white">{stage.replace('_', ' ').toUpperCase()}</strong>
            </span>
          </div>

          {/* Step Sequence Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'nominal', label: '1. NOMINAL', desc: 'All Systems Normal' },
              { id: 'fault_injected', label: '2. FAULT INJECTED', desc: 'Anomaly Onset' },
              { id: 'anomaly_detected', label: '3. DETECTED', desc: 'Dual-Stage Filter' },
              { id: 'diagnosis', label: '4. DIAGNOSIS', desc: 'Root Cause Isolation' },
              { id: 'reconfiguration', label: '5. RECONFIG', desc: 'Software Mode Policy' },
              { id: 'safe_operation', label: '6. SAFE STATE', desc: 'Restored Stability' }
            ].map((step, idx) => {
              const isCurrent = stage === step.id;
              const isPast =
                (step.id === 'nominal' && stage !== 'nominal') ||
                (step.id === 'fault_injected' && ['anomaly_detected', 'diagnosis', 'reconfiguration', 'safe_operation'].includes(stage)) ||
                (step.id === 'anomaly_detected' && ['diagnosis', 'reconfiguration', 'safe_operation'].includes(stage)) ||
                (step.id === 'diagnosis' && ['reconfiguration', 'safe_operation'].includes(stage)) ||
                (step.id === 'reconfiguration' && stage === 'safe_operation');

              return (
                <div
                  key={step.id}
                  className={`p-2 rounded-lg border transition-all text-center ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-500/80 text-white ring-1 ring-cyan-500/40 shadow-lg'
                      : isPast
                      ? 'bg-slate-950/80 border-slate-700/60 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
                  }`}
                >
                  <div className="font-display font-bold text-xs">
                    {step.label}
                  </div>
                  <div className="text-[10px] font-telemetry text-slate-400 truncate mt-0.5">
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playback Controls & Simulation Speed */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleStepForward}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition border border-slate-700"
              title="Advance to next simulation phase"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Step Forward</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition border border-slate-700"
              title="Reset simulation to nominal baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs font-telemetry">
            <span className="text-slate-400">Speed:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  simSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
