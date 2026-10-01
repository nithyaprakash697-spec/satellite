/**
 * SystemArchitectureDiagram.tsx
 * Visual process flow graph:
 * Sensors / Telemetry → Onboard Computer → Fault Detection → Fault Diagnosis →
 * Reconfiguration Controller → Selected Operating Configuration → Telemetry Verification
 */

import React from 'react';
import { SimTimelineStage, FaultType } from '../types';
import { Activity, Cpu, Search, AlertOctagon, RefreshCw, CheckCircle2, ShieldCheck, ArrowDown } from 'lucide-react';

interface SystemArchitectureDiagramProps {
  stage: SimTimelineStage;
  faultType: FaultType;
  detectorName: string;
  selectedConfigName: string;
  className?: string;
}

export const SystemArchitectureDiagram: React.FC<SystemArchitectureDiagramProps> = ({
  stage,
  faultType,
  detectorName,
  selectedConfigName,
  className = ''
}) => {
  // Determine which nodes are active based on the simulation stage
  const isTelemetryActive = stage !== 'nominal' || true;
  const isObcActive = stage !== 'nominal';
  const isDetectionActive = stage === 'anomaly_detected' || stage === 'diagnosis' || stage === 'reconfiguration' || stage === 'safe_operation';
  const isDiagnosisActive = stage === 'diagnosis' || stage === 'reconfiguration' || stage === 'safe_operation';
  const isReconfigActive = stage === 'reconfiguration' || stage === 'safe_operation';
  const isSelectedConfigActive = stage === 'reconfiguration' || stage === 'safe_operation';
  const isVerificationActive = stage === 'safe_operation';

  const nodes = [
    {
      id: 'telemetry',
      label: 'Sensors / Telemetry',
      sublabel: 'Raw In-Flight Streams',
      icon: Activity,
      isActive: isTelemetryActive,
      isAlert: stage === 'fault_injected',
      color: 'cyan'
    },
    {
      id: 'obc',
      label: 'Onboard Computer',
      sublabel: 'AV-IO & Memory Bus',
      icon: Cpu,
      isActive: isObcActive,
      isAlert: false,
      color: 'sky'
    },
    {
      id: 'detection',
      label: 'Fault Detection',
      sublabel: detectorName,
      icon: Search,
      isActive: isDetectionActive,
      isAlert: stage === 'anomaly_detected',
      color: 'amber'
    },
    {
      id: 'diagnosis',
      label: 'Fault Diagnosis',
      sublabel: 'Root Cause Isolation',
      icon: AlertOctagon,
      isActive: isDiagnosisActive,
      isAlert: false,
      color: 'rose'
    },
    {
      id: 'controller',
      label: 'Reconfiguration Controller',
      sublabel: 'Evaluating Valid Modes',
      icon: RefreshCw,
      isActive: isReconfigActive,
      isAlert: false,
      color: 'indigo'
    },
    {
      id: 'config',
      label: 'Selected Operating Config',
      sublabel: selectedConfigName,
      icon: ShieldCheck,
      isActive: isSelectedConfigActive,
      isAlert: false,
      color: 'emerald'
    },
    {
      id: 'verification',
      label: 'Telemetry Verification',
      sublabel: 'Nominal Band Restored',
      icon: CheckCircle2,
      isActive: isVerificationActive,
      isAlert: false,
      color: 'emerald'
    }
  ];

  return (
    <div className={`bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-display font-bold text-white tracking-wide uppercase">
            Closed-Loop Autonomy Architecture
          </span>
          <p className="text-[10px] text-slate-400 font-telemetry">
            Software-in-the-loop sensing, evaluation & reconfiguration flow
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-telemetry uppercase bg-slate-900 border border-slate-700 text-cyan-300">
          STAGE: {stage.replace('_', ' ')}
        </span>
      </div>

      {/* Vertical / Horizontal Process Nodes with Directional Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
        {nodes.map((node, idx) => {
          const Icon = node.icon;

          return (
            <React.Fragment key={node.id}>
              {/* Process Node */}
              <div
                className={`relative flex flex-col items-center text-center p-2.5 rounded-lg border transition-all duration-300 ${
                  node.isAlert
                    ? 'bg-rose-500/15 border-rose-500/80 text-rose-300 ring-2 ring-rose-500/30'
                    : node.isActive
                    ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                {/* Status Dot */}
                <div
                  className={`w-2 h-2 rounded-full mb-1.5 ${
                    node.isAlert
                      ? 'bg-rose-500 animate-ping'
                      : node.isActive
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-400'
                      : 'bg-slate-700'
                  }`}
                />

                <div className="p-1.5 rounded-md bg-slate-800/50 mb-1">
                  <Icon className={`w-4 h-4 ${node.isAlert ? 'text-rose-400' : node.isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>

                <span className="font-display text-[11px] font-semibold text-slate-100 leading-tight">
                  {node.label}
                </span>

                <span className="text-[9px] font-telemetry text-slate-400 mt-0.5 truncate max-w-full px-1">
                  {node.sublabel}
                </span>
              </div>

              {/* Connector Arrow (if not last) */}
              {idx < nodes.length - 1 && (
                <div className="hidden md:flex justify-center items-center">
                  <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14m-5-5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={node.isActive ? 'stroke-cyan-500 animate-pulse' : 'stroke-slate-700'}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
