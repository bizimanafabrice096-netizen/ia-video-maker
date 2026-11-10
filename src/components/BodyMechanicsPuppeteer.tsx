import React from 'react';
import {
  Activity,
  Smile,
  Hand,
  Sparkles,
  RotateCw,
  Eye,
  Footprints,
  Coffee,
  Compass,
  MapPin,
  Volume2,
  Sliders,
  Play,
  Pause,
  Zap,
  CheckCircle2
} from 'lucide-react';

export interface CharacterBodyState {
  // Bipedal Walking Locomotion
  isWalking: boolean;       // whether walk cycle is actively stepping
  walkSpeed: number;        // 0.5 to 2.5 (stride velocity)
  walkDistance: number;     // cumulative meters walked
  activeFoot: 'left' | 'right';

  // Dog (Barnaby) Person Mechanics
  dogMouthOpen: number;     // 0 to 1 (talking mouth/jaw)
  dogPawRaised: number;     // 0 to 1 (gesturing like a person)
  dogHoldingItem: 'walking-stick' | 'coffee-mug' | 'none';
  dogCoffeeSip: number;     // 0 to 1 (drinking coffee gesture)
  dogTailSpeed: number;     // 0 to 2
  dogEarPerk: number;       // 0 to 1
  dogHeadTilt: number;      // -20 to 20 deg
  dogBlink: boolean;

  // Cow (Clarabelle) Person Mechanics
  cowMouthOpen: number;     // 0 to 1 (talking mouth/jaw)
  cowHeadNod: number;       // -15 to 15 deg
  cowHoldingItem: 'flower-basket' | 'trail-map' | 'none';
  cowMapConsult: number;    // 0 to 1 (holding map and pointing gesture)
  cowBasketSwing: number;   // 0 to 1
  cowEarTwitch: number;     // 0 to 1
  cowTailSwish: number;     // 0 to 2
  cowStepMotion: number;    // 0 to 1
  cowBlink: boolean;
}

interface BodyMechanicsPuppeteerProps {
  bodyState: CharacterBodyState;
  setBodyState: React.Dispatch<React.SetStateAction<CharacterBodyState>>;
  isSpeaking: boolean;
  activeSpeaker: 'barnaby' | 'clarabelle' | null;
  onTriggerAction: (character: 'barnaby' | 'clarabelle', action: string) => void;
}

