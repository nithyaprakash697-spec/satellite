/**
 * Robust Client-Side CSV Telemetry Parser
 * Supports both Wide-Format and Long-Format Telemetry CSVs
 */

import { TelemetryChannelMeta, TelemetryDataPoint } from '../types';

export interface ParsedCsvResult {
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  missingCount: number;
  hasGroundTruthLabels: boolean;
  timeRange: string;
  isWideFormat: boolean;
}

export function parseTelemetryCsv(csvContent: string): ParsedCsvResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header line and one data row.");
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const headerLower = header.map(h => h.toLowerCase());

  // Detect format:
  // Check for long-format keywords: 'channel' or 'subsystem' or 'parameter' AND 'value'
  const channelColIdx = headerLower.findIndex(h => h.includes('channel') || h.includes('subsystem') || h.includes('param') || h.includes('metric'));
  const valueColIdx = headerLower.findIndex(h => h === 'value' || h.includes('reading') || h.includes('measurement'));
  const timestampColIdx = headerLower.findIndex(h => h.includes('time') || h.includes('date') || h.includes('timestamp') || h.includes('epoch'));
  const labelColIdx = headerLower.findIndex(h => h.includes('label') || h.includes('anomaly') || h.includes('is_anomaly') || h.includes('ground_truth'));
  const trainColIdx = headerLower.findIndex(h => h.includes('train') || h.includes('split') || h.includes('is_train'));

  const isLongFormat = channelColIdx !== -1 && valueColIdx !== -1;

  const dataPoints: TelemetryDataPoint[] = [];
  const channelMap = new Map<string, TelemetryChannelMeta>();
  let missingCount = 0;
  let hasGroundTruth = false;

  if (isLongFormat) {
    // Group long format rows by timestamp
    const timeGroup = new Map<string, {
      point: TelemetryDataPoint;
      rawTimestamp: string;
    }>();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < Math.max(channelColIdx, valueColIdx) + 1) continue;

      const rawTime = timestampColIdx !== -1 ? parts[timestampColIdx] : `t_${i}`;
      const channelName = parts[channelColIdx] || 'channel_1';
      const channelId = channelName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const valStr = parts[valueColIdx];
      const valNum = (valStr === '' || valStr === 'NaN' || valStr === 'null') ? null : Number(valStr);

      if (valNum === null || isNaN(valNum)) {
        missingCount++;
      }

      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, {
          id: channelId,
          name: channelName,
          subsystem: 'Uploaded Long Telemetry',
          unit: null, // Strictly "Unit not provided"
          nominalRange: [0, 100],
          description: `User-uploaded channel: ${channelName}`
        });
      }

      let group = timeGroup.get(rawTime);
      if (!group) {
        let timeSec = i;
        const parsedEpoch = Date.parse(rawTime);
        if (!isNaN(parsedEpoch)) {
          timeSec = Math.floor(parsedEpoch / 1000);
        }

        let labelVal: number | null = null;
        if (labelColIdx !== -1 && parts[labelColIdx] !== undefined && parts[labelColIdx] !== '') {
          labelVal = Number(parts[labelColIdx]);
          hasGroundTruth = true;
        }

        group = {
          point: {
            timestamp: rawTime,
            timeSec,
            anomaly_label: labelVal,
            is_train: trainColIdx !== -1 ? parts[trainColIdx] === '1' || parts[trainColIdx].toLowerCase() === 'true' : null
          },
          rawTimestamp: rawTime
        };
        timeGroup.set(rawTime, group);
      }

      group.point[channelId] = valNum !== null && !isNaN(valNum) ? valNum : null;
    }

    timeGroup.forEach(g => dataPoints.push(g.point));
  } else {
    // Wide format: each column is a telemetry channel
    const detectedChannels: TelemetryChannelMeta[] = [];
    const colIndices: { idx: number; channelId: string }[] = [];

    header.forEach((colName, idx) => {
      if (idx === timestampColIdx || idx === labelColIdx || idx === trainColIdx) {
        return;
      }
      const channelId = colName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const meta: TelemetryChannelMeta = {
        id: channelId,
        name: colName,
        subsystem: 'Uploaded Telemetry',
        unit: null, // "Unit not provided" unless specified in column e.g. [V]
        nominalRange: [0, 100],
        description: `Column: ${colName}`
      };

      // Check if header specifies unit in parentheses or brackets e.g. "battery_voltage (V)"
      const unitMatch = colName.match(/[\(\[]([A-Za-z°%]+)[\)\]]/);
      if (unitMatch) {
        meta.unit = unitMatch[1];
      }

      channelMap.set(channelId, meta);
      detectedChannels.push(meta);
      colIndices.push({ idx, channelId });
    });

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < header.length / 2) continue;

      const rawTime = timestampColIdx !== -1 && parts[timestampColIdx] ? parts[timestampColIdx] : `t_${i}`;
      let timeSec = i * 60;
      const parsedEpoch = Date.parse(rawTime);
      if (!isNaN(parsedEpoch)) {
        timeSec = Math.floor(parsedEpoch / 1000);
      }

      let labelVal: number | null = null;
      if (labelColIdx !== -1 && parts[labelColIdx] !== undefined && parts[labelColIdx] !== '') {
        const parsed = Number(parts[labelColIdx]);
        if (!isNaN(parsed)) {
          labelVal = parsed;
          hasGroundTruth = true;
        }
      }

      const point: TelemetryDataPoint = {
        timestamp: rawTime,
        timeSec,
        anomaly_label: labelVal,
        is_train: trainColIdx !== -1 ? parts[trainColIdx] === '1' || parts[trainColIdx].toLowerCase() === 'true' : null
      };

      colIndices.forEach(({ idx, channelId }) => {
        const valStr = parts[idx];
        if (valStr === undefined || valStr === '' || valStr === 'NaN' || valStr === 'null') {
          point[channelId] = null;
          missingCount++;
        } else {
          const num = Number(valStr);
          if (isNaN(num)) {
            point[channelId] = null;
            missingCount++;
          } else {
            point[channelId] = num;
          }
        }
      });

      dataPoints.push(point);
    }
  }

  // Determine time range string
  const firstTime = dataPoints[0]?.timestamp || 't0';
  const lastTime = dataPoints[dataPoints.length - 1]?.timestamp || `t${dataPoints.length}`;
  const timeRange = `${firstTime} to ${lastTime}`;

  return {
    dataPoints,
    channels: Array.from(channelMap.values()),
    missingCount,
    hasGroundTruthLabels: hasGroundTruth,
    timeRange,
    isWideFormat: !isLongFormat
  };
}
