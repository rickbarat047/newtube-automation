import fs from 'fs';
import path from 'path';
import {
  AutoTubeProject,
  ChannelAnalyticsData,
  IdeaCandidate,
} from '../src/types/pipeline.js';

const STORAGE_DIR = path.join(process.cwd(), 'projects_data');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// In-memory registry with disk backup
const projectsMap = new Map<string, AutoTubeProject>();

// Channel Analytics Feedback loop store
let channelAnalytics: ChannelAnalyticsData = {
  views: 485200,
  ctrPercent: 11.4,
  clickThroughRate: 11.4,
  averageViewDurationSeconds: 142,
  avgViewDurationSeconds: 142,
  retentionAt30sPercent: 78.5,
  avgRetentionRate: 78.5,
  likes: 24890,
  subscribersGained: 6840,
  subscribers: 6840,
  topPerformingGenre: 'Gentle Mystery & Magic',
  insightsLearned: [
    'First 5-8 seconds curiosity hook increased 30s retention from 61% to 78.5%',
    'Animal sidekicks with expressive ear/eye animations boost viewer engagement score by 22%',
    'Pacing with gentle pauses between dialogues prevents cognitive overload for ages 4-7',
    'Warm dusk/golden hour color palettes show 14% higher average view duration in bedtime category',
  ],
};

