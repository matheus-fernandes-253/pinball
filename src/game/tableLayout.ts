/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D, WallSegment, JetBumper, DropTarget, Slingshot, RolloverLane, Flipper, StageConfig } from './types.ts';

export const TABLE_WIDTH = 700;
export const TABLE_HEIGHT = 960;
export const BALL_RADIUS = 13.5;
export const GRAVITY = 920; // Decreased for smoother, more controllable ball acceleration (was 1150)
export const MAX_BALL_SPEED = 1850; // Balanced terminal speed for fluid arcade reaction time (was 2200)

export function createInitialFlippers(): { left: Flipper; right: Flipper } {
  return {
    left: {
      side: 'left',
      pivot: { x: 240, y: 835 },
      length: 112,
      baseRadius: 18,
      tipRadius: 9,
      restAngle: (27 * Math.PI) / 180,  // Rest angle pointing down-right
      upAngle: (-25 * Math.PI) / 180,   // Up angle flips up-right
      currentAngle: (27 * Math.PI) / 180,
      targetAngle: (27 * Math.PI) / 180,
      angularVelocity: 0,
      isUp: false,
      upSpeed: 28,   // Fast snappy flip
      downSpeed: 20, // Clean return
    },
    right: {
      side: 'right',
      pivot: { x: 460, y: 835 },
      length: 112,
      baseRadius: 18,
      tipRadius: 9,
      restAngle: ((180 - 27) * Math.PI) / 180, // Rest angle pointing down-left
      upAngle: ((180 + 25) * Math.PI) / 180,  // Up angle flips up-left
      currentAngle: ((180 - 27) * Math.PI) / 180,
      targetAngle: ((180 - 27) * Math.PI) / 180,
      angularVelocity: 0,
      isUp: false,
      upSpeed: 28,
      downSpeed: 20,
    },
  };
}

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'STAGE 1: BEACH BIKINI ARCADE',
    subtitle: 'Summer High School Pixel Art Edition',
    kanjiTitle: '常夏学園',
    scoreThreshold: 50000,
    theme: 'neon',
    backglassImage: '/src/assets/images/beach_anime_pixelart_1792443936790.jpg',
    playfieldImage: '/src/assets/images/beach_anime_pixelart_1792443936790.jpg',
    mascotName: 'SAKURA & AOI',
    bumperShape: 'circle',
    dropTargetLetters: ['N', 'E', 'O'],
    dropTargetColor: '#EC4899',
    slingshotColor: '#0284C7',
    accentColor: '#38BDF8',
    tableBgColor: '#0b1928',
    tableFeltPattern: 'grid',
    stageMission: 'Derrube os alvos N-E-O para iniciar a Festa na Praia!',
    missionRewardText: 'BEACH PARTY 2X MULTIPLIER!',
    mascotQuotes: {
      start: 'IKUZO! HIT 50,000 PTS TO CLEAR SUMMER STAGE!',
      combo: 'YATTA! BEACH COMBO STREAK!',
      drain: 'KYAA! WATCH OUT FOR THE WAVES!',
      multiball: '★ 3-BALL BEACH PARTY MULTIBALL! ★',
      stageClear: 'STAGE 1 CLEARED! HEADING TO J-HORROR SCHOOL...',
    },
  },
  {
    id: 2,
    name: 'STAGE 2: J-HORROR SCHOOL',
    subtitle: 'Haunted Grudge & Cursed Ofuda',
    kanjiTitle: '呪怨学園',
    scoreThreshold: 150000,
    theme: 'jhorror',
    backglassImage: '/src/assets/images/jhorror_backglass_art_1792338949512.jpg',
    playfieldImage: '/src/assets/images/jhorror_playfield_1792458808970.jpg',
    mascotName: 'REIKO',
    bumperShape: 'cursed_eye',
    dropTargetLetters: ['呪', '怨', '死', '霊'],
    dropTargetColor: '#DC2626',
    slingshotColor: '#7F1D1D',
    accentColor: '#EF4444',
    tableBgColor: '#120508',
    tableFeltPattern: 'talismans',
    stageMission: 'Exorcize os 4 Selos Ofuda (呪・怨・死・霊) da Sala!',
    missionRewardText: 'CURSE EXORCISED! +50.000 PTS!',
    mascotQuotes: {
      start: 'THE SCHOOL IS HAUNTED... BREAK THE CURSE AT 150,000!',
      combo: 'THE SPIRITS AWAKEN... KEEP HITTING!',
      drain: 'THE DARKNESS CONSUMED THE BALL...',
      multiball: '★ SPIRIT FRENZY! 3 CURSED BALLS! ★',
      stageClear: 'CURSE LIFTED! ADVANCING TO SAMURAI EDO...',
    },
  },
  {
    id: 3,
    name: 'STAGE 3: SAMURAI CHERRY BLOSSOM',
    subtitle: 'Feudal Blade & Torii Gate',
    kanjiTitle: '櫻花武士',
    scoreThreshold: 300000,
    theme: 'samurai',
    backglassImage: '/src/assets/images/samurai_backglass_art_1792338949761.jpg',
    playfieldImage: '/src/assets/images/samurai_playfield_1792458810307.jpg',
    mascotName: 'TOMOE',
    bumperShape: 'sakura',
    dropTargetLetters: ['侍', '刀', '桜'],
    dropTargetColor: '#E11D48',
    slingshotColor: '#B45309',
    accentColor: '#F59E0B',
    tableBgColor: '#180B0F',
    tableFeltPattern: 'sakura_petals',
    stageMission: 'Acerte os 3 Rollovers do Castelo (櫻・武・士) para a Lâmina Sagrada!',
    missionRewardText: 'SAMURAI BLADE FEVER! 3X MULTIPLIER!',
    mascotQuotes: {
      start: 'DRAW THY BLADE! REACH 300,000 FOR VICTORY!',
      combo: 'ONE STRIKE, ONE SCORE! EXCELLENT!',
      drain: 'A WARRIOR ALWAYS RISES AGAIN!',
      multiball: '★ BLADE STORM MULTIBALL! ★',
      stageClear: 'HONOR PRESERVED! ADVANCING TO SHINOBI...',
    },
  },
  {
    id: 4,
    name: 'STAGE 4: MECHA SHINOBI',
    subtitle: 'Cybernetic Shadow Ninjutsu',
    kanjiTitle: '電脳忍道',
    scoreThreshold: 500000,
    theme: 'shinobi',
    backglassImage: '/src/assets/images/shinobi_backglass_art_1792338951047.jpg',
    playfieldImage: '/src/assets/images/shinobi_playfield_1792458809537.jpg',
    mascotName: 'KASUMI',
    bumperShape: 'shuriken',
    dropTargetLetters: ['忍', '影', '斬', '刃'],
    dropTargetColor: '#06B6D4',
    slingshotColor: '#0E7490',
    accentColor: '#38BDF8',
    tableBgColor: '#04101A',
    tableFeltPattern: 'circuits',
    stageMission: 'Hackeie os terminais cibernéticos (忍・影・斬・刃) para Overdrive!',
    missionRewardText: 'CYBER OVERDRIVE! +75.000 PTS!',
    mascotQuotes: {
      start: 'STEALTH PROTOCOL ENGAGED! TARGET: 500,000 PTS!',
      combo: 'SHURIKEN ACCURACY 100%!',
      drain: 'TACTICAL RETREAT! READY NEXT SHOT!',
      multiball: '★ SHADOW CLONE MULTIBALL! ★',
      stageClear: 'MISSION COMPLETE! ENTERING THE YOKAI REALM...',
    },
  },
  {
    id: 5,
    name: 'STAGE 5: YOKAI ONI APOCALYPSE',
    subtitle: 'Demon Queen Inferno Frenzy',
    kanjiTitle: '百鬼夜行',
    scoreThreshold: 1000000,
    theme: 'yokai',
    backglassImage: '/src/assets/images/yokai_backglass_art_1792338965836.jpg',
    playfieldImage: '/src/assets/images/yokai_playfield_1792458809655.jpg',
    mascotName: 'AKANE',
    bumperShape: 'oni_skull',
    dropTargetLetters: ['鬼', '炎', '滅'],
    dropTargetColor: '#EA580C',
    slingshotColor: '#9A3412',
    accentColor: '#F97316',
    tableBgColor: '#1C0603',
    tableFeltPattern: 'magma',
    stageMission: 'Destrua os 3 Selos Demoníacos (鬼・炎・滅) para o Jackpot do Submundo!',
    missionRewardText: 'HELLFIRE JACKPOT! +150.000 PTS!',
    mascotQuotes: {
      start: 'FINAL APOCALYPSE! SURVIVE THE ONI QUEEN!',
      combo: 'INFERNO STRIKE! MAXIMUM DAMAGE!',
      drain: 'THE FLAMES HUNGER FOR MORE!',
      multiball: '★ HELLFIRE FRENZY! UNLEASH ALL BALLS! ★',
      stageClear: 'CONGRATULATIONS! YOU CONQUERED NASTY PINBALL!',
    },
  },
];

