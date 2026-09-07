import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Edit3,
  Check,
  Music,
  Camera,
  Sparkles,
  MessageSquare,
  Clock,
} from 'lucide-react';
import {
  ScriptScene,
  StoryboardScene,
  StoryDocument,
} from '../types/pipeline.js';

interface ScriptStoryboardViewProps {
  story?: StoryDocument;
  script?: ScriptScene[];
  storyboard?: StoryboardScene[];
  onUpdateScript?: (newScript: ScriptScene[]) => Promise<void>;
}

export const ScriptStoryboardView: React.FC<ScriptStoryboardViewProps> = ({
  story,
  script = [],
  storyboard = [],
  onUpdateScript,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'storyboard' | 'narrative'>('script');
  const [editingSceneIdx, setEditingSceneIdx] = useState<number | null>(null);
  const [editNarratorText, setEditNarratorText] = useState('');

  const handleStartEdit = (idx: number) => {
    setEditingSceneIdx(idx);
    setEditNarratorText(script[idx]?.narratorDialogue || '');
  };

  const handleSaveEdit = async () => {
    if (editingSceneIdx === null || !onUpdateScript) return;
    const updated = [...script];
    updated[editingSceneIdx] = {
      ...updated[editingSceneIdx],
      narratorDialogue: editNarratorText,
    };
    await onUpdateScript(updated);
    setEditingSceneIdx(null);
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'script'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Spoken Script ({script.length} scenes)</span>
          </button>

          <button
            onClick={() => setActiveTab('storyboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'storyboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Storyboard & Camera Choreography</span>
          </button>

          <button
            onClick={() => setActiveTab('narrative')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'narrative'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>5-Act Narrative & Hook</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCRIPT VIEW */}
      {activeTab === 'script' && (
        <div className="space-y-4">
          {script.map((scene, idx) => (
            <div
              key={scene.sceneId || idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                    {scene.sceneNumber}
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">{scene.location}</h5>
                    <p className="text-[11px] text-slate-400">
                      {scene.timeOfDay} • Est. Duration: {scene.durationSeconds}s • Transition: {scene.transitionToNext}
                    </p>
                  </div>
                </div>

                {onUpdateScript && (
                  <button
                    onClick={() => handleStartEdit(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Line</span>
                  </button>
                )}
              </div>

              {/* Narrator Dialogue */}
              {editingSceneIdx === idx ? (
                <div className="space-y-2">
                  <textarea
                    value={editNarratorText}
                    onChange={(e) => setEditNarratorText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/60 text-slate-100 text-sm focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSceneIdx(null)}
                      className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs rounded-lg bg-amber-500 text-slate-950 font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Line
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block mb-1">
                    NARRATOR:
                  </span>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    &ldquo;{scene.narratorDialogue}&rdquo;
                  </p>
                </div>
              )}

              {/* Spoken Character Dialogues */}
              {scene.characterDialogue && scene.characterDialogue.length > 0 && (
                <div className="space-y-2">
                  {scene.characterDialogue.map((dia, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex items-start gap-2.5"
                    >
                      <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono text-[11px] font-bold">
                        {dia.character} ({dia.emotion}):
                      </span>
                      <p className="text-xs text-slate-200 leading-normal flex-1">
                        &ldquo;{dia.line}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stage Directives & Audio Cues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-800/50 text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Acting Cue:</strong> {scene.animationCue}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-800/50 text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>SFX:</strong> {scene.sfxCues?.join(', ') || 'Nature ambient'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STORYBOARD & CAMERA CHOREOGRAPHY */}
      {activeTab === 'storyboard' && (
        <div className="space-y-4">
          {storyboard.map((sb) => (
            <div
              key={sb.sceneId}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                    #{sb.sceneNumber}
                  </span>
                  <h5 className="text-sm font-bold text-slate-100">{sb.environment}</h5>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    {sb.cameraAngle.toUpperCase()} • {sb.cameraMovement.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {sb.durationSeconds}s
                  </span>
                </div>
              </div>

              {/* Props & Lighting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Lighting Direction:</span>
                  <span className="text-slate-200">{sb.lighting}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Layer Props:</span>
                  <span className="text-slate-200">{sb.props.join(', ')}</span>
                </div>
              </div>

              {/* Keyframes timeline */}
              <div>
                <span className="text-xs font-semibold text-slate-400 mb-1.5 block">
                  Character Acting Keyframes:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {sb.animationKeyframes.map((kf, kfIdx) => (
                    <div
                      key={kfIdx}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-amber-400 font-bold">{kf.timestamp}s</span>
                        <span className="text-indigo-300 capitalize">{kf.facialExpression}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{kf.characterAction}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Pos: ({kf.positionX}%, {kf.positionY}%) • LipSync: {kf.isTalking ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 5-ACT NARRATIVE */}
      {activeTab === 'narrative' && story && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              ACT 1: RAPID HOOK (0-15s WONDER TRIGGER)
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{story.act1Hook}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
              ACT 2: CORE PROBLEM & CONFLICT
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{story.act2Problem}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              ACT 3: ADVENTURE ESCALATION & INGENUITY
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{story.act3Escalation}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              ACT 4: CLIMAX & TEAMWORK HARMONY
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{story.act4Climax}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase">
              ACT 5: WARM RESOLUTION & MORAL PAYOFF
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">{story.act5Resolution}</p>
          </div>

          {/* Retention Beats */}
          {story.retentionBeats && story.retentionBeats.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mt-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Audience Retention Checkpoints (Feed Forward):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                {story.retentionBeats.map((beat, bIdx) => (
                  <div key={bIdx} className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                    {beat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
