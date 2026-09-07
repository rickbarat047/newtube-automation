import { IdeaCandidate, TargetAge } from '../../src/types/pipeline.js';
import { generateStructuredJson } from '../gemini.js';
import { storage } from '../storage.js';

export interface IdeaGenerationOptions {
  category?: string;
  targetAge?: TargetAge;
  customPrompt?: string;
}

export async function generateIdeas(options: IdeaGenerationOptions = {}): Promise<IdeaCandidate[]> {
  const pastConcepts = storage.getPastConcepts();
  const pastTitles = storage.getPastProjectTitles();
  const analytics = storage.getChannelAnalytics();

  const prompt = `
Generate 3 distinct, high-quality, original animated story ideas for children's YouTube animation channel "AutoTube".
Target Audience Age: ${options.targetAge || '4-6'} years old.
Category Focus: ${options.category || 'Adventure, Kindness, Problem Solving, Magical Wonder'}.
User Note: ${options.customPrompt || 'Create captivating, visually rich concepts with expressive animal or child characters.'}

PAST STORIES TO AVOID DUPLICATING:
${pastTitles.slice(0, 8).map((t) => `- "${t}"`).join('\n')}

CHANNEL AUDIENCE RETENTION INSIGHTS (Feed back into ideas):
${analytics.insightsLearned.map((i) => `- ${i}`).join('\n')}

For each idea, evaluate rigorously and provide scores (0-100) across:
- originality
- storyPotential
- emotionalEngagement
- childAppeal
- visualPotential
- characterPotential
- retentionPotential
- productionDifficulty (lower is easier, but balance with visual potential)
- brandFit
- overallScore (weighted average)

Output a JSON array of objects with the following structure:
[
  {
    "id": "idea-xxx",
    "title": "...",
    "logline": "...",
    "mainCharacters": ["..."],
    "targetAge": "${options.targetAge || '4-6'}",
    "genre": "...",
    "coreConflict": "...",
    "emotionalHook": "...",
    "beginning": "...",
    "middle": "...",
    "ending": "...",
    "lessonTheme": "...",
    "estimatedRuntimeSeconds": 45,
    "scores": {
      "originality": 92,
      "storyPotential": 95,
      "emotionalEngagement": 94,
      "childAppeal": 96,
      "visualPotential": 95,
      "characterPotential": 94,
      "retentionPotential": 93,
      "productionDifficulty": 45,
      "brandFit": 98,
      "overallScore": 94
    },
    "status": "candidate"
  }
]
`;

  const result = await generateStructuredJson<IdeaCandidate[]>(prompt);
  if (result && Array.isArray(result) && result.length > 0) {
    return result.map((item, index) => ({
      ...item,
      id: item.id || `idea-${Date.now()}-${index}`,
      status: 'candidate',
    }));
  }

  // High-craft fallback generator if Gemini API key not yet connected or ratelimited
  return getFallbackIdeas(options.targetAge || '4-6');
}

