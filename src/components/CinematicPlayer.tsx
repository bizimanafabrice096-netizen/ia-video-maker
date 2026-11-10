import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Video,
  Download,
  Sliders,
  Sparkles,
  Camera,
  Layers,
  Eye,
  CheckCircle2,
  Info,
  Activity,
  Hand,
  Smile,
  Footprints,
  Coffee,
  Compass,
  MessageSquare
} from 'lucide-react';
import { forestAudio } from '../utils/audioEngine';
import { CharacterBodyState } from './BodyMechanicsPuppeteer';
import { DialogueLine } from '../utils/speechEngine';

export interface Shot {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
  duration: number;
  cameraMotion: string;
  lens: string;
  lighting: string;
  description: string;
  prompt: string;
}

interface CinematicPlayerProps {
  currentShot: Shot;
  aspectRatio: string;
  colorGrade: string;
  godRaysIntensity: number;
  cameraSpeed: number;
  showHUD: boolean;
  showGrid: boolean;
  showAnatomyHUD: boolean;
  setShowAnatomyHUD: (val: boolean) => void;
  bodyState: CharacterBodyState;
  setBodyState: React.Dispatch<React.SetStateAction<CharacterBodyState>>;
  activeSpeaker: 'barnaby' | 'clarabelle' | null;
  currentLine: DialogueLine | null;
  isSpeaking: boolean;
  onSelectShot?: (shot: Shot) => void;
  onCharacterClick?: (char: 'barnaby' | 'clarabelle') => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  currentShot,
  aspectRatio,
  colorGrade,
  godRaysIntensity,
  cameraSpeed,
  showHUD,
  showGrid,
  showAnatomyHUD,
  setShowAnatomyHUD,
  bodyState,
  setBodyState,
  activeSpeaker,
  currentLine,
  isSpeaking,
  onCharacterClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; pulse: number }>>([]);
  const footstepPuffsRef = useRef<Array<{ x: number; y: number; size: number; alpha: number; vx: number; vy: number }>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentShot.imageUrl;
    img.onload = () => {
      imageRef.current = img;
    };
    setCurrentTime(0);
  }, [currentShot]);

  // Initialize atmospheric particles (golden dust motes)
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: 1.0 + Math.random() * 2.8,
        speedX: (Math.random() - 0.45) * 0.0003,
        speedY: (Math.random() * 0.0005) + 0.0001,
        opacity: 0.2 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Audio lifecycle
  useEffect(() => {
    if (isPlaying && !isMuted) {
      if (!forestAudio.getActive()) {
        forestAudio.start();
      }
      forestAudio.setVolume(volume);
    } else {
      forestAudio.stop();
    }
    return () => {
      forestAudio.stop();
    };
  }, [isPlaying, isMuted, volume]);

  // Canvas Click: interactive personified reaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;

    if (clickX < 0.5) {
      // Clicked Barnaby (Dog)
      setBodyState((prev) => ({
        ...prev,
        dogPawRaised: 1.0,
        dogTailSpeed: 1.8,
        dogEarPerk: 1.0,
      }));
      showToast('Barnaby sips his coffee, raises his hand and tells a story!');
      if (onCharacterClick) onCharacterClick('barnaby');
    } else {
      // Clicked Clarabelle (Cow)
      setBodyState((prev) => ({
        ...prev,
        cowHeadNod: 10,
        cowEarTwitch: 1.0,
        cowMapConsult: 1.0,
      }));
      showToast('Clarabelle examines the trail map, nods and swings her basket!');
      if (onCharacterClick) onCharacterClick('clarabelle');
    }
  };

  // Main 4K Canvas Render Loop
  const renderFrame = useCallback(
    (timestamp: number) => {
      if (!lastTimestamp.current) lastTimestamp.current = timestamp;
      const delta = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed * cameraSpeed;
          return next >= currentShot.duration ? 0 : next;
        });

        // Accumulate walking distance if walking is active
        if (bodyState.isWalking) {
          setBodyState((prev) => ({
            ...prev,
            walkDistance: (prev.walkDistance || 0) + delta * (prev.walkSpeed || 1.2) * 1.4,
          }));
        }
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const img = imageRef.current;

      if (canvas && ctx && img && img.complete) {
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const timeSec = timestamp * 0.001;
        const progress = (currentTime % currentShot.duration) / currentShot.duration;

        // --- BIPEDAL HUMAN WALKING GAIT OSCILLATION ---
        // Visible vertical bounce (bobbing) & lateral weight transfer
        let walkBobY = 0;
        let walkSwayX = 0;
        const isBipedalShot = currentShot.id === 'shot-bipedal-walk';
        const walkingActive = bodyState.isWalking || isBipedalShot;
        const walkCadence = timeSec * (bodyState.walkSpeed || 1.2) * 5.0;

        if (walkingActive) {
          walkBobY = Math.abs(Math.sin(walkCadence)) * 12; // 12px human stride bob
          walkSwayX = Math.sin(walkCadence) * 6; // 6px lateral hip shift

          // Spawn footstep dust puffs when a step lands
          const stepPhase = Math.sin(walkCadence);
          if (stepPhase > 0.94 && Math.random() > 0.5) {
            const isLeftFoot = Math.cos(walkCadence) > 0;
            const puffBaseX = isBipedalShot ? width * 0.43 + (isLeftFoot ? -20 : 20) : width * 0.40;
            const puffBaseY = isBipedalShot ? height * 0.88 : height * 0.82;

            footstepPuffsRef.current.push({
              x: puffBaseX + (Math.random() - 0.5) * 15,
              y: puffBaseY,
              size: 5 + Math.random() * 8,
              alpha: 0.6,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -0.5 - Math.random() * 0.8,
            });
          }
        }

        // Camera Motion Choreography
        let panX = 0;
        let panY = 0;
        let zoom = 1.06;

        switch (currentShot.cameraMotion) {
          case 'slow-pan-right':
            panX = -0.06 + progress * 0.12;
            panY = Math.sin(progress * Math.PI) * 0.015;
            zoom = 1.08 + Math.sin(progress * Math.PI) * 0.04;
            break;
          case 'dolly-forward':
            panX = Math.sin(progress * Math.PI * 2) * 0.02;
            panY = -0.02 + progress * 0.04;
            zoom = 1.05 + progress * 0.14;
            break;
          case 'gentle-orbit':
            panX = Math.cos(progress * Math.PI * 2) * 0.05;
            panY = Math.sin(progress * Math.PI * 2) * 0.03;
            zoom = 1.1 + Math.sin(progress * Math.PI * 2) * 0.03;
            break;
          case 'crane-up':
            panX = (progress - 0.5) * 0.04;
            panY = 0.05 - progress * 0.1;
            zoom = 1.07;
            break;
          default:
            panX = -0.04 + progress * 0.08;
            zoom = 1.08;
            break;
        }

        // Apply Image with Zoom, Pan, and Human Walking Bob
        ctx.save();
        ctx.translate(width / 2 + walkSwayX, height / 2 + walkBobY);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2 + panX * width, -height / 2 + panY * height);

        // Draw High-Resolution Image centered preserving ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let drawW = width;
        let drawH = height;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect > canvasAspect) {
          drawH = height;
          drawW = height * imgAspect;
          drawX = (width - drawW) / 2;
        } else {
          drawW = width;
          drawH = width / imgAspect;
          drawY = (height - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // --- 1. VISIBLE BIPEDAL WALKING MOTION EFFECTS ---
        // Render footstep dust puffs along the trail
        footstepPuffsRef.current.forEach((puff, idx) => {
          puff.x += puff.vx;
          puff.y += puff.vy;
          puff.size += 0.3;
          puff.alpha -= 0.02;

          ctx.save();
          ctx.beginPath();
          ctx.arc(puff.x, puff.y, puff.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 215, 170, ${Math.max(0, puff.alpha)})`;
          ctx.shadowColor = 'rgba(217, 119, 6, 0.4)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        });
        footstepPuffsRef.current = footstepPuffsRef.current.filter((p) => p.alpha > 0.02);

        // --- 2. CHARACTER ANCHOR COORDINATES PER SHOT ---
        let barnabyMouthX = width * 0.45;
        let barnabyMouthY = height * 0.35;
        let clarabelleMouthX = width * 0.58;
        let clarabelleMouthY = height * 0.36;

        let barnabyHandX = width * 0.50;
        let barnabyHandY = height * 0.47;
        let clarabelleBasketX = width * 0.70;
        let clarabelleBasketY = height * 0.68;

        if (currentShot.id === 'shot-bipedal-walk') {
          // Full body upright bipedal walk
          barnabyMouthX = width * 0.46;
          barnabyMouthY = height * 0.35;
          clarabelleMouthX = width * 0.57;
          clarabelleMouthY = height * 0.36;
          barnabyHandX = width * 0.51;
          barnabyHandY = height * 0.48;
          clarabelleBasketX = width * 0.70;
          clarabelleBasketY = height * 0.70;
        } else if (currentShot.id === 'shot-human-chat') {
          // Medium close-up with coffee mug & trail map
          barnabyMouthX = width * 0.36;
          barnabyMouthY = height * 0.42;
          clarabelleMouthX = width * 0.63;
          clarabelleMouthY = height * 0.43;
          barnabyHandX = width * 0.48;
          barnabyHandY = height * 0.60;
          clarabelleBasketX = width * 0.68;
          clarabelleBasketY = height * 0.74;
        }

        // --- 3. VISIBLE SPEAKING RIG (ARTICULATED MOUTH & SOUND RIPPLES) ---
        const isDogSpeaking = isSpeaking && activeSpeaker === 'barnaby';
        const isCowSpeaking = isSpeaking && activeSpeaker === 'clarabelle';

        // Barnaby Visible Talking Mouth
        const dogMouthActive = bodyState.dogMouthOpen > 0.08 || isDogSpeaking;
        if (dogMouthActive) {
          const speechPulse = Math.abs(Math.sin(timeSec * 14)) * (isDogSpeaking ? 0.85 : bodyState.dogMouthOpen);

          ctx.save();
          // Animated mouth cavity / smiling lips
          ctx.beginPath();
          ctx.ellipse(barnabyMouthX, barnabyMouthY, 14, 7 + speechPulse * 8, 0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.stroke();

          // Expanding acoustic speech ripple rings
          for (let r = 1; r <= 3; r++) {
            const ringRadius = 15 + ((timeSec * 35 + r * 15) % 40);
            const ringAlpha = (1 - ringRadius / 40) * 0.6;
            ctx.beginPath();
            ctx.arc(barnabyMouthX + 15, barnabyMouthY, ringRadius, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.strokeStyle = `rgba(251, 191, 36, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Floating audio frequency bar graph next to mouth
          const barBaseX = barnabyMouthX + 38;
          const barBaseY = barnabyMouthY - 15;
          for (let b = 0; b < 5; b++) {
            const barH = 5 + Math.abs(Math.sin(timeSec * 16 + b)) * 18 * (isDogSpeaking ? 1 : 0.4);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(barBaseX + b * 5, barBaseY + 18 - barH, 3.5, barH);
          }
          ctx.restore();
        }

        // Clarabelle Visible Talking Muzzle
        const cowMouthActive = bodyState.cowMouthOpen > 0.08 || isCowSpeaking;
        if (cowMouthActive) {
          const cowSpeechPulse = Math.abs(Math.sin(timeSec * 11)) * (isCowSpeaking ? 0.8 : bodyState.cowMouthOpen);

          ctx.save();
          // Animated cow lips parting with gentle cud-chew/speech rhythm
          ctx.beginPath();
          ctx.ellipse(clarabelleMouthX, clarabelleMouthY, 16, 8 + cowSpeechPulse * 9, -0.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(96, 165, 250, 0.9)';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.stroke();

          // Expanding acoustic voice rings
          for (let r = 1; r <= 3; r++) {
            const ringRadius = 15 + ((timeSec * 30 + r * 15) % 40);
            const ringAlpha = (1 - ringRadius / 40) * 0.6;
            ctx.beginPath();
            ctx.arc(clarabelleMouthX - 15, clarabelleMouthY, ringRadius, Math.PI * 0.7, Math.PI * 1.3);
            ctx.strokeStyle = `rgba(147, 197, 253, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Floating audio frequency bar graph next to cow's mouth
          const barBaseX = clarabelleMouthX - 60;
          const barBaseY = clarabelleMouthY - 15;
          for (let b = 0; b < 5; b++) {
            const barH = 5 + Math.abs(Math.sin(timeSec * 14 + b)) * 16 * (isCowSpeaking ? 1 : 0.4);
            ctx.fillStyle = '#93c5fd';
            ctx.fillRect(barBaseX + b * 5, barBaseY + 18 - barH, 3.5, barH);
          }
          ctx.restore();
        }

        // --- 4. VISIBLE PERSON ACTIONS & GESTURES ---
        // Barnaby Storytelling Hand Gesture
        const pawActive = bodyState.dogPawRaised > 0.1 || isDogSpeaking;
        if (pawActive) {
          const gesturePhase = Math.sin(timeSec * 5) * (isDogSpeaking ? 1.0 : bodyState.dogPawRaised);
          const handY = barnabyHandY + gesturePhase * 16;
          const handX = barnabyHandX + Math.cos(timeSec * 4) * 10;

          ctx.save();
          // Kinetic motion arc
          ctx.beginPath();
          ctx.arc(handX, handY, 26, -Math.PI * 0.75, -Math.PI * 0.15);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Hand articulated palm indicator
          ctx.beginPath();
          ctx.arc(handX, handY, 15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.fill();
          ctx.restore();
        }

        // Barnaby Campfire Coffee Mug Sip & Steam
        if (currentShot.id === 'shot-human-chat' || bodyState.dogCoffeeSip > 0.1) {
          const mugX = width * 0.35;
          const mugY = height * 0.78;
          ctx.save();
          // Animated steam curls rising from the hot campfire mug
          for (let s = 0; s < 3; s++) {
            const steamOffset = (timeSec * 40 + s * 25) % 60;
            const steamAlpha = (1 - steamOffset / 60) * 0.7;
            const steamWiggle = Math.sin(timeSec * 4 + s) * 8;

            ctx.beginPath();
            ctx.arc(mugX + steamWiggle, mugY - steamOffset, 4 + s * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${steamAlpha})`;
            ctx.fill();
          }
          ctx.restore();
        }

        // Clarabelle Trail Map Route Glow
        if (currentShot.id === 'shot-human-chat' || bodyState.cowMapConsult > 0.1) {
          const mapX = width * 0.65;
          const mapY = height * 0.74;
          ctx.save();
          // Pulsing emerald route tracker on the map
          const pulse = (Math.sin(timeSec * 4) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(mapX, mapY, 8 + pulse * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.4})`;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Clarabelle Wicker Basket Pendulum Swing
        if (isBipedalShot) {
          const basketAngle = Math.sin(walkCadence + 0.4) * 0.2;
          ctx.save();
          ctx.translate(clarabelleBasketX, clarabelleBasketY);
          ctx.rotate(basketAngle);
          // Highlight basket swing arc
          ctx.beginPath();
          ctx.arc(0, 20, 16, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }

        // 5. Body Anatomy Biomechanical HUD Tracker Overlay (when toggled on)
        if (showAnatomyHUD) {
          ctx.save();
          const drawJoint = (x: number, y: number, label: string, color: string) => {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + 12, y);
            ctx.lineTo(x + 40, y);
            ctx.stroke();

            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(label, x + 44, y + 4);
          };

          drawJoint(barnabyMouthX, barnabyMouthY, 'SPEAKING JAW [VISEME]', '#f59e0b');
          drawJoint(barnabyHandX, barnabyHandY, 'HUMAN HAND GESTURE', '#f59e0b');
          drawJoint(clarabelleMouthX, clarabelleMouthY, 'BOVINE SPEECH ARTICULATION', '#60a5fa');
          if (isBipedalShot) {
            drawJoint(width * 0.43, height * 0.88, 'BIPEDAL STRIDE [WALK]', '#10b981');
            drawJoint(width * 0.35, height * 0.62, 'WALKING STAFF PLANT', '#f59e0b');
            drawJoint(clarabelleBasketX, clarabelleBasketY, 'FLOWER BASKET SWING', '#60a5fa');
          }
          ctx.restore();
        }

        ctx.restore();

        // 1. Volumetric God Rays (Shafts of sunlight penetrating pine canopy)
        if (godRaysIntensity > 0) {
          ctx.save();
          const rayTime = timestamp * 0.001;
          const rayIntensity = godRaysIntensity * (0.8 + Math.sin(rayTime * 1.5) * 0.15);

          const sourceX = width * 0.45;
          const sourceY = -height * 0.2;

          const numRays = 7;
          for (let i = 0; i < numRays; i++) {
            const angleOffset = ((i - (numRays - 1) / 2) * 0.14) + Math.sin(rayTime * 0.8 + i) * 0.02;
            const rayGrad = ctx.createRadialGradient(
              sourceX,
              sourceY,
              50,
              sourceX + Math.sin(angleOffset) * width * 1.4,
              height * 1.3,
              width * 0.8
            );

            const alpha = (0.16 * rayIntensity * (1 - Math.abs(i - 3) / 4)).toFixed(3);
            rayGrad.addColorStop(0, `rgba(255, 235, 175, ${alpha})`);
            rayGrad.addColorStop(0.3, `rgba(255, 215, 130, ${Number(alpha) * 0.7})`);
            rayGrad.addColorStop(0.7, `rgba(240, 190, 90, ${Number(alpha) * 0.25})`);
            rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(sourceX, sourceY);
            ctx.lineTo(sourceX + Math.sin(angleOffset - 0.1) * width * 1.5, height);
            ctx.lineTo(sourceX + Math.sin(angleOffset + 0.1) * width * 1.5, height);
            ctx.closePath();
            ctx.fill();
          }

          const flareGrad = ctx.createRadialGradient(sourceX, 0, 10, sourceX, 0, width * 0.65);
          flareGrad.addColorStop(0, `rgba(255, 245, 210, ${0.35 * rayIntensity})`);
          flareGrad.addColorStop(0.4, `rgba(255, 220, 140, ${0.15 * rayIntensity})`);
          flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // 2. Floating Golden Dust Motes / Forest Pollen
        ctx.save();
        particlesRef.current.forEach((p) => {
          p.y += p.speedY * (1 + progress * 0.5);
          p.x += p.speedX + Math.sin(p.pulse + timestamp * 0.002) * 0.0003;
          p.pulse += 0.02;

          if (p.y > 1) p.y = 0;
          if (p.x > 1) p.x = 0;
          if (p.x < 0) p.x = 1;

          const px = p.x * width;
          const py = p.y * height;
          const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 235, 180, ${currentOpacity * 0.8})`;
          ctx.shadowColor = 'rgba(255, 215, 100, 0.9)';
          ctx.shadowBlur = 6;
          ctx.fill();
        });
        ctx.restore();

        // 3. Color Grading LUT and Vignette Overlay
        ctx.save();
        if (colorGrade === 'golden') {
          ctx.fillStyle = 'rgba(255, 175, 40, 0.08)';
          ctx.fillRect(0, 0, width, height);
        } else if (colorGrade === 'kodak') {
          ctx.fillStyle = 'rgba(255, 140, 30, 0.06)';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = 'rgba(20, 60, 120, 0.04)';
          ctx.fillRect(0, 0, width, height);
        } else if (colorGrade === 'emerald') {
          ctx.fillStyle = 'rgba(40, 180, 80, 0.07)';
          ctx.fillRect(0, 0, width, height);
        } else if (colorGrade === 'nordic') {
          ctx.fillStyle = 'rgba(50, 120, 180, 0.12)';
          ctx.fillRect(0, 0, width, height);
        }

        // Cinematic Vignette
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.35,
          width / 2,
          height / 2,
          width * 0.72
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(10, 8, 4, 0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // --- 4. DYNAMIC CINEMA SPEECH BUBBLE OVER ACTIVE CHARACTER ---
        if (currentLine && currentLine.text) {
          ctx.save();
          const isBarnaby = currentLine.speaker === 'barnaby';
          const bubbleX = isBarnaby ? width * 0.28 : width * 0.52;
          const bubbleY = isBarnaby ? height * 0.12 : height * 0.10;
          const bubbleW = width * 0.38;
          const bubbleH = 115;

          // Bubble background with backdrop blur effect
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 18);
          ctx.fillStyle = isBarnaby ? 'rgba(26, 18, 5, 0.90)' : 'rgba(10, 20, 35, 0.90)';
          ctx.fill();

          ctx.strokeStyle = isBarnaby ? 'rgba(245, 158, 11, 0.85)' : 'rgba(96, 165, 250, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = isBarnaby ? 'rgba(245, 158, 11, 0.6)' : 'rgba(96, 165, 250, 0.6)';
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Bubble tail pointer pointing to speaking mouth
          ctx.beginPath();
          if (isBarnaby) {
            ctx.moveTo(bubbleX + 60, bubbleY + bubbleH);
            ctx.lineTo(bubbleX + 75, bubbleY + bubbleH + 22);
            ctx.lineTo(bubbleX + 90, bubbleY + bubbleH);
          } else {
            ctx.moveTo(bubbleX + bubbleW - 90, bubbleY + bubbleH);
            ctx.lineTo(bubbleX + bubbleW - 75, bubbleY + bubbleH + 22);
            ctx.lineTo(bubbleX + bubbleW - 60, bubbleY + bubbleH);
          }
          ctx.fillStyle = isBarnaby ? 'rgba(26, 18, 5, 0.90)' : 'rgba(10, 20, 35, 0.90)';
          ctx.fill();

          // Speaker Header Name
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = isBarnaby ? '#fbbf24' : '#60a5fa';
          ctx.shadowBlur = 0;
          const speakerTitle = isBarnaby ? '🐕 BARNABY (Adventurer)' : '🐄 CLARABELLE (Botanist & Philosopher)';
          ctx.fillText(speakerTitle, bubbleX + 16, bubbleY + 26);

          // Dialogue line text wrapping
          ctx.font = '500 13px sans-serif';
          ctx.fillStyle = '#f3f4f6';

          const words = currentLine.text.split(' ');
          let line = '';
          let textY = bubbleY + 52;
          const maxWidth = bubbleW - 32;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              ctx.fillText(line, bubbleX + 16, textY);
              line = words[n] + ' ';
              textY += 21;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, bubbleX + 16, textY);

          ctx.restore();
        }

        // 5. Anamorphic Cinema Bars (Aspect ratio letterbox)
        if (aspectRatio === '2.39:1') {
          const barHeight = (height - width / 2.39) / 2;
          if (barHeight > 0) {
            ctx.fillStyle = '#05070a';
            ctx.fillRect(0, 0, width, barHeight);
            ctx.fillRect(0, height - barHeight, width, barHeight);
          }
        } else if (aspectRatio === '9:16') {
          const frameWidth = height * (9 / 16);
          const barWidth = (width - frameWidth) / 2;
          if (barWidth > 0) {
            ctx.fillStyle = '#05070a';
            ctx.fillRect(0, 0, barWidth, height);
            ctx.fillRect(width - barWidth, 0, barWidth, height);
          }
        }

        // 6. Cinematography Grid Overlay
        if (showGrid) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);

          ctx.beginPath();
          ctx.moveTo(width / 3, 0);
          ctx.lineTo(width / 3, height);
          ctx.moveTo((2 * width) / 3, 0);
          ctx.lineTo((2 * width) / 3, height);
          ctx.moveTo(0, height / 3);
          ctx.lineTo(width, height / 3);
          ctx.moveTo(0, (2 * height) / 3);
          ctx.lineTo(width, (2 * height) / 3);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
          const crossSize = 16;
          ctx.beginPath();
          ctx.moveTo(width / 2 - crossSize, height / 2);
          ctx.lineTo(width / 2 + crossSize, height / 2);
          ctx.moveTo(width / 2, height / 2 - crossSize);
          ctx.lineTo(width / 2, height / 2 + crossSize);
          ctx.stroke();
          ctx.restore();
        }
      }

      animationFrameId.current = requestAnimationFrame(renderFrame);
    },
    [
      isPlaying,
      playbackSpeed,
      cameraSpeed,
      currentTime,
      currentShot,
      godRaysIntensity,
      colorGrade,
      aspectRatio,
      showGrid,
      showAnatomyHUD,
      bodyState,
      activeSpeaker,
      currentLine,
      isSpeaking,
    ]
  );

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [renderFrame]);

  // Video recording capability via Canvas MediaRecorder
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(60);
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sunlit-woods-person-${currentShot.id}-4k.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordProgress(0);
        showToast('4K Personified Video clip successfully downloaded!');
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setCurrentTime(0);

      const totalMs = currentShot.duration * 1000;
      const startMs = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startMs;
        const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
        setRecordProgress(pct);
        if (elapsed >= totalMs) {
          clearInterval(interval);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 100);
    } catch (err) {
      console.error('Recording failed:', err);
      showToast('Could not record video directly on this browser.');
      setIsRecording(false);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl group select-none"
    >
      {/* 4K Canvas Player Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain cursor-pointer"
          onClick={handleCanvasClick}
          title="Click Barnaby (left) or Clarabelle (right) to trigger personified reactions!"
        />

        {/* Cinematography Director HUD Overlay */}
        {showHUD && (
          <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between font-mono text-xs text-amber-200/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/20">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold tracking-wider text-amber-400">4K DCI • BIPEDAL PERSON MODE</span>
                <span className="text-neutral-400">|</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5" />
                  {bodyState.isWalking ? 'WALKING (108 SPM)' : 'RESTING'}
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-amber-300 font-semibold">
                  {isSpeaking ? `VOICE: ${activeSpeaker?.toUpperCase()}` : 'SPEECH ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnatomyHUD(!showAnatomyHUD)}
                  className={`pointer-events-auto px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showAnatomyHUD
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-black/60 backdrop-blur-md text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                  title="Toggle Body Mechanics Anatomy Tracker"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Biomechanical Joints HUD</span>
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-lg border border-amber-500/20 max-w-sm space-y-1">
                <div className="text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  {currentShot.title}
                </div>
                <div className="text-[11px] text-neutral-300 leading-snug line-clamp-2">
                  {currentShot.description}
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/20 text-right">
                <span className="text-amber-400 font-bold">{formatTime(currentTime)}</span>
                <span className="text-neutral-400"> / {formatTime(currentShot.duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recording Overlay Progress */}
        {isRecording && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600/95 text-white px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-3 border border-red-400 animate-bounce">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span className="font-semibold text-sm">Rendering & Recording 4K Master ({recordProgress}%)</span>
          </div>
        )}

        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/40 shadow-2xl text-xs font-medium flex items-center gap-2 backdrop-blur-md z-30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}
      </div>

      {/* Scrubber Timeline */}
      <div className="relative w-full bg-neutral-900/80 px-4 pt-2.5 pb-1">
        <input
          type="range"
          min="0"
          max={currentShot.duration}
          step="0.01"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all hover:h-2"
        />
      </div>

      {/* Player Action Controls Bar */}
      <div className="p-4 bg-neutral-900/95 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-neutral-300">
        {/* Left: Playback & Walk Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl font-medium transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setBodyState((p) => ({ ...p, isWalking: !p.isWalking }));
              showToast(!bodyState.isWalking ? 'Started Bipedal Walk Cycle!' : 'Paused Walk Cycle');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
              bodyState.isWalking
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
            title="Toggle Bipedal Walking Motion"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{bodyState.isWalking ? 'Walking Active' : 'Start Walk'}</span>
          </button>

          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono text-neutral-400 pl-1 hidden sm:inline">
            <span className="text-amber-400 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-neutral-600"> / </span>
            <span>{formatTime(currentShot.duration)}</span>
          </div>
        </div>

        {/* Center: Soundstage Ambient Audio */}
        <div className="flex items-center space-x-2 bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-700/60">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-amber-400 hover:text-amber-300 cursor-pointer"
            title={isMuted ? 'Unmute Forest Soundscape' : 'Mute Soundscape'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1 bg-neutral-600 rounded cursor-pointer accent-amber-500"
            title="Forest Ambience Volume"
          />
          <span className="text-[11px] text-neutral-400 hidden sm:inline">Soundscape</span>
        </div>

        {/* Right: Export, Quality, Fullscreen */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-600/50 text-white cursor-not-allowed'
                : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30'
            }`}
            title="Record and export 4K cinematic WebM video"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Capturing 4K...' : 'Export 4K Video'}</span>
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
