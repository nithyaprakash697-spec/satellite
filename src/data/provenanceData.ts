/**
 * Data Provenance, External Citations, and Evidence Items
 * Strictly separated into VERIFIED SOURCE, USER DATA, SIMULATED, and ASSUMPTION
 */

import { DatasetMeta, EvidenceItem } from '../types';

export const OFFICIAL_SOURCES = [
  {
    title: 'ESA OPS-SAT Telemetry Documentation',
    url: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html',
    desc: 'Publicly documented telemetry channels, data structures, and housekeeping parameters for the OPS-SAT mission.',
    badge: 'VERIFIED SOURCE' as const
  },
  {
    title: 'ESA Anomaly Dataset (Zenodo)',
    url: 'https://zenodo.org/records/12528696',
    desc: 'Open-access spacecraft anomaly benchmark dataset curated by European Space Agency researchers.',
    badge: 'VERIFIED SOURCE' as const
  },
  {
    title: 'ESA Anomaly Dataset GitHub Repository',
    url: 'https://github.com/esa/anomaly-dataset',
    desc: 'Codebase, evaluation scripts, and metadata definitions for the ESA spacecraft anomaly detection benchmark.',
    badge: 'VERIFIED SOURCE' as const
  },
  {
    title: 'Caltech Self-Healing Circuit Research',
    url: 'https://www.caltech.edu/about/news/creating-indestructible-self-healing-circuits-38815',
    desc: 'Seminal microchip self-healing power amplifier research by Kaushik Sengupta and Ali Hajimiri at Caltech.',
    badge: 'VERIFIED SOURCE' as const
  },
  {
    title: 'ESA OPS-SAT Mission Overview',
    url: 'https://www.esa.int/Enabling_Support/Operations/OPS-SAT',
    desc: 'Official European Space Agency 3U CubeSat flying laboratory mission specifications and objectives.',
    badge: 'VERIFIED SOURCE' as const
  }
];

export const DATASET_CATALOG: DatasetMeta[] = [
  {
    id: 'opssat_telemetry_demo',
    name: 'OPS-SAT Documented Channels Baseline',
    organization: 'European Space Agency (ESA) Public Reference',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html',
    type: 'illustrative',
    labelsType: 'source-provided',
    dateAccessed: '2026-09-17',
    limitations: 'Illustrative demonstration dataset based on publicly documented OPS-SAT telemetry channels, ranges, and eclipse cycles. It does not represent uncurated raw space telemetry.',
    rowsCount: 200,
    channelsCount: 6,
    timeRange: '2023-10-14T12:00:00Z to 2023-10-14T15:19:00Z (1 orbit cycle)',
    missingCount: 3,
    hasGroundTruthLabels: true
  },
  {
    id: 'esa_anomaly_subset_demo',
    name: 'ESA Anomaly Benchmark (Representative Subset)',
    organization: 'ESA Advanced Concepts Team & Operations (Zenodo 12528696)',
    sourceUrl: 'https://zenodo.org/records/12528696',
    type: 'illustrative',
    labelsType: 'source-provided',
    dateAccessed: '2026-09-17',
    limitations: 'Subset reproducing ESA anomaly benchmark schema (time-series, value, labeled anomalous interval). Does not claim to be the full multi-gigabyte repository.',
    rowsCount: 220,
    channelsCount: 4,
    timeRange: 'Benchmark Test Window (220 samples, 1 Hz nominal cadence)',
    missingCount: 2,
    hasGroundTruthLabels: true
  }
];

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev-1',
    category: 'VERIFIED SOURCE',
    title: 'OPS-SAT Satellite Subsystem Architecture',
    summary: 'Hardware specifications derived directly from official ESA mission documentation.',
    details: 'The SEPP platform (Altera Cyclone V SoC, Dual-Core ARM Cortex-A9 @ 800 MHz, 1 GB DDR3 RAM, Linux) and 8 GB mass memory are documented in official ESA OPS-SAT documentation. No undocumented clock speeds, radiation limits, or temperature ceilings are claimed.',
    sourceUrl: 'https://live.opssat.esa.int/ops-sat-1/docs/tm_analysis.html',
    citationLabel: 'ESA OPS-SAT TM Analysis (2020)'
  },
  {
    id: 'ev-2',
    category: 'VERIFIED SOURCE',
    title: 'ESA Anomaly Dataset Benchmark & Structure',
    summary: 'Benchmark methodology adhering to the peer-reviewed dataset released on Zenodo.',
    details: 'The ESA Anomaly Dataset (Zenodo record 12528696) provides labeled spacecraft telemetry segments for evaluating anomaly detection algorithms under realistic class imbalances. This lab reproduces its schema and evaluation metric protocols.',
    sourceUrl: 'https://zenodo.org/records/12528696',
    citationLabel: 'Zenodo 12528696 / ESA'
  },
  {
    id: 'ev-3',
    category: 'VERIFIED SOURCE',
    title: 'Caltech Self-Healing Integrated Circuit Inspiration',
    summary: 'Conceptual heritage acknowledged from Dr. Hajimiri and Dr. Sengupta’s self-healing circuit research.',
    details: 'Caltech researchers demonstrated an RF power amplifier microchip with on-chip sensors, actuator switches, and an autonomous state-machine controller. This project explicitly cites their research as inspiration for autonomous sensing-and-switching policies at the system level.',
    sourceUrl: 'https://www.caltech.edu/about/news/creating-indestructible-self-healing-circuits-38815',
    citationLabel: 'Caltech News & IEEE JSSC (2013)'
  },
  {
    id: 'ev-4',
    category: 'USER DATA',
    title: 'Telemetry CSV Ingestion & Local Calculations',
    summary: 'All statistics, Z-scores, and classification confusion matrices are computed dynamically from active data.',
    details: 'When a user uploads a CSV file or adjusts detector window/threshold sliders, all numbers in the visualization and evaluation panels are calculated deterministically on the client. No metrics are hardcoded or fabricated.',
    citationLabel: 'Local Client State'
  },
  {
    id: 'ev-5',
    category: 'SIMULATED',
    title: 'Spacecraft Autonomous Reconfiguration Sequence',
    summary: 'Demonstrates a software-in-the-loop recovery sequence across virtual redundant paths.',
    details: 'The switching from primary EPS bus to redundant power bus, or thermal throttling of the SEPP SoC, is simulated in software logic. It demonstrates the decision-making loop ("Detect → Diagnose → Reconfigure → Continue") without physically moving real satellite hardware.',
    citationLabel: 'SIL State Machine'
  },
  {
    id: 'ev-6',
    category: 'ASSUMPTION',
    title: 'Redundancy Paths & Reconfiguration Timing',
    summary: 'Subsystem redundancy models assume standard aerospace cross-strapping topologies.',
    details: 'The simulation assumes cold-standby or warm-standby redundant channels for EPS, ADCS magnetorquers, and communications transceivers. Switching latency is modeled as a 3-second transition delay based on typical flight software commanding cycles.',
    citationLabel: 'Engineering Hypothesis'
  }
];
