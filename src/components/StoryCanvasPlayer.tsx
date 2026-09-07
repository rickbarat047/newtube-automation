import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';
import {
  StoryboardScene,
  CharacterBible,
  WorldBible,
} from '../types/pipeline.js';
import { audioEngine } from '../utils/audioSynthesizer.js';

interface StoryCanvasPlayerProps {
  storyboard: StoryboardScene[];
  characterBible?: CharacterBible;
  worldBible?: WorldBible;
  title: string;
}

export const StoryCanvasPlayer: React.FC<StoryCanvasPlayerProps> = ({
  storyboard,
  characterBible,
  worldBible,
  title,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeInScene, setCurrentTimeInScene] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeWord, setActiveWord] = useState('');
  const [cameraTransform, setCameraTransform] = useState({ scale: 1, x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const spokenInSceneRef = useRef<boolean>(false);
  const triggeredSfxRef = useRef<Set<string>>(new Set());

  const currentScene = storyboard[currentSceneIdx] || storyboard[0];
  const sceneDuration = currentScene?.durationSeconds || 10;

  // Calculate total runtime & global time
  const totalDuration = storyboard.reduce((acc, s) => acc + (s.durationSeconds || 10), 0);
  const sceneStartOffsets = storyboard.reduce((acc, s, idx) => {
    if (idx === 0) return [0];
    acc.push(acc[idx - 1] + (storyboard[idx - 1].durationSeconds || 10));
    return acc;
  }, [] as number[]);

  const globalCurrentTime = (sceneStartOffsets[currentSceneIdx] || 0) + currentTimeInScene;

  // Camera Motion calculation based on currentScene.cameraMovement
  useEffect(() => {
    if (!currentScene) return;
    const progress = Math.min(1, Math.max(0, currentTimeInScene / sceneDuration));

    switch (currentScene.cameraMovement) {
      case 'slow_push_in':
        setCameraTransform({
          scale: 1 + progress * 0.18,
          x: -progress * 20,
          y: -progress * 15,
        });
        break;
      case 'pull_out':
        setCameraTransform({
          scale: 1.18 - progress * 0.18,
          x: (1 - progress) * 20,
          y: (1 - progress) * 10,
        });
        break;
      case 'pan_right':
        setCameraTransform({
          scale: 1.05,
          x: -progress * 50,
          y: 0,
        });
        break;
      case 'pan_left':
        setCameraTransform({
          scale: 1.05,
          x: progress * 50 - 25,
          y: 0,
        });
        break;
      case 'tilt_up':
        setCameraTransform({
          scale: 1.08,
          x: 0,
          y: progress * 35 - 15,
        });
        break;
      case 'tracking':
        setCameraTransform({
          scale: 1.12,
          x: -progress * 30 + Math.sin(progress * Math.PI * 2) * 5,
          y: Math.cos(progress * Math.PI * 2) * 4,
        });
        break;
      default:
        setCameraTransform({ scale: 1, x: 0, y: 0 });
    }
  }, [currentScene, currentTimeInScene, sceneDuration]);

  // Handle scene change & narration speech trigger
  const triggerSceneAudioAndNarration = useCallback((scene: StoryboardScene) => {
    if (isMuted) return;

    // Start background music
    audioEngine.playMusic(scene.musicMood || 'playful_wonder');

    // Trigger spoken narration
    if (scene.narrationText && !spokenInSceneRef.current) {
      spokenInSceneRef.current = true;
      audioEngine.speakNarration(scene.narrationText, {
        pitch: 1.1,
        rate: 0.92,
      });
    }
  }, [isMuted]);

  // Main animation / playback loop
  useEffect(() => {
    if (!isPlaying) {
      audioEngine.stopMusic();
      audioEngine.cancelSpeech();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTimeRef.current = Date.now();
    triggerSceneAudioAndNarration(currentScene);

    const loop = () => {
      const now = Date.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTimeInScene((prev) => {
        const nextTime = prev + deltaSec;

        // Check sound effects triggering
        if (currentScene?.soundEffects && !isMuted) {
          currentScene.soundEffects.forEach((sfx) => {
            const key = `${currentScene.sceneId}-${sfx.cue}`;
            if (nextTime >= sfx.timestamp && !triggeredSfxRef.current.has(key)) {
              triggeredSfxRef.current.add(key);
              audioEngine.playSoundEffect(sfx.cue);
            }
          });
        }

        // Check active word for captions
        if (currentScene?.captions) {
          const match = currentScene.captions.find(
            (c) => nextTime >= c.start && nextTime <= c.end
          );
          setActiveWord(match ? match.word : '');
        }

        // Check if current scene has ended
        if (nextTime >= sceneDuration) {
          if (currentSceneIdx < storyboard.length - 1) {
            // Next scene transition
            spokenInSceneRef.current = false;
            setCurrentSceneIdx((idx) => idx + 1);
            return 0;
          } else {
            // Reached end of animation
            setIsPlaying(false);
            audioEngine.stopMusic();
            return sceneDuration;
          }
        }

        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentSceneIdx, currentScene, sceneDuration, storyboard.length, isMuted, triggerSceneAudioAndNarration]);

  // Scrubber control
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetGlobalSec = parseFloat(e.target.value);
    let accumulated = 0;
    for (let i = 0; i < storyboard.length; i++) {
      const dur = storyboard[i].durationSeconds || 10;
      if (targetGlobalSec <= accumulated + dur || i === storyboard.length - 1) {
        spokenInSceneRef.current = false;
        triggeredSfxRef.current.clear();
        setCurrentSceneIdx(i);
        setCurrentTimeInScene(Math.max(0, targetGlobalSec - accumulated));
        break;
      }
      accumulated += dur;
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTimeInScene >= sceneDuration && currentSceneIdx === storyboard.length - 1) {
        // Reset to start
        setCurrentSceneIdx(0);
        setCurrentTimeInScene(0);
        spokenInSceneRef.current = false;
        triggeredSfxRef.current.clear();
      }
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentSceneIdx(0);
    setCurrentTimeInScene(0);
    spokenInSceneRef.current = false;
    triggeredSfxRef.current.clear();
    setCameraTransform({ scale: 1, x: 0, y: 0 });
    setActiveWord('');
  };

  const handleSelectScene = (index: number) => {
    spokenInSceneRef.current = false;
    triggeredSfxRef.current.clear();
    setCurrentSceneIdx(index);
    setCurrentTimeInScene(0);
    if (isPlaying) {
      triggerSceneAudioAndNarration(storyboard[index]);
    }
  };

  // Interpolate character keyframe positions
  const keyframes = currentScene?.animationKeyframes || [];
  const currentKeyframe =
    keyframes
      .slice()
      .reverse()
      .find((kf) => currentTimeInScene >= kf.timestamp) || keyframes[0] || {
      positionX: 50,
      positionY: 55,
      scale: 1,
      facialExpression: 'happy',
      isTalking: false,
      facing: 'right',
    };

  return (
    <div
      ref={containerRef}
      id="story-player-container"
      className={`relative flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-mono">
                16:9 1080p
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Scene {currentScene?.sceneNumber || 1} of {storyboard.length} •{' '}
              {currentScene?.environment}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera movement badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-mono">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase text-[11px] font-medium">
              {currentScene?.cameraAngle} • {currentScene?.cameraMovement?.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute Audio Stems' : 'Mute Audio Stems'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Visual Canvas Stage (16:9 ratio) */}
      <div className="relative w-full aspect-video bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 overflow-hidden select-none">
        {/* Dynamic Camera Root */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `scale(${cameraTransform.scale}) translate(${cameraTransform.x}px, ${cameraTransform.y}px)`,
          }}
        >
          {/* LAYER 1: Deep Sky & Far Background */}
          <div className="absolute inset-0">
            {currentScene?.backgroundPreset === 'enchanted_forest' && (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 562">
                <defs>
                  <linearGradient id="skyGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#080e1e" />
                    <stop offset="60%" stopColor="#132342" />
                    <stop offset="100%" stopColor="#1e3a5f" />
                  </linearGradient>
                  <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ffd54f" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="1000" height="562" fill="url(#skyGrad1)" />
                {/* Crescent Moon & Stars */}
                <circle cx="820" cy="110" r="70" fill="url(#moonGlow)" />
                <circle cx="820" cy="110" r="32" fill="#fffde7" />
                <circle cx="832" cy="104" r="28" fill="#132342" />
                {/* Distant mountains */}
                <path d="M 0 420 Q 200 320 450 390 T 800 340 T 1000 400 L 1000 562 L 0 562 Z" fill="#0d1b2a" opacity="0.8" />
                <path d="M 0 450 Q 300 380 600 440 T 1000 430 L 1000 562 L 0 562 Z" fill="#1b263b" opacity="0.9" />
              </svg>
            )}

            {currentScene?.backgroundPreset === 'crystal_cave' && (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 562">
                <defs>
                  <linearGradient id="caveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#110d24" />
                    <stop offset="100%" stopColor="#1c1638" />
                  </linearGradient>
                </defs>
                <rect width="1000" height="562" fill="url(#caveGrad)" />
                {/* Crystal stalactites */}
                <polygon points="120,0 145,180 170,0" fill="#7986cb" opacity="0.7" />
                <polygon points="340,0 370,220 400,0" fill="#9fa8da" opacity="0.6" />
                <polygon points="760,0 790,260 820,0" fill="#c5cae9" opacity="0.8" />
                {/* Cave opening silhouette */}
                <path d="M 0 0 C 300 120 700 80 1000 0 L 1000 562 L 0 562 Z" fill="#0c071d" opacity="0.5" />
              </svg>
            )}

            {currentScene?.backgroundPreset === 'sparkling_brook' && (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 562">
                <defs>
                  <linearGradient id="brookSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c192c" />
                    <stop offset="100%" stopColor="#1b4332" />
                  </linearGradient>
                </defs>
                <rect width="1000" height="562" fill="url(#brookSky)" />
                {/* Rolling river banks */}
                <path d="M 0 320 Q 250 280 500 340 T 1000 310 L 1000 562 L 0 562 Z" fill="#2d6a4f" opacity="0.7" />
                {/* Winding blue stream */}
                <path d="M 120 562 C 300 480 420 410 520 370 C 680 340 850 320 1000 300 L 1000 360 C 820 390 600 440 400 562 Z" fill="#48cae4" opacity="0.85" />
              </svg>
            )}

            {(currentScene?.backgroundPreset === 'starlit_bedroom' || !currentScene?.backgroundPreset) && (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 562">
                <defs>
                  <linearGradient id="dawnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a0b2e" />
                    <stop offset="50%" stopColor="#311b92" />
                    <stop offset="100%" stopColor="#ff8f00" />
                  </linearGradient>
                </defs>
                <rect width="1000" height="562" fill="url(#dawnGrad)" opacity="0.9" />
                {/* Glowing Aurora ribbons */}
                <path d="M 0 140 Q 250 80 500 130 T 1000 90" stroke="#76ff03" strokeWidth="28" fill="none" opacity="0.25" />
                <path d="M 0 190 Q 300 120 600 170 T 1000 140" stroke="#00e5ff" strokeWidth="32" fill="none" opacity="0.3" />
                {/* Hilltop silhouette */}
                <path d="M 0 520 Q 400 380 750 420 T 1000 500 L 1000 562 L 0 562 Z" fill="#0f0c24" />
              </svg>
            )}
          </div>

          {/* LAYER 2: Midground Environment Props (Ancient Oak Trees, Mushrooms, River Stones) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Ancient Mossy Oak Tree */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 562">
              <defs>
                <radialGradient id="shroomGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Left Ancient Tree Trunk */}
              <path d="M -20 -20 Q 80 200 40 460 Q 90 520 180 562 L -20 562 Z" fill="#2c1810" />
              <path d="M 30 220 Q 140 260 220 220" stroke="#2c1810" strokeWidth="26" fill="none" />
              {/* Moss patches */}
              <ellipse cx="60" cy="380" rx="24" ry="14" fill="#52b788" opacity="0.9" />
              <ellipse cx="95" cy="440" rx="30" ry="16" fill="#40916c" opacity="0.9" />
              {/* Glowing Mushrooms on Tree Root */}
              <circle cx="140" cy="490" r="28" fill="url(#shroomGlow)" />
              <path d="M 125 500 Q 140 475 155 500 Z" fill="#00f5d4" />
              <rect x="137" y="500" width="6" height="12" fill="#e0fbfc" />
              {/* Right woodland foliage branch */}
              <path d="M 1020 -20 Q 900 180 940 440 L 1020 562 Z" fill="#2c1810" opacity="0.7" />
            </svg>
          </div>

          {/* LAYER 3: Interactive Character Rigs */}
          {/* Character 1: Pip the Fox Rig */}
          <div
            className="absolute transition-all duration-300 ease-out origin-bottom"
            style={{
              left: `${currentKeyframe.positionX}%`,
              top: `${currentKeyframe.positionY}%`,
              transform: `translate(-50%, -70%) scale(${currentKeyframe.scale}) ${
                currentKeyframe.facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
              }`,
            }}
          >
            <div className="relative w-40 h-48">
              {/* Character Rig SVG */}
              <svg className="w-full h-full filter drop-shadow(0 10px 15px rgba(0,0,0,0.5))" viewBox="0 0 160 190">
                <defs>
                  <linearGradient id="foxFur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff7b00" />
                    <stop offset="100%" stopColor="#d35400" />
                  </linearGradient>
                  <radialGradient id="pipCheekGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff8a80" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#ff8a80" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Fluffy Tail with Wag Animation */}
                <g className="animate-[wiggle_2.5s_ease-in-out_infinite] origin-bottom-left">
                  <path d="M 40 140 C -10 120 -25 70 5 45 C 25 30 55 70 52 130 Z" fill="url(#foxFur)" />
                  {/* White tail tip (Strict Character Bible compliance!) */}
                  <path d="M 5 45 C -15 65 -5 95 18 80 C 25 55 20 40 5 45 Z" fill="#ffffff" />
                </g>

                {/* Body */}
                <ellipse cx="80" cy="135" rx="34" ry="38" fill="url(#foxFur)" />
                {/* White fluffy chest patch */}
                <ellipse cx="80" cy="138" rx="20" ry="24" fill="#ffffff" />

                {/* Sage Green Knitted Acorn Bandana (Strict Bible Anchor) */}
                <path d="M 54 112 Q 80 138 106 112 Q 80 120 54 112 Z" fill="#588157" />
                <circle cx="80" cy="122" r="5" fill="#a3b18a" />

                {/* Oversized Expressive Fox Ears */}
                <g>
                  {/* Left Ear */}
                  <path d="M 48 65 Q 25 5 55 18 Q 72 38 68 62 Z" fill="url(#foxFur)" />
                  <path d="M 50 60 Q 35 18 54 26 Q 66 42 62 58 Z" fill="#ffe0b2" />
                  {/* Right Ear */}
                  <path d="M 112 65 Q 135 5 105 18 Q 88 38 92 62 Z" fill="url(#foxFur)" />
                  <path d="M 110 60 Q 125 18 106 26 Q 94 42 98 58 Z" fill="#ffe0b2" />
                </g>

                {/* Head */}
                <ellipse cx="80" cy="72" rx="38" ry="32" fill="url(#foxFur)" />
                {/* White Cheek Tufts */}
                <path d="M 44 76 Q 30 84 46 94 Q 60 92 68 86 Z" fill="#ffffff" />
                <path d="M 116 76 Q 130 84 114 94 Q 100 92 92 86 Z" fill="#ffffff" />

                {/* Cheerful Cheek Blushes */}
                <circle cx="56" cy="80" r="8" fill="url(#pipCheekGlow)" />
                <circle cx="104" cy="80" r="8" fill="url(#pipCheekGlow)" />

                {/* Fox Eyes with Expression */}
                <g>
                  {currentKeyframe.facialExpression === 'curious' ? (
                    <>
                      <circle cx="64" cy="68" r="8.5" fill="#fbc02d" />
                      <circle cx="64" cy="68" r="5" fill="#212121" />
                      <circle cx="66" cy="66" r="2.5" fill="#ffffff" />
                      <circle cx="96" cy="68" r="8.5" fill="#fbc02d" />
                      <circle cx="96" cy="68" r="5" fill="#212121" />
                      <circle cx="98" cy="66" r="2.5" fill="#ffffff" />
                    </>
                  ) : currentKeyframe.facialExpression === 'worried' ? (
                    <>
                      <path d="M 58 64 Q 64 68 70 64" stroke="#4e342e" strokeWidth="2.5" fill="none" />
                      <circle cx="64" cy="70" r="7" fill="#fbc02d" />
                      <circle cx="64" cy="70" r="4" fill="#212121" />
                      <circle cx="96" cy="70" r="7" fill="#fbc02d" />
                      <circle cx="96" cy="70" r="4" fill="#212121" />
                    </>
                  ) : (
                    // Happy Crescent Eyes
                    <>
                      <path d="M 56 70 Q 64 62 72 70" stroke="#3e2723" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                      <path d="M 88 70 Q 96 62 104 70" stroke="#3e2723" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    </>
                  )}
                </g>

                {/* Nose & Mouth (Lip sync when talking) */}
                <polygon points="76,82 84,82 80,87" fill="#212121" />
                {currentKeyframe.isTalking ? (
                  <ellipse cx="80" cy="94" rx="6" ry="5" fill="#b71c1c" />
                ) : (
                  <path d="M 76 89 Q 80 94 84 89" stroke="#3e2723" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                )}

                {/* Paws */}
                <ellipse cx="64" cy="168" rx="12" ry="8" fill="#3e2723" />
                <ellipse cx="96" cy="168" rx="12" ry="8" fill="#3e2723" />
              </svg>
            </div>
          </div>

          {/* Character 2: Lumie the Baby Star (Floating Sidekick) */}
          {(currentScene?.charactersPresent?.includes('Lumie') || currentScene?.charactersPresent?.length > 1) && (
            <div
              className="absolute transition-all duration-500 ease-out pointer-events-none"
              style={{
                left: `${currentKeyframe.positionX + (currentKeyframe.facing === 'left' ? -22 : 22)}%`,
                top: `${currentKeyframe.positionY - 24}%`,
                transform: `translate(-50%, -50%) scale(${0.85 + Math.sin(currentTimeInScene * 3) * 0.08})`,
              }}
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Glowing Aura */}
                <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-xl animate-pulse" />
                <svg className="w-full h-full filter drop-shadow(0 0 12px rgba(255, 235, 59, 0.9))" viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#fff176" />
                      <stop offset="100%" stopColor="#ffd54f" />
                    </radialGradient>
                  </defs>
                  {/* Marshmallow 5-Point Rounded Star */}
                  <path
                    d="M 50 12 Q 58 35 78 38 Q 62 54 66 76 Q 50 66 34 76 Q 38 54 22 38 Q 42 35 50 12 Z"
                    fill="url(#starGlow)"
                  />
                  {/* Pink Cheek Blush */}
                  <circle cx="38" cy="50" r="4.5" fill="#ff80ab" opacity="0.8" />
                  <circle cx="62" cy="50" r="4.5" fill="#ff80ab" opacity="0.8" />
                  {/* Star Eyes */}
                  <circle cx="42" cy="44" r="3.2" fill="#1a237e" />
                  <circle cx="58" cy="44" r="3.2" fill="#1a237e" />
                  <circle cx="43" cy="43" r="1.2" fill="#ffffff" />
                  <circle cx="59" cy="43" r="1.2" fill="#ffffff" />
                  {/* Happy Smile */}
                  <path d="M 47 52 Q 50 56 53 52" stroke="#d81b60" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}

          {/* LAYER 4: Atmospheric Fireflies & Golden Dust Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd54f] animate-pulse"
                style={{
                  left: `${(i * 19 + 7) % 94}%`,
                  top: `${(i * 27 + 12) % 86}%`,
                  opacity: 0.3 + (i % 4) * 0.2,
                  transform: `translateY(${Math.sin((currentTimeInScene + i) * 1.5) * 14}px)`,
                  transition: 'transform 0.4s ease',
                }}
              />
            ))}
          </div>

          {/* LAYER 5: Foreground Rim Vignette & Lighting Filter */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Burned-in Synchronized Karaoke Captions (Center Bottom) */}
        {currentScene?.narrationText && (
          <div className="absolute bottom-6 inset-x-8 flex flex-col items-center justify-center pointer-events-none z-30">
            <div className="max-w-3xl px-6 py-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-2xl text-center">
              <p className="text-base sm:text-lg md:text-xl font-medium tracking-wide text-slate-100 leading-relaxed">
                {currentScene.narrationText.split(/\s+/).map((word, wIdx) => {
                  const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  const cleanActive = activeWord.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  const isHighlighted = cleanWord && cleanActive && cleanWord === cleanActive;

                  return (
                    <span
                      key={wIdx}
                      className={`inline-block mr-1.5 transition-all duration-150 ${
                        isHighlighted
                          ? 'text-amber-300 font-bold scale-110 drop-shadow-[0_0_8px_#f59e0b]'
                          : 'text-slate-200'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>
        )}

        {/* Big Center Play Overlay (when paused) */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group z-40"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all">
              <Play className="w-10 h-10 ml-1.5 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Scrubber & Timeline Bar */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2.5 z-20">
        <div className="flex items-center gap-3">
          {/* Play/Pause toggle */}
          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md"
            title={isPlaying ? 'Pause' : 'Play Animated Story'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset from Scene 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Scrubber */}
          <div className="flex-1 flex flex-col justify-center">
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={globalCurrentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div className="text-xs font-mono text-slate-400 whitespace-nowrap min-w-[90px] text-right">
            <span>{Math.floor(globalCurrentTime)}s</span>
            <span className="text-slate-600"> / </span>
            <span>{Math.floor(totalDuration)}s</span>
          </div>
        </div>

        {/* Scene Selector Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Scenes:
            </span>
            {storyboard.map((sc, i) => (
              <button
                key={sc.sceneId}
                onClick={() => handleSelectScene(i)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  i === currentSceneIdx
                    ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                #{sc.sceneNumber} {sc.environment?.split(' ')[0]} ({sc.durationSeconds}s)
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 hidden md:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Music: <strong className="text-slate-200 uppercase">{currentScene?.musicMood?.replace(/_/g, ' ')}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
