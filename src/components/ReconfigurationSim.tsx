import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  Flame,
  Compass,
  Radio,
  Cpu,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  GitBranch,
  ShieldAlert
} from 'lucide-react';
import { FaultType, ReconfigPhase, ReconfigStepEvent } from '../types';
import { CaltechInspiration } from './CaltechInspiration';

interface FaultScenarioMeta {
  id: FaultType;
  title: string;
  subsystem: string;
  nominalMetric: string;
  faultMetric: string;
  recoveredMetric: string;
  diagnosisText: string;
  recoveryPolicy: string;
  redundancyPath: string;
}

const FAULT_SCENARIOS: Record<FaultType, FaultScenarioMeta> = {
  power_voltage_drift: {
    id: 'power_voltage_drift',
    title: 'Power Bus Voltage Drift',
    subsystem: 'Power Subsystem (EPS)',
    nominalMetric: 'Bus Voltage: 8.12 V (Nominal)',
    faultMetric: 'Bus Voltage: 6.84 V (Under-voltage Trip)',
    recoveredMetric: 'Bus Voltage: 7.95 V (Regulated on Aux Bus B)',
    diagnosisText: 'EPS Primary Battery Bus Regulator degradation or high internal resistance.',
    recoveryPolicy: 'Isolate Primary Bus A; switch payload rails to Redundant Cross-Strap Bus B; shed non-essential imaging payload.',
    redundancyPath: 'EPS Bus A (Primary) → Isolated; EPS Bus B (Backup) → Active'
  },
  thermal_excursion: {
    id: 'thermal_excursion',
    title: 'SEPP SoC Thermal Excursion',
    subsystem: 'Payload Processing / Thermal',
    nominalMetric: 'SoC Temp: 38.4 °C (Within thermal limits)',
    faultMetric: 'SoC Temp: 61.8 °C (Thermal runaway risk)',
    recoveredMetric: 'SoC Temp: 42.1 °C (Stabilized after throttle)',
    diagnosisText: 'Unconstrained FPGA fabric pipeline or radiative heat dissipation deficit.',
    recoveryPolicy: 'Clock-gate Cyclone V FPGA fabric; throttle Cortex-A9 cores from 800 MHz to 400 MHz; activate passive thermal dump.',
    redundancyPath: 'High-Compute Pipeline → Clock-Gated; Low-Power Core Mode → Active'
  },
  adcs_rate_anomaly: {
    id: 'adcs_rate_anomaly',
    title: 'ADCS Tumble Rate Anomaly',
    subsystem: 'Attitude Determination & Control',
    nominalMetric: 'Angular Rate: 0.12 deg/s (Stable 3-axis nadir)',
    faultMetric: 'Angular Rate: 1.48 deg/s (Rapid uncontrolled spin)',
    recoveredMetric: 'Angular Rate: 0.22 deg/s (Detumbling complete)',
    diagnosisText: 'Reaction wheel tachometer runaway or external aerodynamic disturbance torque.',
    recoveryPolicy: 'Desaturate and safe primary reaction wheels; switch to magnetic B-dot detumbling via 3-axis magnetorquers.',
    redundancyPath: 'Reaction Wheel Stack → Standby; Magnetorquer Coils → B-Dot Active'
  },
  comms_degradation: {
    id: 'comms_degradation',
    title: 'Communications RF Link Degradation',
    subsystem: 'Communications Subsystem',
    nominalMetric: 'S-Band RSSI: -82 dBm (High SNR link)',
    faultMetric: 'S-Band RSSI: -118 dBm (Carrier unlock / drop)',
    recoveredMetric: 'UHF RSSI: -91 dBm (Housekeeping link sustained)',
    diagnosisText: 'S-Band patch antenna misalignment or RF power amplifier driver failure.',
    recoveryPolicy: 'Fallback from high-speed S-Band data downlink to omnidirectional UHF emergency transceiver; broadcast beacon packets.',
    redundancyPath: 'S-Band Transceiver → Standby; UHF Transceiver → Primary Telemetry'
  },
  sensor_dropout: {
    id: 'sensor_dropout',
    title: 'Primary Voltage Sensor Dropout (NaN)',
    subsystem: 'Telemetry & Sensing Unit',
    nominalMetric: 'Primary ADC: 8.15 V (Active Stream)',
    faultMetric: 'Primary ADC: [DROPOUT / STUCK HIGH]',
    recoveredMetric: 'Secondary ADC: 8.08 V (Reconstructed stream)',
    diagnosisText: 'I2C telemetry bus communication lockup or front-end ADC freeze.',
    recoveryPolicy: 'Flag telemetry sensor stream as untrusted; switch health estimator to secondary analog housekeeping line.',
    redundancyPath: 'ADC Channel 1 → Flagged Untrusted; ADC Channel 2 → Active Telemetry'
  },
  processing_seu: {
    id: 'processing_seu',
    title: 'Processing Path Single Event Upset (SEU)',
    subsystem: 'SEPP Computing Platform',
    nominalMetric: 'SEPP Heartbeat: 1 Hz Pulse (OK)',
    faultMetric: 'SEPP Heartbeat: TIMEOUT (Kernel panic / bitflip)',
    recoveredMetric: 'NanoMind Fallback: Flight OS Nominal',
    diagnosisText: 'Radiation-induced single-event latch-up (SEU) in volatile processor cache.',
    recoveryPolicy: 'Trigger hardware power-cycle of SEPP board; NanoMind flight OBC assumes primary telemetry sovereignty.',
    redundancyPath: 'SEPP Linux Platform → Hardware Reset; NanoMind OBC → Safe Commander'
  }
};

