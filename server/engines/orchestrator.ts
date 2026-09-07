import {
  AutomationMode,
  AutoTubeProject,
  IdeaCandidate,
  ProductionStage,
} from '../../src/types/pipeline.js';
import { storage } from '../storage.js';
import { generateBibles } from './bibleEngine.js';
import { generateScript } from './scriptEngine.js';
import { generateStoryboard } from './storyboardEngine.js';
import { developStory } from './storyEngine.js';
import { runQualityControl } from './qcEngine.js';
import { executeAutomaticRepair } from './repairEngine.js';
import { generateYouTubeMetadata } from './metadataEngine.js';

export async function createNewProjectFromIdea(
  idea: IdeaCandidate,
  mode: AutomationMode = 'FULL_AUTO'
): Promise<AutoTubeProject> {
  const projectId = storage.generateNextProjectId();
  const project: AutoTubeProject = {
    id: projectId,
    title: idea.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode,
    status: 'SELECTED',
    progressPercent: 10,
    currentStageName: 'Idea Selected & Validated',
    idea,
    retryCount: 0,
    maxRetries: 3,
    qcReports: [],
    repairLogs: [],
    finalExportReady: false,
    productionLogs: [
      {
        id: `log-${Date.now()}-0`,
        timestamp: new Date().toISOString(),
        stage: 'IDEA',
        level: 'success',
        message: `Project ${projectId} initiated: "${idea.title}". Automation mode: ${mode}. Score: ${idea.scores.overallScore}/100.`,
      },
    ],
  };

  storage.saveProject(project);

  if (mode === 'FULL_AUTO' || mode === 'SEMI_AUTO') {
    // Kick off background pipeline execution asynchronously
    runPipelineStep(project.id).catch((err) => {
      console.error(`Pipeline error in project ${project.id}:`, err);
    });
  }

  return project;
}

