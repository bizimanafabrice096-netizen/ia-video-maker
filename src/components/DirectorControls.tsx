import React from 'react';
import {
  Sliders,
  Sun,
  Eye,
  Grid,
  Sparkles,
  Music,
  Wind,
  Footprints,
  Volume2
} from 'lucide-react';
import { forestAudio } from '../utils/audioEngine';

interface DirectorControlsProps {
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;
  colorGrade: string;
  setColorGrade: (cg: string) => void;
  godRaysIntensity: number;
  setGodRaysIntensity: (val: number) => void;
  cameraSpeed: number;
  setCameraSpeed: (val: number) => void;
  showHUD: boolean;
  setShowHUD: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  audioLayers: {
    wind: boolean;
    birds: boolean;
    footsteps: boolean;
    music: boolean;
  };
  setAudioLayers: React.Dispatch<
    React.SetStateAction<{
      wind: boolean;
      birds: boolean;
      footsteps: boolean;
      music: boolean;
    }>
  >;
}

export const DirectorControls: React.FC<DirectorControlsProps> = ({
  aspectRatio,
  setAspectRatio,
  colorGrade,
  setColorGrade,
  godRaysIntensity,
  setGodRaysIntensity,
  cameraSpeed,
  setCameraSpeed,
  showHUD,
  setShowHUD,
  showGrid,
  setShowGrid,
  audioLayers,
  setAudioLayers,
}) => {
  const toggleAudioLayer = (layer: 'wind' | 'birds' | 'footsteps' | 'music') => {
    setAudioLayers((prev) => {
      const nextState = !prev[layer];
      forestAudio.setLayer(layer, nextState);
      return { ...prev, [layer]: nextState };
    });
  };

  const colorGrades = [
    { id: 'golden', name: 'Golden Hour', desc: '4800K Radiant Amber' },
    { id: 'kodak', name: 'Kodak 5207', desc: 'Vintage 35mm Celluloid' },
    { id: 'emerald', name: 'Emerald Moss', desc: 'Vibrant Forest Greens' },
    { id: 'nordic', name: 'Nordic Woods', desc: 'Cool Atmospheric Mist' },
    { id: 'natural', name: 'Natural Log', desc: 'Neutral Cine Balance' },
  ];

  const aspectRatios = [
    { id: '16:9', label: '16:9', sub: 'Standard Cinema' },
    { id: '2.39:1', label: '2.39:1', sub: 'Anamorphic Ultrawide' },
    { id: '9:16', label: '9:16', sub: 'Vertical Reel' },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase">
            Cinematography Director Deck
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHUD(!showHUD)}
            className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showHUD
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>HUD Data</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showGrid
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>3rds Grid</span>
          </button>
        </div>
      </div>

      {/* Lighting & Volumetric Rays */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="text-neutral-300 flex items-center gap-1.5 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Volumetric God Rays (Light Beams)
          </label>
          <span className="text-amber-400 font-mono font-semibold">
            {Math.round(godRaysIntensity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.05"
          value={godRaysIntensity}
          onChange={(e) => setGodRaysIntensity(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>Subtle Haze</span>
          <span>Golden Sunbeams</span>
          <span>Radiant Piercing</span>
        </div>
      </div>

      {/* Camera Glide Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="text-neutral-300 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Camera Dolly & Pan Glide Speed
          </label>
          <span className="text-amber-400 font-mono font-semibold">
            {cameraSpeed.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min="0.4"
          max="2.0"
          step="0.1"
          value={cameraSpeed}
          onChange={(e) => setCameraSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Color Grade LUT Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-300 block">
          Cinematic Color Grade (LUT)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {colorGrades.map((cg) => (
            <button
              key={cg.id}
              onClick={() => setColorGrade(cg.id)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                colorGrade === cg.id
                  ? 'bg-amber-500/20 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-neutral-800/60 border-neutral-700/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              <div className="font-semibold text-xs text-neutral-200">{cg.name}</div>
              <div className="text-[10px] text-neutral-400 truncate">{cg.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Mattes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-300 block">
          Cinema Aspect Ratio Framing
        </label>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              onClick={() => setAspectRatio(ar.id)}
              className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                aspectRatio === ar.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-neutral-800/60 border-neutral-700/80 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-semibold">{ar.label}</div>
              <div className="text-[10px] text-neutral-400">{ar.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Soundstage Channels */}
      <div className="space-y-2 pt-1 border-t border-neutral-800">
        <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          Soundstage Ambience Layers
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => toggleAudioLayer('wind')}
            className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${
              audioLayers.wind
                ? 'bg-neutral-800 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" />
              Pine Wind
            </span>
            <span className="text-[10px] font-mono">{audioLayers.wind ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleAudioLayer('birds')}
            className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${
              audioLayers.birds
                ? 'bg-neutral-800 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Birdsong
            </span>
            <span className="text-[10px] font-mono">{audioLayers.birds ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleAudioLayer('footsteps')}
            className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${
              audioLayers.footsteps
                ? 'bg-neutral-800 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5" />
              Moss Steps
            </span>
            <span className="text-[10px] font-mono">{audioLayers.footsteps ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => toggleAudioLayer('music')}
            className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${
              audioLayers.music
                ? 'bg-neutral-800 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              Acoustic Score
            </span>
            <span className="text-[10px] font-mono">{audioLayers.music ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