export function getStageConfig(stageId: number): StageConfig {
  const index = Math.max(0, Math.min(STAGES.length - 1, stageId - 1));
  return STAGES[index];
}

// Scenery Item format and geometry varies distinctively per stage:
export function createBumpersForStage(stageId: number = 1): JetBumper[] {
  const cfg = getStageConfig(stageId);

  if (cfg.theme === 'jhorror') {
    // Stage 2 J-HORROR: 4 Cursed Eye Bumpers arranged in an occult diamond ritual
    return [
      { id: 1, x: 250, y: 220, radius: 32, score: 700, lit: false, hitTimer: 0, color: '#EF4444' },
      { id: 2, x: 440, y: 220, radius: 32, score: 700, lit: false, hitTimer: 0, color: '#DC2626' },
      { id: 3, x: 345, y: 310, radius: 38, score: 1000, lit: false, hitTimer: 0, color: '#DC2626' },
      { id: 4, x: 345, y: 430, radius: 34, score: 1500, lit: false, hitTimer: 0, color: '#B91C1C' },
    ];
  }

  if (cfg.theme === 'samurai') {
    // Stage 3 SAMURAI: 3 Sakura Blossom Crest Bumpers in a broad defensive arc
    return [
      { id: 1, x: 220, y: 290, radius: 38, score: 800, lit: false, hitTimer: 0, color: '#FB7185' },
      { id: 2, x: 350, y: 230, radius: 44, score: 1800, lit: false, hitTimer: 0, color: '#F59E0B' },
      { id: 3, x: 480, y: 290, radius: 38, score: 800, lit: false, hitTimer: 0, color: '#FB7185' },
    ];
  }

  if (cfg.theme === 'shinobi') {
    // Stage 4 MECHA SHINOBI: 4 Shuriken Star Bumpers in stealth corridor zig-zag
    return [
      { id: 1, x: 230, y: 250, radius: 34, score: 1000, lit: false, hitTimer: 0, color: '#06B6D4' },
      { id: 2, x: 470, y: 250, radius: 34, score: 1000, lit: false, hitTimer: 0, color: '#06B6D4' },
      { id: 3, x: 310, y: 370, radius: 36, score: 1500, lit: false, hitTimer: 0, color: '#38BDF8' },
      { id: 4, x: 390, y: 370, radius: 36, score: 1500, lit: false, hitTimer: 0, color: '#38BDF8' },
    ];
  }

  if (cfg.theme === 'yokai') {
    // Stage 5 YOKAI ONI: 3 Inferno Demon Bumpers featuring a massive center Boss Skull Core
    return [
      { id: 1, x: 210, y: 270, radius: 36, score: 2000, lit: false, hitTimer: 0, color: '#F97316' },
      { id: 2, x: 350, y: 330, radius: 50, score: 5000, lit: false, hitTimer: 0, color: '#EF4444' },
      { id: 3, x: 490, y: 270, radius: 36, score: 2000, lit: false, hitTimer: 0, color: '#FBBF24' },
    ];
  }

  // Stage 1 NEON BEACH: 3 classic glowing round beach ball bumpers
  return [
    { id: 1, x: 260, y: 280, radius: 36, score: 500, lit: false, hitTimer: 0, color: '#EC4899' },
    { id: 2, x: 440, y: 280, radius: 36, score: 500, lit: false, hitTimer: 0, color: '#06B6D4' },
    { id: 3, x: 350, y: 395, radius: 38, score: 1000, lit: false, hitTimer: 0, color: '#FBBF24' },
  ];
}

