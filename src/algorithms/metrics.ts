/**
 * Evaluation Metrics & Verification Protocol
 * Strictly computes metrics ONLY when ground-truth labels exist.
 */

import { EvaluationMetrics, TelemetryDataPoint, DetectionResult } from '../types';

export function calculateEvaluationMetrics(
  predictedFlags: boolean[],
  dataPoints: TelemetryDataPoint[]
): EvaluationMetrics | null {
  const n = dataPoints.length;
  if (n === 0 || predictedFlags.length !== n) return null;

  // Check if ground truth labels exist
  const labeledPoints = dataPoints.filter(
    p => p.anomaly_label !== undefined && p.anomaly_label !== null
  );

  // If fewer than 5% labeled points or no ground truth, return null
  if (labeledPoints.length === 0) {
    return null;
  }

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (let i = 0; i < n; i++) {
    const label = dataPoints[i].anomaly_label;
    if (label === undefined || label === null) continue;

    const actual = label === 1;
    const pred = predictedFlags[i];

    if (actual && pred) tp++;
    else if (!actual && pred) fp++;
    else if (!actual && !pred) tn++;
    else if (actual && !pred) fn++;
  }

  const total = tp + fp + tn + fn;
  if (total === 0) return null;

  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const falseAlarmRate = fp + tn > 0 ? fp / (fp + tn) : 0;
  const missRate = fn + tp > 0 ? fn / (fn + tp) : 0;

  // Compute detection latency on first anomaly segment
  let detectionLatencySamples: number | null = null;
  let detectionLatencySec: number | null = null;

  // Find contiguous anomaly intervals in ground truth
  let inSegment = false;
  let segStart = -1;

  for (let i = 0; i < n; i++) {
    const isAnom = dataPoints[i].anomaly_label === 1;
    if (isAnom && !inSegment) {
      inSegment = true;
      segStart = i;
      // Look for first predicted flag in this segment
      for (let j = segStart; j < n; j++) {
        if (dataPoints[j].anomaly_label !== 1) break;
        if (predictedFlags[j]) {
          detectionLatencySamples = j - segStart;
          const dt = (dataPoints[j].timeSec || j * 60) - (dataPoints[segStart].timeSec || segStart * 60);
          detectionLatencySec = Math.max(0, dt);
          break;
        }
      }
      break; // Evaluate primary onset segment
    } else if (!isAnom && inSegment) {
      inSegment = false;
    }
  }

  return {
    accuracy: Number(accuracy.toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1Score: Number(f1Score.toFixed(4)),
    falseAlarmRate: Number(falseAlarmRate.toFixed(4)),
    missRate: Number(missRate.toFixed(4)),
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    detectionLatencySamples,
    detectionLatencySec,
    totalEvaluated: total
  };
}

export function evaluateDetection(
  result: DetectionResult | null,
  dataPoints: TelemetryDataPoint[]
): EvaluationMetrics | null {
  if (!result || !result.flags) return null;
  return calculateEvaluationMetrics(result.flags, dataPoints);
}
