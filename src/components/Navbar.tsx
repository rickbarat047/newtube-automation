import React from 'react';
import {
  Sparkles,
  Youtube,
  ShieldCheck,
  Plus,
  BarChart2,
  Tv,
  FolderOpen,
} from 'lucide-react';
import { AutoTubeProject, AutomationMode } from '../types/pipeline.js';

interface NavbarProps {
  projects: AutoTubeProject[];
  activeProject: AutoTubeProject | null;
  onSelectProject: (p: AutoTubeProject) => void;
  onOpenNewProductionModal: () => void;
  onToggleAnalytics: () => void;
  showAnalytics: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProductionModal,
  onToggleAnalytics,
  showAnalytics,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-slate-950 shadow-md">
            <Tv className="w-5 h-5 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-100 tracking-tight">
                AutoTube <span className="text-amber-400 font-medium text-xs">STUDIO</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                COPPA SAFE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Production Pipeline for High-Retention Children’s Animated Stories
            </p>
          </div>
        </div>

        {/* Center: Project Selector */}
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find((proj) => proj.id === e.target.value);
                  if (p) onSelectProject(p);
                }}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none max-w-[140px] sm:max-w-[220px] truncate"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="bg-slate-900 text-slate-200">
                    {proj.id}: {proj.title} ({proj.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleAnalytics}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showAnalytics
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
            title="Channel Analytics & Feedback Loop"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden md:inline">Channel Growth</span>
          </button>

          <button
            onClick={onOpenNewProductionModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Production</span>
          </button>
        </div>
      </div>
    </header>
  );
};