function getFallbackIdeas(age: TargetAge): IdeaCandidate[] {
  const timestamp = Date.now();
  return [
    {
      id: `idea-${timestamp}-1`,
      title: 'Barnaby Bear’s Pocket Cloud',
      logline: 'A chubby bear discovers a lonely baby raincloud trapped inside a teapot and learns how to help it grow big enough to water the meadow’s thirsty sunflowers.',
      mainCharacters: ['Barnaby the Bear', 'Nimbus the Teapot Cloud', 'Daisy the Dormouse'],
      targetAge: age,
      genre: 'Whimsical Fantasy & Nature',
      coreConflict: 'Nimbus gets startled by sudden noises and shrinks into a puff of mist whenever it tries to rain.',
      emotionalHook: 'Barnaby discovers that singing a gentle lullaby makes the little cloud feel safe enough to drizzle happy rainbow sprinkles.',
      beginning: 'Barnaby pours tea into his cup and a tiny smiling cloud floats out, sneezing tiny droplets of water.',
      middle: 'Barnaby takes Nimbus on a stroll to the dried sunflower field, but a rumble of thunder scares Nimbus back into the teapot.',
      ending: 'Barnaby hums a warm honey-song; Nimbus floats joyfully upward and showers sparkling rain over the blooming flowers.',
      lessonTheme: 'Gentleness, patience, and encouraging friends when they feel scared.',
      estimatedRuntimeSeconds: 48,
      scores: {
        originality: 95,
        storyPotential: 96,
        emotionalEngagement: 97,
        childAppeal: 98,
        visualPotential: 96,
        characterPotential: 96,
        retentionPotential: 94,
        productionDifficulty: 38,
        brandFit: 99,
        overallScore: 96,
      },
      status: 'candidate',
    },
    {
      id: `idea-${timestamp}-2`,
      title: 'The Brave Firefly Who Wanted to Be a Lighthouse',
      logline: 'Flicker, the smallest firefly in Whispering Marsh, dreams of guiding lost river turtles home during the foggiest night of the year.',
      mainCharacters: ['Flicker the Firefly', 'Captain Shell the River Turtle', 'Pip the Frog'],
      targetAge: age,
      genre: 'Bedtime Adventure',
      coreConflict: 'The river fog is too thick for one tiny firefly light to penetrate alone.',
      emotionalHook: 'Flicker learns that calling together his friends creates a radiant river beacon that turns dark night into glowing warmth.',
      beginning: 'Flicker practices flashing morse code signals from the top of a giant mossy mushroom.',
      middle: 'A lost turtle family is stranded in the winding misty creek, and Flicker’s single lantern flickers in the damp breeze.',
      ending: 'Flicker chirps a harmonic note, summoning hundreds of firefly pals into a brilliant floating light chain to guide the turtles safely home.',
      lessonTheme: 'Teamwork, believing in yourself no matter your size, and guiding others.',
      estimatedRuntimeSeconds: 45,
      scores: {
        originality: 93,
        storyPotential: 94,
        emotionalEngagement: 95,
        childAppeal: 97,
        visualPotential: 98,
        characterPotential: 93,
        retentionPotential: 95,
        productionDifficulty: 42,
        brandFit: 97,
        overallScore: 94,
      },
      status: 'candidate',
    },
    {
      id: `idea-${timestamp}-3`,
      title: 'Milo and the Whispering Clocktower',
      logline: 'When the musical clock in Acorn Village stops ticking, a curious mouse and a sleepy hedgehog climb the wooden cog staircase to find out who borrowed the missing gear.',
      mainCharacters: ['Milo the Mouse', 'Hedge the Sleeper Hedgehog', 'Chirpy the Cuckoo Bird'],
      targetAge: age,
      genre: 'Gentle Mystery & Friendship',
      coreConflict: 'Without the clock chimes, the forest animals don’t know when storytime begins.',
      emotionalHook: 'Milo discovers that the missing gear wasn’t stolen; a mother bluebird used it as a warm cradle for her sleepy hatchlings.',
      beginning: 'The big Acorn Village clock stops chiming at breakfast, and Milo hears a curious tapping sound inside the spire.',
      middle: 'Milo and Hedge climb through winding copper pipes and bouncy pendulum swings.',
      ending: 'Milo replaces the gear with a soft knitted moss blanket for the baby birds, and the bells chime a joyful melody across the trees.',
      lessonTheme: 'Empathy, thoughtful problem solving, and caring for young creatures.',
      estimatedRuntimeSeconds: 50,
      scores: {
        originality: 91,
        storyPotential: 93,
        emotionalEngagement: 94,
        childAppeal: 95,
        visualPotential: 94,
        characterPotential: 95,
        retentionPotential: 92,
        productionDifficulty: 46,
        brandFit: 96,
        overallScore: 93,
      },
      status: 'candidate',
    },
  ];
}
