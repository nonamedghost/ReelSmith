import React from 'react';
import { Check, Loader2, X, Circle } from 'lucide-react';

export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface PipelineStep {
  key: string;
  label: string;
  description: string;
}

interface StepTrackerProps {
  // currentStage: string;
  statuses: Record<string, StepStatus>;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { key: 'script', label: 'Script', description: 'Generating narration script' },
  { key: 'metadata', label: 'Metadata', description: 'Generating SEO tags and info' },
  { key: 'tts', label: 'TTS Audio', description: 'Synthesizing voice narration' },
  { key: 'subtitles', label: 'Subtitles', description: 'Transcribing & creating captions' },
  { key: 'clips', label: 'Video Clips', description: 'Fetching stock clips or AI visuals' },
  { key: 'merge', label: 'Merge & Render', description: 'FFmpeg rendering final MP4' },
  { key: 'validate', label: 'Validation', description: 'Verifying outputs compliance' },
  { key: 'youtube', label: 'YouTube Upload', description: 'Publishing reel to channel' },
];

export const StepTracker: React.FC<StepTrackerProps> = ({/* currentStage, */ statuses, }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pipeline Steps</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PIPELINE_STEPS.map((step) => {
          const status = statuses[step.key] || 'pending';

          let icon = <Circle className="w-5 h-5 text-slate-600" />;
          let cardBorderClass = 'border-slate-800 bg-slate-900/30';
          let textColorClass = 'text-slate-500';

          if (status === 'success') {
            icon = (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            );
            cardBorderClass = 'border-emerald-500/30 bg-emerald-500/5';
            textColorClass = 'text-slate-300';
          } else if (status === 'running') {
            icon = <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />;
            cardBorderClass = 'border-violet-500/40 bg-violet-500/5 ring-1 ring-violet-500/30 animate-pulse';
            textColorClass = 'text-white font-medium';
          } else if (status === 'failed') {
            icon = (
              <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <X className="w-3 h-3" />
              </div>
            );
            cardBorderClass = 'border-rose-500/30 bg-rose-500/5';
            textColorClass = 'text-rose-300';
          }

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 ${cardBorderClass}`}
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs truncate ${textColorClass}`}>{step.label}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepTracker;