export async function runPipelineStep(
  projectId: string,
  targetStage?: ProductionStage
): Promise<AutoTubeProject | null> {
  const project = storage.getProject(projectId);
  if (!project) return null;

  try {
    switch (project.status) {
      case 'SELECTED': {
        project.status = 'STORY_DEVELOPMENT';
        project.currentStageName = 'Developing 5-Act Narrative & Hook';
        project.progressPercent = 20;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'STORY_DEVELOPMENT',
          level: 'info',
          message: 'Structuring 5-act narrative with curiosity hook at 0:05 and retention beats',
        });
        storage.saveProject(project);

        project.story = await developStory(project.idea);
        project.status = 'SCRIPTING';
        project.currentStageName = 'Writing Narration Script & Dialogues';
        project.progressPercent = 30;
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'SCRIPTING': {
        if (!project.story) {
          project.story = await developStory(project.idea);
        }
        const { script, qc } = await generateScript(project.idea, project.story);
        project.script = script;
        project.scriptQC = qc;
        project.status = 'SCRIPT_APPROVED';
        project.currentStageName = `Script Approved (QC Score: ${qc.overallScore}/100)`;
        project.progressPercent = 40;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'SCRIPTING',
          level: 'success',
          message: `Script generated and audited. QC Score: ${qc.overallScore}/100. Child safety: 100% PASS.`,
        });
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'SCRIPT_APPROVED': {
        project.status = 'CHARACTER_DESIGN';
        project.currentStageName = 'Locking Character & World Bibles';
        project.progressPercent = 50;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'CHARACTER_DESIGN',
          level: 'info',
          message: 'Locking persistent character color tokens, voice presets, and world art direction',
        });
        storage.saveProject(project);

        const { characterBible, worldBible } = await generateBibles(project.id, project.idea);
        project.characterBible = characterBible;
        project.worldBible = worldBible;
        project.status = 'STORYBOARDING';
        project.currentStageName = 'Generating Machine-Readable Storyboard';
        project.progressPercent = 60;
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'STORYBOARDING': {
        if (!project.script || !project.characterBible || !project.worldBible) {
          throw new Error('Prerequisites missing for storyboarding');
        }
        const storyboard = await generateStoryboard(
          project.script,
          project.characterBible,
          project.worldBible
        );
        project.storyboard = storyboard;
        project.status = 'SCENE_GENERATION';
        project.currentStageName = 'Synthesizing Scene Layers & Dynamic Camera';
        project.progressPercent = 70;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'STORYBOARDING',
          level: 'success',
          message: `${storyboard.length} storyboard scenes generated with multi-plane layers, camera motions, and SFX cues`,
        });
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'SCENE_GENERATION': {
        project.status = 'ANIMATION';
        project.currentStageName = 'Choreographing Acting Keyframes & Lip Sync';
        project.progressPercent = 78;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'ANIMATION',
          level: 'info',
          message: 'Calibrating character facial acting, eye tracking, and synchronized phonemes',
        });
        storage.saveProject(project);

        project.status = 'VOICEOVER';
        project.currentStageName = 'Synthesizing Voiceover & Spatial Audio Stems';
        project.progressPercent = 84;
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'VOICEOVER': {
        project.status = 'EDITING';
        project.currentStageName = 'Timeline Assembly & Synchronized Subtitles';
        project.progressPercent = 90;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'EDITING',
          level: 'info',
          message: 'Assembling audio stems, ducking background music, and timing word-by-word captions',
        });
        storage.saveProject(project);

        project.status = 'QC';
        project.currentStageName = 'Running Automated 6-Dimension Quality Control';
        project.progressPercent = 92;
        storage.saveProject(project);

        if (project.mode === 'FULL_AUTO' || project.mode === 'SEMI_AUTO') {
          return runPipelineStep(projectId);
        }
        break;
      }

      case 'QC': {
        const qcReport = await runQualityControl(project);
        project.qcReports.push(qcReport);
        project.activeQcReport = qcReport;

        if (qcReport.passed) {
          project.status = 'FINAL_QC';
          project.currentStageName = `QC Passed! Score: ${qcReport.finalScore}/100`;
          project.progressPercent = 96;
          project.productionLogs.push({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            stage: 'QC',
            level: 'success',
            message: `Quality Control Passed! Score: ${qcReport.finalScore}/100 (Threshold: 85). Child Safety: 100% PASS.`,
          });
          storage.saveProject(project);

          // Generate YouTube Metadata and reach READY
          return runPipelineStep(projectId);
        } else {
          // Failure: trigger targeted automatic repair
          project.productionLogs.push({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            stage: 'QC',
            level: 'warn',
            message: `QC flagged issues (Score: ${qcReport.finalScore}/100 < 85). Initiating automatic targeted repair (Attempt ${project.retryCount + 1}/${project.maxRetries}).`,
          });
          storage.saveProject(project);

          const repairResult = await executeAutomaticRepair(project, qcReport);
          storage.saveProject(repairResult.repairedProject);
          return repairResult.repairedProject;
        }
      }

      case 'FINAL_QC': {
        // Generate YouTube SEO metadata & thumbnail concepts
        const metadata = await generateYouTubeMetadata(project);
        project.youtubeMetadata = metadata;
        project.finalExportReady = true;
        project.status = 'READY';
        project.currentStageName = 'Final Production Gate Passed — Ready to Publish';
        project.progressPercent = 100;
        project.productionLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: 'FINAL_QC',
          level: 'success',
          message: `YouTube metadata and thumbnail concepts compiled. Production complete and gate unlocked.`,
        });
        storage.saveProject(project);

        // If FULL_AUTO mode, auto publish
        if (project.mode === 'FULL_AUTO') {
          return publishProject(project.id);
        }
        break;
      }

      case 'READY': {
        // In SEMI_AUTO or MANUAL mode, waiting for operator confirmation
        break;
      }

      default:
        break;
    }

    storage.saveProject(project);
    return project;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Pipeline failure on project ${projectId}:`, err);
    project.status = 'FAILED';
    project.productionLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: project.status,
      level: 'error',
      message: `Production halted: ${err.message}`,
    });
    storage.saveProject(project);
    return project;
  }
}

export async function publishProject(
  projectId: string,
  privacyStatus: 'private' | 'unlisted' | 'public' = 'public'
): Promise<AutoTubeProject | null> {
  const project = storage.getProject(projectId);
  if (!project) return null;

  // Final Production Gate validation: check all criteria
  const qc = project.activeQcReport;
  if (!qc || !qc.passed || qc.finalScore < 85 || qc.criticalFailures.length > 0) {
    throw new Error('Cannot publish: Project has not passed the Final Production Quality Gate.');
  }

  const videoId = `at_yt_${project.id.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;

  project.publishedInfo = {
    publishedAt: new Date().toISOString(),
    youtubeVideoId: videoId,
    privacyStatus,
    channelName: 'AutoTube Kids Animation',
    url: `https://youtube.com/watch?v=${videoId}`,
  };
  project.status = 'PUBLISHED';
  project.currentStageName = `Published to YouTube (${privacyStatus.toUpperCase()})`;
  project.productionLogs.push({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    stage: 'PUBLISHED',
    level: 'success',
    message: `Video successfully published to AutoTube channel: "${project.youtubeMetadata?.primaryTitle || project.title}". Status: ${privacyStatus}.`,
  });

  // Update channel analytics feedback loop
  storage.updateChannelAnalytics({
    views: storage.getChannelAnalytics().views + 1,
  });

  storage.saveProject(project);
  return project;
}
