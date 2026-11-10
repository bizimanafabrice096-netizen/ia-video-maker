import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Sun,
  Camera,
  Layers,
  Sliders,
  Maximize,
  Compass,
  Heart,
  Share2,
  Info,
  Check,
  Trees,
  MessageSquare,
  Activity,
  Hand,
  Volume2
} from 'lucide-react';
import { CinematicPlayer, Shot } from './components/CinematicPlayer';
import { DirectorControls } from './components/DirectorControls';
import { ShotSelector } from './components/ShotSelector';
import { VideoStudioPanel } from './components/VideoStudioPanel';
import { BodyMechanicsPuppeteer, CharacterBodyState } from './components/BodyMechanicsPuppeteer';
import { ConversationHub } from './components/ConversationHub';
import { DialogueLine, speechEngine } from './utils/speechEngine';

const INITIAL_SHOTS: Shot[] = [
  {
    id: 'shot-bipedal-walk',
    title: 'The Humanoid Stroll',
    subtitle: 'Walking upright on two legs with hiking boots, vest & flower basket',
    imageUrl: '/src/assets/images/bipedal_forest_pals_1793788363339.jpg',
    duration: 10,
    cameraMotion: 'dolly-forward',
    lens: '35mm Anamorphic Prime',
    lighting: 'Golden Sunbeams on Walking Companions',
    description: 'Barnaby walks upright on two legs in hiker boots and vest, holding his walking staff and gesturing, while Clarabelle strolls beside him in her knitted sweater and country dress carrying her basket.',
    prompt: 'A cinematic 4K shot of an anthropomorphic golden retriever and spotted dairy cow walking upright on two legs side by side like human companions through a sun-drenched pine forest.',
  },
  {
    id: 'shot-human-chat',
    title: 'Coffee & Trail Map Chat',
    subtitle: 'Barnaby holding campfire coffee mug while Clarabelle consults the map',
    imageUrl: '/src/assets/images/human_pals_chat_1793788380688.jpg',
    duration: 8,
    cameraMotion: 'slow-pan-right',
    lens: '50mm f/1.4 Cinema Portrait',
    lighting: 'Warm Backlit God Rays & Rim Light',
    description: 'Barnaby laughs and gestures with his campfire mug while speaking like a person, as Clarabelle holds the trail map with her hands and shares navigation wisdom.',
    prompt: 'A cinematic 4K medium close-up of an anthropomorphic golden retriever dog and spotted cow interacting like human friends in a sunlit pine forest with coffee mug and trail map.',
  },
  {
    id: 'shot-talking-pals',
    title: 'The Forest Discussion',
    subtitle: 'Barnaby gestures with his paw like a person explaining an adventure',
    imageUrl: '/src/assets/images/forest_talking_pals_1793627280290.jpg',
    duration: 9,
    cameraMotion: 'slow-pan-right',
    lens: '40mm Cinema Prime',
    lighting: 'Sunbeams on Expressive Companions',
    description: 'Barnaby the golden retriever raises his paw expressively like a person explaining an exciting forest adventure, as Clarabelle the spotted dairy cow leans down with an affectionate listening smile.',
    prompt: 'A cinematic 4K expressive shot of an anthropomorphic friendly golden retriever dog wearing a soft brown leather collar and a gentle spotted dairy cow with expressive warm eyes walking and talking together like close human friends in a sunlit pine forest.',
  },
  {
    id: 'shot-cow-chat',
    title: "Clarabelle's Reply",
    subtitle: 'Clarabelle speaking with tilted head and expressive mouth',
    imageUrl: '/src/assets/images/cow_dog_chat_1793627294836.jpg',
    duration: 8,
    cameraMotion: 'gentle-orbit',
    lens: '85mm f/1.4 Cinema Portrait',
    lighting: 'Golden Rim Light with Warm Bokeh',
    description: 'Clarabelle gently shares her peaceful bovine wisdom, mouth moving as she speaks, while Barnaby sits attentively looking up with perked golden ears.',
    prompt: 'A cinematic 4K medium close-up shot of a spotted black-and-white dairy cow talking warmly and gesturing with a slight tilt of her head to a golden retriever dog who is listening intently with perked ears in a sun-dappled pine forest.',
  },
  {
    id: 'shot-1-greeting',
    title: 'The Forest Greeting',
    subtitle: 'Golden retriever admiring dairy cow under volumetric light beams',
    imageUrl: '/src/assets/images/forest_companions_1793626448646.jpg',
    duration: 8,
    cameraMotion: 'slow-pan-right',
    lens: '50mm f/1.8 Prime',
    lighting: 'Golden Hour (4800K) with Strong God Rays',
    description: 'Soft camera panning slowly rightwards as the dog gazes up affectionately with a wagging tail. Sunlight streams diagonally in dramatic shafts through towering pine needles onto lush green moss.',
    prompt: 'A cinematic, photorealistic 4K video of a golden retriever dog and a spotted dairy cow walking side by side through a lush, sun-drenched forest. Golden sunlight filters through the tall pine trees, creating beautiful light beams (god rays). The dog is wagging its tail happily, looking up at the cow, while the cow walks calmly, stepping on green moss and autumn leaves. Soft camera panning, highly detailed fur and texture, peaceful atmosphere.',
  },
  {
    id: 'shot-2-trail',
    title: 'The Sunlit Path',
    subtitle: 'Tracking shot walking forward together down the woodland trail',
    imageUrl: '/src/assets/images/forest_trail_walk_1793626479392.jpg',
    duration: 10,
    cameraMotion: 'dolly-forward',
    lens: '35mm f/2.8 Anamorphic',
    lighting: 'Dappled Canopy Sunlight with Ambient Foliage Bounce',
    description: 'Smooth dolly tracking shot leading the cow and golden retriever as they advance side by side. Leaves softly rustle underfoot while golden dust motes dance in the warm forest air.',
    prompt: 'A cinematic 4K video frame: golden retriever dog and black and white spotted dairy cow walking forward together down a winding sun-dappled woodland trail. Soft golden light beams, floating dust particles in the air, pine trees arching above, dog in mid-step with fluffy tail swishing happily, cow with gentle expression walking alongside. Photorealistic, warm golden hour tones, lush forest greens and amber fallen leaves.',
  },
  {
    id: 'shot-3-intimate',
    title: 'Close Companions',
    subtitle: 'Intimate shallow depth-of-field portrait and gentle breathing',
    imageUrl: '/src/assets/images/forest_friends_cu_1793626494462.jpg',
    duration: 6,
    cameraMotion: 'gentle-orbit',
    lens: '85mm f/1.4 Cinema Portrait',
    lighting: 'Backlit Golden Rim Light with Forest Bokeh',
    description: 'Subtle slow-orbit camera with dreamy golden rim-lighting around the retriever’s silky fur and the spotted dairy cow’s gentle muzzle, capturing a deep, peaceful bond in nature.',
    prompt: 'Cinematic 4K close up frame: golden retriever dog looking up affectionately at a friendly spotted dairy cow in a sunlit pine forest. Beautiful bokeh background with golden sun flare, detailed golden fur glistening in warm light, soft cow snout near the dog, gentle and heartwarming atmosphere, cinema lenses, shallow depth of field, 35mm film aesthetic.',
  },
];