export function createDropTargetsForStage(stageId: number = 1): DropTarget[] {
  const cfg = getStageConfig(stageId);
  const letters = cfg.dropTargetLetters;
  
  // Format varies: 3 or 4 targets with custom dimensions
  if (letters.length === 4) {
    return [
      { id: 1, letter: letters[0], x: 76, y: 360, width: 32, height: 18, isDown: false, downTimer: 0 },
      { id: 2, letter: letters[1], x: 76, y: 405, width: 32, height: 18, isDown: false, downTimer: 0 },
      { id: 3, letter: letters[2], x: 76, y: 450, width: 32, height: 18, isDown: false, downTimer: 0 },
      { id: 4, letter: letters[3], x: 76, y: 495, width: 32, height: 18, isDown: false, downTimer: 0 },
    ];
  }

  // 3 targets bank
  return [
    { id: 1, letter: letters[0], x: 78, y: 385, width: 32, height: 20, isDown: false, downTimer: 0 },
    { id: 2, letter: letters[1], x: 78, y: 435, width: 32, height: 20, isDown: false, downTimer: 0 },
    { id: 3, letter: letters[2], x: 78, y: 485, width: 32, height: 20, isDown: false, downTimer: 0 },
  ];
}

export function createRolloverLanesForStage(stageId: number = 1): RolloverLane[] {
  const kanjiMap: Record<number, string[]> = {
    1: ['A', 'B', 'C'],
    2: ['怨', '呪', '霊'],
    3: ['櫻', '武', '士'],
    4: ['忍', '術', '影'],
    5: ['鬼', '炎', '滅'],
  };
  const letters = kanjiMap[stageId] || ['A', 'B', 'C'];
  return [
    { id: 1, letter: letters[0], x: 260, y: 130, width: 36, height: 40, lit: false, score: 500 },
    { id: 2, letter: letters[1], x: 350, y: 130, width: 36, height: 40, lit: false, score: 500 },
    { id: 3, letter: letters[2], x: 440, y: 130, width: 36, height: 40, lit: false, score: 500 },
  ];
}

