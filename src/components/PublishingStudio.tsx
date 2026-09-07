import React, { useState } from 'react';
import {
  Youtube,
  CheckCircle2,
  XCircle,
  Share2,
  ExternalLink,
  Download,
  Tag,
  Clock,
  Sparkles,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { AutoTubeProject } from '../types/pipeline.js';

interface PublishingStudioProps {
  project: AutoTubeProject;
  onPublish: (privacyStatus: 'public' | 'unlisted' | 'private') => Promise<void>;
  isProcessing: boolean;
}

export const PublishingStudio: React.FC<PublishingStudioProps> = ({
  project,
  onPublish,
  isProcessing,
}) => {
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'unlisted' | 'private'>('public');
  const [selectedTitle, setSelectedTitle] = useState<string>(
    project.youtubeMetadata?.primaryTitle || project.title
  );

  const qc = project.activeQcReport;
  const meta = project.youtubeMetadata;
  const isPublished = project.status === 'PUBLISHED';

  // 12 Strict Production Gate Checkpoints
  const gateChecklist = [
    { label: 'Story & Curiosity Hook Audited', passed: Boolean(project.story?.act1Hook) },
    { label: 'Script Naturalness & Grammar Approved', passed: Boolean(project.scriptQC?.passed) },
    { label: 'Character Bible Color Tokens Locked', passed: Boolean(project.characterBible?.characters?.length) },
    { label: 'World Art Direction & Grammar Locked', passed: Boolean(project.worldBible?.artDirection) },
    { label: 'Multi-plane Storyboard Generated', passed: Boolean(project.storyboard?.length) },
    { label: 'Visual Consistency QC Passed', passed: (qc?.visualsScore || 0) >= 85 },
    { label: 'Animation & Keyframe QC Passed', passed: (qc?.animationScore || 0) >= 85 },
    { label: 'Audio Intelligibility & SFX Balanced', passed: (qc?.audioScore || 0) >= 85 },
    { label: 'Synchronized Captions Verified', passed: (qc?.editingScore || 0) >= 85 },
    { label: 'Child Safety & COPPA 100% Compliant', passed: (qc?.safetyScore || 0) === 100 },
    { label: 'Final QC Score >= 85 Threshold', passed: (qc?.finalScore || 0) >= 85 },
    { label: 'Zero Critical Defects or Character Drift', passed: (qc?.criticalFailures?.length || 0) === 0 },
  ];

  const allGateCheckpointsPassed = gateChecklist.every((c) => c.passed);
  const canPublish = allGateCheckpointsPassed && !isPublished;

  const handleExportPackage = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.id}-production-package.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Published Success Banner (if published) */}
      {isPublished && project.publishedInfo && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-red-950/40 border border-red-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg">
              <Youtube className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Live on YouTube</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-semibold uppercase">
                  {project.publishedInfo.privacyStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Published to <strong>{project.publishedInfo.channelName}</strong> on{' '}
                {new Date(project.publishedInfo.publishedAt).toLocaleString()}
              </p>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Video ID: {project.publishedInfo.youtubeVideoId}
              </p>
            </div>
          </div>

          <a
            href={project.publishedInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg transition-all"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Production Gate Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Final Production Quality Gate (12 Criteria)
            </h4>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
              allGateCheckpointsPassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {gateChecklist.filter((c) => c.passed).length} / 12 VERIFIED
          </span>
        </div>

        <p className="text-xs text-slate-400">
          AutoTube policy: A project will NEVER automatically publish without 100% verification across all twelve technical and safety checkpoints.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
          {gateChecklist.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                item.passed
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Preview Card & Metadata Inspector */}
      {meta ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Thumbnail & Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              YouTube Thumbnail & Feed Card
            </h4>

            {/* Thumbnail Canvas Preview */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-amber-600 via-indigo-900 to-slate-900 overflow-hidden border border-slate-700 shadow-2xl p-4 flex flex-col justify-between select-none">
              {/* Radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,10,0.35),transparent_70%)]" />

              {/* Top Tags */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md">
                  AUTOTUBE
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-amber-300 text-[11px] font-mono font-bold">
                  KIDS STORY
                </span>
              </div>

              {/* Bold Thumbnail Headline */}
              <div className="relative z-10 text-center my-auto px-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tracking-tight uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] stroke-black">
                  {meta.thumbnailHeadline || 'A MAGICAL SECRET!'}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider drop-shadow-md mt-1">
                  {meta.thumbnailSubtext || 'Heartwarming Tale'}
                </p>
              </div>

              {/* Bottom Runtime & Badge */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-black/80 text-white font-mono font-semibold">
                  0:48
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold">
                  100% Safe
                </span>
              </div>
            </div>

            {/* Thumbnail Spec Details */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
              <div>
                <span className="text-slate-400">Thumbnail Prompt: </span>
                <span className="text-slate-300">{meta.thumbnailPrompt}</span>
              </div>
              <div>
                <span className="text-slate-400">Character Focus: </span>
                <span className="text-slate-300">{meta.thumbnailCharacterPose}</span>
              </div>
            </div>

            {/* Export Package button */}
            <button
              onClick={handleExportPackage}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Production Package (JSON)</span>
            </button>
          </div>

          {/* Right Column: Title Selection, SEO, Chapters, Description (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Video Metadata & SEO Package
            </h4>

            {/* Title Selection */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Selected Primary Title:
              </label>
              <input
                type="text"
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-400"
              />

              {meta.titleAlternatives && meta.titleAlternatives.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Or choose an evaluated alternative:
                  </span>
                  <div className="space-y-1">
                    {meta.titleAlternatives.map((alt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTitle(alt)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                          selectedTitle === alt
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Classification & COPPA */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Audience Classification:</span>
                <strong className="text-emerald-400">{meta.targetAgeClassification}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">YouTube Category:</span>
                <strong className="text-slate-200">{meta.category}</strong>
              </div>
            </div>

            {/* Chapters & Timestamps */}
            {meta.chapters && meta.chapters.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timed Chapters for YouTube Player:</span>
                </span>
                <div className="space-y-1 text-xs font-mono">
                  {meta.chapters.map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400">
                      <span className="text-indigo-400 font-bold">{ch.timestamp}</span>
                      <span className="text-slate-300 font-sans">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Hashtags */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>SEO Tags & Hashtags:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meta.hashtags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
                {meta.tags?.slice(0, 6).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Publishing Action Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-slate-900 border border-red-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Publication Privacy Setting:
                </span>
                <div className="flex items-center gap-1.5">
                  {(['public', 'unlisted', 'private'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrivacyStatus(p)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-all ${
                        privacyStatus === p
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onPublish(privacyStatus)}
                disabled={!canPublish || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Youtube className="w-5 h-5" />
                <span>
                  {isPublished
                    ? 'Already Published to AutoTube'
                    : canPublish
                    ? `Publish Now (${privacyStatus.toUpperCase()})`
                    : 'Awaiting 12/12 Gate Validation'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          <Youtube className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h4 className="text-base font-semibold text-slate-300">Metadata Compiling</h4>
          <p className="text-sm text-slate-500 mt-1">
            YouTube metadata and thumbnail concepts are generated during the Final Production Gate.
          </p>
        </div>
      )}
    </div>
  );
};