export default function App() {
  const [shots, setShots] = useState<Shot[]>(INITIAL_SHOTS);
  const [currentShot, setCurrentShot] = useState<Shot>(INITIAL_SHOTS[0]);

  // Director settings
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [colorGrade, setColorGrade] = useState<string>('golden');
  const [godRaysIntensity, setGodRaysIntensity] = useState<number>(1.0);
  const [cameraSpeed, setCameraSpeed] = useState<number>(1.0);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showAnatomyHUD, setShowAnatomyHUD] = useState<boolean>(true);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'bodymechanics' | 'director' | 'studio' | 'specs'>('conversation');

  // Character Personified Body State
  const [bodyState, setBodyState] = useState<CharacterBodyState>({
    isWalking: true,
    walkSpeed: 1.2,
    walkDistance: 45.2,
    activeFoot: 'left',

    dogMouthOpen: 0,
    dogPawRaised: 0.85,
    dogHoldingItem: 'walking-stick',
    dogCoffeeSip: 0,
    dogTailSpeed: 1.2,
    dogEarPerk: 0.8,
    dogHeadTilt: 8,
    dogBlink: false,

    cowMouthOpen: 0,
    cowHeadNod: 6,
    cowHoldingItem: 'flower-basket',
    cowMapConsult: 0,
    cowBasketSwing: 0.5,
    cowEarTwitch: 0.7,
    cowTailSwish: 1.0,
    cowStepMotion: 0.5,
    cowBlink: false,
  });

  // Speech & Conversation state
  const [activeSpeaker, setActiveSpeaker] = useState<'barnaby' | 'clarabelle' | null>(null);
  const [currentLine, setCurrentLine] = useState<DialogueLine | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [audioLayers, setAudioLayers] = useState({
    wind: true,
    birds: true,
    footsteps: true,
    music: true,
  });

  // Subscribe to speech synthesizer state and synchronize body parts in real time
  useEffect(() => {
    return speechEngine.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setActiveSpeaker(state.speaker);
      setCurrentLine(state.currentLine);

      if (state.speaker === 'barnaby') {
        // Sync Barnaby's personified body
        setBodyState((prev) => ({
          ...prev,
          dogMouthOpen: state.mouthOpen,
          dogPawRaised: Math.max(0.65, state.mouthOpen * 1.3),
          dogTailSpeed: 1.6,
          dogEarPerk: 1.0,
        }));
        // Switch to an expressive talking shot if needed
        if (currentShot.id !== 'shot-talking-pals' && currentShot.id !== 'shot-cow-chat') {
          setCurrentShot(INITIAL_SHOTS[0]);
        }
      } else if (state.speaker === 'clarabelle') {
        // Sync Clarabelle's personified body
        setBodyState((prev) => ({
          ...prev,
          cowMouthOpen: state.mouthOpen,
          cowHeadNod: 6 + state.mouthOpen * 6,
          cowEarTwitch: 0.9,
          cowTailSwish: 1.4,
        }));
        if (currentShot.id !== 'shot-cow-chat' && currentShot.id !== 'shot-talking-pals') {
          setCurrentShot(INITIAL_SHOTS[1]);
        }
      } else {
        // Return to resting personified posture
        setBodyState((prev) => ({
          ...prev,
          dogMouthOpen: 0,
          cowMouthOpen: 0,
          dogPawRaised: 0.4,
          dogTailSpeed: 1.0,
        }));
      }
    });
  }, [currentShot]);

  // Handle triggered person actions
  const handleTriggerAction = (character: 'barnaby' | 'clarabelle', action: string) => {
    if (character === 'barnaby') {
      if (action === 'gesture-paw') {
        setBodyState((p) => ({ ...p, dogPawRaised: 1.0 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogPawRaised: 0.5 })), 2500);
      } else if (action === 'sip-coffee') {
        setBodyState((p) => ({ ...p, dogCoffeeSip: 1.0, dogMouthOpen: 0.3 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogCoffeeSip: 0, dogMouthOpen: 0 })), 3000);
      } else if (action === 'tap-stick') {
        setBodyState((p) => ({ ...p, dogPawRaised: 0.9 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogPawRaised: 0.4 })), 2000);
      } else if (action === 'laugh-shrug') {
        setBodyState((p) => ({ ...p, dogHeadTilt: 16, dogMouthOpen: 0.8, dogTailSpeed: 1.8 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogHeadTilt: 8, dogMouthOpen: 0, dogTailSpeed: 1.2 })), 2500);
      } else if (action === 'wag-tail') {
        setBodyState((p) => ({ ...p, dogTailSpeed: 2.0 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogTailSpeed: 1.2 })), 3000);
      } else if (action === 'perk-ears') {
        setBodyState((p) => ({ ...p, dogEarPerk: 1.0, dogHeadTilt: 15 }));
        setTimeout(() => setBodyState((p) => ({ ...p, dogEarPerk: 0.6, dogHeadTilt: 8 })), 2500);
      }
    } else {
      if (action === 'nod-head' || action === 'thoughtful-nod') {
        setBodyState((p) => ({ ...p, cowHeadNod: 14 }));
        setTimeout(() => setBodyState((p) => ({ ...p, cowHeadNod: 6 })), 2500);
      } else if (action === 'check-map') {
        setBodyState((p) => ({ ...p, cowMapConsult: 1.0, cowHeadNod: 10 }));
        setTimeout(() => setBodyState((p) => ({ ...p, cowMapConsult: 0, cowHeadNod: 6 })), 3500);
      } else if (action === 'swing-basket') {
        setBodyState((p) => ({ ...p, cowBasketSwing: 1.0 }));
        setTimeout(() => setBodyState((p) => ({ ...p, cowBasketSwing: 0.5 })), 3000);
      } else if (action === 'ear-twitch') {
        setBodyState((p) => ({ ...p, cowEarTwitch: 1.0 }));
        setTimeout(() => setBodyState((p) => ({ ...p, cowEarTwitch: 0.7 })), 2000);
      } else if (action === 'swish-tail') {
        setBodyState((p) => ({ ...p, cowTailSwish: 1.8 }));
        setTimeout(() => setBodyState((p) => ({ ...p, cowTailSwish: 1.0 })), 3000);
      }
    }
  };

  const handlePlayDialogue = (lines: DialogueLine[]) => {
    speechEngine.playScript(lines);
  };

  const handleStopDialogue = () => {
    speechEngine.stop();
  };

  const handleCharacterClick = (char: 'barnaby' | 'clarabelle') => {
    if (char === 'barnaby') {
      handleTriggerAction('barnaby', 'gesture-paw');
      speechEngine.speakLine({
        speaker: 'barnaby',
        text: "I say, Clarabelle! The sunbeams are simply magnificent today!",
        emotion: 'excited',
      });
    } else {
      handleTriggerAction('clarabelle', 'nod-head');
      speechEngine.speakLine({
        speaker: 'clarabelle',
        text: "Indeed they are, Barnaby. Pure woodland tranquility.",
        emotion: 'gentle',
      });
    }
  };

  // Handle new shot generated from Gemini studio
  const handleNewShotGenerated = (newShot: Shot) => {
    setShots((prev) => [newShot, ...prev]);
    setCurrentShot(newShot);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Cinematic Navigation Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trees className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold tracking-tight text-base sm:text-lg text-neutral-100 uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                  Sunlit Woods
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  PERSONIFIED 4K CINEMA
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Barnaby (Golden Retriever) & Clarabelle (Dairy Cow) • Working Body Parts & Voice Dialogue
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (isSpeaking) {
                  handleStopDialogue();
                } else {
                  speechEngine.speakLine({
                    speaker: 'barnaby',
                    text: "Greetings, friend! Clarabelle and I are taking a stroll down the sunlit trail!",
                    emotion: 'excited',
                  });
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Mute Speech' : 'Quick Voice Greet'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy share link"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Experience Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Master 4K Cinematic Video Player with Speech Bubbles and Animated Body Parts */}
        <section>
          <CinematicPlayer
            currentShot={currentShot}
            aspectRatio={aspectRatio}
            colorGrade={colorGrade}
            godRaysIntensity={godRaysIntensity}
            cameraSpeed={cameraSpeed}
            showHUD={showHUD}
            showGrid={showGrid}
            showAnatomyHUD={showAnatomyHUD}
            setShowAnatomyHUD={setShowAnatomyHUD}
            bodyState={bodyState}
            setBodyState={setBodyState}
            activeSpeaker={activeSpeaker}
            currentLine={currentLine}
            isSpeaking={isSpeaking}
            onSelectShot={setCurrentShot}
            onCharacterClick={handleCharacterClick}
          />
        </section>

        {/* Multi-angle Storyboard Takes */}
        <section>
          <ShotSelector
            shots={shots}
            currentShot={currentShot}
            onSelectShot={setCurrentShot}
          />
        </section>

        {/* Five Interactive Tab Panels */}
        <section className="space-y-4">
          <div className="flex flex-wrap border-b border-neutral-800 gap-1">
            <button
              onClick={() => setActiveTab('conversation')}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'conversation'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Dialogue & Conversation Hub
            </button>

            <button
              onClick={() => setActiveTab('bodymechanics')}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'bodymechanics'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Personified Body Mechanics
            </button>

            <button
              onClick={() => setActiveTab('director')}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'director'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Director Deck & Lighting
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'studio'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Prompt & Video Studio
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'specs'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Biomechanical Specs
            </button>
          </div>

          <div className="pt-2">
            {activeTab === 'conversation' && (
              <ConversationHub
                currentLine={currentLine}
                activeSpeaker={activeSpeaker}
                isSpeaking={isSpeaking}
                onPlayDialogue={handlePlayDialogue}
                onStopDialogue={handleStopDialogue}
              />
            )}

            {activeTab === 'bodymechanics' && (
              <BodyMechanicsPuppeteer
                bodyState={bodyState}
                setBodyState={setBodyState}
                isSpeaking={isSpeaking}
                activeSpeaker={activeSpeaker}
                onTriggerAction={handleTriggerAction}
              />
            )}

            {activeTab === 'director' && (
              <DirectorControls
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                colorGrade={colorGrade}
                setColorGrade={setColorGrade}
                godRaysIntensity={godRaysIntensity}
                setGodRaysIntensity={setGodRaysIntensity}
                cameraSpeed={cameraSpeed}
                setCameraSpeed={setCameraSpeed}
                showHUD={showHUD}
                setShowHUD={setShowHUD}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                audioLayers={audioLayers}
                setAudioLayers={setAudioLayers}
              />
            )}

            {activeTab === 'studio' && (
              <VideoStudioPanel
                onNewShotGenerated={handleNewShotGenerated}
                currentShot={currentShot}
              />
            )}

            {activeTab === 'specs' && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 text-neutral-300">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-neutral-100 text-sm uppercase tracking-wider">
                    Personified Biomechanics & Conversational Speech Specs
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                    <div className="text-amber-400 font-semibold uppercase tracking-wider">
                      Barnaby's Articulated Body
                    </div>
                    <ul className="space-y-1.5 text-neutral-400">
                      <li>• Humanoid Paw Gesture: Raises and sweeps like a person explaining an idea</li>
                      <li>• Talking Jaw: Synchronized lip-flap opening in real-time with phonemes</li>
                      <li>• Golden Floppy Ears: Perking and tilting with curiosity</li>
                      <li>• Tail Dynamics: Variable wag frequency up to 2.0x during speech</li>
                      <li>• Mutual Gaze: Looks up admiringly at Clarabelle</li>
                    </ul>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                    <div className="text-blue-400 font-semibold uppercase tracking-wider">
                      Clarabelle's Articulated Body
                    </div>
                    <ul className="space-y-1.5 text-neutral-400">
                      <li>• Bovine Talking Muzzle: Expressive mouth articulation and gentle smile</li>
                      <li>• Attentive Head Lean: Leans downward to listen with maternal warmth</li>
                      <li>• Spotted Ear Twitches: Rotates ears with natural spring physics</li>
                      <li>• Tasseled Tail: Swishes with measured, tranquil momentum</li>
                      <li>• Pacing Hooves: Measured stride on mossy forest floor</li>
                    </ul>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                    <div className="text-emerald-400 font-semibold uppercase tracking-wider">
                      Voice Dialogue & Dynamic AI
                    </div>
                    <ul className="space-y-1.5 text-neutral-400">
                      <li>• Voices: Tuned pitch & rate synthesis for distinct personalities</li>
                      <li>• Canvas Speech Bubbles: Real-time floating dialog above characters</li>
                      <li>• Gemini Scripting Engine: Generate charming dialogue on any topic</li>
                      <li>• Click-to-Interact: Tap either character on canvas to trigger reactions</li>
                      <li>• Direct Video Export: Records both audio and animated gestures</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <p>Sunlit Woods • Personified Companions & Conversational 4K Cinema • Powered by Google AI Studio</p>
      </footer>
    </div>
  );
}
