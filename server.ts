import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { storage } from './server/storage.js';
import { generateIdeas } from './server/engines/ideaEngine.js';
import {
  createNewProjectFromIdea,
  publishProject,
  runPipelineStep,
} from './server/engines/orchestrator.js';
import { runQualityControl } from './server/engines/qcEngine.js';
import { executeAutomaticRepair } from './server/engines/repairEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Analytics Feedback Loop
  app.get('/api/analytics', (req, res) => {
    res.json(storage.getChannelAnalytics());
  });

  // Get all projects
  app.get('/api/projects', (req, res) => {
    const projects = storage.getAllProjects();
    res.json(projects);
  });

  // Get project by ID
  app.get('/api/projects/:id', (req, res) => {
    const project = storage.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  });

  // Generate Idea candidates
  app.post('/api/generate-ideas', async (req, res) => {
    try {
      const { category, targetAge, customPrompt } = req.body;
      const ideas = await generateIdeas({ category, targetAge, customPrompt });
      res.json(ideas);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || 'Failed to generate ideas' });
    }
  });

  // Create new project from selected idea
  app.post('/api/projects/create', async (req, res) => {
    try {
      const { idea, mode } = req.body;
      if (!idea) {
        res.status(400).json({ error: 'Missing idea parameter' });
        return;
      }
      const project = await createNewProjectFromIdea(idea, mode || 'FULL_AUTO');
      res.json(project);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || 'Failed to create project' });
    }
  });

  // Advance pipeline step
  app.post('/api/pipeline/:id/step', async (req, res) => {
    try {
      const project = await runPipelineStep(req.params.id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || 'Pipeline step failed' });
    }
  });

  // Simulate QC Failure (to demonstrate Targeted Automatic Repair & Recovery)
  app.post('/api/pipeline/:id/simulate-qc-fail', async (req, res) => {
    try {
      const project = storage.getProject(req.params.id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const qcReport = await runQualityControl(project, { forceSimulateFailure: true });
      project.qcReports.push(qcReport);
      project.activeQcReport = qcReport;
      project.status = 'QC';
      project.currentStageName = `QC Flagged Failure (Score: ${qcReport.finalScore}/100)`;
      project.productionLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: 'QC',
        level: 'warn',
        message: `Simulated defect injected for Scene 03 character consistency testing (Score: ${qcReport.finalScore}/100 < 85).`,
      });
      storage.saveProject(project);

      res.json({ project, qcReport });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger targeted automatic repair
  app.post('/api/pipeline/:id/repair', async (req, res) => {
    try {
      const project = storage.getProject(req.params.id);
      if (!project || !project.activeQcReport) {
        res.status(400).json({ error: 'Project or active QC report not found' });
        return;
      }

      const repairResult = await executeAutomaticRepair(project, project.activeQcReport);
      storage.saveProject(repairResult.repairedProject);
      res.json(repairResult);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  });

  // Human Override QC
  app.post('/api/pipeline/:id/override-qc', async (req, res) => {
    try {
      const project = storage.getProject(req.params.id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const currentQc = project.activeQcReport;
      if (currentQc) {
        currentQc.passed = true;
        currentQc.finalScore = Math.max(88, currentQc.finalScore);
        currentQc.criticalFailures = [];
      }
      project.status = 'READY';
      project.finalExportReady = true;
      project.currentStageName = 'Quality Control Approved via Human Override';
      project.productionLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: 'QC',
        level: 'warn',
        message: 'Operator manually verified and approved production QC gate override.',
      });
      storage.saveProject(project);
      res.json(project);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  });

  // Update Script
  app.post('/api/pipeline/:id/update-script', async (req, res) => {
    try {
      const { script } = req.body;
      const project = storage.getProject(req.params.id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      project.script = script;
      project.productionLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: 'SCRIPTING',
        level: 'info',
        message: 'Narration script updated via human override.',
      });
      storage.saveProject(project);
      res.json(project);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  });

  // Publish to YouTube
  app.post('/api/pipeline/:id/publish', async (req, res) => {
    try {
      const { privacyStatus } = req.body;
      const project = await publishProject(req.params.id, privacyStatus || 'public');
      res.json(project);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoTube Animation Studio running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AutoTube server:', err);
});