export function createSlingshotsForStage(stageId: number = 1): Slingshot[] {
  const restitutionMap: Record<number, number> = {
    1: 1.45,
    2: 1.55,
    3: 1.40,
    4: 1.60,
    5: 1.65,
  };
  const rest = restitutionMap[stageId] || 1.45;
  return [
    {
      id: 1,
      p1: { x: 175, y: 690 },
      p2: { x: 220, y: 785 },
      p3: { x: 175, y: 785 },
      normal: normalize({ x: 0.85, y: -0.52 }),
      hitTimer: 0,
      restitution: rest,
      score: 250,
    },
    {
      id: 2,
      p1: { x: 525, y: 690 },
      p2: { x: 480, y: 785 },
      p3: { x: 525, y: 785 },
      normal: normalize({ x: -0.85, y: -0.52 }),
      hitTimer: 0,
      restitution: rest,
      score: 250,
    },
  ];
}

export function createBumpers(): JetBumper[] {
  return createBumpersForStage(1);
}

export function createDropTargets(): DropTarget[] {
  return createDropTargetsForStage(1);
}

export function createRolloverLanes(): RolloverLane[] {
  return [
    { id: 1, letter: 'A', x: 260, y: 130, width: 36, height: 40, lit: false, score: 500 },
    { id: 2, letter: 'B', x: 350, y: 130, width: 36, height: 40, lit: false, score: 500 },
    { id: 3, letter: 'C', x: 440, y: 130, width: 36, height: 40, lit: false, score: 500 },
  ];
}

export function createSlingshots(): Slingshot[] {
  return [
    {
      id: 1,
      p1: { x: 175, y: 690 },
      p2: { x: 220, y: 785 },
      p3: { x: 175, y: 785 },
      normal: normalize({ x: 0.85, y: -0.52 }),
      hitTimer: 0,
      restitution: 1.45,
      score: 250,
    },
    {
      id: 2,
      p1: { x: 525, y: 690 },
      p2: { x: 480, y: 785 },
      p3: { x: 525, y: 785 },
      normal: normalize({ x: -0.85, y: -0.52 }),
      hitTimer: 0,
      restitution: 1.45,
      score: 250,
    },
  ];
}

