import React, { useState } from 'react';
import {
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  SkipForward,
  User,
  Heart,
  Laugh,
  RefreshCw
} from 'lucide-react';
import { DialogueLine, speechEngine } from '../utils/speechEngine';

const SCRIPTED_EPISODES: { id: string; title: string; subtitle: string; lines: DialogueLine[] }[] = [
  {
    id: 'ep-0-trail-map',
    title: 'Coffee, Maps & Hiking Directions',
    subtitle: 'Barnaby sips his campfire coffee while Clarabelle navigates the pine trail',
    lines: [
      {
        speaker: 'barnaby',
        text: "Clarabelle, take a sip of this campfire brew! I declare it gives a fellow at least twenty extra horsepower for walking up this ridge!",
        emotion: 'excited',
        bodyAction: 'sip-coffee',
        durationSec: 5,
      },
      {
        speaker: 'clarabelle',
        text: "Keep both boots on the trail, Barnaby. According to this map, the scenic moss overlook is just past the twin larch trees.",
        emotion: 'thoughtful',
        bodyAction: 'check-map',
        durationSec: 5.5,
      },
      {
        speaker: 'barnaby',
        text: "Who needs a map when the god rays are literally pointing the way like giant golden arrows?",
        emotion: 'playful',
        bodyAction: 'gesture-paw',
        durationSec: 4.5,
      },
      {
        speaker: 'clarabelle',
        text: "The sunbeams are beautiful, dear, but they won't tell you where the brambles are. Now let's keep a steady pace.",
        emotion: 'gentle',
        bodyAction: 'nod-head',
        durationSec: 5,
      },
      {
        speaker: 'barnaby',
        text: "Forward march, my dear cartographer! The forest awaits our glorious stroll!",
        emotion: 'excited',
        bodyAction: 'tap-stick',
        durationSec: 4,
      },
    ],
  },
  {
    id: 'ep-0-bipedal',
    title: 'The Wonders of Pockets & Two Legs',
    subtitle: 'Debating the greatest perks of walking upright like humans',
    lines: [
      {
        speaker: 'barnaby',
        text: "You know, Clarabelle, walking on two legs is truly revolutionary. My hands are completely free to carry this walking staff and gesture dramatically!",
        emotion: 'proud',
        bodyAction: 'gesture-paw',
        durationSec: 5.5,
      },
      {
        speaker: 'clarabelle',
        text: "And don't forget the cardigan pockets, Barnaby. I can carry chamomile, peppermint, and three kinds of trail biscuits without dropping a leaf.",
        emotion: 'amused',
        bodyAction: 'swing-basket',
        durationSec: 5.5,
      },
      {
        speaker: 'barnaby',
        text: "Pockets! An absolute triumph of civilization! Though I confess my tail still wags whenever we reach a sunny clearing.",
        emotion: 'laugh',
        bodyAction: 'wag-tail',
        durationSec: 5,
      },
      {
        speaker: 'clarabelle',
        text: "A happy tail is the truest compass, my friend. Let's enjoy the warm afternoon sun.",
        emotion: 'gentle',
        bodyAction: 'nod-head',
        durationSec: 4.5,
      },
    ],
  },
  {
    id: 'ep-1-sticks',
    title: 'The Great Stick vs. Clover Debate',
    subtitle: 'Barnaby’s quest for supreme pine branches meets Clarabelle’s gourmet grazing',
    lines: [
      {
        speaker: 'barnaby',
        text: "Clarabelle! Look at this god ray! Do you think if I stand right in the middle of it, my golden coat becomes eighty percent shinier?",
        emotion: 'excited',
        bodyAction: 'gesture-paw',
        durationSec: 4.5,
      },
      {
        speaker: 'clarabelle',
        text: "Barnaby, dear, you are already luminous enough to guide wandering ships through the fog. Now mind your step—you almost trod upon my gourmet wild clover.",
        emotion: 'amused',
        bodyAction: 'nod-head',
        durationSec: 5.5,
      },
      {
        speaker: 'barnaby',
        text: "Pardon me, mademoiselle! But consider this: what if we discovered a stick so magnificent that even the highland bears bowed with respect?",
        emotion: 'playful',
        bodyAction: 'wag-tail',
        durationSec: 5,
      },
      {
        speaker: 'clarabelle',
        text: "A magnificent stick is all well and good, Barnaby, but a quiet stroll under these pines beside a dear friend is the true prize.",
        emotion: 'thoughtful',
        bodyAction: 'ear-twitch',
        durationSec: 5,
      },
      {
        speaker: 'barnaby',
        text: "You always know how to warm a golden heart, Clarabelle. Race you to the sunny birch clearing!",
        emotion: 'excited',
        bodyAction: 'gesture-paw',
        durationSec: 4,
      },
    ],
  },
  {
    id: 'ep-2-giant-dog',
    title: 'Are You Just a Giant Dog?',
    subtitle: 'Barnaby investigates bovine genetics and polite philosophy',
    lines: [
      {
        speaker: 'barnaby',
        text: "Clarabelle, I have performed extensive canine calculations. You have four legs, a tail, you love scritches behind the ears... Are you certain you're not just an extra-large spotted dog?",
        emotion: 'curious',
        bodyAction: 'tilt-head',
        durationSec: 5.5,
      },
      {
        speaker: 'clarabelle',
        text: "Well, Barnaby, I don't chase my tail in dizzy circles, and I certainly don't bark at pinecones. But I do appreciate a good nap in the tall rye grass.",
        emotion: 'amused',
        bodyAction: 'ear-twitch',
        durationSec: 5.5,
      },
      {
        speaker: 'barnaby',
        text: "Hey! That pinecone looked suspicious and you know it! It was plotting a tactical drop on my nose!",
        emotion: 'playful',
        bodyAction: 'gesture-paw',
        durationSec: 4.5,
      },
      {
        speaker: 'clarabelle',
        text: "Of course it was, darling. And you heroically saved the entire forest. What would I ever do without my valiant golden bodyguard?",
        emotion: 'gentle',
        bodyAction: 'nod-head',
        durationSec: 5,
      },
    ],
  },
  {
    id: 'ep-3-sunbeams',
    title: 'The Sunbeam Map of the Forest',
    subtitle: 'Charting the celestial warmth filtering through the canopy',
    lines: [
      {
        speaker: 'clarabelle',
        text: "Notice how the light shifts between the tall Scots pines, Barnaby. At ten in the morning, it warms the sweet moss; by noon, it gilds the birch leaves.",
        emotion: 'thoughtful',
        bodyAction: 'nod-head',
        durationSec: 5.5,
      },
      {
        speaker: 'barnaby',
        text: "It is pure magic, Clarabelle! I can feel the sunbeams soaking right down into my paws. Makes me want to trot until sunset!",
        emotion: 'excited',
        bodyAction: 'gesture-paw',
        durationSec: 5,
      },
      {
        speaker: 'clarabelle',
        text: "Let's take it slowly, little brother. The forest is not in a hurry, and neither are we.",
        emotion: 'gentle',
        bodyAction: 'ear-twitch',
        durationSec: 4.5,
      },
      {
        speaker: 'barnaby',
        text: "Slow it is. Side by side, just as nature intended.",
        emotion: 'peaceful',
        bodyAction: 'wag-tail',
        durationSec: 3.5,
      },
    ],
  },
];

