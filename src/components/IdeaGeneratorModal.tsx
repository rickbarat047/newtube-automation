import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Play,
  Check,
  RotateCcw,
  Sliders,
  Award,
  AlertCircle,
} from 'lucide-react';
import { IdeaCandidate, TargetAge, AutomationMode } from '../types/pipeline.js';

interface IdeaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (idea: IdeaCandidate, mode: AutomationMode) => Promise<void>;
  isProcessing: boolean;
}

export const IdeaGeneratorModal: React.FC<IdeaGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectIdea,
  isProcessing,
}) => {
  const [category, setCategory] = useState('Gentle Adventure & Wonder');
  const [targetAge, setTargetAge] = useState<TargetAge>('4-6');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [candidates, setCandidates] = useState<IdeaCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<IdeaCandidate | null>(null);
  const [mode, setMode] = useState<AutomationMode>('FULL_AUTO');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, targetAge, customPrompt }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCandidates(data);
        if (data.length > 0) setSelectedCandidate(data[0]);
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchProduction = async () => {
    if (!selectedCandidate) return;
    await onSelectIdea(selectedCandidate, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                AI Idea Engine & Candidate Scoring
              </h3>
              <p className="text-xs text-slate-400">
                Synthesizes child-safe stories evaluated across 9 retention & visual parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Options Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Story Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option>Gentle Adventure & Wonder</option>
                <option>Animal Friends & Problem Solving</option>
                <option>Magical Bedtime Lullaby Story</option>
                <option>Curiosity, Science & Everyday Mysteries</option>
                <option>Kindness, Sharing & Empathy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Age Group:
              </label>
              <div className="flex items-center gap-1.5">
                {(['4-6', '7-8', '9-10'] as TargetAge[]).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setTargetAge(age)}
                    className={`flex-1 py-2 text-xs rounded-xl font-medium transition-colors ${
                      targetAge === age
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {age} yrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Custom Prompt / Hero Note:
              </label>
              <input
                type="text"
                placeholder="e.g., A little bear and a raincloud..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Deduplication active: Checks against past channel uploads.
            </span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{candidates.length > 0 ? 'Regenerate Candidates' : 'Generate & Evaluate Ideas'}</span>
            </button>
          </div>

          {/* Candidates List */}
          {candidates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Evaluated Idea Candidates ({candidates.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {candidates.map((cand) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                            SCORE: {cand.scores.overallScore}
                          </span>
                          <span className="text-[11px] text-slate-500">{cand.targetAge} yrs</span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-100 mb-1 leading-snug">
                          {cand.title}
                        </h5>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {cand.logline}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Characters: {cand.mainCharacters.slice(0, 2).join(', ')}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Candidate Detailed Evaluation */}
          {selectedCandidate && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-amber-300">{selectedCandidate.title}</h5>
                  <p className="text-xs text-slate-400">{selectedCandidate.genre} • Moral: {selectedCandidate.lessonTheme}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Production Mode:</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as AutomationMode)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="FULL_AUTO">FULL AUTO (End-to-End)</option>
                    <option value="SEMI_AUTO">SEMI AUTO (Pause at Gate)</option>
                    <option value="MANUAL">MANUAL (Stage-by-Stage)</option>
                  </select>
                </div>
              </div>

              {/* 9 Factor Radar/Scores */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Originality</span>
                  <strong className="text-slate-200">{selectedCandidate.scores.originality}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Story Potential</span>
                  <strong className="text-slate-200">{selectedCandidate.scores.storyPotential}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Child Appeal</span>
                  <strong className="text-slate-200">{selectedCandidate.scores.childAppeal}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Visual Potential</span>
                  <strong className="text-slate-200">{selectedCandidate.scores.visualPotential}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Retention</span>
                  <strong className="text-slate-200">{selectedCandidate.scores.retentionPotential}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunchProduction}
            disabled={!selectedCandidate || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Production ({mode})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
