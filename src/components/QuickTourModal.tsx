import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Compass, Satellite, Sliders, Play, GitBranch } from 'lucide-react';

interface QuickTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

export const QuickTourModal: React.FC<QuickTourModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to the Autonomous Satellite Simulation',
      subtitle: '30-Second Overview for Reviewers & Judges',
      content: 'This educational engineering prototype demonstrates in-flight telemetry sensing, anomaly detection, and autonomous software reconfiguration to sustain spacecraft health in orbit.',
      badge: 'MISSION SIMULATION',
      icon: <Satellite className="w-8 h-8 text-cyan-400" />,
      targetTab: 'simulation'
    },
    {
      title: '1. 3D Spacecraft & Closed-Loop Autonomy',
      subtitle: 'Nominal → Fault Injection → Detection → Reconfiguration → Safe State',
      content: 'Rotate the interactive 3D satellite, inject simulated subsystem anomalies, view the live telemetry stream, and watch the onboard controller select valid software recovery policies.',
      badge: '3D SPACECRAFT HUD',
      icon: <GitBranch className="w-8 h-8 text-cyan-400" />,
      targetTab: 'simulation'
    },
    {
      title: '2. Experiment Data & Anomaly Detectors',
      subtitle: 'Statistical Z-Score + Isolation Forest + Hybrid Gating',
      content: 'Upload wide/long CSV datasets, tune detection hyper-parameters, inspect the confusion matrix (Precision, Recall, F1), and examine the embedded C/Python artifacts.',
      badge: 'EXPERIMENT DATA',
      icon: <Sliders className="w-8 h-8 text-indigo-400" />,
      targetTab: 'experiment'
    },
    {
      title: '3. Reference Hardware Architecture & Evidence',
      subtitle: 'OPS-SAT Reference Profile, Caltech Research & Provenance',
      content: 'Inspect documented ESA OPS-SAT subsystems (SEPP Cyclone V SoC, ARM Cortex-A9, mass memory) and the honest conceptual boundaries of self-healing research.',
      badge: 'VERIFIED SOURCES',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      targetTab: 'hardware'
    }
  ];

  const current = tourSteps[step];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
      onNavigate(tourSteps[step + 1].targetTab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      onNavigate(tourSteps[step - 1].targetTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b1220] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            {current.icon}
          </div>
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-telemetry bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {current.badge}
            </span>
            <h3 className="font-display text-lg font-bold text-white mt-1">
              {current.title}
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-cyan-400 font-telemetry">
            {current.subtitle}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {current.content}
          </p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === step ? 'bg-cyan-400 w-5' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-telemetry transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-telemetry font-bold transition flex items-center gap-1"
            >
              <span>{step === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
