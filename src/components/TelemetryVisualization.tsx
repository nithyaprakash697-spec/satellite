import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Info,
  Sliders,
  Eye,
  Maximize2
} from 'lucide-react';
import { TelemetryChannelMeta, TelemetryDataPoint, DetectionResult } from '../types';

interface TelemetryVisualizationProps {
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  detectionResult?: DetectionResult | null;
  detectorName?: string;
  isDemonstrationData: boolean;
}

export const TelemetryVisualization: React.FC<TelemetryVisualizationProps> = ({
  dataPoints,
  channels,
  selectedChannelId,
  onSelectChannel,
  detectionResult,
  detectorName = 'Statistical Z-Score',
  isDemonstrationData
}) => {
  const [showThresholdBands, setShowThresholdBands] = useState<boolean>(true);
  const [showRollingMean, setShowRollingMean] = useState<boolean>(true);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);
  const [viewWindow, setViewWindow] = useState<'all' | '100' | '50'>('all');

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  // Prepare chart series data
  const chartData = useMemo(() => {
    let sliced = dataPoints;
    if (viewWindow === '50') {
      sliced = dataPoints.slice(Math.max(0, dataPoints.length - 50));
    } else if (viewWindow === '100') {
      sliced = dataPoints.slice(Math.max(0, dataPoints.length - 100));
    }

    return sliced.map((p, idx) => {
      const origIndex = dataPoints.indexOf(p);
      const val = p[selectedChannelId];
      const numVal = (val !== null && val !== undefined && !isNaN(Number(val))) ? Number(val) : null;
      
      const isDetectedAnomaly = detectionResult?.flags ? detectionResult.flags[origIndex] : false;
      const isGroundTruthAnomaly = p.anomaly_label === 1;

      return {
        index: origIndex,
        time: p.timestamp.includes('T') ? p.timestamp.split('T')[1].slice(0, 8) : p.timestamp,
        value: numVal,
        mean: detectionResult?.rollingMean ? detectionResult.rollingMean[origIndex] : null,
        upperBand: detectionResult?.upperBand ? detectionResult.upperBand[origIndex] : null,
        lowerBand: detectionResult?.lowerBand ? detectionResult.lowerBand[origIndex] : null,
        detectedPoint: isDetectedAnomaly ? numVal : null,
        groundTruthAnomaly: isGroundTruthAnomaly,
        isMissing: numVal === null
      };
    });
  }, [dataPoints, selectedChannelId, detectionResult, viewWindow]);

  // Current metric summary
  const currentStat = useMemo(() => {
    const validVals = dataPoints
      .map(p => p[selectedChannelId])
      .filter((v): v is number => v !== null && v !== undefined && !isNaN(Number(v)))
      .map(Number);

    if (validVals.length === 0) return { current: null, mean: null, std: null, min: null, max: null };

    const current = validVals[validVals.length - 1];
    const mean = validVals.reduce((a, b) => a + b, 0) / validVals.length;
    const variance = validVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validVals.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...validVals);
    const max = Math.max(...validVals);

    return {
      current,
      mean: Number(mean.toFixed(3)),
      std: Number(std.toFixed(3)),
      min: Number(min.toFixed(3)),
      max: Number(max.toFixed(3))
    };
  }, [dataPoints, selectedChannelId]);

  const unitLabel = selectedChannel?.unit ? selectedChannel.unit : 'Unit not provided';

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      {/* Top Channel Selection and Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-telemetry uppercase tracking-wider text-cyan-400">
              Active Channel Telemetry Stream
            </span>
            {isDemonstrationData ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-amber-950/60 border border-amber-500/40 text-amber-300">
                Illustrative demonstration data
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                User-uploaded CSV
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedChannelId}
              onChange={(e) => onSelectChannel(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} {ch.unit ? `(${ch.unit})` : '[Unit not provided]'}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              Subsystem: <strong className="text-slate-200">{selectedChannel?.subsystem || 'Spacecraft Bus'}</strong>
            </span>
          </div>
        </div>

        {/* Chart View Switches */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-telemetry">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowThresholdBands(!showThresholdBands)}
              className={`px-2.5 py-1 rounded transition ${
                showThresholdBands ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ±Z Bands
            </button>
            <button
              onClick={() => setShowRollingMean(!showRollingMean)}
              className={`px-2.5 py-1 rounded transition ${
                showRollingMean ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Rolling Mean
            </button>
            <button
              onClick={() => setShowGroundTruth(!showGroundTruth)}
              className={`px-2.5 py-1 rounded transition ${
                showGroundTruth ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Ground Truth
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['all', '100', '50'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setViewWindow(win)}
                className={`px-2 py-1 rounded uppercase ${
                  viewWindow === win ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {win === 'all' ? 'Full Orbit' : `Last ${win}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Readouts Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-telemetry text-slate-400">Current Value</div>
          <div className="text-base sm:text-lg font-bold font-telemetry text-white mt-0.5">
            {currentStat.current !== null ? currentStat.current : 'N/A'}{' '}
            <span className="text-xs font-normal text-cyan-400">{unitLabel}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-telemetry text-slate-400">Rolling Mean (μ)</div>
          <div className="text-base sm:text-lg font-bold font-telemetry text-slate-200 mt-0.5">
            {currentStat.mean !== null ? currentStat.mean : 'N/A'}{' '}
            <span className="text-xs font-normal text-slate-400">{unitLabel}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-telemetry text-slate-400">Rolling Std (σ)</div>
          <div className="text-base sm:text-lg font-bold font-telemetry text-slate-200 mt-0.5">
            {currentStat.std !== null ? currentStat.std : 'N/A'}{' '}
            <span className="text-xs font-normal text-slate-400">{unitLabel}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-telemetry text-slate-400">Observed Range</div>
          <div className="text-xs sm:text-sm font-semibold font-telemetry text-slate-300 mt-1">
            [{currentStat.min ?? '?'}, {currentStat.max ?? '?'}]
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-telemetry text-slate-400">Alarms Flagged</div>
          <div className="text-base sm:text-lg font-bold font-telemetry text-rose-400 mt-0.5">
            {detectionResult ? detectionResult.indices.length : 0}{' '}
            <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>
      </div>

      {/* Main Time-Series Graph */}
      <div className="w-full h-72 sm:h-80 bg-slate-950/80 rounded-lg p-2 border border-slate-800 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              minTickGap={25}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              unit={selectedChannel?.unit ? ` ${selectedChannel.unit}` : ''}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-telemetry">
                      <div className="text-slate-400 font-semibold">T: {data.time} (idx: {data.index})</div>
                      <div className="text-cyan-300">
                        {selectedChannel?.name}:{' '}
                        <span className="text-white font-bold">
                          {data.value !== null ? `${data.value} ${unitLabel}` : 'MISSING / DROPOUT'}
                        </span>
                      </div>
                      {data.mean !== null && (
                        <div className="text-blue-400">Rolling Mean (μ): {data.mean} {unitLabel}</div>
                      )}
                      {data.upperBand !== null && (
                        <div className="text-slate-400">Threshold: [{data.lowerBand}, {data.upperBand}]</div>
                      )}
                      {data.detectedPoint !== null && (
                        <div className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ANOMALY FLAGGED BY {detectorName.toUpperCase()}
                        </div>
                      )}
                      {data.groundTruthAnomaly && (
                        <div className="text-amber-400 font-semibold">
                          Ground-Truth Label: ANOMALOUS
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Threshold Bands Area (between lowerBand and upperBand) */}
            {showThresholdBands && (
              <Area
                type="monotone"
                dataKey="upperBand"
                stroke="#0284c7"
                strokeDasharray="2 2"
                strokeWidth={1}
                fill="url(#bandFill)"
                isAnimationActive={false}
              />
            )}
            {showThresholdBands && (
              <Line
                type="monotone"
                dataKey="lowerBand"
                stroke="#0284c7"
                strokeDasharray="2 2"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Rolling Mean Line */}
            {showRollingMean && (
              <Line
                type="monotone"
                dataKey="mean"
                stroke="#38bdf8"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Primary Telemetry Stream */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#e2e8f0"
              strokeWidth={1.8}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (!cx || !cy) return <g key={`dot-${payload.index}`} />;
                
                // If missing data
                if (payload.isMissing) {
                  return (
                    <circle
                      key={`missing-${payload.index}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }

                // If detected anomaly
                if (payload.detectedPoint !== null) {
                  return (
                    <circle
                      key={`anom-${payload.index}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#ef4444"
                      stroke="#fca5a5"
                      strokeWidth={2}
                    />
                  );
                }

                // If ground truth label is anomaly and ground truth display active
                if (showGroundTruth && payload.groundTruthAnomaly) {
                  return (
                    <circle
                      key={`gt-${payload.index}`}
                      cx={cx}
                      cy={cy}
                      r={3.5}
                      fill="#f59e0b"
                      opacity={0.8}
                    />
                  );
                }

                return <g key={`dot-norm-${payload.index}`} />;
              }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Scientific Notation Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-telemetry pt-1 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-white inline-block" />
            <span className="text-slate-300">Telemetry Stream</span>
          </div>
          {showRollingMean && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#38bdf8] inline-block" />
              <span className="text-slate-300">Rolling Mean</span>
            </div>
          )}
          {showThresholdBands && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-cyan-500/20 border border-cyan-500/40 inline-block rounded-xs" />
              <span className="text-slate-300">Z-Score Threshold Envelope</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ring-2 ring-rose-300/30" />
            <span className="text-rose-300">Detector Alarm</span>
          </div>
          {showGroundTruth && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-amber-300">Ground-Truth Label</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Unit specification: <strong className="text-slate-200">{unitLabel}</strong>
        </div>
      </div>
    </div>
  );
};
