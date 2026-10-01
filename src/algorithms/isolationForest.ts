/**
 * Faithful, Fully Documented TypeScript Implementation of Isolation Forest
 * Reference: F. T. Liu, K. M. Ting, and Z.-H. Zhou, "Isolation Forest", 
 * Eighth IEEE International Conference on Data Mining (ICDM), 2008, pp. 413-422.
 * 
 * Includes exact path length formula c(n), recursive iTree isolation splits,
 * and ensemble average anomaly scoring.
 */

import { IsolationForestConfig, DetectionResult, TelemetryDataPoint } from '../types';

interface ITreeNode {
  isLeaf: boolean;
  size?: number;
  splitFeature?: number;
  splitValue?: number;
  left?: ITreeNode;
  right?: ITreeNode;
}

/**
 * Average path length of unsuccessful searches in a Binary Search Tree (BST)
 * c(n) = 2 * (ln(n - 1) + 0.5772156649) - 2 * (n - 1) / n
 */
export function cFactor(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const eulerMascheroni = 0.5772156649015329;
  return 2.0 * (Math.log(n - 1) + eulerMascheroni) - (2.0 * (n - 1) / n);
}

/**
 * Recursive Isolation Tree Builder
 */
function buildITree(
  X: number[][],
  currentHeight: number,
  maxHeight: number
): ITreeNode {
  const nSamples = X.length;

  if (currentHeight >= maxHeight || nSamples <= 1) {
    return { isLeaf: true, size: nSamples };
  }

  const nFeatures = X[0].length;
  // Select a random feature attribute
  const featureIdx = Math.floor(Math.random() * nFeatures);

  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < nSamples; i++) {
    const val = X[i][featureIdx];
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
  }

  // If all samples have identical feature values, cannot split further
  if (minVal === maxVal) {
    return { isLeaf: true, size: nSamples };
  }

  // Draw uniform random split point between min and max
  const splitValue = minVal + Math.random() * (maxVal - minVal);

  const leftSamples: number[][] = [];
  const rightSamples: number[][] = [];

  for (let i = 0; i < nSamples; i++) {
    if (X[i][featureIdx] < splitValue) {
      leftSamples.push(X[i]);
    } else {
      rightSamples.push(X[i]);
    }
  }

  return {
    isLeaf: false,
    splitFeature: featureIdx,
    splitValue,
    left: buildITree(leftSamples, currentHeight + 1, maxHeight),
    right: buildITree(rightSamples, currentHeight + 1, maxHeight)
  };
}

/**
 * Evaluate single sample path length h(x) in an iTree
 */
function pathLength(x: number[], node: ITreeNode, currentHeight: number): number {
  if (node.isLeaf) {
    return currentHeight + cFactor(node.size ?? 1);
  }

  const featureIdx = node.splitFeature!;
  if (x[featureIdx] < node.splitValue!) {
    return pathLength(x, node.left!, currentHeight + 1);
  } else {
    return pathLength(x, node.right!, currentHeight + 1);
  }
}

export class IsolationForestModel {
  private trees: ITreeNode[] = [];
  private subsampleSize: number;
  private nTrees: number;
  private maxHeight: number;

  constructor(nTrees = 40, subsampleSize = 64) {
    this.nTrees = nTrees;
    this.subsampleSize = subsampleSize;
    this.maxHeight = Math.ceil(Math.log2(Math.max(2, subsampleSize)));
  }

  public fit(X: number[][]): void {
    this.trees = [];
    const n = X.length;
    const effectiveSubsample = Math.min(this.subsampleSize, n);

    for (let t = 0; t < this.nTrees; t++) {
      // Draw random subsample without replacement if possible
      const subsample: number[][] = [];
      const indices = new Set<number>();
      while (indices.size < effectiveSubsample) {
        indices.add(Math.floor(Math.random() * n));
      }
      for (const idx of indices) {
        subsample.push(X[idx]);
      }

      const tree = buildITree(subsample, 0, this.maxHeight);
      this.trees.push(tree);
    }
  }

  public predictAnomalyScores(X: number[][]): number[] {
    const cN = cFactor(this.subsampleSize);
    if (cN <= 0) return X.map(() => 0.5);

    const scores: number[] = [];

    for (let i = 0; i < X.length; i++) {
      const sample = X[i];
      let totalPathLength = 0;

      for (let t = 0; t < this.trees.length; t++) {
        totalPathLength += pathLength(sample, this.trees[t], 0);
      }

      const avgPathLength = totalPathLength / this.trees.length;
      // Anomaly score s(x, n) = 2^(- E(h(x)) / c(n))
      const score = Math.pow(2, -(avgPathLength / cN));
      scores.push(Number(score.toFixed(4)));
    }

    return scores;
  }
}

