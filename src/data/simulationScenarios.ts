/**
 * Autonomous Satellite Simulation Scenarios
 * Software-level reconfiguration models (mode change, parameter adjustment, task reallocation)
 * Inspired by Caltech self-healing circuit principles adapted for spacecraft software autonomy.
 */

import { FaultType, SubsystemId, SoftwareConfigOption, SubsystemStatusInfo } from '../types';

export interface SimulationFaultScenario {
  id: FaultType;
  title: string;
  affectedSubsystemId: SubsystemId;
  subsystemName: string;
  nominalMetric: { label: string; value: string };
  faultMetric: { label: string; value: string };
  recoveredMetric: { label: string; value: string };
  telemetryChannelId: string;
  nominalStreamVal: number;
  faultStreamVal: number;
  recoveredStreamVal: number;
  detectionReason: string;
  detectorTriggered: 'Statistical Z-Score' | 'Isolation Forest (ML)' | 'Hybrid (Statistical ∪ ML)';
  zScoreVal: number;
  mlScoreVal: number;
  diagnosisSummary: string;
  configEvaluationPrompt: string;
  configOptions: SoftwareConfigOption[];
  softwareChangesSummary: string[];
}

export const SUBSYSTEM_DEFINITIONS: SubsystemStatusInfo[] = [
  {
    id: 'eps',
    name: 'Power / EPS',
    health: 'nominal',
    metricLabel: 'Bus Voltage',
    metricValue: '8.12 V',
    description: 'Electrical Power System. Regulates solar array power, battery charging, and 3.3V/5V/12V distribution buses.',
    position3D: [0.0, -0.4, 0.2]
  },
  {
    id: 'battery',
    name: 'Battery Pack',
    health: 'nominal',
    metricLabel: 'State of Charge',
    metricValue: '92.4%',
    description: 'Dual Li-Ion cell battery assembly supplying energy during eclipse passes.',
    position3D: [0.0, -0.7, 0.0]
  },
  {
    id: 'obc',
    name: 'Onboard Computer (OBC)',
    health: 'nominal',
    metricLabel: 'Core Load',
    metricValue: '28.5%',
    description: 'Central avionics computer running flight software, anomaly detection, and autonomous reconfiguration controller.',
    position3D: [0.0, 0.1, 0.1]
  },
  {
    id: 'adcs',
    name: 'ADCS (Attitude Control)',
    health: 'nominal',
    metricLabel: 'Angular Rate',
    metricValue: '0.11 deg/s',
    description: 'Attitude Determination & Control System: 3-axis reaction wheels, sun sensors, and magnetic torquer coils.',
    position3D: [0.0, 0.5, 0.0]
  },
  {
    id: 'comms',
    name: 'Communications',
    health: 'nominal',
    metricLabel: 'RSSI Link',
    metricValue: '-82 dBm',
    description: 'S-Band payload downlink transceiver and UHF omnidirectional telemetry/command beacon.',
    position3D: [0.0, 0.9, -0.1]
  },
  {
    id: 'thermal',
    name: 'Thermal Subsystem',
    health: 'nominal',
    metricLabel: 'Radiator Temp',
    metricValue: '24.6 °C',
    description: 'Passive heat straps, thermal radiators, and embedded thermistors monitoring processor and battery temperatures.',
    position3D: [-0.45, 0.0, -0.2]
  },
  {
    id: 'payload',
    name: 'Payload / Sensors',
    health: 'nominal',
    metricLabel: 'IMS Camera',
    metricValue: 'Standby / 38.2°C',
    description: 'Optical high-resolution imaging payload and SEPP acceleration processor for onboard edge AI experiments.',
    position3D: [0.0, -0.9, 0.0]
  },
  {
    id: 'solar',
    name: 'Solar Panels',
    health: 'nominal',
    metricLabel: 'Generated Power',
    metricValue: '14.8 W',
    description: 'Deployable photovoltaic solar wings converting solar irradiance into spacecraft electrical power.',
    position3D: [1.3, 0.0, 0.0]
  }
];

