import React from 'react';
import {
  CharacterBible,
  WorldBible,
} from '../types/pipeline.js';
import {
  Palette,
  Mic,
  Smile,
  ShieldAlert,
  Camera,
  Sun,
  Home,
  CheckCircle,
} from 'lucide-react';

interface BiblesViewerProps {
  characterBible?: CharacterBible;
  worldBible?: WorldBible;
}

export const BiblesViewer: React.FC<BiblesViewerProps> = ({
  characterBible,
  worldBible,
}) => {
  if (!characterBible || !worldBible) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
        <Palette className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h4 className="text-base font-semibold text-slate-300">Bibles Not Yet Generated</h4>
        <p className="text-sm text-slate-500 mt-1">
          Character and World Bibles are locked during Phase 4 of the pipeline to guarantee visual continuity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Art Direction & Continuity Rule */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Style Continuity & Production Bibles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict single-source-of-truth ensuring zero model drift, persistent color palettes, and vocal identities across scenes.
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-500">Global Art Direction: </span>
            <strong className="text-amber-300">{worldBible.artDirection}</strong>
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      <div>
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>Character Bible (Persistent Rigs)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
            {characterBible.characters.length} characters
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characterBible.characters.map((char) => (
            <div
              key={char.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
            >
              {/* Character Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base font-bold text-slate-100">{char.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {char.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rig: <strong className="text-slate-300 capitalize">{char.rigType}</strong> • Target Age: {char.age}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{char.voicePreset?.voiceName || 'Default'}</span>
                </div>
              </div>

              {/* Fixed Color Tokens Swatches */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Fixed Hex Color Tokens (Source of Truth):</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {Object.entries(char.colors).map(([key, hex]) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-xl border border-slate-700 shadow-md transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                        title={`${key}: ${hex}`}
                      />
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{key}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proportions & Clothing */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400">Body Proportions: </span>
                  <span className="text-slate-200">{char.bodyProportions}</span>
                </div>
                <div>
                  <span className="text-slate-400">Clothing / Anchor: </span>
                  <span className="text-slate-200">{char.clothing}</span>
                </div>
                <div>
                  <span className="text-slate-400">Distinctive Features: </span>
                  <span className="text-slate-200">{char.distinctiveFeatures.join(', ')}</span>
                </div>
              </div>

              {/* Emotional Expression specs */}
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-slate-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emotional Acting Specs:</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <strong className="text-emerald-400">Happy:</strong> {char.emotionalExpressions.happy}
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <strong className="text-amber-400">Curious:</strong> {char.emotionalExpressions.curious}
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <strong className="text-rose-400">Worried:</strong> {char.emotionalExpressions.worried}
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <strong className="text-cyan-400">Relieved:</strong> {char.emotionalExpressions.relieved}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Forbidden Variations */}
        {characterBible.forbiddenVariations && characterBible.forbiddenVariations.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-200">
            <h5 className="font-bold flex items-center gap-2 text-rose-300 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Forbidden Variations (Strict Model Drift Prevention)
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {characterBible.forbiddenVariations.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* World Bible Section */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>World Bible & Cinematic Direction</span>
        </h4>

        {/* Color Language Swatches */}
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">World Color Language:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(worldBible.colorLanguage).map(([name, hex]) => (
              <div
                key={name}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60"
              >
                <div
                  className="w-9 h-9 rounded-lg border border-slate-600 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
                <div>
                  <p className="text-xs font-medium text-slate-200 capitalize">{name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cinematic Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <Sun className="w-4 h-4" />
              <span>Lighting Style</span>
            </div>
            <p className="text-slate-300">{worldBible.lightingStyle}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
              <Home className="w-4 h-4" />
              <span>Architecture & Props</span>
            </div>
            <p className="text-slate-300">{worldBible.architectureStyle}</p>
            <p className="text-slate-400 text-[11px] pt-1">
              Key Props: {worldBible.keyProps.join(', ')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Camera className="w-4 h-4" />
              <span>Camera Grammar</span>
            </div>
            <p className="text-slate-300">{worldBible.cameraGrammar}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
