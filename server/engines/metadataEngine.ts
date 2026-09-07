import {
  AutoTubeProject,
  YouTubeMetadata,
} from '../../src/types/pipeline.js';
import { generateStructuredJson } from '../gemini.js';

export async function generateYouTubeMetadata(
  project: AutoTubeProject
): Promise<YouTubeMetadata> {
  const charNames = project.characterBible?.characters.map((c) => c.name).join(', ') || 'Friends';
  const scenes = project.storyboard || [];

  const chaptersPrompt = scenes.map((s, i) => {
    const min = Math.floor((i * 10) / 60);
    const sec = (i * 10) % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `- ${timeStr} Scene ${s.sceneNumber}: ${s.primaryAction}`;
  });

  const prompt = `
You are the YouTube Growth and Kids Content Strategist at AutoTube.
Generate high-CTR, kid-friendly, compliant YouTube metadata for project "${project.title}".

PROJECT:
Title: ${project.title}
Logline: ${project.idea.logline}
Target Age: ${project.idea.targetAge}
Characters: ${charNames}
Genre: ${project.idea.genre}
Theme: ${project.idea.lessonTheme}

REQUIREMENTS:
1. primaryTitle: Curiosity-driven, warm, engaging, with friendly emoji, not deceptive clickbait. Under 65 characters.
2. titleAlternatives: 3 additional strong title options.
3. description: Beautifully formatted with synopsis, emotional takeaway, chapter timestamps, and channel CTA.
4. chapters: Array of objects with timestamp and clean title.
5. tags: 8-10 high-relevance tags for YouTube algorithm.
6. hashtags: 3-4 friendly hashtags (#KidsStories, etc.).
7. targetAgeClassification: Must be "Made for Kids" (COPPA compliance).
8. thumbnailPrompt: Visual description of high-contrast thumbnail composition (clear focal character, strong expression, clean silhouette).
9. thumbnailHeadline: 3-5 bold curiosity words for thumbnail overlay.
10. thumbnailSubtext: Short supportive phrase.
11. thumbnailCharacterPose: Character focal pose and emotion.

Output valid JSON matching YouTubeMetadata interface:
{
  "primaryTitle": "...",
  "titleAlternatives": ["...", "...", "..."],
  "description": "...",
  "chapters": [
    { "timestamp": "00:00", "title": "..." },
    { "timestamp": "00:10", "title": "..." }
  ],
  "tags": ["..."],
  "hashtags": ["#KidsStories", "..."],
  "category": "Film & Animation",
  "targetAgeClassification": "Made for Kids",
  "playlistSuggestion": "...",
  "seoKeywords": ["..."],
  "thumbnailPrompt": "...",
  "thumbnailHeadline": "...",
  "thumbnailSubtext": "...",
  "thumbnailCharacterPose": "..."
}
`;

  const result = await generateStructuredJson<YouTubeMetadata>(prompt);
  if (result && result.primaryTitle && result.thumbnailHeadline) {
    return {
      ...result,
      targetAgeClassification: 'Made for Kids',
    };
  }

  // Fallback metadata generator
  return {
    primaryTitle: `${project.title} ⭐ | Kids Animated Story`,
    titleAlternatives: [
      `${project.title} | Bedtime Adventure for Kids`,
      `A Heartwarming Tale: ${project.title}`,
      `Sweet Stories for Children | ${project.title}`,
    ],
    description: `Join us for a heartwarming animated adventure in "${project.title}"!\n\n${project.idea.logline}\n\n✨ A gentle story about ${project.idea.lessonTheme}, made especially for children aged ${project.idea.targetAge}.\n\n🕒 CHAPTERS:\n00:00 - A Curious Beginning\n00:09 - The Surprise Discovery\n00:20 - Journey of Friendship\n00:32 - A Glowing Happy Ending\n\n🔔 Subscribe to AutoTube for original animated children's stories every week!`,
    chapters: [
      { timestamp: '00:00', title: 'A Curious Beginning' },
      { timestamp: '00:09', title: 'The Surprise Discovery' },
      { timestamp: '00:20', title: 'Journey of Friendship' },
      { timestamp: '00:32', title: 'A Glowing Happy Ending' },
    ],
    tags: [
      'kids stories',
      'children animation',
      'bedtime story for kids',
      'autotube',
      'animated cartoon',
      'moral stories for kids',
      'preschool story',
    ],
    hashtags: ['#KidsStories', '#BedtimeStory', '#ChildrenAnimation', '#KidsCartoons'],
    category: 'Film & Animation',
    targetAgeClassification: 'Made for Kids',
    playlistSuggestion: 'Gentle Adventures & Magical Bedtime Tales',
    seoKeywords: ['kids story animation', 'children bedtime stories', 'positive values for kids', 'cute cartoon'],
    thumbnailPrompt: `Close-up shot of ${project.idea.mainCharacters[0]} with wide sparkling eyes and joyful expression, vibrant rim lighting, warm magical background with high color contrast`,
    thumbnailHeadline: 'A MAGICAL SECRET! ✨',
    thumbnailSubtext: 'Sweet Kids Story',
    thumbnailCharacterPose: 'Focal character leaning forward with curious wonder and cheerful smile',
  };
}
