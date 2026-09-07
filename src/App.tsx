import React, { useEffect, useState, useCallback } from 'react';
import {
  Film,
  ShieldCheck,
  Palette,
  FileText,
  Youtube,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import {
  AutoTubeProject,
  AutomationMode,
  ChannelAnalytics,
  IdeaCandidate,
  ScriptScene,
} from './types/pipeline.js';
import { Navbar } from './components/Navbar.js';
import { StoryCanvasPlayer } from './components/StoryCanvasPlayer.js';
import { PipelineStageTracker } from './components/PipelineStageTracker.js';
import { QcDashboard } from './components/QcDashboard.js';
import { BiblesViewer } from './components/BiblesViewer.js';
import { ScriptStoryboardView } from './components/ScriptStoryboardView.js';
import { PublishingStudio } from './components/PublishingStudio.js';
import { ProductionLogs } from './components/ProductionLogs.js';
import { AnalyticsFeedbackView } from './components/AnalyticsFeedbackView.js';
import { IdeaGeneratorModal } from './components/IdeaGeneratorModal.js';

type ViewTab = 'player' | 'qc' | 'bibles' | 'script' | 'publishing' | 'logs';

export default function App() {
  const [projects, setProjects] = useState<AutoTubeProject[]>([]);
  const [activeProject, setActiveProject] = useState<AutoTubeProject | null>(null);
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('player');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showIdeaModal, setShowIdeaModal] = useState<boolean>(false);
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState<boolean>(false);

  // Fetch projects list
  const loadProjects = useCallback(async (selectId?: string) => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: AutoTubeProject[] = await res.json();
        setProjects(data);
        if (data.length > 0) {
          if (selectId) {
            const found = data.find((p) => p.id === selectId);
            if (found) setActiveProject(found);
          } else if (!activeProject) {
            setActiveProject(data[0]);
          } else {
            const refreshed = data.find((p) => p.id === activeProject.id);
            if (refreshed) setActiveProject(refreshed);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, [activeProject]);

  // Fetch Channel Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data: ChannelAnalytics = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadAnalytics();
  }, [loadProjects, loadAnalytics]);

  // Polling if current project is running automated pipeline in background
  useEffect(() => {
    if (!activeProject) return;
    const isRunning =
      activeProject.status !== 'READY' &&
      activeProject.status !== 'PUBLISHED' &&
      activeProject.status !== 'FAILED';

    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${activeProject.id}`);
        if (res.ok) {
          const updated: AutoTubeProject = await res.json();
          setActiveProject(updated);
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeProject]);

  // Advance Pipeline Step
  const handleAdvanceStep = async () => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/step`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProject(updated);
        await loadProjects(updated.id);
      }
    } catch (err) {
      console.error('Step advance error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate QC Defect
  const handleSimulateQcFail = async () => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/simulate-qc-fail`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.project);
        setActiveTab('qc');
        await loadProjects(data.project.id);
      }
    } catch (err) {
      console.error('Simulate QC error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Targeted Automatic Repair
  const handleExecuteRepair = async () => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/repair`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.repairedProject);
        await loadProjects(data.repairedProject.id);
      }
    } catch (err) {
      console.error('Repair error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Human Override QC Gate
  const handleHumanOverride = async () => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/override-qc`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProject(updated);
        await loadProjects(updated.id);
      }
    } catch (err) {
      console.error('Human override error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update Script
  const handleUpdateScript = async (newScript: ScriptScene[]) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/update-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: newScript }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProject(updated);
        await loadProjects(updated.id);
      }
    } catch (err) {
      console.error('Update script error:', err);
    }
  };

  // Publish to YouTube
  const handlePublish = async (privacyStatus: 'public' | 'unlisted' | 'private') => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pipeline/${activeProject.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacyStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProject(updated);
        await loadProjects(updated.id);
        await loadAnalytics();
      }
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create New Production
  const handleSelectIdea = async (idea: IdeaCandidate, mode: AutomationMode) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, mode }),
      });
      if (res.ok) {
        const newProj = await res.json();
        setActiveProject(newProj);
        await loadProjects(newProj.id);
        setActiveTab('player');
      }
    } catch (err) {
      console.error('Create project error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(p) => setActiveProject(p)}
        onOpenNewProductionModal={() => setShowIdeaModal(true)}
        onToggleAnalytics={() => setShowAnalyticsDrawer(!showAnalyticsDrawer)}
        showAnalytics={showAnalyticsDrawer}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Channel Analytics Feedback Drawer (Expandable) */}
        {showAnalyticsDrawer && analytics && (
          <AnalyticsFeedbackView analytics={analytics} />
        )}

        {activeProject ? (
          <div className="space-y-6">
            {/* Pipeline Stage Tracker */}
            <PipelineStageTracker
              project={activeProject}
              onAdvanceStep={handleAdvanceStep}
              isProcessing={isProcessing}
            />

            {/* View Selector Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('player')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'player'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Interactive Animation Player</span>
                </button>

                <button
                  onClick={() => setActiveTab('qc')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'qc'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>QC & Targeted Repair Station</span>
                  {activeProject.activeQcReport && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        activeProject.activeQcReport.passed
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {activeProject.activeQcReport.finalScore}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('bibles')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'bibles'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Character & World Bibles</span>
                </button>

                <button
                  onClick={() => setActiveTab('script')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'script'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Script & Storyboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('publishing')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'publishing'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Youtube className="w-4 h-4" />
                  <span>YouTube Publishing Gate</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Observability Logs ({activeProject.productionLogs?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'player' && (
              <div className="space-y-6">
                {activeProject.storyboard && activeProject.storyboard.length > 0 ? (
                  <StoryCanvasPlayer
                    storyboard={activeProject.storyboard}
                    characterBible={activeProject.characterBible}
                    worldBible={activeProject.worldBible}
                    title={activeProject.title}
                  />
                ) : (
                  <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
                    <Film className="w-12 h-12 mx-auto text-amber-500/50" />
                    <h3 className="text-base font-bold text-slate-200">
                      Animation Assets Generating
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Storyboard and scene animation keyframes are generated during Phases 5 through 7.
                      Click &ldquo;Advance Next Stage&rdquo; above to advance the production.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qc' && (
              <QcDashboard
                project={activeProject}
                onSimulateQcFail={handleSimulateQcFail}
                onExecuteRepair={handleExecuteRepair}
                onHumanOverride={handleHumanOverride}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'bibles' && (
              <BiblesViewer
                characterBible={activeProject.characterBible}
                worldBible={activeProject.worldBible}
              />
            )}

            {activeTab === 'script' && (
              <ScriptStoryboardView
                story={activeProject.story}
                script={activeProject.script}
                storyboard={activeProject.storyboard}
                onUpdateScript={handleUpdateScript}
              />
            )}

            {activeTab === 'publishing' && (
              <PublishingStudio
                project={activeProject}
                onPublish={handlePublish}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'logs' && (
              <ProductionLogs logs={activeProject.productionLogs || []} />
            )}
          </div>
        ) : (
          <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
            <Sparkles className="w-16 h-16 mx-auto text-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">
              Welcome to AutoTube Kids Animation Studio
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              An automated, production-grade AI animation pipeline engineered for high-retention children’s storytelling.
              Equipped with 9-factor idea scoring, persistent Character Bibles, multi-plane animated rendering, procedural sound & speech synthesis, and 6-dimension automated Quality Control.
            </p>
            <button
              onClick={() => setShowIdeaModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch First Automated Production</span>
            </button>
          </div>
        )}
      </main>

      {/* Idea Generator Modal */}
      <IdeaGeneratorModal
        isOpen={showIdeaModal}
        onClose={() => setShowIdeaModal(false)}
        onSelectIdea={handleSelectIdea}
        isProcessing={isProcessing}
      />
    </div>
  );
}
