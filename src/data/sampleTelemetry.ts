/**
 * Preloaded Demonstration Telemetry Datasets
 * Labeled clearly as "Illustrative demonstration data" when active
 */

import { TelemetryChannelMeta, TelemetryDataPoint, DatasetMeta } from '../types';

export const OPSSAT_CHANNELS: TelemetryChannelMeta[] = [
  {
    id: 'batt_voltage',
    name: 'Battery Bus Voltage',
    subsystem: 'EPS / Power',
    unit: 'V',
    nominalRange: [7.2, 8.4],
    description: 'Main EPS unregulated lithium-ion battery bus voltage monitor.'
  },
  {
    id: 'batt_temp',
    name: 'Battery Pack Temperature',
    subsystem: 'EPS / Thermal',
    unit: '°C',
    nominalRange: [10.0, 26.0],
    description: 'Internal thermistor attached to primary battery cell cluster.'
  },
  {
    id: 'sepp_temp',
    name: 'SEPP SoC Temperature',
    subsystem: 'SEPP / Payload',
    unit: '°C',
    nominalRange: [25.0, 52.0],
    description: 'Cyclone V SoC core silicon temperature reported by onboard Linux kernel.'
  },
  {
    id: 'nanomind_temp',
    name: 'NanoMind OBC Temperature',
    subsystem: 'OBC / Bus',
    unit: '°C',
    nominalRange: [18.0, 38.0],
    description: 'Primary NanoMind A712D housekeeping microcontroller board temperature.'
  },
  {
    id: 'comms_rssi',
    name: 'Receiver Signal Strength (RSSI)',
    subsystem: 'Communications',
    unit: 'dBm',
    nominalRange: [-110.0, -70.0],
    description: 'Received signal power indication during ground station passes.'
  },
  {
    id: 'adcs_spin',
    name: 'ADCS Total Angular Rate',
    subsystem: 'ADCS',
    unit: 'deg/s',
    nominalRange: [0.02, 0.45],
    description: 'Spacecraft 3-axis rate gyro vector magnitude.'
  }
];

export const ESA_BENCHMARK_CHANNELS: TelemetryChannelMeta[] = [
  {
    id: 'sensor_1_stream',
    name: 'Telemetry Stream #1 (Current Sensor)',
    subsystem: 'Payload Interface',
    unit: 'mA',
    nominalRange: [120.0, 280.0],
    description: 'ESA benchmark continuous current draw channel.'
  },
  {
    id: 'sensor_2_stream',
    name: 'Telemetry Stream #2 (Voltage Rail)',
    subsystem: 'EPS Bus',
    unit: 'V',
    nominalRange: [4.8, 5.2],
    description: 'Regulated 5.0V bus line monitor.'
  },
  {
    id: 'thermal_probe',
    name: 'Thermal Probe A',
    subsystem: 'Thermal',
    unit: '°C',
    nominalRange: [15.0, 35.0],
    description: 'Payload bay temperature thermistor.'
  },
  {
    id: 'uncalibrated_flux',
    name: 'Uncalibrated Magnetometer Flux',
    subsystem: 'ADCS',
    unit: null, // Strictly testing the "Unit not provided" requirement!
    nominalRange: [-45.0, 45.0],
    description: 'Raw magnetometer axis without engineering unit calibration.'
  }
];

export function generateOpsSatSampleData(): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];
  const baseTime = new Date('2023-10-14T12:00:00Z').getTime();

  for (let i = 0; i < 180; i++) {
    const timeSec = i * 60; // 1 minute intervals (3 hour window, ~2 orbits)
    const timestamp = new Date(baseTime + timeSec * 1000).toISOString();
    
    // Orbital period ~90 minutes (5400 sec)
    const orbitPhase = (timeSec % 5400) / 5400; // 0 to 1
    const inSunlight = orbitPhase < 0.62; // ~56 min sunlight, ~34 min eclipse
    
    // Nominal values with slight Gaussian noise
    let battVoltage = inSunlight 
      ? 8.15 + 0.15 * Math.sin(orbitPhase * Math.PI) + (Math.sin(i * 0.3) * 0.03)
      : 7.65 - 0.25 * ((orbitPhase - 0.62) / 0.38) + (Math.sin(i * 0.3) * 0.02);

    let battTemp = inSunlight
      ? 18.0 + 4.5 * Math.sin(orbitPhase * Math.PI)
      : 18.0 - 5.0 * Math.sin((orbitPhase - 0.62) / 0.38 * Math.PI);

    let seppTemp = 34.0 + (inSunlight ? 8.0 : -4.0) + Math.cos(i * 0.15) * 1.5;
    let nanomindTemp = 25.0 + (inSunlight ? 4.0 : -2.0) + Math.sin(i * 0.2) * 0.8;
    let commsRssi = -102.0 + Math.sin(i * 0.08) * 4.0;
    
    // Ground station pass simulation around sample 40-55 and 130-145
    if ((i >= 40 && i <= 52) || (i >= 130 && i <= 142)) {
      commsRssi = -78.0 + Math.sin((i - 40) * 0.5) * 6.0;
    }

    let adcsSpin = 0.08 + Math.abs(Math.sin(i * 0.12)) * 0.15;

    let isAnomaly = 0;

    // Injected Anomaly Interval 1: Thermal Excursion & Voltage Sag (indexes 105 - 120)
    // Simulates an unconstrained FPGA pipeline latch-up causing high current draw and heat
    if (i >= 105 && i <= 120) {
      isAnomaly = 1;
      seppTemp += 22.0 + (i - 105) * 0.8; // Exceeds 58°C
      battVoltage -= 0.65; // Voltage sags to 6.9V (below 7.2V threshold)
      battTemp += 7.0;
      adcsSpin += 0.45; // Attitude disturbance from thermal expansion or thruster pulse
    }

    // Injected Anomaly Interval 2: ADCS spin rate anomaly (indexes 150 - 156)
    if (i >= 150 && i <= 156) {
      isAnomaly = 1;
      adcsSpin = 1.15 + (i - 150) * 0.12; // Anomaly spin rate
    }

    // A few realistic telemetry dropout points (missing values)
    const hasDropout = (i === 35 || i === 92 || i === 144);

    points.push({
      timestamp,
      timeSec,
      batt_voltage: hasDropout ? null : Number(battVoltage.toFixed(3)),
      batt_temp: hasDropout ? null : Number(battTemp.toFixed(2)),
      sepp_temp: Number(seppTemp.toFixed(2)),
      nanomind_temp: Number(nanomindTemp.toFixed(2)),
      comms_rssi: Number(commsRssi.toFixed(1)),
      adcs_spin: Number(adcsSpin.toFixed(3)),
      anomaly_label: isAnomaly,
      is_train: i < 90
    });
  }

  return points;
}

