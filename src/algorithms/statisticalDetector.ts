/**
 * Statistical Anomaly Detector (Rolling Window Z-Score)
 * Causal streaming implementation for telemetry streams
 */

import { StatisticalDetectorConfig, DetectionResult, TelemetryDataPoint } from '../types';

export function runStatisticalDetector(
  values: (number | null)[],
  config: StatisticalDetectorConfig
): DetectionResult {
  const { windowSize, zThreshold, minConsecutive } = config;
  const n = values.length;

  const zScores: (number | null)[] = new Array(n).fill(null);
  const rollingMean: (number | null)[] = new Array(n).fill(null);
  const rollingStd: (number | null)[] = new Array(n).fill(null);
  const upperBand: (number | null)[] = new Array(n).fill(null);
  const lowerBand: (number | null)[] = new Array(n).fill(null);
  const rawFlags: boolean[] = new Array(n).fill(false);
  const filteredFlags: boolean[] = new Array(n).fill(false);
  const anomalyIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const currentVal = values[i];
    if (currentVal === null || isNaN(currentVal)) {
      continue;
    }

    // Collect preceding window of valid points: [max(0, i - windowSize), i - 1]
    const windowVals: number[] = [];
    for (let j = Math.max(0, i - windowSize); j < i; j++) {
      const v = values[j];
      if (v !== null && !isNaN(v)) {
        windowVals.push(v);
      }
    }

    if (windowVals.length < 3) {
      // Need minimum statistical sample for mean & variance
      rollingMean[i] = currentVal;
      rollingStd[i] = 0;
      upperBand[i] = currentVal;
      lowerBand[i] = currentVal;
      zScores[i] = 0;
      continue;
    }

    const mean = windowVals.reduce((acc, v) => acc + v, 0) / windowVals.length;
    const variance = windowVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (windowVals.length - 1);
    const std = Math.sqrt(variance);

    rollingMean[i] = Number(mean.toFixed(4));
    rollingStd[i] = Number(std.toFixed(4));

    const uBand = mean + zThreshold * std;
    const lBand = mean - zThreshold * std;
    upperBand[i] = Number(uBand.toFixed(4));
    lowerBand[i] = Number(lBand.toFixed(4));

    if (std > 1e-6) {
      const z = (currentVal - mean) / std;
      zScores[i] = Number(z.toFixed(3));
      if (Math.abs(z) >= zThreshold) {
        rawFlags[i] = true;
      }
    } else {
      zScores[i] = 0;
    }
  }

  // Apply Minimum Consecutive Anomalies Filter
  let consecutiveCounter = 0;
  for (let i = 0; i < n; i++) {
    if (rawFlags[i]) {
      consecutiveCounter++;
      if (consecutiveCounter >= minConsecutive) {
        // Confirm this and preceding (minConsecutive - 1) alarms
        for (let k = 0; k < minConsecutive; k++) {
          filteredFlags[i - k] = true;
        }
      }
    } else {
      consecutiveCounter = 0;
    }
  }

  for (let i = 0; i < n; i++) {
    if (filteredFlags[i]) {
      anomalyIndices.push(i);
    }
  }

  return {
    indices: anomalyIndices,
    zScores,
    flags: filteredFlags,
    rollingMean,
    rollingStd,
    upperBand,
    lowerBand
  };
}

export function detectStatisticalAnomalies(
  dataPoints: TelemetryDataPoint[],
  channelId: string,
  config: StatisticalDetectorConfig
): DetectionResult {
  const values = dataPoints.map(p => {
    const val = p[channelId];
    return val !== undefined && val !== null ? Number(val) : null;
  });
  return runStatisticalDetector(values, config);
}

export function combineHybridAnomalies(
  statResult: DetectionResult,
  mlResult: DetectionResult,
  logic: 'OR' | 'AND',
  sampleCount: number
): DetectionResult {
  const flags: boolean[] = new Array(sampleCount).fill(false);
  const indices: number[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const isStat = statResult.flags[i] || false;
    const isMl = mlResult.flags[i] || false;
    const isCombined = logic === 'OR' ? isStat || isMl : isStat && isMl;
    flags[i] = isCombined;
    if (isCombined) {
      indices.push(i);
    }
  }

  return {
    indices,
    flags,
    zScores: statResult.zScores,
    mlScores: mlResult.mlScores,
    rollingMean: statResult.rollingMean,
    rollingStd: statResult.rollingStd,
    upperBand: statResult.upperBand,
    lowerBand: statResult.lowerBand
  };
}
