/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  active: boolean;
  trail: Vector2D[];
  inRamp: boolean;
  rampProgress: number; // 0 to 1
  rampSpeed: number;
  locked: boolean;
  lockTimer?: number;
}

export interface WallSegment {
  p1: Vector2D;
  p2: Vector2D;
  normal: Vector2D;
  length: number;
  restitution: number;
  friction: number;
  isGate?: boolean;
  gateOpen?: boolean;
}

export interface JetBumper {
  id: number;
  x: number;
  y: number;
  radius: number;
  score: number;
  lit: boolean;
  hitTimer: number; // For glow flash animation
  color: string;
}

export interface DropTarget {
  id: number;
  letter: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDown: boolean;
  downTimer: number;
}

export interface Slingshot {
  id: number;
  p1: Vector2D;
  p2: Vector2D;
  p3: Vector2D; // Pivot / apex
  normal: Vector2D;
  hitTimer: number;
  restitution: number;
  score: number;
}

export interface RolloverLane {
  id: number;
  letter: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lit: boolean;
  score: number;
}

export interface Flipper {
  side: 'left' | 'right';
  pivot: Vector2D;
  length: number;
  baseRadius: number;
  tipRadius: number;
  restAngle: number;
  upAngle: number;
  currentAngle: number;
  targetAngle: number;
  angularVelocity: number;
  isUp: boolean;
  upSpeed: number;
  downSpeed: number;
}

export type ParticleType = 'spark' | 'ring' | 'star' | 'debris' | 'flash';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: ParticleType;
  rotation?: number;
  rotSpeed?: number;
  growth?: number;
  width?: number;
  height?: number;
  secondaryColor?: string;
}

export type MascotMood = 'IDLE' | 'HAPPY' | 'EXCITED' | 'SHOCK' | 'FEVER' | 'GAMEOVER';

export interface ScorePopup {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export type BumperShapeType = 'circle' | 'cursed_eye' | 'sakura' | 'shuriken' | 'oni_skull';

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  kanjiTitle: string;
  scoreThreshold: number;
  theme: 'neon' | 'jhorror' | 'samurai' | 'shinobi' | 'yokai';
  backglassImage: string;
  mascotName: string;
  bumperShape: BumperShapeType;
  dropTargetLetters: string[];
  dropTargetColor: string;
  slingshotColor: string;
  accentColor: string;
  tableBgColor: string;
  tableFeltPattern: string;
  mascotQuotes: {
    start: string;
    combo: string;
    drain: string;
    multiball: string;
    stageClear: string;
  };
}

export interface GameStats {
  score: number;
  highScore: number;
  ballNumber: number;
  maxBalls: number;
  multiplier: number;
  lockedBalls: number;
  isMultiball: boolean;
  multiballTimer: number;
  dropTargetsDown: boolean[];
  rolloverLanesLit: boolean[];
  comboCount: number;
  tiltWarnings: number;
  isTilted: boolean;
  skillShotReady: boolean;
  mascotMood: MascotMood;
  mascotMessage: string;
  mascotTimer: number;
  currentStage: number; // 1 to 5
  nextStageThreshold: number;
  scoreMilestoneTriggered?: boolean;
}

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
