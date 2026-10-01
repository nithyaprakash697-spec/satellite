/**
 * Autonomous Satellite Fault Detection & Reconfiguration Lab
 * Core Data Models and Types
 */

export type ProvenanceBadgeType = 'VERIFIED SOURCE' | 'USER DATA' | 'SIMULATED' | 'ASSUMPTION';

export interface TelemetryChannelMeta {
  id: string;
  name: string;
  subsystem: string;
  unit: string | null; // null if unit not provided, strictly following instructions
  nominalRange: [number, number];
  description: string;
}

export interface TelemetryDataPoint {
  timestamp: string;
  timeSec: number;
  // Dynamic channel readings
  [channelId: string]: number | string | boolean | null | undefined;
  // Optional ground truth label
  anomaly_label?: number | null; // 1 = anomaly, 0 = normal, null = unavailable
  // Machine learning precomputed score if present
  ml_anomaly_score?: number | null;
  // Train or test flag if provided
  is_train?: boolean | null;
}

export interface DatasetMeta {
  id: string;
  name: string;
  organization: string;
  sourceUrl: string;
  type: 'illustrative' | 'real_subset' | 'user_uploaded';
  labelsType: 'source-provided' | 'injected-user' | 'none';
  dateAccessed?: string;
  limitations: string;
  rowsCount: number;
  channelsCount: number;
  timeRange: string;
  missingCount: number;
  hasGroundTruthLabels: boolean;
}

export interface HardwareSubsystemInfo {
  id: string;
  category: string;
  title: string;
  documentedSpecs: string[];
  sourceTitle: string;
  sourceUrl: string;
  opsSatRole: string;
  notes?: string;
}

export interface StatisticalDetectorConfig {
  windowSize: number;
  zThreshold: number;
  minConsecutive: number;
}

export interface IsolationForestConfig {
  contamination: number; // expected proportion of anomalies, e.g. 0.05
  nTrees: number;        // number of isolation trees
  subsampleSize: number; // samples per tree (e.g. 64 or 128)
  scoreThreshold: number;// anomaly threshold (standard is 0.6)
}

export interface HybridDetectorConfig {
  logic: 'OR' | 'AND';
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falseAlarmRate: number; // FPR: FP / (FP + TN)
  missRate: number;       // FNR: FN / (FN + TP)
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  detectionLatencySamples: number | null;
  detectionLatencySec: number | null;
  totalEvaluated: number;
}

export interface DetectorRunLog {
  id: string;
  timestamp: string;
  datasetName: string;
  channelId: string;
  detectorName: string;
  parameters: string;
  sampleCount: number;
  anomalyCount: number;
  metrics: EvaluationMetrics | null;
}

export interface DetectionResult {
  indices: number[];
  zScores?: (number | null)[];
  mlScores?: (number | null)[];
  flags: boolean[];
  rollingMean?: (number | null)[];
  rollingStd?: (number | null)[];
  upperBand?: (number | null)[];
  lowerBand?: (number | null)[];
}

export type FaultType = 
  | 'power_voltage_drift'
  | 'thermal_excursion'
  | 'adcs_rate_anomaly'
  | 'comms_degradation'
  | 'sensor_dropout'
  | 'processing_seu';

export type ReconfigPhase = 
  | 'nominal'
  | 'fault_active'
  | 'detected'
  | 'diagnosed'
  | 'policy_selected'
  | 'reconfiguring'
  | 'safe_operating_state';

export interface ReconfigStepEvent {
  phase: ReconfigPhase;
  timestamp: string;
  message: string;
  subsystem: string;
  badge: string;
}

export type SimTimelineStage = 
  | 'nominal'
  | 'fault_injected'
  | 'anomaly_detected'
  | 'diagnosis'
  | 'reconfiguration'
  | 'safe_operation';

export interface SoftwareConfigOption {
  id: string;
  name: string;
  category: 'nominal' | 'reduced_power' | 'comms_rate' | 'sensor_adjustment' | 'task_priority' | 'safe_mode';
  description: string;
  status: 'pending' | 'evaluating' | 'rejected' | 'selected';
  rejectionReason?: string;
  actionsApplied: string[];
}

export type SubsystemId = 
  | 'eps'
  | 'battery'
  | 'obc'
  | 'adcs'
  | 'comms'
  | 'thermal'
  | 'payload'
  | 'solar';

export interface SubsystemStatusInfo {
  id: SubsystemId;
  name: string;
  health: 'nominal' | 'affected' | 'reconfiguring' | 'recovered';
  metricLabel: string;
  metricValue: string;
  description: string;
  position3D: [number, number, number];
}

export interface EvidenceItem {
  id: string;
  category: ProvenanceBadgeType;
  title: string;
  summary: string;
  details: string;
  sourceUrl?: string;
  citationLabel?: string;
}