// Seed sample production project so user immediately sees a rich studio experience
function initializeSeedData() {
  const seedProject: AutoTubeProject = {
    id: 'AT-00124',
    title: 'The Little Fox Who Lost His Star',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    mode: 'FULL_AUTO',
    status: 'READY',
    progressPercent: 100,
    currentStageName: 'FINAL PRODUCTION GATE PASSED',
    retryCount: 1,
    maxRetries: 3,
    finalExportReady: true,
    idea: {
      id: 'idea-124',
      title: 'The Little Fox Who Lost His Star',
      logline:
        'A gentle red fox named Pip finds a fallen baby star caught in a bramble and journeys across the whispering forest to return it to the night sky before morning.',
      mainCharacters: ['Pip the Fox', 'Lumie the Baby Star', 'Barnaby the Wise Owl'],
      targetAge: '4-6',
      genre: 'Magical Adventure',
      coreConflict: 'The baby star is dimming and cannot fly back home without reaching the high Starlight Hill before dawn.',
      emotionalHook: 'Pip realizes that helping a lost friend shine brings back the warm glow in his own heart.',
      beginning: 'Pip discovers a warm, twinkling golden glow trembling in a blackberry bush.',
      middle: 'With Lumie in his acorn-leaf pouch, Pip crosses a singing stream with help from Barnaby the Owl.',
      ending: 'Pip releases Lumie at the highest cliff; Lumie sparkles back into the sky, lighting a path to Pip’s cozy den.',
      lessonTheme: 'Kindness, perseverance, and helping others find their light.',
      estimatedRuntimeSeconds: 45,
      scores: {
        originality: 94,
        storyPotential: 96,
        emotionalEngagement: 95,
        childAppeal: 98,
        visualPotential: 97,
        characterPotential: 95,
        retentionPotential: 92,
        productionDifficulty: 40,
        brandFit: 99,
        overallScore: 94,
      },
      status: 'approved',
    },
    story: {
      act1Hook: 'Pip is watching the midnight sky when a tiny falling star zips down and lands with a soft chime in the nearby woods.',
      act2Problem: 'The star is a baby named Lumie, flickering softly and too weak to lift off the ground.',
      act3Escalation: 'A gentle gust of wind blows away Pip’s leaf-map, and the glowing trail begins to fade as dawn approaches.',
      act4Climax: 'Barnaby Owl swoops down with glowing stardust feathers, lifting Pip and Lumie to the peak of Whispering Hill just in time.',
      act5Resolution: 'Lumie bursts into radiant constellation light, illuminating the forest with a happy smile before taking her place beside the Moon.',
      retentionBeats: [
        '5s: Falling star sparkle sound effect and Pip’s curious ear twitch',
        '15s: Lumie makes a cute chime squeak and nestles into Pip’s tail',
        '28s: The path turns dark and magical fireflies join the rescue',
        '40s: Joyful ascension into starry sky with grand orchestral swell',
      ],
    },
    script: [
      {
        sceneNumber: 1,
        sceneId: 'scene-01',
        durationSeconds: 9,
        location: 'Whispering Forest Bramble',
        timeOfDay: 'Deep Twilight',
        narratorDialogue:
          'Deep in the Whispering Forest, little Pip the Fox heard something go... ping! Right behind the mossy oak tree.',
        characterDialogue: [
          { character: 'Pip', line: 'Hello? Who’s glowing under the brambles?', emotion: 'curious' },
        ],
        emotionalDirection: 'Gentle mystery and instant curiosity',
        pauses: ['[Pause 0.8s after ping]'],
        sfxCues: ['Soft chime ping', 'Rustling dry leaves', 'Distant night owl'],
        musicCue: { mood: 'gentle_mystery', intensity: 'low' },
        animationCue: 'Pip peeks around mossy tree; ears twitch; tiny star glimmers in bush',
        transitionToNext: 'match_cut_zoom',
      },
      {
        sceneNumber: 2,
        sceneId: 'scene-02',
        durationSeconds: 11,
        location: 'Bramble Bush Clearing',
        timeOfDay: 'Midnight',
        narratorDialogue:
          'It wasn’t a glow-worm. It was a baby star! Her name was Lumie, and she had tumbled straight out of the Milky Way.',
        characterDialogue: [
          { character: 'Lumie', line: 'Pip-pip! My twinkle is getting sleepy...', emotion: 'worried' },
          { character: 'Pip', line: 'Don’t worry Lumie, my paws are fast and my heart is brave!', emotion: 'encouraging' },
        ],
        emotionalDirection: 'Tender connection and immediate empathy',
        pauses: ['[Warm chuckle from Pip]'],
        sfxCues: ['Crystalline harmonic hum', 'Pip soft footsteps'],
        musicCue: { mood: 'playful_wonder', intensity: 'medium' },
        animationCue: 'Lumie pulses warm golden light in Pip’s paws; Pip smiles warmly',
        transitionToNext: 'dissolve',
      },
      {
        sceneNumber: 3,
        sceneId: 'scene-03',
        durationSeconds: 12,
        location: 'Singing Brook Crossing',
        timeOfDay: 'Late Night',
        narratorDialogue:
          'To reach the highest peak, they had to hop across the Singing Brook. One pebble, two pebbles... whoops!',
        characterDialogue: [
          { character: 'Pip', line: 'Hold on tight, little star!', emotion: 'determined' },
        ],
        emotionalDirection: 'Mild playful suspense and teamwork',
        pauses: ['[Splash anticipation pause 0.5s]'],
        sfxCues: ['Water babbling', 'Playful stone jump tap', 'Magical safety ring'],
        musicCue: { mood: 'sparkling_adventure', intensity: 'medium' },
        animationCue: 'Pip leaps gracefully across river stones; Lumie creates a sparkling safety trail',
        transitionToNext: 'pan_up',
      },
      {
        sceneNumber: 4,
        sceneId: 'scene-04',
        durationSeconds: 13,
        location: 'Starlight Hill Summit',
        timeOfDay: 'Pre-Dawn Aurora',
        narratorDialogue:
          'At the very top of Whispering Hill, Pip lifted Lumie high into the morning breeze. With a joyful twirl, she soared home.',
        characterDialogue: [
          { character: 'Lumie', line: 'Thank you Pip! Look up whenever you feel small!', emotion: 'relieved' },
          { character: 'Pip', line: 'Shine bright, Lumie! Goodnight my starry friend!', emotion: 'happy' },
        ],
        emotionalDirection: 'Triumphant heartwarming warmth',
        pauses: ['[Music crescendo, 1s contemplative silence after farewell]'],
        sfxCues: ['Starlight burst chime', 'Gentle wind swell', 'Happy fox chirp'],
        musicCue: { mood: 'triumphant_joy', intensity: 'high' },
        animationCue: 'Lumie shoots into the sky, creating a glowing fox constellation that winks down',
        transitionToNext: 'fade_to_warm_gold',
      },
    ],
    scriptQC: {
      passed: true,
      grammarScore: 98,
      coherenceScore: 97,
      characterConsistencyScore: 99,
      ageAppropriatenessScore: 100,
      dialogueQualityScore: 96,
      pacingScore: 94,
      emotionalProgressionScore: 97,
      originalityScore: 93,
      childSafetyScore: 100,
      overallScore: 97,
      issues: [],
      recommendations: [
        'Voice actor for Lumie should maintain warm bell-like harmonic filter',
        'Add 0.5s pause after Pip’s jump in Scene 3 for comedic timing',
      ],
    },
    characterBible: {
      projectId: 'AT-00124',
      artStyle: 'Lush 2.5D storybook animation with soft rim lighting and expressive papercraft depth',
      characters: [
        {
          id: 'char-pip',
          name: 'Pip the Fox',
          age: '6 (fox years)',
          role: 'protagonist',
          personality: ['Curious', 'Loyal', 'Warm-hearted', 'Playful'],
          visualPromptToken: 'pip_red_fox_storybook_fluffy_white_tail_tip_golden_eyes',
          bodyProportions: 'Rounded chibi proportions, 1:2 head-to-body ratio, extra-large expressive ears',
          colors: {
            primary: '#e65c00', // Amber orange
            secondary: '#ffffff', // Snow white chest & tail
            accent: '#3e2723', // Espresso brown paws
            eyes: '#fbc02d', // Warm amber gold
            furOrHair: '#f57c00', // Cinnamon fur highlights
          },
          clothing: 'Cozy sage green knitted acorn bandana with oak-leaf clasp',
          distinctiveFeatures: ['Extra fluffy white-tipped tail', 'Oversized expressive ears with cream tufts'],
          voicePreset: { voiceName: 'Puck', pitch: 1.15, rate: 0.95, tone: 'Warm, enthusiastic, child-friendly' },
          emotionalExpressions: {
            happy: 'Bright crescent eyes with cheerful open mouth smile and bouncing tail',
            curious: 'Head tilted 15 degrees, left ear perked up, wide round eyes',
            worried: 'Ears flattened back slightly, furrowed gentle brow, protective tail curled',
            surprised: 'Both ears straight up, wide sparkling pupils, paws raised to chest',
            relieved: 'Soft happy squint, relaxing shoulders, gentle tail wag',
          },
          rigType: 'quadruped',
        },
        {
          id: 'char-lumie',
          name: 'Lumie the Baby Star',
          age: 'Starling',
          role: 'deuteragonist',
          personality: ['Sweet', 'Innocent', 'Gentle', 'Sparkling'],
          visualPromptToken: 'lumie_baby_star_soft_golden_glow_floating_constellation',
          bodyProportions: 'Soft rounded 5-point star shape with squishy marshmallow silhouette',
          colors: {
            primary: '#ffea00',
            secondary: '#fff9c4',
            accent: '#ff80ab',
            eyes: '#1a237e',
            furOrHair: '#ffffff',
          },
          clothing: 'None (radiates tiny pastel stardust particles)',
          distinctiveFeatures: ['Soft pastel pink cheek blushes', 'Gentle pulsing light aura synchronized with speech'],
          voicePreset: { voiceName: 'Zephyr', pitch: 1.35, rate: 1.05, tone: 'Sweet, musical, bell-like tone' },
          emotionalExpressions: {
            happy: 'Radiant golden sparkle burst with tiny star dust fireworks',
            curious: 'Floating in gentle figure-eight loop with inquisitive shimmer',
            worried: 'Dimming to faint amber glow with droopy top point',
            surprised: 'Burst of playful lavender sparkles and quick upward bounce',
            relieved: 'Full warm buttery glow with happy spinning chime',
          },
          rigType: 'creature',
        },
      ],
      forbiddenVariations: [
        'Never change Pip’s coat to brown or gray',
        'Never remove Pip’s sage green acorn bandana',
        'Never depict Lumie with sharp robotic or geometric edges',
        'Never alter eye color or remove white tail-tip',
      ],
    },
    worldBible: {
      artDirection: 'Hand-painted watercolor and textured gouache storybook atmosphere with gentle volumetric sunbeams and starry glow',
      colorLanguage: {
        sky: '#0d1b2a',
        ground: '#1b4332',
        foliage: '#2d6a4f',
        magicAccent: '#ffd166',
      },
      lightingStyle: 'Soft rim lighting with magical self-illuminating props and bioluminescent flora',
      architectureStyle: 'Organic natural woodland shelters made of hollow oak logs and mossy boulders',
      keyProps: ['Acorn-leaf pouch', 'Singing river stepping stones', 'Luminous forest mushrooms'],
      weatherOptions: ['Clear starry night with aurora ribbons', 'Pre-dawn golden mist'],
      cameraGrammar: 'Gentle dollies and slow cinematic push-ins at low children’s eye-level height',
    },
    storyboard: [
      {
        sceneId: 'scene-01',
        sceneNumber: 1,
        durationSeconds: 9,
        environment: 'Ancient Mossy Oak Grove',
        backgroundPreset: 'enchanted_forest',
        charactersPresent: ['Pip'],
        primaryAction: 'Pip peeks around tree root and spots glowing brambles',
        emotionalBeat: 'Intriguing curiosity',
        cameraAngle: 'medium',
        cameraMovement: 'slow_push_in',
        lighting: 'Deep cobalt night with golden rim lights',
        props: ['Mossy ancient tree', 'Luminous mushroom cluster', 'Acorn pouch'],
        animationKeyframes: [
          { timestamp: 0, characterAction: 'peek_tree', facialExpression: 'curious', positionX: 30, positionY: 55, scale: 1, isTalking: false, facing: 'right' },
          { timestamp: 3, characterAction: 'ear_twitch', facialExpression: 'surprised', positionX: 45, positionY: 55, scale: 1.05, isTalking: true, facing: 'right' },
          { timestamp: 7, characterAction: 'step_forward', facialExpression: 'happy', positionX: 52, positionY: 55, scale: 1.1, isTalking: false, facing: 'right' },
        ],
        soundEffects: [
          { cue: 'soft_star_ping', timestamp: 1.2, volume: 0.8, type: 'magic' },
          { cue: 'forest_ambience', timestamp: 0, volume: 0.4, type: 'ambient' },
        ],
        musicMood: 'gentle_mystery',
        narrationText: 'Deep in the Whispering Forest, little Pip the Fox heard something go... ping! Right behind the mossy oak tree.',
        captions: [
          { word: 'Deep', start: 0.3, end: 0.7 },
          { word: 'in', start: 0.7, end: 0.9 },
          { word: 'the', start: 0.9, end: 1.1 },
          { word: 'Whispering', start: 1.1, end: 1.7 },
          { word: 'Forest,', start: 1.7, end: 2.2 },
          { word: 'little', start: 2.5, end: 2.9 },
          { word: 'Pip', start: 2.9, end: 3.3 },
          { word: 'heard', start: 3.3, end: 3.7 },
          { word: 'something...', start: 3.7, end: 4.4 },
          { word: 'PING!', start: 4.6, end: 5.5 },
        ],
        renderStatus: 'ready',
        qcStatus: 'passed',
      },
      {
        sceneId: 'scene-02',
        sceneNumber: 2,
        durationSeconds: 11,
        environment: 'Bramble Bush Clearing',
        backgroundPreset: 'crystal_cave',
        charactersPresent: ['Pip', 'Lumie'],
        primaryAction: 'Pip cradles tiny shivering Lumie star in his paws',
        emotionalBeat: 'Heartfelt connection',
        cameraAngle: 'close-up',
        cameraMovement: 'slow_push_in',
        lighting: 'Warm golden star glow illuminating Pip’s face',
        props: ['Blackberry vines', 'Dewdrop leaves'],
        animationKeyframes: [
          { timestamp: 0, characterAction: 'cradle_hands', facialExpression: 'worried', positionX: 40, positionY: 50, scale: 1.2, isTalking: false, facing: 'right' },
          { timestamp: 4, characterAction: 'star_float', facialExpression: 'happy', positionX: 55, positionY: 45, scale: 0.8, isTalking: true, facing: 'left' },
          { timestamp: 8, characterAction: 'pip_smile', facialExpression: 'relieved', positionX: 42, positionY: 50, scale: 1.2, isTalking: true, facing: 'right' },
        ],
        soundEffects: [
          { cue: 'crystalline_chime_loop', timestamp: 0, volume: 0.7, type: 'magic' },
          { cue: 'paws_grass_step', timestamp: 2.5, volume: 0.5, type: 'foley' },
        ],
        musicMood: 'playful_wonder',
        narrationText: 'It wasn’t a glow-worm. It was a baby star! Her name was Lumie, and she had tumbled straight out of the Milky Way.',
        captions: [
          { word: 'It', start: 0.2, end: 0.5 },
          { word: 'wasn’t', start: 0.5, end: 0.9 },
          { word: 'a', start: 0.9, end: 1.0 },
          { word: 'glow-worm.', start: 1.0, end: 1.6 },
          { word: 'It', start: 2.0, end: 2.3 },
          { word: 'was', start: 2.3, end: 2.6 },
          { word: 'a', start: 2.6, end: 2.8 },
          { word: 'baby', start: 2.8, end: 3.2 },
          { word: 'STAR!', start: 3.2, end: 4.1 },
        ],
        renderStatus: 'ready',
        qcStatus: 'passed',
      },
      {
        sceneId: 'scene-03',
        sceneNumber: 3,
        durationSeconds: 12,
        environment: 'Singing Brook Crossing',
        backgroundPreset: 'sparkling_brook',
        charactersPresent: ['Pip', 'Lumie'],
        primaryAction: 'Pip hops across mossy river pebbles as Lumie guides with light',
        emotionalBeat: 'Playful adventure',
        cameraAngle: 'wide',
        cameraMovement: 'pan_right',
        lighting: 'Rippling water reflections on mossy cliffs',
        props: ['Singing river stones', 'Glowing water lilies'],
        animationKeyframes: [
          { timestamp: 0, characterAction: 'jump_prep', facialExpression: 'determined', positionX: 20, positionY: 60, scale: 1, isTalking: false, facing: 'right' },
          { timestamp: 4, characterAction: 'mid_air_leap', facialExpression: 'happy', positionX: 50, positionY: 45, scale: 1, isTalking: true, facing: 'right' },
          { timestamp: 8, characterAction: 'safe_landing', facialExpression: 'relieved', positionX: 80, positionY: 60, scale: 1, isTalking: false, facing: 'right' },
        ],
        soundEffects: [
          { cue: 'water_stream_rush', timestamp: 0, volume: 0.5, type: 'ambient' },
          { cue: 'stone_jump_splash', timestamp: 4.2, volume: 0.6, type: 'foley' },
          { cue: 'sparkle_trail', timestamp: 5.0, volume: 0.7, type: 'magic' },
        ],
        musicMood: 'sparkling_adventure',
        narrationText: 'To reach the highest peak, they had to hop across the Singing Brook. One pebble, two pebbles... whoops!',
        captions: [
          { word: 'To', start: 0.2, end: 0.4 },
          { word: 'reach', start: 0.4, end: 0.8 },
          { word: 'the', start: 0.8, end: 1.0 },
          { word: 'highest', start: 1.0, end: 1.5 },
          { word: 'peak,', start: 1.5, end: 2.1 },
          { word: 'they', start: 2.3, end: 2.6 },
          { word: 'hopped', start: 2.6, end: 3.1 },
          { word: 'across', start: 3.1, end: 3.5 },
          { word: 'the', start: 3.5, end: 3.7 },
          { word: 'Singing', start: 3.7, end: 4.2 },
          { word: 'Brook!', start: 4.2, end: 5.0 },
        ],
        renderStatus: 'ready',
        qcStatus: 'passed',
      },
      {
        sceneId: 'scene-04',
        sceneNumber: 4,
        durationSeconds: 13,
        environment: 'Starlight Hill Summit',
        backgroundPreset: 'starlit_bedroom',
        charactersPresent: ['Pip', 'Lumie'],
        primaryAction: 'Lumie ascends back into the night sky, forming a constellation',
        emotionalBeat: 'Wonder and warm fulfillment',
        cameraAngle: 'establishing',
        cameraMovement: 'pull_out',
        lighting: 'Radiant golden starlight washing the purple mountain peaks',
        props: ['Highest peak rock', 'Starlight aurora ribbons'],
        animationKeyframes: [
          { timestamp: 0, characterAction: 'lift_arms', facialExpression: 'happy', positionX: 45, positionY: 65, scale: 0.9, isTalking: false, facing: 'front' },
          { timestamp: 4, characterAction: 'star_ascend', facialExpression: 'surprised', positionX: 50, positionY: 20, scale: 1.3, isTalking: true, facing: 'front' },
          { timestamp: 9, characterAction: 'wave_goodbye', facialExpression: 'relieved', positionX: 45, positionY: 65, scale: 0.9, isTalking: true, facing: 'front' },
        ],
        soundEffects: [
          { cue: 'supernova_chime_swell', timestamp: 3.5, volume: 0.9, type: 'magic' },
          { cue: 'gentle_breeze_swell', timestamp: 7.0, volume: 0.6, type: 'ambient' },
        ],
        musicMood: 'triumphant_joy',
        narrationText: 'At the very top of Whispering Hill, Pip lifted Lumie high into the morning breeze. With a joyful twirl, she soared home.',
        captions: [
          { word: 'With', start: 0.3, end: 0.6 },
          { word: 'a', start: 0.6, end: 0.8 },
          { word: 'joyful', start: 0.8, end: 1.3 },
          { word: 'twirl,', start: 1.3, end: 1.8 },
          { word: 'she', start: 2.0, end: 2.3 },
          { word: 'soared', start: 2.3, end: 2.8 },
          { word: 'HOME.', start: 2.8, end: 3.8 },
          { word: 'Shine', start: 4.5, end: 4.9 },
          { word: 'bright,', start: 4.9, end: 5.4 },
          { word: 'little', start: 5.4, end: 5.8 },
          { word: 'star!', start: 5.8, end: 6.8 },
        ],
        renderStatus: 'ready',
        qcStatus: 'passed',
      },
    ],
    qcReports: [
      {
        id: 'qc-run-01',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        passed: false,
        storyScore: 94,
        visualsScore: 82, // Failed initially due to slight color drift in Scene 3
        animationScore: 89,
        audioScore: 95,
        editingScore: 92,
        safetyScore: 100,
        finalScore: 84.8, // Below 85 threshold
        criticalFailures: [],
        stageBreakdown: {
          story: { passed: true, score: 94, notes: ['Coherent 5-act flow', 'Strong 5s curiosity hook'] },
          visuals: {
            passed: false,
            score: 82,
            notes: ['Scene 3: Pip tail color had excessive dark shading compared to Character Bible'],
            failedSceneIds: ['scene-03'],
          },
          animation: { passed: true, score: 89, notes: ['Fluid movement and good lip sync'] },
          audio: { passed: true, score: 95, notes: ['Narration warm and intelligible; SFX levels balanced'] },
          editing: { passed: true, score: 92, notes: ['Clean transitions and retention-preserving pacing'] },
          safety: { passed: true, score: 100, notes: ['Zero violence, zero scary themes, 100% kid-safe'] },
        },
        repairRecommendations: [
          {
            stage: 'SCENE_GENERATION',
            targetSceneId: 'scene-03',
            component: 'character',
            action: 'Regenerate Scene 03 character rig to align Pip color token strictly with Character Bible (#e65c00 / #ffffff)',
          },
        ],
      },
      {
        id: 'qc-run-02',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        passed: true,
        storyScore: 95,
        visualsScore: 94, // Fixed after targeted repair
        animationScore: 91,
        audioScore: 96,
        editingScore: 93,
        safetyScore: 100,
        finalScore: 93.6, // Passed (>= 85)
        criticalFailures: [],
        stageBreakdown: {
          story: { passed: true, score: 95, notes: ['Coherent 5-act flow', 'Strong hook and heartwarming ending'] },
          visuals: { passed: true, score: 94, notes: ['Scene 03 repaired successfully. Strict character consistency passed.'] },
          animation: { passed: true, score: 91, notes: ['Dynamic camera tracking and multi-plane depth validated'] },
          audio: { passed: true, score: 96, notes: ['Crystal clear voiceover, ducking -14dB during speech'] },
          editing: { passed: true, score: 93, notes: ['Rhythmic cuts matching dialogue cadence'] },
          safety: { passed: true, score: 100, notes: ['Safe for children 4-10. Meets COPPA & YouTube Kids standards.'] },
        },
        repairRecommendations: [],
      },
    ],
    activeQcReport: {
      id: 'qc-run-02',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      passed: true,
      storyScore: 95,
      visualsScore: 94,
      animationScore: 91,
      audioScore: 96,
      editingScore: 93,
      safetyScore: 100,
      finalScore: 93.6,
      criticalFailures: [],
      stageBreakdown: {
        story: { passed: true, score: 95, notes: ['Coherent 5-act flow', 'Strong hook and heartwarming ending'] },
        visuals: { passed: true, score: 94, notes: ['Scene 03 repaired successfully. Strict character consistency passed.'] },
        animation: { passed: true, score: 91, notes: ['Dynamic camera tracking and multi-plane depth validated'] },
        audio: { passed: true, score: 96, notes: ['Crystal clear voiceover, ducking -14dB during speech'] },
        editing: { passed: true, score: 93, notes: ['Rhythmic cuts matching dialogue cadence'] },
        safety: { passed: true, score: 100, notes: ['Safe for children 4-10. Meets COPPA & YouTube Kids standards.'] },
      },
      repairRecommendations: [],
    },
    repairLogs: [
      {
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        stage: 'SCENE_GENERATION',
        action: 'Targeted repair of Scene 03: Re-aligned color palette with Character Bible',
        result: 'success',
        targetSceneId: 'scene-03',
      },
    ],
    youtubeMetadata: {
      primaryTitle: 'The Little Fox Who Lost His Star ⭐ | Bedtime Animation for Kids',
      titleAlternatives: [
        'Pip & The Baby Star | A Heartwarming Children’s Story',
        'The Little Fox Who Saved A Star ⭐ Kids Animated Story',
        'Pip’s Magical Journey | Sweet Bedtime Story for Kids',
      ],
      description:
        'Join little Pip the Fox on a gentle, magical adventure through the Whispering Forest to help Lumie the Baby Star find her way back to the sky! A heartwarming animated tale about kindness, helping friends, and shining bright.\n\n✨ Perfect for bedtime, quiet time, and young dreamers aged 4–10.\n\n🕒 CHAPTERS:\n00:00 - The Mystery in the Brambles\n00:09 - Meeting Baby Star Lumie\n00:20 - Hopping the Singing Brook\n00:32 - Journey Home & Constellation Wink\n\n🔔 Subscribe to AutoTube for new original animated stories every week!',
      chapters: [
        { timestamp: '00:00', title: 'The Mystery in the Brambles' },
        { timestamp: '00:09', title: 'Meeting Baby Star Lumie' },
        { timestamp: '00:20', title: 'Hopping the Singing Brook' },
        { timestamp: '00:32', title: 'Journey Home & Constellation Wink' },
      ],
      tags: [
        'kids bedtime story',
        'animated kids story',
        'stories for children',
        'gentle bedtime animation',
        'pip the fox',
        'autotube',
        'preschool cartoon',
        'moral stories for kids',
      ],
      hashtags: ['#KidsStories', '#BedtimeStory', '#ChildrenAnimation', '#KidsCartoons'],
      category: 'Film & Animation',
      targetAgeClassification: 'Made for Kids',
      playlistSuggestion: 'Bedtime Wonders: Gentle Magical Tales',
      seoKeywords: ['kids story animation', 'children bedtime story video', 'cute animal cartoon', 'positive values for kids'],
      thumbnailPrompt: 'Close up of fluffy cute red fox Pip holding glowing smiling baby star in paws, enchanted night forest background, vibrant rim lighting, high contrast',
      thumbnailHeadline: 'HE SAVED A FALLEN STAR! ⭐',
      thumbnailSubtext: 'A Heartwarming Tale',
      thumbnailCharacterPose: 'Pip with wide sparkling eyes looking up at twinkling star in his paws',
    },
    publishedInfo: {
      publishedAt: new Date(Date.now() - 300000).toISOString(),
      youtubeVideoId: 'at_yt_pip_0124',
      privacyStatus: 'public',
      channelName: 'AutoTube Kids Animation',
      url: 'https://youtube.com/watch?v=at_yt_pip_0124',
    },
    productionLogs: [
      { id: 'log-1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), stage: 'IDEA', level: 'info', message: 'Generated 5 story concepts; selected top candidate "The Little Fox Who Lost His Star" (Score: 94/100)' },
      { id: 'log-2', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), stage: 'STORY_DEVELOPMENT', level: 'info', message: 'Structured 5-act narrative with early curiosity hook at 0:05' },
      { id: 'log-3', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), stage: 'SCRIPTING', level: 'info', message: 'Narration and character dialogues compiled; Script QC passed with 97/100' },
      { id: 'log-4', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), stage: 'CHARACTER_DESIGN', level: 'info', message: 'Character Bible locked for Pip (#e65c00) and Lumie (#ffea00)' },
      { id: 'log-5', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), stage: 'STORYBOARDING', level: 'info', message: '4 scenes generated with dynamic camera trajectories and audio stems' },
      { id: 'log-6', timestamp: new Date(Date.now() - 1800000).toISOString(), stage: 'QC', level: 'warn', message: 'Automated QC flagged Scene 03 visual inconsistency (Score 84.8/100 < 85)' },
      { id: 'log-7', timestamp: new Date(Date.now() - 1200000).toISOString(), stage: 'REPAIR', level: 'info', message: 'Targeted repair activated: Re-rendered Scene 03 character color matrix (Retry 1/3)' },
      { id: 'log-8', timestamp: new Date(Date.now() - 600000).toISOString(), stage: 'FINAL_QC', level: 'success', message: 'Re-QC passed! Final production score: 93.6/100. Child safety: 100% PASS' },
      { id: 'log-9', timestamp: new Date(Date.now() - 300000).toISOString(), stage: 'PUBLISHED', level: 'success', message: 'Video package ready and published to AutoTube Kids channel' },
    ],
    analyticsFeedback: {
      views: 14200,
      ctrPercent: 12.8,
      averageViewDurationSeconds: 41,
      retentionAt30sPercent: 88.2,
      likes: 1240,
      subscribersGained: 340,
      topPerformingGenre: 'Magical Adventure',
      insightsLearned: [
        'Lumie constellation transition in final 10 seconds retained 91% of viewers through end credits',
      ],
    },
  };

  projectsMap.set(seedProject.id, seedProject);
}

