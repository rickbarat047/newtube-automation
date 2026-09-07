import { IdeaCandidate, StoryDocument } from '../../src/types/pipeline.js';
import { generateStructuredJson } from '../gemini.js';

export async function developStory(idea: IdeaCandidate): Promise<StoryDocument> {
  const prompt = `
You are the lead story director at AutoTube, an animated storytelling channel for children.
Take the following approved idea candidate and develop a rich, cohesive 5-Act story structure tailored for children aged ${idea.targetAge}.

IDEA:
Title: ${idea.title}
Logline: ${idea.logline}
Characters: ${idea.mainCharacters.join(', ')}
Genre: ${idea.genre}
Core Conflict: ${idea.coreConflict}
Emotional Hook: ${idea.emotionalHook}
Theme: ${idea.lessonTheme}

REQUIREMENTS:
1. Act 1 (Hook): Must hook the child in the first 5-15 seconds with wonder, curiosity, or gentle surprise. No slow exposition.
2. Act 2 (Problem): Clear, understandable conflict that sparks empathy.
3. Act 3 (Escalation): Action or emotional test where stakes gently rise without becoming scary or traumatic.
4. Act 4 (Climax): Teamwork, cleverness, or kindness resolves the dilemma in an exciting, visually stunning way.
5. Act 5 (Resolution): Warm, comforting ending that leaves the child feeling safe, happy, and inspired.
6. Retention Beats: 4 specific visual/audio hooks placed throughout the runtime to maximize engagement.

Output valid JSON matching this schema:
{
  "act1Hook": "...",
  "act2Problem": "...",
  "act3Escalation": "...",
  "act4Climax": "...",
  "act5Resolution": "...",
  "retentionBeats": [
    "0-5s: ...",
    "15s: ...",
    "28s: ...",
    "40s: ..."
  ]
}
`;

  const result = await generateStructuredJson<StoryDocument>(prompt);
  if (result && result.act1Hook && result.act4Climax) {
    return result;
  }

  // Fallback high-craft story outline
  return {
    act1Hook: `In the very first 5 seconds, ${idea.mainCharacters[0]} encounters an unexpected, magical anomaly that triggers immediate wonder and playful curiosity.`,
    act2Problem: `The peaceful routine is disrupted: ${idea.coreConflict}. The characters must act quickly to help their friend.`,
    act3Escalation: `A sudden obstacle tests the duo’s patience and ingenuity, prompting a lively journey across unfamiliar, captivating landscape.`,
    act4Climax: `Through cooperation, gentle empathy, and creative problem solving, ${idea.mainCharacters.join(' and ')} overcome the hurdle in a dazzling burst of colorful harmony.`,
    act5Resolution: `The world is restored to calm joy. A warm visual embrace and playful farewell solidify the theme of ${idea.lessonTheme}, bringing a safe, peaceful conclusion.`,
    retentionBeats: [
      `0-5s: Rapid audiovisual hook with whimsical sound effects and expressive character reaction`,
      `15s: Heartfelt dialogue moment introducing high emotional connection`,
      `30s: Visual action beat with dynamic camera movement and pacing acceleration`,
      `42s: Emotional crescendo and satisfying warm resolution payoff`,
    ],
  };
}
