import {
  CharacterBible,
  CharacterDefinition,
  IdeaCandidate,
  WorldBible,
} from '../../src/types/pipeline.js';
import { generateStructuredJson } from '../gemini.js';

export async function generateBibles(
  projectId: string,
  idea: IdeaCandidate
): Promise<{ characterBible: CharacterBible; worldBible: WorldBible }> {
  const prompt = `
You are the Animation Art Director and Visual Development Supervisor for AutoTube Kids Animation.
Create the persistent CHARACTER BIBLE and WORLD BIBLE for project "${idea.title}".

MAIN CHARACTERS: ${idea.mainCharacters.join(', ')}
GENRE: ${idea.genre}
TARGET AGE: ${idea.targetAge}

STRICT RULE FOR CHARACTER BIBLE (SOURCE OF TRUTH):
- Every character must have fixed hex color tokens (primary, secondary, accent, eyes, furOrHair).
- Explicit body proportions (e.g. 1:2 head-to-body, chibi proportions).
- Rigid distinctive features.
- Voice preset (voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr', pitch, rate).
- Emotional expression specs (happy, curious, worried, surprised, relieved).
- List of FORBIDDEN variations (e.g. "Never change bandana color", "Never change eye color").

WORLD BIBLE:
- Art direction style (e.g. "Lush 2.5D papercraft-textured watercolor").
- Color language (sky, ground, foliage, magicAccent).
- Lighting style.
- Architecture / props.
- Camera grammar.

Output valid JSON matching this schema:
{
  "characterBible": {
    "projectId": "${projectId}",
    "artStyle": "...",
    "characters": [
      {
        "id": "char-1",
        "name": "${idea.mainCharacters[0] || 'Hero'}",
        "age": "6",
        "role": "protagonist",
        "personality": ["curious", "brave", "kind"],
        "visualPromptToken": "hero_character_storybook",
        "bodyProportions": "1:2 head-to-body rounded chibi",
        "colors": {
          "primary": "#e65c00",
          "secondary": "#ffffff",
          "accent": "#3e2723",
          "eyes": "#fbc02d",
          "furOrHair": "#f57c00"
        },
        "clothing": "...",
        "distinctiveFeatures": ["..."],
        "voicePreset": {
          "voiceName": "Puck",
          "pitch": 1.15,
          "rate": 0.95,
          "tone": "Warm and enthusiastic"
        },
        "emotionalExpressions": {
          "happy": "...",
          "curious": "...",
          "worried": "...",
          "surprised": "...",
          "relieved": "..."
        },
        "rigType": "quadruped"
      }
    ],
    "forbiddenVariations": [
      "No random clothing changes between scenes",
      "No color shifts on fur or eyes"
    ]
  },
  "worldBible": {
    "artDirection": "...",
    "colorLanguage": {
      "sky": "#0d1b2a",
      "ground": "#1b4332",
      "foliage": "#2d6a4f",
      "magicAccent": "#ffd166"
    },
    "lightingStyle": "...",
    "architectureStyle": "...",
    "keyProps": ["..."],
    "weatherOptions": ["..."],
    "cameraGrammar": "..."
  }
}
`;

  const result = await generateStructuredJson<{
    characterBible: CharacterBible;
    worldBible: WorldBible;
  }>(prompt);

  if (result && result.characterBible && result.worldBible) {
    return result;
  }

  return getFallbackBibles(projectId, idea);
}

