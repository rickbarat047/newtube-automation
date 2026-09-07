import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AutoTubeProject, ProductionStage } from '../types/pipeline.js';

interface PipelineStageTrackerProps {
  project: AutoTubeProject;
  onAdvanceStep: () => Promise<void>;
  isProcessing: boolean;
}

const ORDERED_STAGES: Array<{ key: ProductionStage; label: string }> = [
  { key: 'IDEA', label: '1. Idea' },
  { key: 'STORY_DEVELOPMENT', label: '2. Story' },
  { key: 'SCRIPTING', label: '3. Script' },
  { key: 'CHARACTER_DESIGN', label: '4. Bibles' },
  { key: 'STORYBOARDING', label: '5. Storyboard' },
  { key: 'SCENE_GENERATION', label: '6. Visuals' },
  { key: 'ANIMATION', label: '7. Animation' },
  { key: 'VOICEOVER', label: '8. Audio' },
  { key: 'EDITING', label: '9. Edit' },
  { key: 'QC', label: '10. QC Audit' },
  { key: 'FINAL_QC', label: '11. Gate' },
  { key: 'READY', label: '12. Ready' },
  { key: 'PUBLISHED', label: '13. Live' },
];

export const PipelineStageTracker: React.FC<PipelineStageTrackerProps> = ({
  project,
  onAdvanceStep,
  isProcessing,
}) => {
  const currentStageIndex = ORDERED_STAGES.findIndex((s) => s.key === project.status);
  const isFailed = project.status === 'FAILED';
  const isRepairing = project.status === 'REPAIR';
  const isReady = project.status === 'READY';
  const isPublished = project.status === 'PUBLISHED';

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      {/* Top Header: Current status & Progress bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Automated Production Stage:
            </h4>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                isPublished
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : isReady
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isRepairing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : isFailed
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {project.status.replace(/_/g, ' ')}
            </span>

            {project.retryCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-mono">
                RETRY: {project.retryCount}/{project.maxRetries}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-100 mt-1">
            {project.currentStageName || 'Processing pipeline...'}
          </p>
        </div>

        {/* Pipeline Controls */}
        <div className="flex items-center gap-2">
          {!isPublished && !isReady && (
            <button
              onClick={onAdvanceStep}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Advance Next Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isPublished
              ? 'bg-gradient-to-r from-red-500 to-amber-500'
              : isReady
              ? 'bg-emerald-500'
              : isRepairing
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-indigo-500 to-amber-400'
          }`}
          style={{ width: `${project.progressPercent}%` }}
        />
      </div>

      {/* Horizontal Stage Stepper */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 min-w-[720px]">
          {ORDERED_STAGES.map((stg, idx) => {
            const isCompleted =
              currentStageIndex > idx || isReady || isPublished;
            const isCurrent =
              currentStageIndex === idx && !isReady && !isPublished;

            return (
              <div
                key={stg.key}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  isCurrent
                    ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300'
                    : isCompleted
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="text-[10px] font-mono font-medium whitespace-nowrap">
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
