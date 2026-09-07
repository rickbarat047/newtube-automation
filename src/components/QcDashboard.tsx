import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  RotateCcw,
  UserCheck,
  Eye,
  Music,
  Film,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { AutoTubeProject, QualityControlReport } from '../types/pipeline.js';

interface QcDashboardProps {
  project: AutoTubeProject;
  onSimulateQcFail: () => Promise<void>;
  onExecuteRepair: () => Promise<void>;
  onHumanOverride: () => Promise<void>;
  isProcessing: boolean;
}

export const QcDashboard: React.FC<QcDashboardProps> = ({
  project,
  onSimulateQcFail,
  onExecuteRepair,
  onHumanOverride,
  isProcessing,
}) => {
  const qc = project.activeQcReport;
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  if (!qc) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h4 className="text-base font-semibold text-slate-300">No Quality Control Report Yet</h4>
        <p className="text-sm text-slate-500 mt-1">
          Quality Control is automatically conducted during Phase 9 of the production pipeline.
        </p>
      </div>
    );
  }

  const dimensions = [
    {
      name: 'Story & Narrative',
      weight: '20%',
      score: qc.storyScore,
      icon: BookOpen,
      data: qc.stageBreakdown?.story,
    },
    {
      name: 'Visuals & Character Consistency',
      weight: '30%',
      score: qc.visualsScore,
      icon: Eye,
      data: qc.stageBreakdown?.visuals,
    },
    {
      name: 'Animation & Choreography',
      weight: '20%',
      score: qc.animationScore,
      icon: Sparkles,
      data: qc.stageBreakdown?.animation,
    },
    {
      name: 'Audio & Intelligibility',
      weight: '15%',
      score: qc.audioScore,
      icon: Music,
      data: qc.stageBreakdown?.audio,
    },
    {
      name: 'Editing & Rhythm',
      weight: '10%',
      score: qc.editingScore,
      icon: Film,
      data: qc.stageBreakdown?.editing,
    },
    {
      name: 'Child Safety & COPPA',
      weight: '5%',
      score: qc.safetyScore,
      icon: ShieldCheck,
      data: qc.stageBreakdown?.safety,
      strictPass: true,
    },
  ];

  const hasCriticalFailures = qc.criticalFailures && qc.criticalFailures.length > 0;
  const isPassingScore = qc.finalScore >= 85 && !hasCriticalFailures;

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Score & Gate Status */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isPassingScore
            ? 'bg-emerald-950/30 border-emerald-800/60 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
            : 'bg-rose-950/30 border-rose-800/60 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border ${
                isPassingScore
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {qc.finalScore}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  {isPassingScore ? 'Automated Quality Gate Passed' : 'Quality Gate Blocked — Defect Detected'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isPassingScore
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPassingScore ? 'PASSED (>= 85)' : 'REQUIRES REPAIR'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Audit conducted: {new Date(qc.timestamp).toLocaleTimeString()} • Retries used:{' '}
                <strong className="text-slate-200">{project.retryCount} / {project.maxRetries}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons: Targeted Repair, Defect Simulation, Human Override */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {!isPassingScore && (
              <button
                onClick={onExecuteRepair}
                disabled={isProcessing || project.retryCount >= project.maxRetries}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" />
                <span>Execute Targeted Repair</span>
              </button>
            )}

            {isPassingScore && (
              <button
                onClick={onSimulateQcFail}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors"
                title="Inject a test character drift defect on Scene 3 to demonstrate automated targeted repair"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate QC Defect</span>
              </button>
            )}

            <button
              onClick={() => setShowOverrideConfirm(true)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Human Override</span>
            </button>
          </div>
        </div>

        {/* Critical Failure alerts */}
        {hasCriticalFailures && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Critical Production Failure Detected:</p>
              <ul className="list-disc list-inside mt-1 text-xs text-rose-300 space-y-0.5">
                {qc.criticalFailures.map((cf, i) => (
                  <li key={i}>{cf}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Targeted Repair Recommendations */}
        {qc.repairRecommendations && qc.repairRecommendations.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-sm flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Targeted Repair Action Plan:</p>
              <div className="space-y-1.5 mt-1.5 text-xs text-amber-300">
                {qc.repairRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-2 bg-amber-900/30 px-2.5 py-1.5 rounded-lg">
                    <span className="font-mono text-amber-400">[{rec.stage}]</span>
                    {rec.targetSceneId && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-800/50 text-amber-200 font-mono">
                        {rec.targetSceneId}
                      </span>
                    )}
                    <span>{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6 Dimensions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          const passed = dim.score >= 85;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{dim.name}</h4>
                      <span className="text-[11px] text-slate-500">Weight: {dim.weight}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dim.score}
                    </span>
                    {passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      passed ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                {/* Inspector notes */}
                {dim.data?.notes && (
                  <ul className="text-[11px] text-slate-400 space-y-1 mt-2">
                    {dim.data.notes.map((note: string, nIdx: number) => (
                      <li key={nIdx} className="flex items-start gap-1">
                        <span className="text-slate-600">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Repair History Log */}
      {project.repairLogs && project.repairLogs.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Automatic Repair Audit History ({project.repairLogs.length})
          </h4>
          <div className="space-y-2">
            {project.repairLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                    {log.stage}
                  </span>
                  {log.targetSceneId && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                      {log.targetSceneId}
                    </span>
                  )}
                  <span>{log.action}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-semibold">
                  {log.result.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Human Override Modal */}
      {showOverrideConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Confirm Human Operator Override</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are manually overriding the automated Quality Control gate. This will sign off the production as
              READY for export and unlock the publishing gate.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowOverrideConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowOverrideConfirm(false);
                  await onHumanOverride();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md"
              >
                Authorize Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