export const BodyMechanicsPuppeteer: React.FC<BodyMechanicsPuppeteerProps> = ({
  bodyState,
  setBodyState,
  isSpeaking,
  activeSpeaker,
  onTriggerAction,
}) => {
  const toggleWalking = () => {
    setBodyState((prev) => ({
      ...prev,
      isWalking: !prev.isWalking,
    }));
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase">
            Person Locomotion: Visible Walk, Speech & Gestures
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-neutral-800 text-amber-300 px-2.5 py-1 rounded-lg border border-neutral-700 flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span>{(bodyState.walkDistance || 0).toFixed(1)} m Walked</span>
          </span>
          <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg border border-neutral-700 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
            <span>{isSpeaking ? `VOICE: ${activeSpeaker?.toUpperCase()}` : 'SPEECH READY'}</span>
          </span>
        </div>
      </div>

      {/* Primary Person Walking Locomotion Bar */}
      <div className="p-4 bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 border border-amber-500/30 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleWalking}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                bodyState.isWalking
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 ring-2 ring-amber-400/50'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {bodyState.isWalking ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Bipedal Walk</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Walking Stroll</span>
                </>
              )}
            </button>

            <div className="text-xs text-neutral-300 flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${bodyState.isWalking ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
              <span className="font-semibold">
                {bodyState.isWalking ? 'Bipedal Gait Physics Active (Vertical Bob & Stride)' : 'Resting Posture'}
              </span>
            </div>
          </div>

          {/* Stride Cadence Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400">Pace:</span>
            {[
              { id: 0.8, label: 'Saunter (0.8x)' },
              { id: 1.2, label: 'Hike (1.2x)' },
              { id: 1.8, label: 'Brisk (1.8x)' },
            ].map((pace) => (
              <button
                key={pace.id}
                onClick={() => setBodyState((p) => ({ ...p, walkSpeed: pace.id }))}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] cursor-pointer transition-colors ${
                  bodyState.walkSpeed === pace.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
                }`}
              >
                {pace.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gait Mechanics Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-neutral-400">
          <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block">GAIT OSCILLATION:</span>
            <span className="text-amber-400 font-bold">14px Vertical Bob</span>
          </div>
          <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block">WEIGHT TRANSFER:</span>
            <span className="text-amber-400 font-bold">8px Hip Shift</span>
          </div>
          <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block">GROUND IMPACT:</span>
            <span className="text-emerald-400 font-bold">Moss Crunch Audio</span>
          </div>
          <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block">STAFF TAP:</span>
            <span className="text-amber-400 font-bold">Sync on Left Foot</span>
          </div>
        </div>
      </div>

      {/* Two-Column Character Personified Moves Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Barnaby (The Golden Retriever Person) */}
        <div className="bg-neutral-950/70 border border-amber-500/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <h4 className="font-bold text-xs uppercase text-amber-300 tracking-wider">
                Barnaby's Visible Person Moves
              </h4>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Bipedal Explorer Vest & Staff</span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onTriggerAction('barnaby', 'sip-coffee')}
              className="p-2 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Sip Campfire Coffee</div>
                <div className="text-[10px] text-neutral-400">Raises mug to lips & smiles</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('barnaby', 'gesture-paw')}
              className="p-2 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Hand className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Human Story Gesture</div>
                <div className="text-[10px] text-neutral-400">Sweeps hand outwards</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('barnaby', 'tap-stick')}
              className="p-2 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Tap Walking Staff</div>
                <div className="text-[10px] text-neutral-400">Rhythmic hiker's staff plant</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('barnaby', 'laugh-shrug')}
              className="p-2 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Smile className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Laugh & Shrug</div>
                <div className="text-[10px] text-neutral-400">Shoulders bounce with chuckle</div>
              </div>
            </button>
          </div>

          {/* Biomechanical Sliders */}
          <div className="space-y-3 text-xs pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span className="flex items-center gap-1">
                  <Smile className="w-3 h-3 text-amber-400" />
                  Speaking Mouth / Articulated Jaw
                </span>
                <span className="font-mono text-amber-400">{Math.round(bodyState.dogMouthOpen * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bodyState.dogMouthOpen}
                onChange={(e) => setBodyState((p) => ({ ...p, dogMouthOpen: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span className="flex items-center gap-1">
                  <Hand className="w-3 h-3 text-amber-400" />
                  Hand Gesture Elevation
                </span>
                <span className="font-mono text-amber-400">{Math.round(bodyState.dogPawRaised * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bodyState.dogPawRaised}
                onChange={(e) => setBodyState((p) => ({ ...p, dogPawRaised: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Clarabelle (The Spotted Dairy Cow Person) */}
        <div className="bg-neutral-950/70 border border-blue-500/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              <h4 className="font-bold text-xs uppercase text-blue-300 tracking-wider">
                Clarabelle's Visible Person Moves
              </h4>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Knitted Cardigan & Trail Map</span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onTriggerAction('clarabelle', 'check-map')}
              className="p-2 bg-neutral-800 hover:bg-blue-500/20 hover:text-blue-300 border border-neutral-700 hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Examine Trail Map</div>
                <div className="text-[10px] text-neutral-400">Traces route with fingers</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('clarabelle', 'swing-basket')}
              className="p-2 bg-neutral-800 hover:bg-blue-500/20 hover:text-blue-300 border border-neutral-700 hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Swing Flower Basket</div>
                <div className="text-[10px] text-neutral-400">Gentle pendulum rhythm</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('clarabelle', 'thoughtful-nod')}
              className="p-2 bg-neutral-800 hover:bg-blue-500/20 hover:text-blue-300 border border-neutral-700 hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Thoughtful Nod</div>
                <div className="text-[10px] text-neutral-400">Affirms Barnaby's ideas</div>
              </div>
            </button>

            <button
              onClick={() => onTriggerAction('clarabelle', 'ear-twitch')}
              className="p-2 bg-neutral-800 hover:bg-blue-500/20 hover:text-blue-300 border border-neutral-700 hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Spotted Ear Perk</div>
                <div className="text-[10px] text-neutral-400">Twitches to forest birdsong</div>
              </div>
            </button>
          </div>

          {/* Biomechanical Sliders */}
          <div className="space-y-3 text-xs pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span className="flex items-center gap-1">
                  <Smile className="w-3 h-3 text-blue-400" />
                  Speaking Muzzle / Speech Articulation
                </span>
                <span className="font-mono text-blue-400">{Math.round(bodyState.cowMouthOpen * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bodyState.cowMouthOpen}
                onChange={(e) => setBodyState((p) => ({ ...p, cowMouthOpen: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-400" />
                  Map Consultation Focus
                </span>
                <span className="font-mono text-blue-400">{Math.round(bodyState.cowMapConsult * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bodyState.cowMapConsult}
                onChange={(e) => setBodyState((p) => ({ ...p, cowMapConsult: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