// Generate fully sealed perimeter walls, plunger lane, arch, and stage-specific interior geometry
export function createWallsForStage(stageId: number = 1): WallSegment[] {
  const walls: WallSegment[] = [];

  function addSegment(x1: number, y1: number, x2: number, y2: number, restitution = 0.6, friction = 0.08, isGate = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
    const nx = -dy / len;
    const ny = dx / len;
    walls.push({
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      normal: { x: nx, y: ny },
      length: len,
      restitution,
      friction,
      isGate,
      gateOpen: true,
    });
  }

  // 1. Plunger Lane (Right edge)
  addSegment(665, 930, 665, 230, 0.55);
  addSegment(620, 930, 665, 930, 0.4);
  addSegment(620, 255, 620, 930, 0.55);

  // 2. Continuous Top Arch (Smooth 16-segment dome enclosing the top)
  const arch = [
    { x: 665, y: 230 },
    { x: 660, y: 170 },
    { x: 642, y: 115 },
    { x: 605, y: 70 },
    { x: 550, y: 40 },
    { x: 485, y: 24 },
    { x: 420, y: 18 },
    { x: 350, y: 16 },
    { x: 280, y: 18 },
    { x: 215, y: 24 },
    { x: 150, y: 40 },
    { x: 95, y: 70 },
    { x: 58, y: 115 },
    { x: 40, y: 170 },
    { x: 35, y: 230 },
  ];
  for (let i = 0; i < arch.length - 1; i++) {
    addSegment(arch[i].x, arch[i].y, arch[i + 1].x, arch[i + 1].y, 0.72, 0.01);
  }

  // 3. One-way Gate at top of plunger lane
  addSegment(665, 240, 620, 240, 0.4, 0.05, true);

  // 4. Left Outer Wall
  addSegment(35, 230, 35, 690, 0.6);

  // 5. Left Outlane Outer Guide
  addSegment(35, 690, 65, 830, 0.55);
  addSegment(65, 830, 65, 915, 0.45);

  // 6. Left Divider (Separates Left Outlane and Left Inlane)
  addSegment(105, 665, 105, 785, 0.55);
  addSegment(105, 785, 115, 825, 0.55);

  // 7. Left Inlane Inner Guide (feeds into Left Flipper)
  addSegment(145, 675, 175, 785, 0.6);
  addSegment(175, 785, 215, 825, 0.6);

  // 8. Right Inlane Inner Guide (feeds into Right Flipper)
  addSegment(555, 675, 525, 785, 0.6);
  addSegment(525, 785, 485, 825, 0.6);

  // 9. Right Divider (Separates Right Inlane and Right Outlane)
  addSegment(595, 665, 595, 785, 0.55);
  addSegment(595, 785, 585, 825, 0.55);

  // 10. Right Outlane Outer Guide
  addSegment(620, 690, 620, 830, 0.55);
  addSegment(620, 830, 620, 915, 0.45);

  // 11. Top Rollover Dividers
  addSegment(305, 75, 305, 170, 0.55);
  addSegment(395, 75, 395, 170, 0.55);

  // 12. Ball Lock Scoop Left Guide Walls
  addSegment(35, 330, 85, 330, 0.55);
  addSegment(85, 330, 105, 360, 0.55);

  // 13. STAGE-SPECIFIC INTERIOR OBSTACLES & GEOMETRY
  if (stageId === 2) {
    // Stage 2 J-HORROR: Asymmetrical haunted school hallway & spirit alcove
    addSegment(315, 280, 375, 280, 0.7); // Cursed classroom desk barrier
    addSegment(480, 350, 535, 400, 0.65); // Jagged haunted locker
    addSegment(535, 400, 505, 460, 0.65);
    addSegment(110, 190, 185, 150, 0.6);
  } else if (stageId === 3) {
    // Stage 3 SAMURAI: Dual Pagoda Eaves and Torii Gate funnel
    addSegment(130, 240, 210, 200, 0.68); // Left Pagoda roof
    addSegment(490, 200, 570, 240, 0.68); // Right Pagoda roof
    addSegment(165, 570, 200, 625, 0.6);  // Katana deflection rail left
    addSegment(535, 570, 500, 625, 0.6);  // Katana deflection rail right
  } else if (stageId === 4) {
    // Stage 4 MECHA SHINOBI: Cyberpunk twin vertical high-speed circuit rails
    addSegment(215, 305, 215, 435, 0.75); // Left cyber rail
    addSegment(485, 305, 485, 435, 0.75); // Right cyber rail
    addSegment(320, 230, 380, 230, 0.7);  // Center ninja leap deflector
  } else if (stageId === 5) {
    // Stage 5 YOKAI ONI: Magma funnel cracks & Demon Hellgate baffle
    addSegment(140, 350, 225, 440, 0.7); // Left magma crag
    addSegment(560, 350, 475, 440, 0.7); // Right magma crag
    addSegment(300, 530, 400, 530, 0.75); // Hellgate cross baffle
    addSegment(105, 190, 180, 150, 0.6);
    addSegment(520, 150, 595, 190, 0.6);
  } else {
    // Stage 1 BEACH: Smooth open-orbit corner deflectors
    addSegment(105, 190, 180, 150, 0.6);
    addSegment(520, 150, 595, 190, 0.6);
  }

  return walls;
}

export function createTableWalls(): WallSegment[] {
  return createWallsForStage(1);
}

// Wireform Ramp Path
export const RAMP_PATH: Vector2D[] = [
  { x: 485, y: 530 },
  { x: 495, y: 400 },
  { x: 480, y: 260 },
  { x: 420, y: 160 },
  { x: 350, y: 140 },
  { x: 260, y: 150 },
  { x: 160, y: 220 },
  { x: 130, y: 340 },
  { x: 125, y: 500 },
  { x: 125, y: 650 },
  { x: 135, y: 760 },
];

export function normalize(v: Vector2D): Vector2D {
  const len = Math.hypot(v.x, v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

export function dot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function distSq(a: Vector2D, b: Vector2D): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