initializeSeedData();

export const storage = {
  getAllProjects(): AutoTubeProject[] {
    return Array.from(projectsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getProject(id: string): AutoTubeProject | null {
    return projectsMap.get(id) || null;
  },

  saveProject(project: AutoTubeProject): void {
    project.updatedAt = new Date().toISOString();
    projectsMap.set(project.id, project);

    // Persist to disk
    try {
      const projectFolder = path.join(STORAGE_DIR, project.id);
      if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
      }
      fs.writeFileSync(
        path.join(projectFolder, 'project.json'),
        JSON.stringify(project, null, 2)
      );
    } catch (e) {
      console.warn('Could not write project to disk:', e);
    }
  },

  deleteProject(id: string): boolean {
    return projectsMap.delete(id);
  },

  getPastProjectTitles(): string[] {
    return Array.from(projectsMap.values()).map((p) => p.title);
  },

  getPastConcepts(): Array<{ title: string; genre: string; coreConflict: string }> {
    return Array.from(projectsMap.values()).map((p) => ({
      title: p.title,
      genre: p.idea.genre,
      coreConflict: p.idea.coreConflict,
    }));
  },

  getChannelAnalytics(): ChannelAnalyticsData {
    return channelAnalytics;
  },

  updateChannelAnalytics(data: Partial<ChannelAnalyticsData>): ChannelAnalyticsData {
    channelAnalytics = { ...channelAnalytics, ...data };
    return channelAnalytics;
  },

  generateNextProjectId(): string {
    const count = projectsMap.size + 125;
    return `AT-${String(count).padStart(5, '0')}`;
  },
};
