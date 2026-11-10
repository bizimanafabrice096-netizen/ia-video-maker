import React from 'react';
import { Camera, Film, Sparkles, Clock, Compass } from 'lucide-react';
import { Shot } from './CinematicPlayer';

interface ShotSelectorProps {
  shots: Shot[];
  currentShot: Shot;
  onSelectShot: (shot: Shot) => void;
}

export const ShotSelector: React.FC<ShotSelectorProps> = ({
  shots,
  currentShot,
  onSelectShot,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-200">
          <Film className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Cinematic Camera Takes & Storyboard
          </h3>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          {shots.length} Sequences Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {shots.map((shot, idx) => {
          const isSelected = shot.id === currentShot.id;
          return (
            <div
              key={shot.id}
              onClick={() => onSelectShot(shot)}
              className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/80 scale-[1.01]'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/80'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                <img
                  src={shot.imageUrl}
                  alt={shot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Take index badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                  TAKE {idx + 1}
                </div>

                {/* Duration badge */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 flex items-center gap-1 border border-neutral-700">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  {shot.duration}s
                </div>

                {/* Active Indicator */}
                {isSelected && (
                  <div className="absolute bottom-2 right-2 bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-ping" />
                    LIVE ON CAMERA
                  </div>
                )}
              </div>

              {/* Shot Details */}
              <div className="p-3 bg-neutral-900/90 space-y-1">
                <div className="font-semibold text-xs text-neutral-100 flex items-center justify-between">
                  <span>{shot.title}</span>
                  <span className="text-[10px] font-mono text-amber-400/90 capitalize flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    {shot.cameraMotion.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-1 leading-snug">
                  {shot.subtitle}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 truncate pt-0.5">
                  Lens: {shot.lens}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
