/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PinballPhysics } from './game/physics.ts';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  createInitialFlippers,
  createBumpersForStage,
  createDropTargetsForStage,
  createSlingshotsForStage,
  createRolloverLanesForStage,
  createWallsForStage,
  createTableWalls,
  getStageConfig,
  STAGES,
} from './game/tableLayout.ts';
import { GameStats, GameState } from './game/types.ts';
import { soundEngine } from './game/sound.ts';
import { PinballCanvas } from './components/PinballCanvas.tsx';
import { BackglassPanel } from './components/BackglassPanel.tsx';
import { ControlOverlay } from './components/ControlOverlay.tsx';
import { Play, RotateCcw, Trophy, Sparkles, Flame } from 'lucide-react';

const HIGH_SCORE_KEY = 'nasty_pinball_high_score';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [plungerPower, setPlungerPower] = useState(0);

  // High score from storage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 150000;
    } catch {
      return 150000;
    }
  });

  // Game Stats State for React UI
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 150000,
    ballNumber: 1,
    maxBalls: 3,
    multiplier: 1,
    lockedBalls: 0,
    isMultiball: false,
    multiballTimer: 0,
    dropTargetsDown: [false, false, false],
    rolloverLanesLit: [false, false, false],
    comboCount: 0,
    tiltWarnings: 0,
    isTilted: false,
    skillShotReady: true,
    infiniteLives: false,
    stageMission: STAGES[0].stageMission,
    missionProgress: '0%',
    missionCompleted: false,
    mascotMood: 'IDLE',
    mascotMessage: 'READY! SHOOT FOR HIGHSCORE!',
    mascotTimer: 0,
    currentStage: 1,
    nextStageThreshold: 50000,
  });

  // Stable Game Engine Refs
  const physicsRef = useRef<PinballPhysics>(new PinballPhysics());
  const leftFlipperRef = useRef(createInitialFlippers().left);
  const rightFlipperRef = useRef(createInitialFlippers().right);
  const bumpersRef = useRef(createBumpersForStage(1));
  const dropTargetsRef = useRef(createDropTargetsForStage(1));
  const slingshotsRef = useRef(createSlingshotsForStage(1));
  const rolloversRef = useRef(createRolloverLanesForStage(1));
  const wallsRef = useRef(createTableWalls());
  const statsRef = useRef(stats);

  // Sync ref with state
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, highScore }));
  }, [highScore]);

  // Stage Switcher Function: Resets ball, loads stage-specific geometry, sound, and mission
  const handleSelectStage = useCallback((stageId: number) => {
    const cfg = getStageConfig(stageId);
    
    // 1. Reset ball to plunger lane for a fresh clean launch in the new stage
    const physics = physicsRef.current;
    physics.balls = [];
    physics.spawnBall(642, 860, 0, 0);
    physics.plungerTension = 0;
    physics.isPlungerCharging = false;
    setPlungerPower(0);

    // 2. Update playfield components with stage-specific geometry, walls, and bumpers
    wallsRef.current = createWallsForStage(stageId);
    bumpersRef.current = createBumpersForStage(stageId);
    dropTargetsRef.current = createDropTargetsForStage(stageId);
    slingshotsRef.current = createSlingshotsForStage(stageId);
    rolloversRef.current = createRolloverLanesForStage(stageId);

    // 3. Audio transition to stage-specific soundtrack & celebratory fanfare
    soundEngine.setStage(stageId);
    soundEngine.playStageClear();
    physics.triggerStageClearExplosion(cfg.accentColor);
    physics.addPopup(`★ ${cfg.name} ★`, TABLE_WIDTH / 2, 260, cfg.accentColor);

    // 4. Reset stage mission, combo, multiball, and update stats
    const updated: GameStats = {
      ...statsRef.current,
      currentStage: stageId,
      nextStageThreshold: cfg.scoreThreshold,
      stageMission: cfg.stageMission,
      missionProgress: '0%',
      missionCompleted: false,
      isMultiball: false,
      lockedBalls: 0,
      comboCount: 0,
      skillShotReady: true,
      isTilted: false,
      tiltWarnings: 0,
      mascotMood: 'HAPPY',
      mascotMessage: cfg.mascotQuotes.start,
      mascotTimer: 3.5,
      dropTargetsDown: dropTargetsRef.current.map(() => false),
      rolloverLanesLit: rolloversRef.current.map(() => false),
    };

    statsRef.current = updated;
    setStats(updated);
  }, []);

  // Infinite Lives Toggle Handler (For testing & casual play)
  const handleToggleInfiniteLives = useCallback(() => {
    setStats((prev) => {
      const next = !prev.infiniteLives;
      statsRef.current.infiniteLives = next;
      return { ...prev, infiniteLives: next };
    });
  }, []);

  // Start New Game
  const startNewGame = useCallback(() => {
    const physics = physicsRef.current;
    physics.balls = [];
    physics.particles = [];
    physics.popups = [];
    physics.cameraShake = 0;
    physics.plungerTension = 0;
    physics.isPlungerCharging = false;
    setPlungerPower(0);

    // Reset flippers & components to stage 1
    const initFlippers = createInitialFlippers();
    leftFlipperRef.current = initFlippers.left;
    rightFlipperRef.current = initFlippers.right;
    wallsRef.current = createWallsForStage(1);
    bumpersRef.current = createBumpersForStage(1);
    dropTargetsRef.current = createDropTargetsForStage(1);
    slingshotsRef.current = createSlingshotsForStage(1);
    rolloversRef.current = createRolloverLanesForStage(1);

    // Spawn First Ball
    physics.spawnBall(642, 860, 0, 0);

    const initialStats: GameStats = {
      score: 0,
      highScore,
      ballNumber: 1,
      maxBalls: 3,
      multiplier: 1,
      lockedBalls: 0,
      isMultiball: false,
      multiballTimer: 0,
      dropTargetsDown: [false, false, false],
      rolloverLanesLit: [false, false, false],
      comboCount: 0,
      tiltWarnings: 0,
      isTilted: false,
      skillShotReady: true,
      infiniteLives: statsRef.current?.infiniteLives || false,
      stageMission: STAGES[0].stageMission,
      missionProgress: '0%',
      missionCompleted: false,
      mascotMood: 'IDLE',
      mascotMessage: 'BOLA 1 PRONTA! PUXE A MOLA!',
      mascotTimer: 2.5,
      currentStage: 1,
      nextStageThreshold: 50000,
    };

    setStats(initialStats);
    statsRef.current = initialStats;
    setGameState('PLAYING');

    soundEngine.setStage(1);
    if (isMusicEnabled) {
      soundEngine.startMusicLoop();
    }
  }, [highScore, isMusicEnabled]);

  // Handle Score Addition & Dynamic Score-Hooked Stage Progression
  const handleScore = useCallback((pts: number) => {
    const multi = statsRef.current.multiplier;
    const added = pts * multi;
    const newScore = statsRef.current.score + added;

    statsRef.current.score = newScore;
    if (newScore > statsRef.current.highScore) {
      statsRef.current.highScore = newScore;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
      } catch {
        // ignore
      }
      setHighScore(newScore);
    }

    // Check Stage Advancement Hooked to Score
    const currentStage = statsRef.current.currentStage;
    const threshold = statsRef.current.nextStageThreshold;

    if (newScore >= threshold && currentStage < 5) {
      const nextStage = currentStage + 1;
      handleSelectStage(nextStage);
    } else {
      setStats((prev) => ({
        ...prev,
        score: newScore,
        highScore: Math.max(prev.highScore, newScore),
      }));
    }
  }, [handleSelectStage]);

  // Flipper and Plunger Handlers
  const handleLeftFlipperDown = useCallback(() => {
    if (statsRef.current.isTilted) return;
    leftFlipperRef.current.isUp = true;
    soundEngine.playFlipperUp();
  }, []);

  const handleLeftFlipperUp = useCallback(() => {
    leftFlipperRef.current.isUp = false;
    soundEngine.playFlipperDown();
  }, []);

  const handleRightFlipperDown = useCallback(() => {
    if (statsRef.current.isTilted) return;
    rightFlipperRef.current.isUp = true;
    soundEngine.playFlipperUp();
  }, []);

  const handleRightFlipperUp = useCallback(() => {
    rightFlipperRef.current.isUp = false;
    soundEngine.playFlipperDown();
  }, []);

  const handlePlungerDown = useCallback(() => {
    physicsRef.current.isPlungerCharging = true;
  }, []);

  const handlePlungerUp = useCallback(() => {
    physicsRef.current.releasePlunger(statsRef.current);
    setPlungerPower(0);
  }, []);

  const handleNudge = useCallback(() => {
    physicsRef.current.nudge('up', statsRef.current);
    setStats({ ...statsRef.current });
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (gameState === 'TITLE' || gameState === 'GAMEOVER') {
        if (e.code === 'Enter' || e.code === 'Space') {
          startNewGame();
        }
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        handleTogglePause();
        return;
      }

      // Hotkey to quickly test switch stages: 1, 2, 3, 4, 5
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const stageNum = parseInt(e.code.replace('Digit', ''), 10);
        handleSelectStage(stageNum);
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.code === 'KeyZ' || e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ShiftLeft') {
        handleLeftFlipperDown();
      } else if (e.code === 'Slash' || e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'ShiftRight') {
        handleRightFlipperDown();
      } else if (e.code === 'Space' || e.code === 'ArrowDown') {
        handlePlungerDown();
      } else if (e.code === 'KeyX' || e.code === 'KeyN') {
        handleNudge();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' || e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ShiftLeft') {
        handleLeftFlipperUp();
      } else if (e.code === 'Slash' || e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'ShiftRight') {
        handleRightFlipperUp();
      } else if (e.code === 'Space' || e.code === 'ArrowDown') {
        handlePlungerUp();
      }
    };

    const handleBlur = () => {
      leftFlipperRef.current.isUp = false;
      rightFlipperRef.current.isUp = false;
      physicsRef.current.isPlungerCharging = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [
    gameState,
    startNewGame,
    handleTogglePause,
    handleSelectStage,
    handleLeftFlipperDown,
    handleLeftFlipperUp,
    handleRightFlipperDown,
    handleRightFlipperUp,
    handlePlungerDown,
    handlePlungerUp,
    handleNudge,
  ]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let lastTime = performance.now();
    let animId: number;
    let uiSyncCounter = 0;

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const physics = physicsRef.current;
      const currentStats = statsRef.current;

      // Charge plunger if key held
      if (physics.isPlungerCharging) {
        physics.chargePlunger(dt);
        setPlungerPower(physics.plungerTension);
      }

      // Physics Step
      physics.update(
        dt,
        leftFlipperRef.current,
        rightFlipperRef.current,
        bumpersRef.current,
        dropTargetsRef.current,
        slingshotsRef.current,
        rolloversRef.current,
        wallsRef.current,
        currentStats,
        handleScore
      );

      // Check Ball Drains
      const activeBalls = physics.balls.filter((b) => b.active);
      if (activeBalls.length === 0) {
        if (currentStats.isMultiball) {
          // Multiball ended
          currentStats.isMultiball = false;
          currentStats.lockedBalls = 0;
          currentStats.mascotMood = 'IDLE';
          currentStats.mascotMessage = 'MULTIBALL TERMINADO!';
          currentStats.mascotTimer = 2.0;
          // Spawn 1 standard ball to continue play
          physics.spawnBall(642, 860, 0, 0);
        } else {
          // Standard ball drained
          soundEngine.playDrain();
          if (currentStats.infiniteLives) {
            // Infinite Lives Active: respawn ball without deducting life or ending game
            currentStats.multiplier = 1;
            currentStats.isTilted = false;
            currentStats.tiltWarnings = 0;
            currentStats.mascotMood = 'HAPPY';
            currentStats.mascotMessage = '♾️ VIDAS INFINITAS ATIVAS! BOLA RECOLOCADA!';
            currentStats.mascotTimer = 2.0;

            physics.spawnBall(642, 860, 0, 0);
          } else if (currentStats.ballNumber < currentStats.maxBalls) {
            currentStats.ballNumber++;
            currentStats.multiplier = 1;
            currentStats.isTilted = false;
            currentStats.tiltWarnings = 0;
            currentStats.mascotMood = 'SHOCK';
            currentStats.mascotMessage = `BOLA PERDIDA! PREPARE-SE PARA A BOLA ${currentStats.ballNumber}!`;
            currentStats.mascotTimer = 3.0;

            // Spawn next ball
            physics.spawnBall(642, 860, 0, 0);
          } else {
            // GAME OVER!
            currentStats.mascotMood = 'GAMEOVER';
            currentStats.mascotMessage = 'FIM DE JOGO! INSIRA UMA FICHA PARA CONTINUAR!';
            currentStats.mascotTimer = 999;
            setGameState('GAMEOVER');
          }
        }
      }

      // Sync React state periodically
      uiSyncCounter++;
      if (uiSyncCounter >= 4) {
        uiSyncCounter = 0;
        setStats({
          ...currentStats,
          dropTargetsDown: dropTargetsRef.current.map((t) => t.isDown),
          rolloverLanesLit: rolloversRef.current.map((r) => r.lit),
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, handleScore]);

  // Audio Toggles
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
  };

  const handleToggleMusic = () => {
    const next = !isMusicEnabled;
    setIsMusicEnabled(next);
    soundEngine.setMusicEnabled(next);
  };

  const handleToggleCrt = () => {
    setIsCrtEnabled((prev) => !prev);
  };

  // Grade calculation
  const getGrade = (score: number) => {
    if (score >= 400000) return 'S';
    if (score >= 250000) return 'A';
    if (score >= 100000) return 'B';
    return 'C';
  };

  const currentStageConfig = getStageConfig(stats.currentStage);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* 1920x1080 Aspect Ratio Fixed Cabinet Shell with Oriental Trim */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] aspect-[16/9] flex flex-col bg-slate-950 shadow-2xl border-2 border-red-950 overflow-hidden">
        
        {/* Main Side-by-Side Playfield & Backglass */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left Column: Vertical Pinball Table (58% width) */}
          <div className="w-[58%] h-full relative">
            <PinballCanvas
              physics={physicsRef.current}
              leftFlipper={leftFlipperRef.current}
              rightFlipper={rightFlipperRef.current}
              bumpers={bumpersRef.current}
              dropTargets={dropTargetsRef.current}
              slingshots={slingshotsRef.current}
              rollovers={rolloversRef.current}
              walls={wallsRef.current}
              stageConfig={currentStageConfig}
            />
          </div>

          {/* Right Column: Illuminated Backglass & Scoreboard (42% width) */}
          <div className="w-[42%] h-full relative overflow-y-auto">
            <BackglassPanel
              stats={stats}
              stageConfig={currentStageConfig}
              onSelectStage={handleSelectStage}
              isMuted={isMuted}
              isMusicEnabled={isMusicEnabled}
              isCrtEnabled={isCrtEnabled}
              onToggleMute={handleToggleMute}
              onToggleMusic={handleToggleMusic}
              onToggleCrt={handleToggleCrt}
              onToggleInfiniteLives={handleToggleInfiniteLives}
            />
          </div>
        </div>

        {/* Bottom Apron & Physical Control Bar */}
        <ControlOverlay
          onLeftFlipperDown={handleLeftFlipperDown}
          onLeftFlipperUp={handleLeftFlipperUp}
          onRightFlipperDown={handleRightFlipperDown}
          onRightFlipperUp={handleRightFlipperUp}
          onPlungerDown={handlePlungerDown}
          onPlungerUp={handlePlungerUp}
          onNudge={handleNudge}
          onTogglePause={handleTogglePause}
          onRestart={startNewGame}
          isPaused={gameState === 'PAUSED'}
          plungerPower={plungerPower}
        />

        {/* Optional Retro CRT Scanline Shader Overlay */}
        {isCrtEnabled && (
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
              backgroundSize: '100% 3px, 6px 100%',
            }}
          />
        )}

        {/* TITLE SCREEN / ATTRACT MODE MODAL WITH ORIENTAL THEME */}
        {gameState === 'TITLE' && (
          <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-8 select-none text-center">
            {/* Oriental Kanji & Torii Top Accent */}
            <div className="flex items-center gap-3 mb-2 text-amber-500 font-mono tracking-widest text-sm">
              <span>⛩</span>
              <span>悪戯ピンボール · ORIENTAL PINBALL ARCADE</span>
              <span>⛩</span>
            </div>

            {/* Inline Bespoke SVG Title Lockup */}
            <div className="max-w-2xl mb-6">
              <svg viewBox="0 0 700 120" className="w-full drop-shadow-[0_0_28px_rgba(239,68,68,0.8)]">
                <defs>
                  <linearGradient id="orientalTitle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="40%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <text
                  x="50%"
                  y="75"
                  textAnchor="middle"
                  fill="url(#orientalTitle)"
                  fontSize="70"
                  fontWeight="900"
                  fontFamily="'Oswald', sans-serif"
                  letterSpacing="6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                >
                  NASTY PINBALL
                </text>
              </svg>
              <div className="flex items-center justify-center gap-3 text-xs font-mono tracking-widest text-amber-400 uppercase mt-1">
                <span>5 FASES EXCLUSIVAS</span>
                <span>·</span>
                <span>NEON · TERROR J-HORROR · SAMURAI · SHINOBI · YOKAI</span>
              </div>
            </div>

            {/* 5 Stages Preview Pills */}
            <div className="grid grid-cols-5 gap-2 max-w-xl mb-6">
              {STAGES.map((s) => (
                <div key={s.id} className="p-2 rounded-lg bg-slate-900/80 border border-amber-900/50 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-amber-500">FASE {s.id}</span>
                  <span className="text-sm font-serif font-bold text-slate-100">{s.kanjiTitle}</span>
                  <span className="text-[10px] text-slate-400 truncate w-full">{s.theme.toUpperCase()}</span>
                </div>
              ))}
            </div>

            {/* High Score Badge */}
            <div className="flex items-center gap-2 mb-8 px-6 py-2 rounded-full border border-amber-500/40 bg-amber-950/40 text-amber-300 font-mono text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>RECORDE (HIGH SCORE):</span>
              <span className="font-bold tabular-nums text-amber-400">{highScore.toLocaleString()}</span>
            </div>

            {/* Start Button */}
            <button
              onClick={startNewGame}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 hover:opacity-90 active:scale-95 text-white font-mono font-black text-xl tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>INICIAR JOGO / INSERT COIN</span>
            </button>

            {/* Control hints */}
            <div className="mt-8 text-xs font-mono text-slate-400 flex items-center gap-4">
              <span>Z / ← Flip Esquerdo</span>
              <span>·</span>
              <span>/ / → Flip Direito</span>
              <span>·</span>
              <span>ESPAÇO / ↓ Puxar Mola</span>
              <span>·</span>
              <span>X / N Nudge</span>
              <span>·</span>
              <span>1-5 Mudar Fase</span>
            </div>
          </div>
        )}

        {/* PAUSE MODAL */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 select-none text-center">
            <h2 className="text-4xl font-mono font-black text-amber-400 tracking-widest mb-6 drop-shadow-md">
              JOGO PAUSADO
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleTogglePause}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold tracking-wider shadow-lg transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>CONTINUAR</span>
              </button>
              <button
                onClick={startNewGame}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold tracking-wider transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>REINICIAR</span>
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER MODAL */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-8 select-none text-center animate-fade-in">
            <div className="text-amber-500 font-mono text-sm tracking-widest mb-1">悪戯ピンボール</div>
            <h2 className="text-5xl font-mono font-black tracking-widest text-red-500 mb-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">
              GAME OVER
            </h2>
            <p className="text-sm font-mono text-slate-400 mb-6">TODAS AS BOLAS FORAM PERDIDAS</p>

            {/* Score Summary Box */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-red-900/60 mb-6 min-w-[340px] shadow-2xl">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-1">PONTUAÇÃO FINAL</div>
              <div className="text-4xl font-mono font-black text-amber-400 tabular-nums mb-3">
                {stats.score.toLocaleString()}
              </div>

              <div className="flex items-center justify-around border-t border-slate-800 pt-3 text-xs font-mono">
                <div>
                  <div className="text-slate-500">FASE ALCANÇADA</div>
                  <div className="text-xl font-bold text-amber-300">FASE {stats.currentStage}</div>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <div className="text-slate-500">NOTA</div>
                  <div className="text-2xl font-bold text-red-400">{getGrade(stats.score)}</div>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <div className="text-slate-500">RECORDE</div>
                  <div className="text-lg font-bold text-amber-400 tabular-nums">
                    {stats.highScore.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Play Again CTA */}
            <button
              onClick={startNewGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 active:scale-95 text-white font-mono font-bold text-lg tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all flex items-center gap-3 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>JOGAR NOVAMENTE [ENTER]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