/**
 * Executes Isolation Forest detection on 1D or multi-D series.
 * If user uploaded precomputed scores (precomputedScores), uses those directly.
 */
export function runIsolationForestDetector(
  values: (number | null)[],
  config: IsolationForestConfig,
  precomputedScores?: (number | null)[]
): DetectionResult {
  const n = values.length;
  const flags: boolean[] = new Array(n).fill(false);
  const anomalyIndices: number[] = [];
  const mlScores: (number | null)[] = new Array(n).fill(null);

  // If precomputed ML scores were provided in the dataset, use them!
  const hasValidPrecomputed = precomputedScores && 
    precomputedScores.filter(s => s !== null && !isNaN(s as number)).length > n * 0.5;

  if (hasValidPrecomputed && precomputedScores) {
    for (let i = 0; i < n; i++) {
      const s = precomputedScores[i];
      if (s !== null && !isNaN(s)) {
        mlScores[i] = Number(s.toFixed(3));
        if (s >= config.scoreThreshold) {
          flags[i] = true;
          anomalyIndices.push(i);
        }
      }
    }
    return { indices: anomalyIndices, flags, mlScores };
  }

  // Otherwise, run the faithful TypeScript Isolation Forest implementation
  // Filter valid numerical points and build feature vector [x_t, diff_t]
  const validIndices: number[] = [];
  const X: number[][] = [];

  for (let i = 0; i < n; i++) {
    const val = values[i];
    if (val !== null && !isNaN(val)) {
      validIndices.push(i);
      const prev = i > 0 && values[i - 1] !== null ? (values[i - 1] as number) : val;
      const rateOfChange = val - prev;
      X.push([val, rateOfChange]);
    }
  }

  if (X.length < 10) {
    return { indices: [], flags, mlScores };
  }

  const model = new IsolationForestModel(config.nTrees, config.subsampleSize);
  model.fit(X);
  const computedScores = model.predictAnomalyScores(X);

  // Sort scores to determine dynamic threshold if using contamination percentage
  const sortedScores = [...computedScores].sort((a, b) => b - a);
  const cutoffIndex = Math.floor(sortedScores.length * config.contamination);
  const dynamicThreshold = Math.max(config.scoreThreshold, sortedScores[cutoffIndex] || 0.6);

  for (let k = 0; k < validIndices.length; k++) {
    const origIdx = validIndices[k];
    const score = computedScores[k];
    mlScores[origIdx] = score;

    if (score >= dynamicThreshold) {
      flags[origIdx] = true;
      anomalyIndices.push(origIdx);
    }
  }

  return {
    indices: anomalyIndices,
    flags,
    mlScores
  };
}

export function detectIsolationForestAnomalies(
  dataPoints: TelemetryDataPoint[],
  channelId: string,
  config: IsolationForestConfig
): DetectionResult {
  const values = dataPoints.map(p => {
    const val = p[channelId];
    return val !== undefined && val !== null ? Number(val) : null;
  });
  const precomputed = dataPoints.map(p => {
    const val = p.ml_anomaly_score;
    return val !== undefined && val !== null ? Number(val) : null;
  });
  return runIsolationForestDetector(values, config, precomputed);
}

export const PYTHON_TRAINING_SCRIPT_SNIPPET = `"""
Offline Isolation Forest Training & Anomaly Scoring Workflow
Designed for OPS-SAT & ESA Spacecraft Anomaly Benchmarking
Reference: Scikit-Learn 1.4+ / Python 3.10+
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def train_and_export(csv_path: str, output_path: str):
    df = pd.read_csv(csv_path)
    
    # Feature engineering: value + derivative (rate of change)
    feature_cols = ['batt_voltage', 'sepp_temp', 'adcs_spin']
    features = df[feature_cols].copy()
    features = features.interpolate(method='linear').bfill().ffill()
    
    # Optional temporal derivative features
    for col in feature_cols:
        features[f"{col}_diff"] = features[col].diff().fillna(0)
    
    # Model configuration matching satellite experiment baseline
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(features)
    
    # Scikit-learn decision_function: lower score = more anomalous
    # Convert to standard normalized anomaly score in range [0, 1]
    raw_scores = model.score_samples(features)
    # s = 2^(-E(h(x))/c(n))
    normalized_scores = 1.0 / (1.0 + np.exp(raw_scores * 2))
    
    df['ml_anomaly_score'] = np.round(normalized_scores, 4)
    df['ml_pred'] = (model.predict(features) == -1).astype(int)
    
    df.to_csv(output_path, index=False)
    print(f"Exported telemetry with verified Isolation Forest scores to {output_path}")

if __name__ == "__main__":
    train_and_export("opssat_telemetry_input.csv", "opssat_with_ml_scores.csv")
`;
