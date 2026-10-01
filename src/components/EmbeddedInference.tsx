import React, { useState, useMemo } from 'react';
import { Terminal, Code, Cpu, ShieldAlert, Play, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

const DEFAULT_CPP_CODE = `/**
 * Embedded Flight Telemetry Anomaly Inference Stub
 * Reference Target: ARM Cortex-A9 / FreeRTOS or Linux SEPP
 * 
 * NOTE: This is an example embedded interface for demonstration purposes,
 * not an official or proprietary ESA OPS-SAT flight-software API.
 */

#include <stdint.h>
#include <stdbool.h>

// Bounded threshold parameters calibrated from nominal flight telemetry
#define VOLTAGE_MIN_CRIT   7.15f  // Under-voltage trip point (Volts)
#define VOLTAGE_MAX_CRIT   8.45f  // Over-voltage threshold (Volts)
#define TEMP_MAX_CRIT      52.0f  // SEPP SoC thermal excursion limit (deg C)
#define ADCS_RATE_MAX_CRIT 0.85f  // Tumble angular rate threshold (deg/s)
#define COMMS_RSSI_MIN     -112.0f// Link budget drop limit (dBm)

/**
 * Executes a deterministic bounded anomaly inference step.
 * Returns:
 *   0: Nominal state
 *   1: Critical Subsystem Anomaly Flagged
 */
int detect_anomaly(float voltage,
                   float temperature,
                   float adcs_rate,
                   float comms_rssi) 
{
    // Causal rule 1: Voltage bus out of safe battery bounds
    if (voltage < VOLTAGE_MIN_CRIT || voltage > VOLTAGE_MAX_CRIT) {
        return 1; // Power system excursion
    }

    // Causal rule 2: Thermal runaway on payload SEPP SoC
    if (temperature > TEMP_MAX_CRIT) {
        return 1; // Thermal excursion
    }

    // Causal rule 3: ADCS rate runaway (loss of 3-axis pointing)
    if (adcs_rate > ADCS_RATE_MAX_CRIT) {
        return 1; // Attitude instability
    }

    // Causal rule 4: Severe RF signal loss during nominal pass window
    if (comms_rssi < COMMS_RSSI_MIN) {
        return 1; // RF link margin violation
    }

    return 0; // Nominal telemetry vector
}
`;

export const EmbeddedInference: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_CPP_CODE);
  const [voltage, setVoltage] = useState<number>(7.65);
  const [temperature, setTemperature] = useState<number>(36.2);
  const [adcsRate, setAdcsRate] = useState<number>(0.12);
  const [commsRssi, setCommsRssi] = useState<number>(-96.0);
  const [runCount, setRunCount] = useState<number>(0);
  const [executionTimestamp, setExecutionTimestamp] = useState<string | null>(null);

  // Deterministic reference simulation execution
  const inferenceOutput = useMemo(() => {
    // Run evaluation matching the example C/C++ interface
    const v = voltage;
    const t = temperature;
    const rate = adcsRate;
    const rssi = commsRssi;

    let flag = 0;
    const triggerReasons: string[] = [];

    if (v < 7.15 || v > 8.45) {
      flag = 1;
      triggerReasons.push(`Bus Voltage (${v.toFixed(2)} V) violates safe limits [7.15 V, 8.45 V]`);
    }

    if (t > 52.0) {
      flag = 1;
      triggerReasons.push(`Temperature (${t.toFixed(1)} °C) exceeds critical ceiling (52.0 °C)`);
    }

    if (rate > 0.85) {
      flag = 1;
      triggerReasons.push(`ADCS rate (${rate.toFixed(2)} deg/s) indicates uncontrolled tumble (> 0.85 deg/s)`);
    }

    if (rssi < -112.0) {
      flag = 1;
      triggerReasons.push(`Receiver RSSI (${rssi.toFixed(1)} dBm) dropped below link margin (-112.0 dBm)`);
    }

    return {
      returnCode: flag,
      triggerReasons,
      isAnomaly: flag === 1,
      subsystemAttributed: v < 7.15 || v > 8.45 ? 'Power (EPS)' : t > 52.0 ? 'Thermal / SEPP' : rate > 0.85 ? 'ADCS' : rssi < -112.0 ? 'Comms' : 'None (Nominal)'
    };
  }, [voltage, temperature, adcsRate, commsRssi, runCount]);

  const handleExecute = () => {
    setRunCount(prev => prev + 1);
    setExecutionTimestamp(new Date().toISOString().split('T')[1].slice(0, 8) + ' UTC');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context Description */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-lg font-bold text-white tracking-wide">
              Embedded Inference / Onboard Computing
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-telemetry bg-slate-800 text-slate-300 border border-slate-700">
            ARM Cortex-A9 / Linux SEPP Concept
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          In spacecraft operations, models trained in high-resource Python environments must be translated into deterministic, static-memory C/C++ routines for embedded execution on the flight computer or payload processor.
        </p>

        {/* Explicit Warning & Non-Claims Label */}
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Reference execution / browser simulation — not native flight software execution.</strong>{' '}
            Arbitrary uploaded code is safely displayed and evaluated via deterministic JavaScript reference logic. The C/C++ interface shown is an educational example, not an official ESA OPS-SAT flight-software API.
          </span>
        </div>
      </div>

      {/* 3-Tier Architecture Comparison: Python vs Embedded C vs Flight Software */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="text-cyan-400 font-bold font-telemetry text-[11px] uppercase">
            1. Offline Python Research
          </div>
          <h4 className="font-display font-semibold text-white">Scikit-Learn / PyTorch</h4>
          <ul className="space-y-1 text-slate-400 text-[11px]">
            <li>• Unbounded dynamic heap allocations</li>
            <li>• Rich matrix libraries (NumPy, SciPy)</li>
            <li>• High float64 precision compute</li>
            <li>• Non-deterministic garbage collection</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/30 space-y-2">
          <div className="text-indigo-400 font-bold font-telemetry text-[11px] uppercase">
            2. C/C++ Embedded Inference
          </div>
          <h4 className="font-display font-semibold text-white">Targeted Micro-Kernel</h4>
          <ul className="space-y-1 text-slate-300 text-[11px]">
            <li>• Zero runtime heap allocations (malloc)</li>
            <li>• Bounded, deterministic execution time</li>
            <li>• Fixed static memory arrays & lookup trees</li>
            <li>• Compiles directly for ARM Cortex-A9 / RISC-V</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="text-amber-400 font-bold font-telemetry text-[11px] uppercase">
            3. Satellite Flight Software
          </div>
          <h4 className="font-display font-semibold text-white">NanoMind / FreeRTOS / Yocto</h4>
          <ul className="space-y-1 text-slate-400 text-[11px]">
            <li>• Strict hardware watchdog timers (e.g. 500ms)</li>
            <li>• Fault containment & radiation SEU scrubbers</li>
            <li>• Telecommand & telemetry packet integration</li>
            <li>• Safe-mode state transitions</li>
          </ul>
        </div>
      </div>

      {/* Code Editor & Live Inference Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Viewer / Editor */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="font-telemetry text-xs font-bold text-white uppercase">
                C/C++ Inference Kernel (detect_anomaly.c)
              </span>
            </div>
            <button
              onClick={() => setCode(DEFAULT_CPP_CODE)}
              className="text-[11px] font-telemetry text-slate-400 hover:text-slate-200 transition"
            >
              Reset Example
            </button>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full bg-[#060a12] border border-slate-800 rounded-lg p-3 text-xs font-telemetry text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed resize-y"
            />
          </div>

          <div className="text-[11px] text-slate-400">
            You can inspect or adapt the C/C++ interface. The reference simulation below executes the deterministic verification loop in real-time.
          </div>
        </div>

        {/* Right: Feature Input Sliders & Deterministic Reference Execution */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="font-telemetry text-xs font-bold text-white uppercase">
              Simulated Telemetry Vector Input
            </div>
            <span className="text-[11px] font-telemetry text-slate-400">
              {executionTimestamp || 'Ready'}
            </span>
          </div>

          <div className="space-y-3 font-telemetry text-xs">
            {/* Voltage slider */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-300">voltage:</span>
                <span className={`font-bold ${voltage < 7.15 || voltage > 8.45 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {voltage.toFixed(2)} V
                </span>
              </div>
              <input
                type="range"
                min="6.5"
                max="9.0"
                step="0.05"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full accent-cyan-400 mt-1 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Nominal: [7.2V - 8.4V]</span>
            </div>

            {/* Temperature slider */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-300">temperature:</span>
                <span className={`font-bold ${temperature > 52.0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {temperature.toFixed(1)} °C
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-cyan-400 mt-1 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Nominal: [20°C - 50°C]</span>
            </div>

            {/* ADCS rate slider */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-300">adcs_rate:</span>
                <span className={`font-bold ${adcsRate > 0.85 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {adcsRate.toFixed(2)} deg/s
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="2.0"
                step="0.02"
                value={adcsRate}
                onChange={(e) => setAdcsRate(Number(e.target.value))}
                className="w-full accent-cyan-400 mt-1 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Nominal: &lt; 0.50 deg/s</span>
            </div>

            {/* Comms RSSI slider */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-300">comms_rssi:</span>
                <span className={`font-bold ${commsRssi < -112.0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {commsRssi.toFixed(1)} dBm
                </span>
              </div>
              <input
                type="range"
                min="-125"
                max="-70"
                step="1"
                value={commsRssi}
                onChange={(e) => setCommsRssi(Number(e.target.value))}
                className="w-full accent-cyan-400 mt-1 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Nominal: &gt; -110 dBm</span>
            </div>
          </div>

          <button
            onClick={handleExecute}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-telemetry font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Evaluate detect_anomaly() Step
          </button>

          {/* Execution Result Box */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-telemetry text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase">Return Code:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                inferenceOutput.returnCode === 0
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950 border border-rose-500/50 text-rose-300'
              }`}>
                {inferenceOutput.returnCode} {inferenceOutput.returnCode === 0 ? '(NOMINAL)' : '(ANOMALY DETECTED)'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span className="text-slate-400">Diagnosis Attribution:</span>
              <span className="text-white font-semibold">{inferenceOutput.subsystemAttributed}</span>
            </div>

            {inferenceOutput.triggerReasons.length > 0 && (
              <div className="border-t border-slate-800/80 pt-2 space-y-1">
                <span className="text-rose-400 font-semibold text-[11px]">Active Trip Condition:</span>
                {inferenceOutput.triggerReasons.map((reason, idx) => (
                  <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                    <span className="text-rose-400">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
