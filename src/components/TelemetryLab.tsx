import React, { useState, useRef } from 'react';
import { Upload, FileText, Database, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { TelemetryChannelMeta, TelemetryDataPoint, DatasetMeta, DetectionResult } from '../types';
import { parseTelemetryCsv } from '../utils/csvParser';
import { DATASET_CATALOG } from '../data/provenanceData';
import { TelemetryVisualization } from './TelemetryVisualization';

interface TelemetryLabProps {
  dataPoints: TelemetryDataPoint[];
  channels: TelemetryChannelMeta[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  activeDatasetMeta: DatasetMeta;
  onLoadDataset: (datasetId: string) => void;
  onUserCsvLoaded: (result: {
    dataPoints: TelemetryDataPoint[];
    channels: TelemetryChannelMeta[];
    meta: DatasetMeta;
  }) => void;
  detectionResult?: DetectionResult | null;
  detectorName?: string;
}

export const TelemetryLab: React.FC<TelemetryLabProps> = ({
  dataPoints,
  channels,
  selectedChannelId,
  onSelectChannel,
  activeDatasetMeta,
  onLoadDataset,
  onUserCsvLoaded,
  detectionResult,
  detectorName
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && !file.name.endsWith('.txt')) {
      setUploadError('Invalid file format. Please upload a plain text CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseTelemetryCsv(text);

        if (parsed.dataPoints.length === 0) {
          throw new Error('No valid data points found in CSV file.');
        }

        const userMeta: DatasetMeta = {
          id: `user_csv_${Date.now()}`,
          name: file.name,
          organization: 'User-Uploaded Satellite Telemetry',
          sourceUrl: 'Client File Ingestion',
          type: 'user_uploaded',
          labelsType: parsed.hasGroundTruthLabels ? 'injected-user' : 'none',
          dateAccessed: new Date().toISOString().split('T')[0],
          limitations: 'User-provided external CSV dataset. Column formats, cadence, and missingness are dependent on the provided file.',
          rowsCount: parsed.dataPoints.length,
          channelsCount: parsed.channels.length,
          timeRange: parsed.timeRange,
          missingCount: parsed.missingCount,
          hasGroundTruthLabels: parsed.hasGroundTruthLabels
        };

        onUserCsvLoaded({
          dataPoints: parsed.dataPoints,
          channels: parsed.channels,
          meta: userMeta
        });
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isDemo = activeDatasetMeta.type === 'illustrative';

  return (
    <div className="space-y-6">
      {/* Top Selector & Upload Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dataset Source Dropdown & Metadata */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-base font-bold text-white tracking-wide">
                  Telemetry Dataset Source
                </h3>
              </div>
              
              {isDemo ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-telemetry bg-amber-950/70 border border-amber-500/50 text-amber-300 font-semibold">
                  Illustrative demonstration data
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-telemetry bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-semibold">
                  User-uploaded telemetry
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-telemetry">
                SELECT DATASET PRESET OR USE UPLOADED FILE:
              </label>
              <select
                value={activeDatasetMeta.id.startsWith('user_csv') ? 'user' : activeDatasetMeta.id}
                onChange={(e) => {
                  if (e.target.value !== 'user') {
                    onLoadDataset(e.target.value);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="opssat_telemetry_demo">
                  OPS-SAT Documented Channels Baseline (Demonstration Data)
                </option>
                <option value="esa_anomaly_subset_demo">
                  ESA Anomaly Benchmark Representative Subset (Zenodo 12528696)
                </option>
                {activeDatasetMeta.type === 'user_uploaded' && (
                  <option value="user">
                    User File: {activeDatasetMeta.name}
                  </option>
                )}
              </select>
            </div>

            {/* Quick Metrics of Active Dataset */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs font-telemetry">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">TOTAL SAMPLES</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeDatasetMeta.rowsCount} rows</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">CHANNELS</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeDatasetMeta.channelsCount} cols</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">MISSING VALUES</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{activeDatasetMeta.missingCount} gaps</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">LABELS STATUS</div>
                <div className="text-xs font-semibold text-cyan-300 mt-0.5 truncate">
                  {activeDatasetMeta.hasGroundTruthLabels ? activeDatasetMeta.labelsType : 'None available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop CSV Uploader */}
        <div className="lg:col-span-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-xl border-2 border-dashed cursor-pointer transition text-center flex flex-col items-center justify-center min-h-[190px] ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept=".csv,.txt"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-sm font-semibold text-white">
              Drop Telemetry CSV or Click to Browse
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Supports both wide-format (channel per column) and long-format (timestamp, channel, value) files.
            </p>
            <div className="mt-2 text-[10px] font-telemetry text-cyan-400/80">
              Optional columns: anomaly_label (0/1), ml_anomaly_score, is_train
            </div>
          </div>

          {uploadError && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Visualization Panel */}
      <TelemetryVisualization
        dataPoints={dataPoints}
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={onSelectChannel}
        detectionResult={detectionResult}
        detectorName={detectorName}
        isDemonstrationData={isDemo}
      />

      {/* Mandatory Data Provenance Panel */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display text-base font-bold text-white tracking-wide">
              Data Provenance & Scientific Integrity Record
            </h3>
          </div>
          <span className="text-xs font-telemetry text-slate-400">
            Source Verification ID: {activeDatasetMeta.id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Dataset Name</span>
            <div className="font-semibold text-white">{activeDatasetMeta.name}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Organization / Origin</span>
            <div className="font-semibold text-slate-200">{activeDatasetMeta.organization}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Source Reference URL</span>
            {activeDatasetMeta.sourceUrl.startsWith('http') ? (
              <a
                href={activeDatasetMeta.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate"
              >
                <span className="truncate">{activeDatasetMeta.sourceUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <div className="font-semibold text-slate-300">{activeDatasetMeta.sourceUrl}</div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Data Classification</span>
            <div className="font-semibold text-amber-300">
              {activeDatasetMeta.type === 'illustrative'
                ? 'Demonstration Data (Publicly Modeled)'
                : activeDatasetMeta.type === 'user_uploaded'
                ? 'User-Provided Client Telemetry'
                : 'Real Satellite Telemetry Subset'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Anomaly Labels Provenance</span>
            <div className="font-semibold text-slate-200">
              {activeDatasetMeta.labelsType === 'source-provided'
                ? 'Source-Provided (Benchmark Interval)'
                : activeDatasetMeta.labelsType === 'injected-user'
                ? 'User-Provided Column'
                : 'No Labels Present (Unsupervised Evaluation Only)'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-telemetry text-slate-400 uppercase">Date Ingested / Accessed</span>
            <div className="font-semibold text-slate-200 font-telemetry">
              {activeDatasetMeta.dateAccessed || '2026-09-17'}
            </div>
          </div>
        </div>

        {/* Limitations Notice */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-400 font-telemetry text-[11px] uppercase">
            Documented Limitations & Scope Constraints
          </div>
          <p className="text-slate-300 leading-relaxed">
            {activeDatasetMeta.limitations}
          </p>
        </div>
      </div>
    </div>
  );
};