export const ReconfigurationSim: React.FC = () => {
  const [selectedFault, setSelectedFault] = useState<FaultType>('power_voltage_drift');
  const [currentPhase, setCurrentPhase] = useState<ReconfigPhase>('nominal');
  const [eventLog, setEventLog] = useState<ReconfigStepEvent[]>([
    {
      phase: 'nominal',
      timestamp: 'T+00.0s',
      message: 'Spacecraft health parameters operating within nominal baseline envelope.',
      subsystem: 'System Overview',
      badge: 'NOMINAL'
    }
  ]);
  const [autoProgress, setAutoProgress] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = FAULT_SCENARIOS[selectedFault];

  // Automated Reconfiguration Step Pipeline:
  // nominal -> fault_active -> detected -> diagnosed -> policy_selected -> reconfiguring -> safe_operating_state
  const injectFault = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentPhase('fault_active');

    const newLogs: ReconfigStepEvent[] = [
      {
        phase: 'fault_active',
        timestamp: 'T+00.0s',
        message: `Simulated fault injected: ${scenario.title}. Current telemetry: ${scenario.faultMetric}`,
        subsystem: scenario.subsystem,
        badge: 'FAULT ACTIVE'
      }
    ];
    setEventLog(newLogs);

    if (autoProgress) {
      // Step 3: Detected (after 1.2s)
      timerRef.current = setTimeout(() => {
        setCurrentPhase('detected');
        setEventLog(prev => [
          {
            phase: 'detected',
            timestamp: 'T+01.2s',
            message: `Detector algorithm flagged anomalous deviation. Z-score/ML threshold exceeded.`,
            subsystem: scenario.subsystem,
            badge: 'Detected'
          },
          ...prev
        ]);

        // Step 4: Diagnosed (after 2.4s)
        timerRef.current = setTimeout(() => {
          setCurrentPhase('diagnosed');
          setEventLog(prev => [
            {
              phase: 'diagnosed',
              timestamp: 'T+02.4s',
              message: `Fault diagnosis isolated affected subsystem: ${scenario.diagnosisText}`,
              subsystem: scenario.subsystem,
              badge: 'Diagnosed'
            },
            ...prev
          ]);

          // Step 5: Policy Selected (after 3.6s)
          timerRef.current = setTimeout(() => {
            setCurrentPhase('policy_selected');
            setEventLog(prev => [
              {
                phase: 'policy_selected',
                timestamp: 'T+03.6s',
                message: `Recovery Policy Selected: ${scenario.recoveryPolicy}`,
                subsystem: 'Reconfig Controller',
                badge: 'Recovery policy selected'
              },
              ...prev
            ]);

            // Step 6: Simulated Reconfiguration (after 4.8s)
            timerRef.current = setTimeout(() => {
              setCurrentPhase('reconfiguring');
              setEventLog(prev => [
                {
                  phase: 'reconfiguring',
                  timestamp: 'T+04.8s',
                  message: `Executing simulated path switch: ${scenario.redundancyPath}`,
                  subsystem: 'Cross-Strap Matrix',
                  badge: 'Simulated reconfiguration'
                },
                ...prev
              ]);

              // Step 7: Safe Operating State (after 6.2s)
              timerRef.current = setTimeout(() => {
                setCurrentPhase('safe_operating_state');
                setEventLog(prev => [
                  {
                    phase: 'safe_operating_state',
                    timestamp: 'T+06.2s',
                    message: `Telemetry stabilized: ${scenario.recoveredMetric}. Spacecraft returned to validated safe operating configuration.`,
                    subsystem: scenario.subsystem,
                    badge: 'Safe operating state'
                  },
                  ...prev
                ]);
              }, 1400);
            }, 1200);
          }, 1200);
        }, 1200);
      }, 1200);
    }
  };

  const resetNominal = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentPhase('nominal');
    setEventLog([
      {
        phase: 'nominal',
        timestamp: 'T+00.0s',
        message: 'Reconfiguration reset: All systems operating on nominal primary paths.',
        subsystem: 'System Overview',
        badge: 'NOMINAL'
      }
    ]);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Determine path active status
  const isRedundantActive = currentPhase === 'reconfiguring' || currentPhase === 'safe_operating_state';
  const isFaulted = currentPhase === 'fault_active' || currentPhase === 'detected' || currentPhase === 'diagnosed';

  return (
    <div className="space-y-6">
      {/* Top Header & Simulation Controls */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-white tracking-wide">
                Autonomous Fault Diagnosis & Reconfiguration Simulation
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                SOFTWARE-IN-THE-LOOP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Closed-loop fault detection, diagnosis, recovery policy evaluation, and simulated cross-strap switching.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetNominal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-telemetry flex items-center gap-1.5 transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Nominal
            </button>
            <button
              onClick={injectFault}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-telemetry font-bold flex items-center gap-1.5 transition shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Inject Simulated Fault
            </button>
          </div>
        </div>

        {/* Fault Selector Options */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-telemetry uppercase tracking-wider">
            SELECT SIMULATED FAULT TO INJECT:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(FAULT_SCENARIOS) as FaultType[]).map((ft) => {
              const meta = FAULT_SCENARIOS[ft];
              const isSelected = selectedFault === ft;
              return (
                <button
                  key={ft}
                  onClick={() => {
                    setSelectedFault(ft);
                    resetNominal();
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs font-sans transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-semibold shadow-sm ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate text-white font-medium text-[11px]">{meta.title}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{meta.subsystem.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mandatory Step-by-Step Reconfiguration Pipeline Status Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-telemetry">
          <span className="text-slate-400 uppercase tracking-wider">Reconfiguration State Pipeline</span>
          <span className="text-cyan-400 font-semibold">
            Active Phase: {currentPhase.toUpperCase().replace(/_/g, ' ')}
          </span>
        </div>

        {/* 5 Distinct Pipeline Stage Badges as Mandated by Prompt */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-telemetry">
          {/* Badge 1: Detected */}
          <div className={`p-2.5 rounded-lg border transition ${
            currentPhase === 'detected' || currentPhase === 'diagnosed' || currentPhase === 'policy_selected' || currentPhase === 'reconfiguring' || currentPhase === 'safe_operating_state'
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] opacity-75">STEP 1</div>
            <div className="text-xs sm:text-sm">Detected</div>
          </div>

          {/* Badge 2: Diagnosed */}
          <div className={`p-2.5 rounded-lg border transition ${
            currentPhase === 'diagnosed' || currentPhase === 'policy_selected' || currentPhase === 'reconfiguring' || currentPhase === 'safe_operating_state'
              ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] opacity-75">STEP 2</div>
            <div className="text-xs sm:text-sm">Diagnosed</div>
          </div>

          {/* Badge 3: Recovery policy selected */}
          <div className={`p-2.5 rounded-lg border transition ${
            currentPhase === 'policy_selected' || currentPhase === 'reconfiguring' || currentPhase === 'safe_operating_state'
              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] opacity-75">STEP 3</div>
            <div className="text-xs sm:text-sm truncate">Recovery policy selected</div>
          </div>

          {/* Badge 4: Simulated reconfiguration */}
          <div className={`p-2.5 rounded-lg border transition ${
            currentPhase === 'reconfiguring' || currentPhase === 'safe_operating_state'
              ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] opacity-75">STEP 4</div>
            <div className="text-xs sm:text-sm truncate">Simulated reconfiguration</div>
          </div>

          {/* Badge 5: Safe operating state */}
          <div className={`p-2.5 rounded-lg border transition col-span-2 sm:col-span-1 ${
            currentPhase === 'safe_operating_state'
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] opacity-75">STEP 5</div>
            <div className="text-xs sm:text-sm">Safe operating state</div>
          </div>
        </div>
      </div>

      {/* Satellite System Architecture Block Diagram with Redundant Paths */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-base font-bold text-white tracking-wide">
              Satellite Cross-Strap Subsystem Block Diagram
            </h3>
          </div>
          <div className="text-xs font-telemetry text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Nominal Path
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Redundant Backup Path
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Faulted Path
            </span>
          </div>
        </div>

        {/* Visual Architecture Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-telemetry">
          {/* Power Subsystem Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            scenario.subsystem.includes('Power')
              ? isFaulted
                ? 'bg-rose-950/30 border-rose-500/80 shadow-md ring-1 ring-rose-500/40'
                : isRedundantActive
                ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md'
                : 'bg-slate-950 border-slate-800'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-slate-400 uppercase">Power Subsystem</span>
            </div>
            <div className="font-display font-semibold text-white text-sm">EPS & Battery</div>
            
            <div className="mt-3 space-y-2 text-[11px]">
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Power') && isFaulted
                  ? 'border-rose-500 bg-rose-950/50 text-rose-300 line-through'
                  : !isRedundantActive
                  ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Primary Bus A: 8.1V Rail
              </div>
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Power') && isRedundantActive
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Aux Bus B (Cross-Strap): Standby
              </div>
            </div>
          </div>

          {/* Thermal Subsystem Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            scenario.subsystem.includes('Thermal')
              ? isFaulted
                ? 'bg-rose-950/30 border-rose-500/80 ring-1 ring-rose-500/40'
                : isRedundantActive
                ? 'bg-emerald-950/30 border-emerald-500/80'
                : 'bg-slate-950 border-slate-800'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] text-slate-400 uppercase">Thermal Subsystem</span>
            </div>
            <div className="font-display font-semibold text-white text-sm">SEPP Thermal Loop</div>
            
            <div className="mt-3 space-y-2 text-[11px]">
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Thermal') && isFaulted
                  ? 'border-rose-500 bg-rose-950/50 text-rose-300'
                  : !isRedundantActive
                  ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500 line-through'
              }`}>
                Primary: Full Clock (800 MHz)
              </div>
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Thermal') && isRedundantActive
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Thermal Throttle: 400 MHz Safe
              </div>
            </div>
          </div>

          {/* ADCS Subsystem Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            scenario.subsystem.includes('Attitude')
              ? isFaulted
                ? 'bg-rose-950/30 border-rose-500/80 ring-1 ring-rose-500/40'
                : isRedundantActive
                ? 'bg-emerald-950/30 border-emerald-500/80'
                : 'bg-slate-950 border-slate-800'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-slate-400 uppercase">ADCS Subsystem</span>
            </div>
            <div className="font-display font-semibold text-white text-sm">Pointing & Stability</div>
            
            <div className="mt-3 space-y-2 text-[11px]">
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Attitude') && isFaulted
                  ? 'border-rose-500 bg-rose-950/50 text-rose-300 line-through'
                  : !isRedundantActive
                  ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Primary: Reaction Wheel Stack
              </div>
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Attitude') && isRedundantActive
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Backup: B-Dot Magnetorquers
              </div>
            </div>
          </div>

          {/* Communications Subsystem Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            scenario.subsystem.includes('Communications')
              ? isFaulted
                ? 'bg-rose-950/30 border-rose-500/80 ring-1 ring-rose-500/40'
                : isRedundantActive
                ? 'bg-emerald-950/30 border-emerald-500/80'
                : 'bg-slate-950 border-slate-800'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] text-slate-400 uppercase">Communications</span>
            </div>
            <div className="font-display font-semibold text-white text-sm">Transceivers</div>
            
            <div className="mt-3 space-y-2 text-[11px]">
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Communications') && isFaulted
                  ? 'border-rose-500 bg-rose-950/50 text-rose-300 line-through'
                  : !isRedundantActive
                  ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Primary: S-Band High Rate
              </div>
              <div className={`p-2 rounded border ${
                scenario.subsystem.includes('Communications') && isRedundantActive
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                Backup: UHF Emergency Beacon
              </div>
            </div>
          </div>
        </div>

        {/* Central Controller Hub: Fault Detector, Reconfig Controller, Safe-Mode Controller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-5 text-xs font-telemetry">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Fault Detector Core
            </div>
            <div className="font-semibold text-white">Continuous Telemetry Monitor</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Samples live telemetric observables, executes Z-score and Isolation Forest detection, and outputs discrete alarm triggers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              Reconfiguration Controller
            </div>
            <div className="font-semibold text-white">Policy Decision Arbiter</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Evaluates fault classification against the onboard recovery policy lookup table. Commands cross-strap switches and power rail relays.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Safe-Mode Controller
            </div>
            <div className="font-semibold text-white">Survival Supervisor</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Monitors watchdog heartbeats. If reconfiguration fails to stabilize health telemetry within 10 seconds, commands transition to Sun-Pointing Safe Mode.
            </p>
          </div>
        </div>
      </div>

      {/* Live Operational Action Log */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 font-telemetry">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Automated Reconfiguration Event Log
          </h3>
          <span className="text-[11px] text-slate-400">
            {eventLog.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {eventLog.map((ev, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-start sm:items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-cyan-300">
                  {ev.badge}
                </span>
                <span className="text-slate-300">{ev.message}</span>
              </div>
              <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                {ev.timestamp} • {ev.subsystem}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Caltech Self-Healing Circuit Research Inspiration Component */}
      <CaltechInspiration />
    </div>
  );
};
