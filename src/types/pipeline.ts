export type ProductionStage =
  | 'IDEA'
  | 'SELECTED'
  | 'STORY_DEVELOPMENT'
  | 'SCRIPTING'
  | 'SCRIPT_APPROVED'
  | 'CHARACTER_DESIGN'
  | 'WORLD_DESIGN'
  | 'STORYBOARDING'
  | 'SCENE_GENERATION'
  | 'ANIMATION'
  | 'VOICEOVER'
  | 'AUDIO_POST'
  | 'EDITING'
  | 'QC'
  | 'REPAIR'
  | 'FINAL_QC'
  | 'READY'
  | 'PUBLISHED'
  | 'FAILED';

export type AutomationMode = 'FULL_AUTO' | 'SEMI_AUTO' | 'MANUAL';

export type TargetAge = '4-6' | '7-8' | '9-10';

export interface IdeaCandidate {
  id: string;
  title: string;
  logline: string;
  mainCharacters: string[];
  targetAge: TargetAge;
  genre: string;
  coreConflict: string;
  emotionalHook: string;
  beginning: string;
  middle: string;
  ending: string;
  lessonTheme: string;
  estimatedRuntimeSeconds: number;
  scores: {
    originality: number;
    storyPotential: number;
    emotionalEngagement: number;
    childAppeal: number;
    visualPotential: number;
    characterPotential: number;
    retentionPotential: number;
    productionDifficulty: number;
    brandFit: number;
    overallScore: number;
  };
  status: 'candidate' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface StoryDocument {
  act1Hook: string;
  act2Problem: string;
  act3Escalation: string;
  act4Climax: string;
  act5Resolution: string;
  retentionBeats: string[];
}

export interface ScriptDialogue {
  character: string;
  line: string;
  emotion: string;
}

export interface ScriptScene {
  sceneNumber: number;
  sceneId: string;
  durationSeconds: number;
  location: string;
  timeOfDay: string;
  narratorDialogue?: string;
  characterDialogue?: ScriptDialogue[];
  emotionalDirection: string;
  pauses: string[];
  sfxCues: string[];
  musicCue: { mood: string; intensity: 'low' | 'medium' | 'high' };
  animationCue: string;
  transitionToNext: string;
}

export interface ScriptQC {
  passed: boolean;
  grammarScore: number;
  coherenceScore: number;
  characterConsistencyScore: number;
  ageAppropriatenessScore: number;
  dialogueQualityScore: number;
  pacingScore: number;
  emotionalProgressionScore: number;
  originalityScore: number;
  childSafetyScore: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export interface CharacterDefinition {
  id: string;
  name: string;
  age: string;
  role: 'protagonist' | 'deuteragonist' | 'mentor' | 'friend' | 'animal-sidekick';
  personality: string[];
  visualPromptToken: string;
  bodyProportions: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    eyes: string;
    furOrHair: string;
  };
  clothing: string;
  distinctiveFeatures: string[];
  voicePreset: {
    voiceName: string;
    pitch: number;
    rate: number;
    tone: string;
  };
  emotionalExpressions: {
    happy: string;
    curious: string;
    worried: string;
    surprised: string;
    relieved: string;
  };
  rigType: 'quadruped' | 'biped' | 'creature' | 'bird';
}

export interface CharacterBible {
  projectId: string;
  artStyle: string;
  characters: CharacterDefinition[];
  forbiddenVariations: string[];
}

export interface WorldBible {
  artDirection: string;
  colorLanguage: {
    sky: string;
    ground: string;
    foliage: string;
    magicAccent: string;
  };
  lightingStyle: string;
  architectureStyle: string;
  keyProps: string[];
  weatherOptions: string[];
  cameraGrammar: string;
}

export interface AnimationKeyframe {
  timestamp: number;
  characterAction: string;
  facialExpression: 'happy' | 'curious' | 'worried' | 'surprised' | 'relieved' | 'neutral' | 'determined' | 'excited';
  positionX: number; // 0 to 100 percentage
  positionY: number; // 0 to 100 percentage
  scale: number;
  isTalking: boolean;
  facing: 'left' | 'right' | 'front';
}

export interface SoundCue {
  cue: string;
  timestamp: number;
  volume: number;
  type: 'ambient' | 'foley' | 'magic' | 'action';
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface StoryboardScene {
  sceneId: string;
  sceneNumber: number;
  durationSeconds: number;
  environment: string;
  backgroundPreset: 'enchanted_forest' | 'starlit_bedroom' | 'sunlit_meadow' | 'crystal_cave' | 'cozy_treehouse' | 'sparkling_brook';
  charactersPresent: string[];
  primaryAction: string;
  emotionalBeat: string;
  cameraAngle: 'wide' | 'medium' | 'close-up' | 'reaction' | 'establishing';
  cameraMovement: 'static' | 'slow_push_in' | 'pull_out' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tracking';
  lighting: string;
  props: string[];
  animationKeyframes: AnimationKeyframe[];
  soundEffects: SoundCue[];
  musicMood: 'playful_wonder' | 'gentle_mystery' | 'sparkling_adventure' | 'warm_lullaby' | 'triumphant_joy';
  narrationText: string;
  captions: WordTiming[];
  // Status of this single scene (allows targeted re-generation)
  renderStatus: 'pending' | 'generating' | 'ready' | 'failed';
  qcStatus: 'pending' | 'passed' | 'failed';
}

export interface StageScoreDetail {
  passed: boolean;
  score: number;
  notes: string[];
  failedSceneIds?: string[];
  violations?: string[];
  syncDriftMs?: number;
}

export interface QualityControlReport {
  id: string;
  timestamp: string;
  passed: boolean;
  storyScore: number;       // 20%
  visualsScore: number;     // 30%
  animationScore: number;   // 20%
  audioScore: number;       // 15%
  editingScore: number;     // 10%
  safetyScore: number;      // 5%
  finalScore: number;       // weighted
  criticalFailures: string[];
  stageBreakdown: {
    story: StageScoreDetail;
    visuals: StageScoreDetail;
    animation: StageScoreDetail;
    audio: StageScoreDetail;
    editing: StageScoreDetail;
    safety: StageScoreDetail;
  };
  repairRecommendations: Array<{
    stage: ProductionStage;
    targetSceneId?: string;
    component: 'character' | 'scene_visual' | 'voice' | 'sfx' | 'pacing' | 'captions';
    action: string;
  }>;
}

export interface YouTubeMetadata {
  primaryTitle: string;
  titleAlternatives: string[];
  description: string;
  chapters: Array<{ timestamp: string; title: string }>;
  tags: string[];
  hashtags: string[];
  category: string;
  targetAgeClassification: 'Made for Kids';
  playlistSuggestion: string;
  seoKeywords: string[];
  thumbnailPrompt: string;
  thumbnailHeadline: string;
  thumbnailSubtext: string;
  thumbnailCharacterPose: string;
}

export interface ProductionLogEntry {
  id: string;
  timestamp: string;
  stage: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
}
export type ProductionLog = ProductionLogEntry;

export interface ChannelAnalyticsData {
  views: number;
  ctrPercent?: number;
  clickThroughRate?: number;
  averageViewDurationSeconds?: number;
  avgViewDurationSeconds?: number;
  retentionAt30sPercent?: number;
  avgRetentionRate?: number;
  likes?: number;
  subscribersGained?: number;
  subscribers?: number;
  topPerformingGenre?: string;
  insightsLearned: string[];
}
export type ChannelAnalytics = ChannelAnalyticsData;

export interface AutoTubeProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: AutomationMode;
  status: ProductionStage;
  progressPercent: number;
  currentStageName: string;
  idea: IdeaCandidate;
  story?: StoryDocument;
  script?: ScriptScene[];
  scriptQC?: ScriptQC;
  characterBible?: CharacterBible;
  worldBible?: WorldBible;
  storyboard?: StoryboardScene[];
  qcReports: QualityControlReport[];
  activeQcReport?: QualityControlReport;
  retryCount: number;
  maxRetries: number;
  repairLogs: Array<{
    timestamp: string;
    stage: ProductionStage;
    action: string;
    result: 'success' | 'failed';
    targetSceneId?: string;
  }>;
  youtubeMetadata?: YouTubeMetadata;
  finalExportReady: boolean;
  publishedInfo?: {
    publishedAt: string;
    youtubeVideoId: string;
    privacyStatus: 'private' | 'unlisted' | 'public';
    channelName: string;
    url: string;
  };
  productionLogs: ProductionLogEntry[];
  analyticsFeedback?: ChannelAnalyticsData;
}