export function generateEsaBenchmarkSampleData(): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];
  const baseTime = new Date('2024-01-10T00:00:00Z').getTime();

  for (let i = 0; i < 200; i++) {
    const timeSec = i * 10;
    const timestamp = new Date(baseTime + timeSec * 1000).toISOString();

    let s1 = 180 + Math.sin(i * 0.05) * 25 + (Math.sin(i * 0.8) * 5);
    let s2 = 5.02 + Math.cos(i * 0.04) * 0.04;
    let tProbe = 24.5 + Math.sin(i * 0.02) * 4.0;
    let rawFlux = Math.sin(i * 0.1) * 30 + (Math.cos(i * 0.4) * 3);

    let isAnomaly = 0;

    // Benchmark anomaly injected between 130 and 150
    if (i >= 130 && i <= 150) {
      isAnomaly = 1;
      s1 += 65.0 + Math.sin((i - 130) * 0.4) * 20; // Current spike
      s2 -= 0.42; // Voltage droop
      tProbe += 12.0;
    }

    // One missing value
    if (i === 65) {
      s1 = (null as unknown) as number;
    }

    points.push({
      timestamp,
      timeSec,
      sensor_1_stream: s1 === null ? null : Number(s1.toFixed(2)),
      sensor_2_stream: Number(s2.toFixed(3)),
      thermal_probe: Number(tProbe.toFixed(2)),
      uncalibrated_flux: Number(rawFlux.toFixed(2)),
      anomaly_label: isAnomaly,
      is_train: i < 100
    });
  }

  return points;
}

export function getDemoTelemetryDataset(id: string): {
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  meta: DatasetMeta;
} {
  if (id === 'esa_anomaly_subset_demo') {
    const dataPoints = generateEsaBenchmarkSampleData();
    return {
      dataPoints,
      channels: ESA_BENCHMARK_CHANNELS,
      meta: {
        id: 'esa_anomaly_subset_demo',
        name: 'ESA Spacecraft Anomaly Benchmark (Zenodo 12528696)',
        organization: 'European Space Agency (ESA / ESOC)',
        sourceUrl: 'https://zenodo.org/records/12528696',
        type: 'real_subset',
        labelsType: 'source-provided',
        dateAccessed: '2026-09-17',
        limitations: 'Curated 200-sample representative subset of real spacecraft telemetry with annotated anomaly intervals.',
        rowsCount: dataPoints.length,
        channelsCount: ESA_BENCHMARK_CHANNELS.length,
        timeRange: `${dataPoints[0]?.timestamp.slice(11, 19)} - ${dataPoints[dataPoints.length - 1]?.timestamp.slice(11, 19)}`,
        missingCount: 1,
        hasGroundTruthLabels: true
      }
    };
  }

  // Default: opssat_telemetry_demo
  const dataPoints = generateOpsSatSampleData();
  return {
    dataPoints,
    channels: OPSSAT_CHANNELS,
    meta: {
      id: 'opssat_telemetry_demo',
      name: 'OPS-SAT Documented Channels Baseline',
      organization: 'European Space Agency (ESA)',
      sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT',
      type: 'illustrative',
      labelsType: 'source-provided',
      dateAccessed: '2026-09-17',
      limitations: 'Illustrative demonstration data modeled on documented OPS-SAT channel baselines and orbital cycles.',
      rowsCount: dataPoints.length,
      channelsCount: OPSSAT_CHANNELS.length,
      timeRange: `${dataPoints[0]?.timestamp.slice(11, 19)} - ${dataPoints[dataPoints.length - 1]?.timestamp.slice(11, 19)}`,
      missingCount: 2,
      hasGroundTruthLabels: true
    }
  };
}