function getFallbackBibles(projectId: string, idea: IdeaCandidate): {
  characterBible: CharacterBible;
  worldBible: WorldBible;
} {
  const char1Name = idea.mainCharacters[0] || 'Barnaby';
  const char2Name = idea.mainCharacters[1] || 'Pip';

  const characters: CharacterDefinition[] = [
    {
      id: 'char-1',
      name: char1Name,
      age: '6',
      role: 'protagonist',
      personality: ['Warm-hearted', 'Curious', 'Patient', 'Gentle'],
      visualPromptToken: `${char1Name.toLowerCase().replace(/\s+/g, '_')}_plush_storybook_character`,
      bodyProportions: 'Plump rounded chibi 1:2 head-to-body ratio with soft expressive silhouette',
      colors: {
        primary: '#8d6e63', // Soft cocoa brown
        secondary: '#fff8e1', // Cream chest patch
        accent: '#5d4037', // Deep chocolate paws
        eyes: '#4e342e', // Warm deep brown button eyes
        furOrHair: '#a1887f', // Milk chocolate fluff
      },
      clothing: 'Forest green hand-stitched acorn vest with wooden toggle buttons',
      distinctiveFeatures: ['Plush button-like round ears', 'Soft cream heart-shaped chest marking'],
      voicePreset: {
        voiceName: 'Puck',
        pitch: 1.1,
        rate: 0.95,
        tone: 'Warm, cozy, cheerful children narrator voice',
      },
      emotionalExpressions: {
        happy: 'Gentle eye-crinkle smile with relaxed ears and cheerful hand wave',
        curious: 'Head tilted, one ear perked up with wide bright eyes',
        worried: 'Ears turned slightly down, gentle furrowed brow, clasping hands together',
        surprised: 'Eyes wide open, round O-shaped mouth, hands raised in delight',
        relieved: 'Soft happy sigh, relaxed posture, warm wide smile',
      },
      rigType: 'biped',
    },
    {
      id: 'char-2',
      name: char2Name,
      age: '4',
      role: 'friend',
      personality: ['Playful', 'Innocent', 'Sweet', 'Bouncy'],
      visualPromptToken: `${char2Name.toLowerCase().replace(/\s+/g, '_')}_cute_magical_sidekick`,
      bodyProportions: 'Tiny palm-sized companion with oversized expressive eyes (1:1 head-to-body)',
      colors: {
        primary: '#ffd54f', // Warm sunny gold
        secondary: '#fff9c4', // Pale buttercup yellow
        accent: '#ff8a80', // Soft pastel blush
        eyes: '#1a237e', // Deep sapphire sparkle
        furOrHair: '#ffffff', // Cloud white tuft
      },
      clothing: 'None (leaves a faint trail of sparkling pastel light dust)',
      distinctiveFeatures: ['Pastel blush cheeks', 'Tiny floating sparkles following movement'],
      voicePreset: {
        voiceName: 'Zephyr',
        pitch: 1.3,
        rate: 1.05,
        tone: 'Sweet, musical, bell-like companion voice',
      },
      emotionalExpressions: {
        happy: 'Spinning in mid-air loop with joyful sparkle shower',
        curious: 'Peeking upside down with inquisitive chime vibration',
        worried: 'Dimming to faint amber glow with trembling outline',
        surprised: 'Sudden burst of lavender sparkles with quick upward bounce',
        relieved: 'Soft warm golden bloom with gentle floating bob',
      },
      rigType: 'creature',
    },
  ];

  return {
    characterBible: {
      projectId,
      artStyle: 'Lush 2.5D storybook animation with soft rim lighting, textured brushstrokes, and warm cinematic depth',
      characters,
      forbiddenVariations: [
        `Never alter ${char1Name}’s primary color or remove the forest green vest`,
        `Never give ${char2Name} sharp angular or menacing geometry`,
        'Never change eye color or facial anatomy between scenes',
        'Maintain exact body proportion ratios across all camera angles',
      ],
    },
    worldBible: {
      artDirection: 'Whimsical storybook aesthetic inspired by classic children’s picture books with rich watercolor washes and soft golden lighting',
      colorLanguage: {
        sky: '#1e3c72',
        ground: '#2a5298',
        foliage: '#38b000',
        magicAccent: '#ffd60a',
      },
      lightingStyle: 'Soft volumetric godrays, warm rim lighting on character silhouettes, and luminous ambient glow from magical flora',
      architectureStyle: 'Organic woodland fantasy: hollow tree dwellings, moss-thatched roofs, polished river-stone pathways',
      keyProps: ['Acorn lantern', 'Wooden gear clock', 'Singing brook stepping stones', 'Golden dewdrop flowers'],
      weatherOptions: ['Clear morning glow', 'Dappled golden afternoon', 'Enchanted twilight with glowing motes'],
      cameraGrammar: 'Smooth multi-plane parallax camera dollies, slow push-ins for emotional intimacy, and eye-level height for child perspective',
    },
  };
}