interface ConversationHubProps {
  currentLine: DialogueLine | null;
  activeSpeaker: 'barnaby' | 'clarabelle' | null;
  isSpeaking: boolean;
  onPlayDialogue: (lines: DialogueLine[]) => void;
  onStopDialogue: () => void;
}

export const ConversationHub: React.FC<ConversationHubProps> = ({
  currentLine,
  activeSpeaker,
  isSpeaking,
  onPlayDialogue,
  onStopDialogue,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState(SCRIPTED_EPISODES[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Play current episode
  const handlePlayEpisode = (ep = selectedEpisode) => {
    setSelectedEpisode(ep);
    onPlayDialogue(ep.lines);
  };

  // Generate new Gemini AI dialogue
  const handleGenerateCustom = async () => {
    if (!customTopic.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic, mood: 'humorous and heartfelt' }),
      });
      const data = await res.json();

      if (data.lines && data.lines.length > 0) {
        const newEp = {
          id: `custom-${Date.now()}`,
          title: data.title || `Discussion: ${customTopic}`,
          subtitle: `Custom Gemini-scripted dialogue on "${customTopic}"`,
          lines: data.lines,
        };
        setSelectedEpisode(newEp);
        onPlayDialogue(newEp.lines);
      }
    } catch (err) {
      console.error('Failed to generate conversation:', err);
    } finally {
      setIsGenerating(false);
      setCustomTopic('');
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase">
            Companions Conversation & Voice Dialogue
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={onStopDialogue}
              className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              Stop Dialogue
            </button>
          ) : (
            <button
              onClick={() => handlePlayEpisode()}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              Play Conversation
            </button>
          )}
        </div>
      </div>

      {/* Active Speaker Spotlight Box */}
      {currentLine ? (
        <div
          className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
            currentLine.speaker === 'barnaby'
              ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-blue-950/30 border-blue-500/60 shadow-[0_0_20px_rgba(96,165,250,0.2)]'
          }`}
        >
          {/* Subtle animated background bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

          <div className="flex items-start gap-3">
            {/* Avatar badge */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border font-bold text-xs shadow-md ${
                currentLine.speaker === 'barnaby'
                  ? 'bg-amber-500 text-neutral-950 border-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-blue-500 text-white border-blue-300 ring-2 ring-blue-500/30'
              }`}
            >
              {currentLine.speaker === 'barnaby' ? '🐕' : '🐄'}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-xs uppercase tracking-wider ${
                      currentLine.speaker === 'barnaby' ? 'text-amber-400' : 'text-blue-400'
                    }`}
                  >
                    {currentLine.speaker === 'barnaby' ? 'Barnaby (Golden Retriever)' : 'Clarabelle (Dairy Cow)'}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full capitalize">
                    {currentLine.emotion}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Speaking...</span>
                </div>
              </div>

              <p className="text-sm text-neutral-100 font-medium leading-relaxed italic pt-1">
                "{currentLine.text}"
              </p>

              {currentLine.bodyAction && (
                <div className="text-[10px] text-amber-300/80 font-mono pt-1">
                  • Body Motion: {currentLine.bodyAction.replace('-', ' ')}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-500/60" />
          <span>Select an episode below or generate a custom conversation topic!</span>
        </div>
      )}

      {/* Scripted Episode Carousel */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-300 block">
          Select Storyline Episode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SCRIPTED_EPISODES.map((ep) => {
            const isSelected = selectedEpisode.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handlePlayEpisode(ep)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="font-semibold text-xs text-neutral-200 flex items-center justify-between">
                  <span>{ep.title}</span>
                  <Play className="w-3 h-3 text-amber-400 shrink-0" />
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-1 mt-1 leading-snug">
                  {ep.subtitle}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">
                  {ep.lines.length} dialogue turns
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Conversation Generator on Any Topic */}
      <div className="pt-2 border-t border-neutral-800 space-y-2">
        <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Ask Them to Talk About Anything (Gemini AI Generator)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustom()}
            placeholder="e.g., Why humans wear hats, What clouds look like, Planning a picnic in the woods..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleGenerateCustom}
            disabled={isGenerating || !customTopic.trim()}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? 'Writing...' : 'Converse'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