export const SIMULATION_FAULT_SCENARIOS: Record<FaultType, SimulationFaultScenario> = {
  power_voltage_drift: {
    id: 'power_voltage_drift',
    title: 'Power Bus Voltage Drift',
    affectedSubsystemId: 'eps',
    subsystemName: 'Electrical Power System (EPS)',
    nominalMetric: { label: 'Bus Voltage', value: '8.12 V (Nominal)' },
    faultMetric: { label: 'Bus Voltage', value: '6.82 V (Under-Voltage)' },
    recoveredMetric: { label: 'Bus Voltage', value: '7.96 V (Stabilized)' },
    telemetryChannelId: 'BATT_V',
    nominalStreamVal: 8.12,
    faultStreamVal: 6.82,
    recoveredStreamVal: 7.96,
    detectionReason: 'Rapid negative deviation beyond 2.5σ rolling window threshold with persistent under-voltage slope.',
    detectorTriggered: 'Hybrid (Statistical ∪ ML)',
    zScoreVal: -3.42,
    mlScoreVal: 0.81,
    diagnosisSummary: 'EPS battery discharge regulator degradation; internal resistance surge under load.',
    configEvaluationPrompt: 'Evaluating power budget constraints and valid operational software configurations...',
    configOptions: [
      {
        id: 'p_full_sci',
        name: 'Full Science & Imaging Mode',
        category: 'nominal',
        description: 'Maintain nominal 18.5W science experiment operations.',
        status: 'rejected',
        rejectionReason: 'Rejected: Power consumption (18.5W) exceeds degraded bus capacity (11.2W). Immediate brownout risk.',
        actionsApplied: []
      },
      {
        id: 'p_sband_boost',
        name: 'High-Rate S-Band Downlink',
        category: 'comms_rate',
        description: 'Maintain full transmitter power amplifier draw.',
        status: 'rejected',
        rejectionReason: 'Rejected: RF PA draw (6.2W) causes immediate battery undervoltage trip.',
        actionsApplied: []
      },
      {
        id: 'p_safe_mode',
        name: 'Hard Safe-Mode Transition',
        category: 'safe_mode',
        description: 'Halt all onboard computing and await ground pass.',
        status: 'rejected',
        rejectionReason: 'Sub-optimal: Completely terminates mission autonomy for 72+ hours when software load shedding can preserve operations.',
        actionsApplied: []
      },
      {
        id: 'p_reduced_power',
        name: 'Autonomous Reduced-Power Mode & Task Reallocation',
        category: 'reduced_power',
        description: 'Shed high-draw payload rails, throttle CPU clock, prioritize ADCS and housekeeping beacon.',
        status: 'selected',
        actionsApplied: [
          'De-energized optical camera payload power rail (-4.5W)',
          'Scaled Cortex-A9 processor frequency to 400 MHz (-2.1W)',
          'Reallocated task scheduler: deprioritized batch compression, preserved attitude control',
          'Downshifted telemetry downlink to low-power UHF beacon'
        ]
      }
    ],
    softwareChangesSummary: [
      'Power load reduced from 17.8W to 9.6W via selective payload rail de-energization.',
      'Task scheduler prioritized core flight control over scientific compute batches.',
      'EPS bus voltage stabilized from 6.82V back to 7.96V safely above brownout threshold (7.20V).'
    ]
  },

  thermal_excursion: {
    id: 'thermal_excursion',
    title: 'SEPP SoC Thermal Excursion',
    affectedSubsystemId: 'thermal',
    subsystemName: 'Thermal & Payload Processing Unit',
    nominalMetric: { label: 'SoC Core Temp', value: '38.2 °C (Nominal)' },
    faultMetric: { label: 'SoC Core Temp', value: '63.5 °C (Thermal Limit)' },
    recoveredMetric: { label: 'SoC Core Temp', value: '41.4 °C (Safe Zone)' },
    telemetryChannelId: 'TEMP_SEPP',
    nominalStreamVal: 38.2,
    faultStreamVal: 63.5,
    recoveredStreamVal: 41.4,
    detectionReason: 'Isolation Forest flagged sudden multi-sample thermal gradient acceleration exceeding 60°C.',
    detectorTriggered: 'Isolation Forest (ML)',
    zScoreVal: 4.18,
    mlScoreVal: 0.89,
    diagnosisSummary: 'High-compute neural network pipeline thermal dissipation exceeding passive radiator capacity.',
    configEvaluationPrompt: 'Evaluating thermal envelope margins and computational duty-cycling policies...',
    configOptions: [
      {
        id: 't_nominal_pipe',
        name: 'Continuous Machine Learning Inference',
        category: 'nominal',
        description: 'Run continuous edge inference on incoming optical frames.',
        status: 'rejected',
        rejectionReason: 'Rejected: Core temperature will exceed 70°C, risking silicon latch-up and permanent solder fatigue.',
        actionsApplied: []
      },
      {
        id: 't_radiator_turn',
        name: 'Passive Thermal Attitude Reorientation',
        category: 'nominal',
        description: 'Rotate satellite body to point radiator directly toward deep space.',
        status: 'rejected',
        rejectionReason: 'Rejected: Radiative cooling rate (-0.2°C/min) is too slow to stop immediate thermal surge without compute throttling.',
        actionsApplied: []
      },
      {
        id: 't_hard_shutdown',
        name: 'Emergency Processor Power Cut',
        category: 'safe_mode',
        description: 'Cut main power switch to payload processor board.',
        status: 'rejected',
        rejectionReason: 'Rejected: Corrupts flash file system and loses in-flight model state.',
        actionsApplied: []
      },
      {
        id: 't_dynamic_throttling',
        name: 'Dynamic Execution Throttling & Pipeline Duty-Cycling',
        category: 'task_priority',
        description: 'Clock-gate FPGA fabric, throttle CPU frequency to 400 MHz, insert 50ms cooldown between frame batches.',
        status: 'selected',
        actionsApplied: [
          'Clock-gated Cyclone V FPGA hardware accelerators',
          'Down-clocked ARM Cortex-A9 cores from 800 MHz to 400 MHz',
          'Configured inference loop duty-cycle to 30% active / 70% low-power sleep',
          'Restricted active memory bus bandwidth to reduce switching heat'
        ]
      }
    ],
    softwareChangesSummary: [
      'Silicon dissipation reduced by 48% via software clock-gating and frequency scaling.',
      'Peak temperature peaked at 63.5°C and cooled back to 41.4°C over 4 minutes.',
      'Essential anomaly detection and telemetry processing continued uninterrupted.'
    ]
  },

  adcs_rate_anomaly: {
    id: 'adcs_rate_anomaly',
    title: 'ADCS Reaction Wheel Saturation & Tumble',
    affectedSubsystemId: 'adcs',
    subsystemName: 'Attitude Determination & Control (ADCS)',
    nominalMetric: { label: 'Angular Rate', value: '0.11 deg/s (Nadir Lock)' },
    faultMetric: { label: 'Angular Rate', value: '1.68 deg/s (Uncontrolled Tumble)' },
    recoveredMetric: { label: 'Angular Rate', value: '0.19 deg/s (Rate Damped)' },
    telemetryChannelId: 'ADCS_RATE',
    nominalStreamVal: 0.11,
    faultStreamVal: 1.68,
    recoveredStreamVal: 0.19,
    detectionReason: 'Statistical detector identified 3 consecutive samples exceeding 3.0σ angular acceleration limit.',
    detectorTriggered: 'Statistical Z-Score',
    zScoreVal: 3.85,
    mlScoreVal: 0.78,
    diagnosisSummary: 'Reaction wheel #2 tachometer saturation caused loss of 3-axis nadir pointing stability.',
    configEvaluationPrompt: 'Evaluating actuator availability, angular momentum vectors, and control laws...',
    configOptions: [
      {
        id: 'a_wheel_spinup',
        name: 'High-Torque Reaction Wheel Counter-Command',
        category: 'nominal',
        description: 'Drive remaining reaction wheels at maximum RPM.',
        status: 'rejected',
        rejectionReason: 'Rejected: Wheels are already near speed saturation (5800 RPM); risk of mechanical bearing damage and bus surge.',
        actionsApplied: []
      },
      {
        id: 'a_nadir_hold',
        name: 'Force Nadir Pointing Control Law',
        category: 'nominal',
        description: 'Attempt closed-loop optical Earth tracking.',
        status: 'rejected',
        rejectionReason: 'Rejected: State estimator covariance divergent due to high rotational smear.',
        actionsApplied: []
      },
      {
        id: 'a_bdot_recovery',
        name: 'B-Dot Magnetic Rate Damping & Sun-Safe Orientation',
        category: 'sensor_adjustment',
        description: 'De-energize saturated reaction wheels, engage magnetorquers to damp kinetic energy, align panels with Sun.',
        status: 'selected',
        actionsApplied: [
          'Commanded reaction wheel motors to idle freewheel mode',
          'Switched ADCS control law from Nadir PID to geomagnetic B-Dot damping algorithm',
          'Pulsed 3-axis magnetorquer coils against Earth magnetic field vectors',
          'Biased solar array normal vector toward Sun direction to maintain battery charge'
        ]
      }
    ],
    softwareChangesSummary: [
      'Control authority shifted from mechanical wheels to electromagnetic coils.',
      'Rotational kinetic energy dissipated into Earth geomagnetic field.',
      'Tumble rate slowed from 1.68 deg/s to 0.19 deg/s; spacecraft stabilized in Sun-safe attitude.'
    ]
  },

  comms_degradation: {
    id: 'comms_degradation',
    title: 'S-Band RF Link Degradation',
    affectedSubsystemId: 'comms',
    subsystemName: 'Communications Subsystem',
    nominalMetric: { label: 'RSSI Link', value: '-82 dBm (High SNR)' },
    faultMetric: { label: 'RSSI Link', value: '-119 dBm (Carrier Drop)' },
    recoveredMetric: { label: 'RSSI Link', value: '-94 dBm (UHF Beacon Link)' },
    telemetryChannelId: 'COMM_RSSI',
    nominalStreamVal: -82.0,
    faultStreamVal: -119.0,
    recoveredStreamVal: -94.0,
    detectionReason: 'Z-score detector flagged 5 consecutive dropped sync frames with negative SNR plunge.',
    detectorTriggered: 'Statistical Z-Score',
    zScoreVal: -3.12,
    mlScoreVal: 0.74,
    diagnosisSummary: 'S-Band high-speed antenna misalignment or RF driver stage impedance mismatch.',
    configEvaluationPrompt: 'Evaluating RF modulation schemes, antenna routing, and packet queue priorities...',
    configOptions: [
      {
        id: 'c_rf_boost',
        name: 'Increase Transmitter Power Amplifier Output',
        category: 'nominal',
        description: 'Increase S-band transmitter power to maximum 4W.',
        status: 'rejected',
        rejectionReason: 'Rejected: High antenna VSWR reflected power will overheat the RF power amplifier module.',
        actionsApplied: []
      },
      {
        id: 'c_retry_flood',
        name: 'Rapid Uncompressed Frame Retransmission',
        category: 'nominal',
        description: 'Repeatedly flood the channel with full payload telemetry packets.',
        status: 'rejected',
        rejectionReason: 'Rejected: 86% packet loss wastes scarce onboard power without ground delivery.',
        actionsApplied: []
      },
      {
        id: 'c_adaptive_rate',
        name: 'Adaptive Rate Downshift & UHF Housekeeping Beacon Routing',
        category: 'comms_rate',
        description: 'Downshift symbol rate, add Forward Error Correction (FEC), route health telemetry to omnidirectional UHF.',
        status: 'selected',
        actionsApplied: [
          'Switched modulation from 16-APSK (2 Mbps) to robust QPSK 1/2 convolutional coding (256 kbps)',
          'Routed real-time spacecraft health packets to omnidirectional UHF AX.25 beacon',
          'Spool scientific raw imagery to non-volatile SD flash memory buffer until next high-SNR pass',
          'Updated CCSDS packetizer to send high-priority compressed status telemetry'
        ]
      }
    ],
    softwareChangesSummary: [
      'Downshifted modulation and activated Forward Error Correction (FEC).',
      'Spacecraft health stream rerouted via omnidirectional UHF beacon (-94 dBm solid link).',
      'No critical command telemetry lost; high-bandwidth imaging buffered locally.'
    ]
  },

  sensor_dropout: {
    id: 'sensor_dropout',
    title: 'Primary Voltage Sensor Dropout (NaN/Freeze)',
    affectedSubsystemId: 'battery',
    subsystemName: 'Telemetry & Sensing Unit (ADC)',
    nominalMetric: { label: 'Primary ADC', value: '8.15 V (Live)' },
    faultMetric: { label: 'Primary ADC', value: 'NaN / STUCK [0x0000]' },
    recoveredMetric: { label: 'Primary ADC', value: '8.06 V (Imputed)' },
    telemetryChannelId: 'BATT_V',
    nominalStreamVal: 8.15,
    faultStreamVal: 0.0,
    recoveredStreamVal: 8.06,
    detectionReason: 'Out-of-bound sensor reading (zero/NaN) and temporal variance freeze detected.',
    detectorTriggered: 'Hybrid (Statistical ∪ ML)',
    zScoreVal: -4.80,
    mlScoreVal: 0.94,
    diagnosisSummary: 'I2C telemetry bus lockup or front-end analog-to-digital converter freeze.',
    configEvaluationPrompt: 'Evaluating sensor trust weights, telemetry bus resets, and observer models...',
    configOptions: [
      {
        id: 's_raw_passthrough',
        name: 'Raw Sensor Pass-Through',
        category: 'nominal',
        description: 'Continue passing corrupted values into the power regulation loop.',
        status: 'rejected',
        rejectionReason: 'Rejected: Corrupted zero-voltage reading will trigger false emergency battery disconnect.',
        actionsApplied: []
      },
      {
        id: 's_blind_avg',
        name: 'Fixed Static Constant Substitution',
        category: 'sensor_adjustment',
        description: 'Replace sensor reading with hardcoded 8.0V constant.',
        status: 'rejected',
        rejectionReason: 'Rejected: Ignores actual orbital charge/discharge cycle, risking overcharging in sunlight.',
        actionsApplied: []
      },
      {
        id: 's_kalman_imputation',
        name: 'Sensor Trust Masking & Kalman State Observer Imputation',
        category: 'sensor_adjustment',
        description: 'Flag primary sensor untrusted, estimate true bus voltage via dynamic model & solar current telemetry.',
        status: 'selected',
        actionsApplied: [
          'Tagged ADC Channel 1 as UNTRUSTED in flight telemetry registry',
          'Initialized Extended Kalman Filter state observer using solar array current and known load profile',
          'Soft-reset I2C telemetry bus controller in background without interrupting flight computer',
          'Supplied reconstructed 8.06V state vector to EPS charging governor'
        ]
      }
    ],
    softwareChangesSummary: [
      'Sensor failure isolated in software without false subsystem trips.',
      'State observer accurately imputed battery voltage (8.06V) within 1.2% of ground truth.',
      'I2C bus reset scheduled safely without affecting core flight tasks.'
    ]
  },

  processing_seu: {
    id: 'processing_seu',
    title: 'SEPP Single-Event Upset & Memory Checksum Mismatch',
    affectedSubsystemId: 'obc',
    subsystemName: 'Onboard Computing & SEPP Card',
    nominalMetric: { label: 'OBC Task Latency', value: '4.2 ms (Cycle OK)' },
    faultMetric: { label: 'OBC Task Latency', value: '88.4 ms (EDAC Error)' },
    recoveredMetric: { label: 'OBC Task Latency', value: '5.1 ms (Restored)' },
    telemetryChannelId: 'OBC_TEMP',
    nominalStreamVal: 22.4,
    faultStreamVal: 48.6,
    recoveredStreamVal: 24.1,
    detectionReason: 'SEPP core watchdog timer reset and memory EDAC double-bit parity mismatch.',
    detectorTriggered: 'Isolation Forest (ML)',
    zScoreVal: 3.45,
    mlScoreVal: 0.88,
    diagnosisSummary: 'Radiation-induced Single-Event Upset (SEU) in SEPP experiment memory space.',
    configEvaluationPrompt: 'Evaluating core thread isolation, scrubbing memory pages, and task priority reallocation...',
    configOptions: [
      {
        id: 'p_ignore_fault',
        name: 'Ignore Parity Trip & Continue Execution',
        category: 'nominal',
        description: 'Allow experiment thread to continue running on unscrubbed RAM.',
        status: 'rejected',
        rejectionReason: 'Rejected: Memory corruption risks kernel panic and loss of flight command uplink.',
        actionsApplied: []
      },
      {
        id: 'p_task_reallocation',
        name: 'Memory Scrubbing & Task Priority Reallocation',
        category: 'task_priority',
        description: 'Quarantine corrupted memory pages, scrub cache lines, and pin critical flight tasks to core 0.',
        status: 'selected',
        actionsApplied: [
          'Quarantined damaged physical page tables in Linux kernel memory manager',
          'Triggered hardware EDAC scrub cycle on SEPP DDR3 memory',
          'Re-allocated high-priority flight housekeeping tasks to fault-free core 0',
          'Reloaded experiment worker container from verified flash image'
        ]
      }
    ],
    softwareChangesSummary: [
      'Radiation-induced bit flip mitigated entirely through software memory scrubbing.',
      'OBC task execution latency returned to 5.1 ms.',
      'Flight computer stability preserved without requiring satellite hard reboot.'
    ]
  }
};
