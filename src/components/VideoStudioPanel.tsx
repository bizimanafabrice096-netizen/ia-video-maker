import React, { useState } from 'react';
import {
  Wand2,
  Video,
  Sparkles,
  Camera,
  Layers,
  Flame,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Shot } from './CinematicPlayer';

interface VideoStudioPanelProps {
  onNewShotGenerated: (shot: Shot) => void;
  currentShot: Shot;
}

export const VideoStudioPanel: React.FC<VideoStudioPanelProps> = ({
  onNewShotGenerated,
  currentShot,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'A cinematic, photorealistic 4K video of a golden retriever dog and a spotted dairy cow walking side by side through a lush, sun-drenched forest. Golden sunlight filters through the tall pine trees, creating beautiful light beams (god rays). The dog is wagging its tail happily, looking up at the cow, while the cow walks calmly, stepping on green moss and autumn leaves. Soft camera panning, highly detailed fur and texture, peaceful atmosphere.'
  );
  const [cameraMotion, setCameraMotion] = useState<string>('slow-pan-right');
  const [lightingPreset, setLightingPreset] = useState<string>('Golden Hour God Rays');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [duration, setDuration] = useState<string>('8s');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [renderStage, setRenderStage] = useState<string>('');
  const [directorNotes, setDirectorNotes] = useState<string | null>(
    'Composition tip: Frame with the cow on the left and golden retriever on the right, keeping eye-contact alignment on the upper third grid line. Allow the god rays to streak between them.'
  );

  // AI Director Enhancement via Gemini
  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/director-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPrompt: prompt }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
      if (data.directorNotes) {
        setDirectorNotes(data.directorNotes);
      }
      if (data.recommendedCameraMotion) {
        setCameraMotion(data.recommendedCameraMotion);
      }
      if (data.lightingPreset) {
        setLightingPreset(data.lightingPreset);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Trigger Video Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const stages = [
      'Deconstructing Cinematography & Volumetric Lighting...',
      'Mapping Canine & Bovine Skeletal Gait...',
      'Synthesizing High-Detail Fur & Pine Foliage...',
      'Compositing 4K Volumetric God Rays & Dust Motes...',
      'Applying Color Grade Master Output...',
    ];

    let stageIdx = 0;
    setRenderStage(stages[0]);
    const stageTimer = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setRenderStage(stages[stageIdx]);
      }
    }, 1200);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cameraMotion,
          lightingPreset,
          aspectRatio,
          duration,
          baseImageId: currentShot.id,
        }),
      });

      clearInterval(stageTimer);
      const data = await res.json();

      if (data.shot) {
        onNewShotGenerated(data.shot);
      }
    } catch (err) {
      clearInterval(stageTimer);
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
      setRenderStage('');
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase">
            AI Video Prompt & Sequence Generator
          </h3>
        </div>
        <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
          Powered by Gemini 4K Studio
        </span>
      </div>

      {/* Main Prompt Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Cinematic Scene Script & Visual Description
          </label>
          <button
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || isGenerating}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
            {isEnhancing ? 'Enhancing with Gemini...' : 'AI Director Enhance'}
          </button>
        </div>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your cinematic scene..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
        />
      </div>

      {/* Director Notes Display if available */}
      {directorNotes && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-400 block text-[11px] uppercase tracking-wider">
              Director Cinematography Note:
            </span>
            <p className="text-[11px] leading-relaxed text-neutral-300">{directorNotes}</p>
          </div>
        </div>
      )}

      {/* Camera & Lighting Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1.5">
          <label className="text-neutral-400 font-medium flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            Camera Choreography
          </label>
          <select
            value={cameraMotion}
            onChange={(e) => setCameraMotion(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="slow-pan-right">Slow Pan Right (Lateral Tracking)</option>
            <option value="dolly-forward">Smooth Dolly Forward (Leading Shot)</option>
            <option value="gentle-orbit">Gentle Orbit (Cinematic Sweep)</option>
            <option value="crane-up">Crane Up (Moss to Sunbeams)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-neutral-400 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Atmospheric Lighting
          </label>
          <select
            value={lightingPreset}
            onChange={(e) => setLightingPreset(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="Golden Hour God Rays">Golden Hour (Piercing God Rays)</option>
            <option value="Misty Dawn Canopy">Misty Dawn (Soft Filtered Light)</option>
            <option value="Sunset Amber Glow">Warm Sunset (Amber Rim Light)</option>
            <option value="Emerald High Contrast">Lush Emerald (Vibrant Rainforest)</option>
          </select>
        </div>
      </div>

      {/* Render Progress or Action Button */}
      {isGenerating ? (
        <div className="bg-neutral-950 border border-amber-500/40 rounded-xl p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Rendering 4K AI Video Clip...</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full w-2/3 animate-pulse rounded-full" />
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">{renderStage}</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          <Video className="w-4 h-4" />
          <span>Render 4K Cinematic Sequence</span>
        </button>
      )}
    </div>
  );
};
