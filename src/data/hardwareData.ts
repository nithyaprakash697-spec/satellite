/**
 * Publicly Documented ESA OPS-SAT Hardware Profile
 * Sources:
 * - ESA OPS-SAT Live Docs: https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html
 * - ESA Mission Overview: https://www.esa.int/Enabling_Support/Operations/OPS-SAT
 * 
 * Note: Does not invent processor limits, radiation tolerance, or undocumented specs.
 */

import { HardwareSubsystemInfo } from '../types';

export const HARDWARE_DISCLAIMER = 
  "Reference hardware profile based on public OPS-SAT documentation. This application does not claim to reproduce the complete spacecraft hardware.";

export const OPS_SAT_SUBSYSTEMS: HardwareSubsystemInfo[] = [
  {
    id: 'sepp',
    category: 'Payload Processing',
    title: 'SEPP (Satellite Experimental Processing Platform)',
    documentedSpecs: [
      'Altera Cyclone V SoC',
      'Dual-core ARM Cortex-A9',
      '800 MHz processor clock',
      '1 GB DDR3 RAM',
      'Integrated FPGA fabric',
      'Linux-based experiment environment (Yocto/Poky)'
    ],
    opsSatRole: 'Executes experiment payloads, software experiments, and telemetry processing outside the primary flight OBC.',
    sourceTitle: 'ESA OPS-SAT Mission Description & Live Docs',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html'
  },
  {
    id: 'mass_memory',
    category: 'Payload Storage',
    title: 'Mass Memory',
    documentedSpecs: [
      'OPS-SAT mission mass-memory reference, documented by ESA (8 GB flash)',
      'Dedicated payload data storage buffer',
      'Separate physical resource from SEPP 1 GB DDR3 RAM'
    ],
    opsSatRole: 'Buffers Earth observation images, SDR IQ captures, and telemetry logs before downlink.',
    sourceTitle: 'ESA OPS-SAT Architecture Overview',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT',
    notes: 'Kept strictly separate from SEPP processor RAM in accordance with documented architecture.'
  },
  {
    id: 'obc',
    category: 'Spacecraft Command & Control',
    title: 'NanoMind A712D / Flight OBC',
    documentedSpecs: [
      'Primary spacecraft on-board computer',
      'Runs core satellite housekeeping & FreeRTOS flight software',
      'Manages watchdog timers and safe-mode transitions'
    ],
    opsSatRole: 'Maintains mission survival, monitors spacecraft health telemetry, and commands power rails.',
    sourceTitle: 'ESA OPS-SAT Telemetry Analysis Documentation',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html'
  },
  {
    id: 'eps',
    category: 'Electrical Power',
    title: 'EPS (Electrical Power System)',
    documentedSpecs: [
      'Power conditioning and distribution unit',
      'Regulated 3.3V, 5V, and battery-direct buses',
      'Subsystem overcurrent protection and telemetry reporting'
    ],
    opsSatRole: 'Distributes solar and stored energy, switches payload rails upon OBC command.',
    sourceTitle: 'ESA OPS-SAT Mission Architecture',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  },
  {
    id: 'solar',
    category: 'Electrical Power',
    title: 'Solar & Power Generation System',
    documentedSpecs: [
      'Body-mounted triple-junction solar panels',
      'Deployable solar array wings',
      'Analog current and voltage telemetry sensors'
    ],
    opsSatRole: 'Harvests solar radiation during orbital sunlit periods.',
    sourceTitle: 'ESA OPS-SAT Mission Description',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  },
  {
    id: 'battery',
    category: 'Electrical Power',
    title: 'Battery Pack',
    documentedSpecs: [
      'Lithium-ion cell configuration',
      'Cell temperature sensors (thermistor)',
      'Bus voltage monitoring telemetry'
    ],
    opsSatRole: 'Powers spacecraft operations during eclipse and high-current payload activity.',
    sourceTitle: 'ESA OPS-SAT Telemetry Specs',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html'
  },
  {
    id: 'adcs',
    category: 'Attitude Control',
    title: 'ADCS (Attitude Determination & Control)',
    documentedSpecs: [
      'Magnetorquer coils for 3-axis magnetic detumbling',
      'Reaction wheels for precision fine-pointing',
      '3-axis gyroscopes, sun sensors, and magnetometers'
    ],
    opsSatRole: 'Maintains nadir orientation for camera imaging and ground-station antenna alignment.',
    sourceTitle: 'ESA OPS-SAT System Documentation',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html'
  },
  {
    id: 'gnss',
    category: 'Navigation',
    title: 'GPS / GNSS Receiver',
    documentedSpecs: [
      'Spacecraft orbit determination receiver',
      'UTC time-synchronization pulse for experiment timestamps'
    ],
    opsSatRole: 'Calculates orbital position and provides precision reference timing for telemetry frames.',
    sourceTitle: 'ESA OPS-SAT Payload Documentation',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  },
  {
    id: 'comms',
    category: 'Communications',
    title: 'Communications Subsystem',
    documentedSpecs: [
      'UHF transceiver for primary command & housekeeping uplink/downlink',
      'S-Band transceiver for high-speed payload data & telemetry downlink',
      'Telemetry RSSI and transmission power status reporting'
    ],
    opsSatRole: 'Connects OPS-SAT to ESOC ground stations and optical optical/radio test stations.',
    sourceTitle: 'ESA OPS-SAT Ground Segment Documentation',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  },
  {
    id: 'sdr',
    category: 'Payload Instrument',
    title: 'Software Defined Radio (SDR)',
    documentedSpecs: [
      'Reconfigurable RF transceiver payload',
      'Operates in UHF and higher frequency bands',
      'Directly interfaced with Cyclone V FPGA'
    ],
    opsSatRole: 'Supports in-orbit signal processing, radio spectrum surveillance, and experimental waveforms.',
    sourceTitle: 'ESA OPS-SAT In-Orbit Experimentation',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  },
  {
    id: 'camera',
    category: 'Payload Instrument',
    title: 'High-Resolution Optical Camera',
    documentedSpecs: [
      'High-definition color Earth-imaging camera',
      'CMOS sensor with dedicated imaging optics',
      'Direct memory bridge to SEPP DDR3 RAM'
    ],
    opsSatRole: 'Captures Earth observation frames for onboard edge image processing and cloud detection experiments.',
    sourceTitle: 'ESA OPS-SAT Payload Overview',
    sourceUrl: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT'
  }
];
