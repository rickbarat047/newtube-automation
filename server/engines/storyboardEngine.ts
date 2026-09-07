import {
  CharacterBible,
  ScriptScene,
  StoryboardScene,
  WordTiming,
  WorldBible,
} from '../../src/types/pipeline.js';
import { generateStructuredJson } from '../gemini.js';

export async function generateStoryboard(
  scriptScenes: ScriptScene[],
  characterBible: CharacterBible,
  worldBible: WorldBible
): Promise<StoryboardScene[]> {
  const scenesSummary = scriptScenes.map((s) => ({
    sceneId: s.sceneId,
    sceneNumber: s.sceneNumber,
    duration: s.durationSeconds,
    location: s.location,
    narrator: s.narratorDialogue,
    dialogue: s.characterDialogue,
    cue: s.animationCue,
    sfx: s.sfxCues,
  }));

  const prompt = `
You are the Supervising Storyboard Artist and Animation Director at AutoTube.
Convert these script scenes into a machine-readable, multi-plane animation storyboard.

CHARACTERS IN BIBLE:
${characterBible.characters.map((c) => `- ${c.name} (${c.role}): ${c.visualPromptToken}`).join('\n')}

WORLD ART STYLE: ${worldBible.artDirection}

SCENES:
${JSON.stringify(scenesSummary, null, 2)}

For each scene, output detailed parameters:
- backgroundPreset: One of 'enchanted_forest' | 'starlit_bedroom' | 'sunlit_meadow' | 'crystal_cave' | 'cozy_treehouse' | 'sparkling_brook'
- cameraAngle: One of 'wide' | 'medium' | 'close-up' | 'reaction' | 'establishing'
- cameraMovement: One of 'static' | 'slow_push_in' | 'pull_out' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tracking'
- lighting: Lighting description
- props: Array of prop names
- animationKeyframes: 3-4 keyframe checkpoints per scene with timestamp (s), characterAction, facialExpression ('happy'|'curious'|'worried'|'surprised'|'relieved'|'neutral'), positionX (0-100), positionY (0-100), scale, isTalking (boolean), facing ('left'|'right'|'front')
- soundEffects: Array of cues with cue name, timestamp (seconds), volume (0.1 to 1.0), and type ('ambient'|'foley'|'magic'|'action')
- musicMood: 'playful_wonder' | 'gentle_mystery' | 'sparkling_adventure' | 'warm_lullaby' | 'triumphant_joy'
- captions: Word-by-word timestamp array for the spoken narration/dialogue

Output a JSON array of StoryboardScene objects.
`;

  const result = await generateStructuredJson<StoryboardScene[]>(prompt);
  if (result && Array.isArray(result) && result.length > 0) {
    return result.map((scene, idx) => ({
      ...scene,
      sceneId: scene.sceneId || `scene-0${idx + 1}`,
      sceneNumber: idx + 1,
      durationSeconds: scene.durationSeconds || scriptScenes[idx]?.durationSeconds || 10,
      renderStatus: 'ready',
      qcStatus: 'passed',
    }));
  }

  // Fallback storyboard generator
  return fallbackStoryboard(scriptScenes, characterBible);
}

function fallbackStoryboard(
  scriptScenes: ScriptScene[],
  characterBible: CharacterBible
): StoryboardScene[] {
  const backgrounds: Array<StoryboardScene['backgroundPreset']> = [
    'enchanted_forest',
    'crystal_cave',
    'sparkling_brook',
    'sunlit_meadow',
  ];
  const cameraAngles: Array<StoryboardScene['cameraAngle']> = [
    'medium',
    'close-up',
    'wide',
    'establishing',
  ];
  const cameraMovements: Array<StoryboardScene['cameraMovement']> = [
    'slow_push_in',
    'slow_push_in',
    'pan_right',
    'pull_out',
  ];
  const musicMoods: Array<StoryboardScene['musicMood']> = [
    'gentle_mystery',
    'playful_wonder',
    'sparkling_adventure',
    'triumphant_joy',
  ];

  return scriptScenes.map((script, idx) => {
    const charName = characterBible.characters[0]?.name || 'Hero';
    const sidekickName = characterBible.characters[1]?.name || 'Friend';
    const duration = script.durationSeconds || 10;
    const narration = script.narratorDialogue || '';

    // Generate word timestamps
    const words = narration.split(/\s+/).filter(Boolean);
    const timePerWord = Math.min(0.4, (duration * 0.75) / Math.max(1, words.length));
    const captions: WordTiming[] = words.map((w, wIdx) => ({
      word: w,
      start: parseFloat((0.4 + wIdx * timePerWord).toFixed(2)),
      end: parseFloat((0.4 + (wIdx + 1) * timePerWord).toFixed(2)),
    }));

    return {
      sceneId: script.sceneId || `scene-0${idx + 1}`,
      sceneNumber: idx + 1,
      durationSeconds: duration,
      environment: script.location || 'Whispering Forest',
      backgroundPreset: backgrounds[idx % backgrounds.length],
      charactersPresent: idx === 0 ? [charName] : [charName, sidekickName],
      primaryAction: script.animationCue || 'Character explores the scene with curious expressions',
      emotionalBeat: script.emotionalDirection || 'Curiosity and wonder',
      cameraAngle: cameraAngles[idx % cameraAngles.length],
      cameraMovement: cameraMovements[idx % cameraMovements.length],
      lighting: idx === 3 ? 'Golden sunrise glow' : 'Soft filtered woodland sunlight with magical rim lights',
      props: ['Mossy ancient tree', 'Dewdrop wild mushrooms', 'Acorn lantern'],
      animationKeyframes: [
        {
          timestamp: 0,
          characterAction: 'enter_look_around',
          facialExpression: 'curious',
          positionX: 30,
          positionY: 55,
          scale: 1.0,
          isTalking: false,
          facing: 'right',
        },
        {
          timestamp: Math.floor(duration * 0.35),
          characterAction: 'react_dialogue',
          facialExpression: idx === 1 ? 'worried' : 'happy',
          positionX: 45,
          positionY: 55,
          scale: 1.05,
          isTalking: true,
          facing: 'right',
        },
        {
          timestamp: Math.floor(duration * 0.7),
          characterAction: 'interact_and_smile',
          facialExpression: 'relieved',
          positionX: 52,
          positionY: 55,
          scale: 1.1,
          isTalking: false,
          facing: 'front',
        },
      ],
      soundEffects: [
        { cue: 'ambient_forest_nature', timestamp: 0, volume: 0.4, type: 'ambient' },
        { cue: 'magical_sparkle_chime', timestamp: 1.5, volume: 0.7, type: 'magic' },
        { cue: 'gentle_footsteps_leaves', timestamp: 3.2, volume: 0.5, type: 'foley' },
      ],
      musicMood: musicMoods[idx % musicMoods.length],
      narrationText: narration,
      captions,
      renderStatus: 'ready',
      qcStatus: 'passed',
    };
  });
}
