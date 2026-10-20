/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Vector2D,
  Ball,
  WallSegment,
  JetBumper,
  DropTarget,
  Slingshot,
  RolloverLane,
  Flipper,
  Particle,
  ScorePopup,
  GameStats,
} from './types.ts';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS,
  GRAVITY,
  MAX_BALL_SPEED,
  RAMP_PATH,
} from './tableLayout.ts';
import { soundEngine } from './sound.ts';

export class PinballPhysics {
  public balls: Ball[] = [];
  public particles: Particle[] = [];
  public popups: ScorePopup[] = [];
  public nextBallId: number = 1;
  public cameraShake: number = 0;

  // Plunger state
  public plungerTension: number = 0; // 0 to 1
  public isPlungerCharging: boolean = false;

  constructor() {}

  public spawnBall(x: number = 642, y: number = 860, vx: number = 0, vy: number = 0): Ball {
    const ball: Ball = {
      id: this.nextBallId++,
      x,
      y,
      vx,
      vy,
      radius: BALL_RADIUS,
      mass: 1.0,
      active: true,
      trail: [],
      inRamp: false,
      rampProgress: 0,
      rampSpeed: 0.024,
      locked: false,
    };
    this.balls.push(ball);
    return ball;
  }

  public chargePlunger(dt: number) {
    if (this.isPlungerCharging) {
      this.plungerTension = Math.min(1.0, this.plungerTension + dt * 1.5);
    }
  }

  public releasePlunger(stats: GameStats) {
    if (this.plungerTension > 0.05) {
      const power = this.plungerTension;
      // Find ball in plunger lane (x > 615, y > 650)
      for (const ball of this.balls) {
        if (ball.active && !ball.inRamp && ball.x > 615 && ball.y > 650) {
          // Strong launch up to -2000 px/s at 100% tension to cleanly summit the top arch
          ball.vy = -1250 - power * 800;
          ball.vx = 0;
          soundEngine.playPlungerLaunch(power, stats.currentStage);
          stats.skillShotReady = true;
          this.addParticles(ball.x, ball.y, 12, '#F59E0B');
          break;
        }
      }
    }
    this.plungerTension = 0;
    this.isPlungerCharging = false;
  }

  public nudge(dir: 'left' | 'right' | 'up', stats: GameStats) {
    if (stats.isTilted) return;

    stats.tiltWarnings++;
    this.cameraShake = 6;
    soundEngine.playTiltWarning();

    if (stats.tiltWarnings >= 3) {
      stats.isTilted = true;
      stats.mascotMood = 'SHOCK';
      stats.mascotMessage = 'TILT! FLIPPERS DEAD!';
      stats.mascotTimer = 3.0;
      this.addPopup('TILT!', TABLE_WIDTH / 2, TABLE_HEIGHT / 2, '#EF4444');
      return;
    }

    const impulseX = dir === 'left' ? -90 : dir === 'right' ? 90 : 0;
    const impulseY = dir === 'up' ? -100 : -30;

    for (const ball of this.balls) {
      if (ball.active && !ball.inRamp) {
        ball.vx += impulseX;
        ball.vy += impulseY;
      }
    }
  }

  public addPopup(text: string, x: number, y: number, color: string = '#FBBF24') {
    this.popups.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      life: 0,
    });
  }

  public addParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3,
        alpha: 1.0,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.2,
        type: 'spark',
      });
    }
  }

  // Bumper Explosion: Dual expanding shockwaves, 30 laser sparks, core flash, and rotating anime stars
  public triggerBumperExplosion(
    x: number,
    y: number,
    color: string,
    hitX?: number,
    hitY?: number,
    radius: number = 36
  ) {
    const originX = hitX ?? x;
    const originY = hitY ?? y;

    // 1. Central Flash Core
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#FFFFFF',
      secondaryColor: color,
      size: radius * 0.7,
      alpha: 0.95,
      life: 0,
      maxLife: 0.16,
      type: 'flash',
      growth: 70,
    });

    // 2. Primary Expanding Shockwave Ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: color,
      secondaryColor: '#FFFFFF',
      size: radius * 0.5,
      alpha: 1.0,
      life: 0,
      maxLife: 0.38,
      type: 'ring',
      growth: 175,
    });

    // Secondary Rapid White Ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#FFFFFF',
      size: radius * 0.3,
      alpha: 0.85,
      life: 0,
      maxLife: 0.26,
      type: 'ring',
      growth: 210,
    });

    // 3. Radial High-Speed Sparks (30 particles)
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.25;
      const speed = 180 + Math.random() * 300;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.35 ? color : '#FFFFFF',
        size: 2.5 + Math.random() * 2.5,
        alpha: 1.0,
        life: 0,
        maxLife: 0.32 + Math.random() * 0.25,
        type: 'spark',
      });
    }

    // 4. 90s Anime Star Sparkles (8 particles)
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 140;
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#FBBF24' : '#F43F5E',
        size: 6 + Math.random() * 6,
        alpha: 1.0,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 14,
      });
    }
  }

  // Drop Target Explosion: Mechanical target shatter debris, impact shockwave, sparks, and stars
  public triggerDropTargetExplosion(
    x: number,
    y: number,
    width: number,
    height: number,
    letter: string,
    color: string = '#F43F5E'
  ) {
    const cx = x + width / 2;
    const cy = y + height / 2;

    // 1. Expanding Impact Ring
    this.particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      color: color,
      size: 8,
      alpha: 0.95,
      life: 0,
      maxLife: 0.3,
      type: 'ring',
      growth: 150,
    });

    // 2. Mechanical Target Shatter Debris (14 fragments that tumble with gravity)
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * width,
        y: cy + (Math.random() - 0.5) * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,
        color: Math.random() > 0.4 ? color : '#FDA4AF',
        size: 4 + Math.random() * 3,
        width: 4 + Math.random() * 4,
        height: 3 + Math.random() * 4,
        alpha: 1.0,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.3,
        type: 'debris',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 16,
      });
    }

    // 3. Energetic Sparks (22 sparks)
    for (let i = 0; i < 22; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const speed = 130 + Math.random() * 240;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? '#FDE047' : '#FFFFFF',
        size: 2 + Math.random() * 2.5,
        alpha: 1.0,
        life: 0,
        maxLife: 0.28 + Math.random() * 0.2,
        type: 'spark',
      });
    }

    // 4. Sparkle Stars (6 stars)
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 110;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FBBF24',
        size: 6 + Math.random() * 5,
        alpha: 1.0,
        life: 0,
        maxLife: 0.42 + Math.random() * 0.2,
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }
  }

  // Target Bank Reset / Combo Celebration: Multicolored fireworks explosion
  public triggerBankResetCelebration(x: number, y: number) {
    const colors = ['#10B981', '#38BDF8', '#F43F5E', '#FBBF24', '#D946EF'];
    for (let r = 0; r < 3; r++) {
      this.particles.push({
        x,
        y: y + (r - 1) * 35,
        vx: 0,
        vy: 0,
        color: colors[r % colors.length],
        size: 15,
        alpha: 1.0,
        life: 0,
        maxLife: 0.45,
        type: 'ring',
        growth: 160 + r * 45,
      });
    }

    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 300;
      this.particles.push({
        x,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 3,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        type: 'spark',
      });
    }

    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y: y + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FBBF24',
        size: 7 + Math.random() * 7,
        alpha: 1.0,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }
  }

  // Slingshot Explosion
  public triggerSlingshotExplosion(x: number, y: number, normal: Vector2D) {
    const baseAngle = Math.atan2(normal.y, normal.x);
    for (let i = 0; i < 18; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 1.3;
      const speed = 130 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.35 ? '#38BDF8' : '#FFFFFF',
        size: 2.5 + Math.random() * 2,
        alpha: 1.0,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.2,
        type: 'spark',
      });
    }

    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#38BDF8',
      size: 8,
      alpha: 0.9,
      life: 0,
      maxLife: 0.24,
      type: 'ring',
      growth: 130,
    });
  }

  // Grand Stage Clear Particle Firework Celebration
  public triggerStageClearExplosion(accentColor: string = '#F59E0B') {
    this.cameraShake = 12;
    // Radial rings and star bursts across multiple points on the table
    const bursts = [
      { x: 350, y: 300 },
      { x: 250, y: 220 },
      { x: 450, y: 220 },
      { x: 350, y: 480 },
    ];

    bursts.forEach((b) => {
      this.particles.push({
        x: b.x,
        y: b.y,
        vx: 0,
        vy: 0,
        color: accentColor,
        size: 14,
        alpha: 1.0,
        life: 0,
        maxLife: 0.6,
        type: 'ring',
        growth: 260,
      });

      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * 280;
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? accentColor : '#FFFFFF',
          size: 3 + Math.random() * 3,
          alpha: 1.0,
          life: 0,
          maxLife: 0.5 + Math.random() * 0.4,
          type: 'spark',
        });
      }

      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 140;
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#FDE047',
          size: 8 + Math.random() * 6,
          alpha: 1.0,
          life: 0,
          maxLife: 0.7 + Math.random() * 0.4,
          type: 'star',
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 12,
        });
      }
    });
  }

  // 14 sub-steps per frame: each sub-step moves < 1.5 pixels, completely eliminating tunneling!
  public update(
    dt: number,
    leftFlipper: Flipper,
    rightFlipper: Flipper,
    bumpers: JetBumper[],
    dropTargets: DropTarget[],
    slingshots: Slingshot[],
    rollovers: RolloverLane[],
    walls: WallSegment[],
    stats: GameStats,
    onScore: (pts: number) => void
  ) {
    const clampedDt = Math.min(dt, 0.05);
    const subSteps = 14;
    const subDt = clampedDt / subSteps;

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - clampedDt * 18);
    }

    // Drop target bank reset logic & Stage Missions
    const allTargetsDown = dropTargets.every((t) => t.isDown);
    if (allTargetsDown) {
      let readyToReset = true;
      for (const t of dropTargets) {
        t.downTimer += clampedDt;
        if (t.downTimer < 1.2) readyToReset = false;
      }
      if (readyToReset) {
        dropTargets.forEach((t) => {
          t.isDown = false;
          t.downTimer = 0;
        });

        // Stage-Specific Mission Completions & Progression Rewards
        if (stats.currentStage === 1) {
          stats.multiplier = Math.min(5, stats.multiplier + 1);
          stats.missionCompleted = true;
          stats.missionProgress = '100% - CONCLUÍDA!';
          onScore(30000);
          soundEngine.playMissionComplete();
          this.addPopup('🏖️ BEACH PARTY! 2X MULTI! +30K', TABLE_WIDTH / 2, 400, '#38BDF8');
          this.triggerStageClearExplosion('#38BDF8');
          stats.mascotMood = 'HAPPY';
          stats.mascotMessage = 'YATTA! BEACH PARTY MULTIPLIER UP!';
          stats.mascotTimer = 2.5;
        } else if (stats.currentStage === 2) {
          stats.multiplier = Math.min(5, stats.multiplier + 1);
          stats.missionCompleted = true;
          stats.missionProgress = '100% - EXORCIZADO!';
          onScore(50000);
          soundEngine.playMissionComplete();
          this.addPopup('👻 CURSE EXORCISED! +50K', TABLE_WIDTH / 2, 400, '#EF4444');
          this.triggerStageClearExplosion('#EF4444');
          stats.mascotMood = 'EXCITED';
          stats.mascotMessage = 'THE SPIRITS ARE PURIFIED!';
          stats.mascotTimer = 2.5;
        } else if (stats.currentStage === 4) {
          stats.multiplier = Math.min(5, stats.multiplier + 1);
          stats.missionCompleted = true;
          stats.missionProgress = '100% - OVERDRIVE!';
          onScore(75000);
          soundEngine.playMissionComplete();
          this.addPopup('⚡ CYBER OVERDRIVE! +75K', TABLE_WIDTH / 2, 400, '#06B6D4');
          this.triggerStageClearExplosion('#06B6D4');
          stats.mascotMood = 'FEVER';
          stats.mascotMessage = 'CYBER SYSTEM OVERDRIVE ACTIVE!';
          stats.mascotTimer = 2.5;
        } else if (stats.currentStage === 5) {
          stats.multiplier = Math.min(5, stats.multiplier + 2);
          stats.missionCompleted = true;
          stats.missionProgress = '100% - JACKPOT!';
          onScore(150000);
          soundEngine.playMissionComplete();
          this.addPopup('👹 DEMONIC JACKPOT! +150K', TABLE_WIDTH / 2, 400, '#F97316');
          this.triggerStageClearExplosion('#F97316');
          stats.mascotMood = 'FEVER';
          stats.mascotMessage = 'ONI QUEEN SEALS SHATTERED!';
          stats.mascotTimer = 3.0;
        } else {
          soundEngine.playBankReset();
          stats.multiplier = Math.min(5, stats.multiplier + 1);
          onScore(25000);
          this.addPopup(`BANK RESET! ${stats.multiplier}X MULTI!`, 140, 440, '#10B981');
          this.triggerBankResetCelebration(140, 440);
          stats.mascotMood = 'HAPPY';
          stats.mascotMessage = 'SUGOI! COMBO MULTIPLIER UP!';
          stats.mascotTimer = 2.0;
        }
      }
    }

    // Flipper angular kinematics update
    this.updateFlipper(leftFlipper, clampedDt, stats.isTilted);
    this.updateFlipper(rightFlipper, clampedDt, stats.isTilted);

    // Bumpers hit timer decay
    for (const b of bumpers) {
      if (b.hitTimer > 0) {
        b.hitTimer = Math.max(0, b.hitTimer - clampedDt * 4);
      }
    }
    // Slingshots hit timer decay
    for (const s of slingshots) {
      if (s.hitTimer > 0) {
        s.hitTimer = Math.max(0, s.hitTimer - clampedDt * 5);
      }
    }

    // Sub-step loop
    for (let step = 0; step < subSteps; step++) {
      for (let i = this.balls.length - 1; i >= 0; i--) {
        const ball = this.balls[i];
        if (!ball.active) continue;

        // 1. Ramp wireform travel
        if (ball.inRamp) {
          ball.rampProgress += ball.rampSpeed * (subDt / 0.016);
          if (ball.rampProgress >= 1.0) {
            const exit = RAMP_PATH[RAMP_PATH.length - 1];
            ball.x = exit.x;
            ball.y = exit.y;
            ball.vx = 30;
            ball.vy = 260; // Clean downward drop into left inlane
            ball.inRamp = false;
            ball.rampProgress = 0;
            this.addParticles(exit.x, exit.y, 8, '#38BDF8');
          } else {
            const pos = getSplinePoint(RAMP_PATH, ball.rampProgress);
            ball.x = pos.x;
            ball.y = pos.y;
          }
          continue;
        }

        // 2. Integration: Gravity and Resistance (softened acceleration for better control)
        ball.vy += GRAVITY * subDt;
        ball.vx *= 0.99972;
        ball.vy *= 0.99972;

        // Terminal velocity clamp
        const speed = Math.hypot(ball.vx, ball.vy);
        if (speed > MAX_BALL_SPEED) {
          ball.vx = (ball.vx / speed) * MAX_BALL_SPEED;
          ball.vy = (ball.vy / speed) * MAX_BALL_SPEED;
        }

        ball.x += ball.vx * subDt;
        ball.y += ball.vy * subDt;

        // Motion trail
        if (step === 0) {
          ball.trail.push({ x: ball.x, y: ball.y });
          if (ball.trail.length > 8) ball.trail.shift();
        }

        // 3. Ramp Entrance Sensor (x=485, y=530)
        if (ball.vy < -140 && Math.hypot(ball.x - 485, ball.y - 530) < 28) {
          ball.inRamp = true;
          ball.rampProgress = 0;
          ball.rampSpeed = 0.024;
          soundEngine.playRampWhoosh();
          onScore(15000);
          this.addPopup('COSMIC RAMP! +15K', 485, 480, '#38BDF8');
          this.addParticles(485, 530, 14, '#06B6D4');
          stats.comboCount++;
          if (stats.comboCount >= 3) {
            stats.mascotMood = 'EXCITED';
            stats.mascotMessage = `RAMP COMBO X${stats.comboCount}!`;
            stats.mascotTimer = 2.0;
          }
          continue;
        }

        // 4. Ball Lock Scoop Sensor (Left side at x=65, y=335)
        if (
          !stats.isMultiball &&
          ball.x > 45 &&
          ball.x < 95 &&
          ball.y > 315 &&
          ball.y < 355 &&
          ball.vy > 0
        ) {
          ball.active = false;
          stats.lockedBalls++;
          soundEngine.playBallLock();
          this.addParticles(ball.x, ball.y, 20, '#EC4899');

          if (stats.lockedBalls >= 3) {
            stats.isMultiball = true;
            stats.multiballTimer = 25.0;
            stats.mascotMood = 'FEVER';
            stats.mascotMessage = '★ 3-BALL MULTIBALL FRENZY! ★';
            stats.mascotTimer = 4.0;
            soundEngine.playMultiballSiren();
            this.cameraShake = 14;
            this.addPopup('★★★ MULTIBALL FRENZY! ★★★', TABLE_WIDTH / 2, 450, '#F43F5E');

            this.balls = [];
            this.spawnBall(260, 200, 110, 160);
            this.spawnBall(440, 200, -110, 160);
            this.spawnBall(350, 240, 0, 200);
          } else {
            stats.mascotMood = 'HAPPY';
            stats.mascotMessage = `BALL ${stats.lockedBalls} LOCKED!`;
            stats.mascotTimer = 2.5;
            this.addPopup(`BALL ${stats.lockedBalls} LOCKED!`, 120, 330, '#F59E0B');
            this.spawnBall(642, 860, 0, 0);
          }
          continue;
        }

        // 5. Jet Bumpers Contact
        for (const bumper of bumpers) {
          const dx = ball.x - bumper.x;
          const dy = ball.y - bumper.y;
          const dist = Math.hypot(dx, dy);
          const minDist = bumper.radius + ball.radius;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate cleanly
            ball.x = bumper.x + nx * minDist;
            ball.y = bumper.y + ny * minDist;

            const normalVel = ball.vx * nx + ball.vy * ny;
            if (normalVel < 0) {
              // Active repulsion impulse (moderated for balanced acceleration)
              const kickSpeed = -normalVel * 1.18 + 220;
              ball.vx += nx * kickSpeed;
              ball.vy += ny * kickSpeed;

              bumper.hitTimer = 1.0;
              this.cameraShake = Math.max(this.cameraShake, 5);
              soundEngine.playBumperHit(bumper.id === 3 ? 1.25 : 1.0);
              onScore(bumper.score);
              this.addPopup(`+${bumper.score}`, bumper.x, bumper.y - 20, bumper.color);
              this.triggerBumperExplosion(
                bumper.x,
                bumper.y,
                bumper.color,
                bumper.x + nx * bumper.radius,
                bumper.y + ny * bumper.radius,
                bumper.radius
              );

              if (Math.random() < 0.3) {
                stats.mascotMood = 'HAPPY';
                stats.mascotMessage = 'NICE BOUNCE!';
                stats.mascotTimer = 1.2;
              }
            }
          }
        }

        // 6. Slingshots Contact
        for (const sling of slingshots) {
          const res = pointToSegmentDistance({ x: ball.x, y: ball.y }, sling.p1, sling.p2);
          if (res.dist < ball.radius) {
            // Normal pointing directly away from the slingshot face towards ball
            let nx = res.dist > 0.001 ? (ball.x - res.closest.x) / res.dist : sling.normal.x;
            let ny = res.dist > 0.001 ? (ball.y - res.closest.y) / res.dist : sling.normal.y;

            // Ensure normal points outward along slingshot face
            if (nx * sling.normal.x + ny * sling.normal.y < 0) {
              nx = sling.normal.x;
              ny = sling.normal.y;
            }

            // Separate
            const overlap = ball.radius - res.dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            const vDotN = ball.vx * nx + ball.vy * ny;
            if (vDotN < 0) {
              const kick = -vDotN * sling.restitution + 200;
              ball.vx += nx * kick;
              ball.vy += ny * kick;

              sling.hitTimer = 1.0;
              soundEngine.playSlingshot();
              onScore(sling.score);
              this.addPopup(`+${sling.score}`, (sling.p1.x + sling.p2.x) / 2, (sling.p1.y + sling.p2.y) / 2, '#38BDF8');
              this.triggerSlingshotExplosion(res.closest.x, res.closest.y, sling.normal);
            }
          }
        }

        // 7. Drop Targets Contact
        for (const target of dropTargets) {
          if (!target.isDown) {
            const closestX = Math.max(target.x, Math.min(ball.x, target.x + target.width));
            const closestY = Math.max(target.y, Math.min(ball.y, target.y + target.height));
            const dX = ball.x - closestX;
            const dY = ball.y - closestY;
            const dist = Math.hypot(dX, dY);

            if (dist < ball.radius) {
              target.isDown = true;
              target.downTimer = 0;
              soundEngine.playDropTarget();
              onScore(5000);
              this.addPopup(`TARGET '${target.letter}' +5K`, target.x + target.width + 10, target.y, '#F43F5E');
              this.triggerDropTargetExplosion(target.x, target.y, target.width, target.height, target.letter, '#F43F5E');

              if (dist > 0.001) {
                const nx = dX / dist;
                const ny = dY / dist;
                ball.x = closestX + nx * ball.radius;
                ball.y = closestY + ny * ball.radius;
                const vDotN = ball.vx * nx + ball.vy * ny;
                if (vDotN < 0) {
                  ball.vx -= 1.6 * vDotN * nx;
                  ball.vy -= 1.6 * vDotN * ny;
                }
              }
            }
          }
        }

        // 8. Rollover Lanes Contact
        for (const lane of rollovers) {
          if (
            ball.x > lane.x - lane.width / 2 &&
            ball.x < lane.x + lane.width / 2 &&
            ball.y > lane.y - lane.height / 2 &&
            ball.y < lane.y + lane.height / 2
          ) {
            if (!lane.lit) {
              lane.lit = true;
              soundEngine.playRollover();
              onScore(lane.score);
              this.addPopup(`LANE ${lane.letter}!`, lane.x, lane.y - 20, '#FBBF24');
              this.addParticles(lane.x, lane.y, 6, '#FBBF24');

              if (rollovers.every((l) => l.lit)) {
                rollovers.forEach((l) => (l.lit = false));
                if (stats.currentStage === 3) {
                  stats.multiplier = Math.min(5, stats.multiplier + 2);
                  stats.missionCompleted = true;
                  stats.missionProgress = '100% - CONCLUÍDA!';
                  onScore(50000);
                  soundEngine.playMissionComplete();
                  this.addPopup('⚔️ SAMURAI BLADE FEVER! 3X! +50K', TABLE_WIDTH / 2, 120, '#F59E0B');
                  this.triggerStageClearExplosion('#F59E0B');
                  stats.mascotMood = 'EXCITED';
                  stats.mascotMessage = 'THE SACRED BLADE HAS AWAKENED!';
                  stats.mascotTimer = 2.5;
                } else {
                  soundEngine.playBankReset();
                  stats.multiplier = Math.min(5, stats.multiplier + 1);
                  onScore(15000);
                  this.addPopup(`ALL LANES! ${stats.multiplier}X`, TABLE_WIDTH / 2, 120, '#F59E0B');
                }
              }
            }
          }
        }

        // 9. Flippers Contact Resolution
        this.resolveFlipperCollision(ball, leftFlipper);
        this.resolveFlipperCollision(ball, rightFlipper);

        // 10. Table Walls & Guides Contact
        for (const wall of walls) {
          // One-way shooter gate
          if (wall.isGate) {
            // If ball is launching upwards, pass through freely!
            if (ball.vy < 0) {
              continue;
            }
          }

          const res = pointToSegmentDistance({ x: ball.x, y: ball.y }, wall.p1, wall.p2);
          if (res.dist < ball.radius) {
            // Normal pointing directly away from closest point towards ball center
            let nx = 0;
            let ny = 0;
            if (res.dist > 0.0001) {
              nx = (ball.x - res.closest.x) / res.dist;
              ny = (ball.y - res.closest.y) / res.dist;
            } else {
              // Exact overlap fallback: use wall inward normal
              nx = wall.normal.x;
              ny = wall.normal.y;
            }

            // Push ball out along contact normal
            const overlap = ball.radius - res.dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity along contact normal
            const vDotN = ball.vx * nx + ball.vy * ny;
            if (vDotN < 0) {
              const restitution = wall.restitution;
              const normalImpulse = -(1 + restitution) * vDotN;
              ball.vx += nx * normalImpulse;
              ball.vy += ny * normalImpulse;

              // Tangential friction
              const tx = -ny;
              const ty = nx;
              const vDotT = ball.vx * tx + ball.vy * ty;
              ball.vx -= tx * vDotT * wall.friction;
              ball.vy -= ty * vDotT * wall.friction;
            }
          }
        }

        // 11. ABSOLUTE HARD CABINET BOUNDARY ENVELOPE (FAIL-SAFE CAGE)
        // The ball CAN NEVER escape the outer cabinet walls!
        const MIN_X = 35 + ball.radius;
        const MAX_X = 665 - ball.radius;
        const MIN_Y = 18 + ball.radius;

        // Left wall clamp
        if (ball.x < MIN_X) {
          ball.x = MIN_X;
          ball.vx = Math.abs(ball.vx) * 0.6;
        }
        // Right outer wall clamp
        if (ball.x > MAX_X) {
          ball.x = MAX_X;
          ball.vx = -Math.abs(ball.vx) * 0.6;
        }
        // Top arch apex clamp
        if (ball.y < MIN_Y) {
          ball.y = MIN_Y;
          ball.vy = Math.abs(ball.vy) * 0.6;
        }

        // Bottom plunger stop: ball in shooter lane cannot drop below y=915
        if (ball.x >= 615 && ball.y > 905) {
          ball.y = 905;
          ball.vy = Math.min(0, ball.vy * -0.3);
        }

        // 12. Ball Drain Check
        // Ball only drains if it falls below y > 920 in the playfield (not in plunger lane)
        if (ball.x < 615 && ball.y > 920) {
          ball.active = false;
        }
      }
    }

    // Cleanup inactive balls
    this.balls = this.balls.filter((b) => b.active);

    // Multiball timer update
    if (stats.isMultiball) {
      stats.multiballTimer -= clampedDt;
      if (stats.multiballTimer <= 0) {
        stats.isMultiball = false;
        stats.lockedBalls = 0;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += clampedDt;

      // Motion
      p.x += p.vx * clampedDt;
      p.y += p.vy * clampedDt;

      // Drag on flying sparks and debris
      p.vx *= 0.95;
      p.vy *= 0.95;

      // Gravity on shattered target debris
      if (p.type === 'debris') {
        p.vy += 650 * clampedDt;
      }

      // Expanding shockwave rings & flashes
      if (p.growth) {
        p.size += p.growth * clampedDt;
      }

      // Angular spin
      if (p.rotSpeed) {
        p.rotation = (p.rotation || 0) + p.rotSpeed * clampedDt;
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += clampedDt;
      pop.y -= 40 * clampedDt;
      pop.alpha = Math.max(0, 1 - pop.life / 1.0);
      if (pop.life >= 1.0) {
        this.popups.splice(i, 1);
      }
    }

    // Mascot Message Timer
    if (stats.mascotTimer > 0) {
      stats.mascotTimer -= clampedDt;
      if (stats.mascotTimer <= 0 && stats.mascotMood !== 'GAMEOVER') {
        stats.mascotMood = 'IDLE';
        stats.mascotMessage = 'READY! SHOOT FOR HIGHSCORE!';
      }
    }
  }

  private updateFlipper(flipper: Flipper, dt: number, isTilted: boolean) {
    if (isTilted) {
      flipper.isUp = false;
    }

    flipper.targetAngle = flipper.isUp ? flipper.upAngle : flipper.restAngle;
    const speed = flipper.isUp ? flipper.upSpeed : flipper.downSpeed;

    const prevAngle = flipper.currentAngle;
    if (flipper.currentAngle < flipper.targetAngle) {
      flipper.currentAngle = Math.min(flipper.targetAngle, flipper.currentAngle + speed * dt);
    } else if (flipper.currentAngle > flipper.targetAngle) {
      flipper.currentAngle = Math.max(flipper.targetAngle, flipper.currentAngle - speed * dt);
    }

    flipper.angularVelocity = (flipper.currentAngle - prevAngle) / dt;
  }

  private resolveFlipperCollision(ball: Ball, flipper: Flipper) {
    const P = flipper.pivot;
    const cosA = Math.cos(flipper.currentAngle);
    const sinA = Math.sin(flipper.currentAngle);
    const T: Vector2D = {
      x: P.x + cosA * flipper.length,
      y: P.y + sinA * flipper.length,
    };

    const res = pointToSegmentDistance({ x: ball.x, y: ball.y }, P, T);
    // Interpolate flipper body thickness
    const flipperRadius =
      flipper.baseRadius + (flipper.tipRadius - flipper.baseRadius) * res.t;
    const totalRadius = flipperRadius + ball.radius;

    if (res.dist < totalRadius) {
      let nx = 0;
      let ny = -1;
      if (res.dist > 0.0001) {
        nx = (ball.x - res.closest.x) / res.dist;
        ny = (ball.y - res.closest.y) / res.dist;
      } else {
        // Fallback: normal perpendicular to flipper
        nx = -sinA * (flipper.side === 'left' ? 1 : -1);
        ny = cosA * (flipper.side === 'left' ? 1 : -1);
      }

      // Push ball out cleanly
      const overlap = totalRadius - res.dist;
      ball.x += nx * overlap;
      ball.y += ny * overlap;

      // Surface velocity at contact point: v_f = omega x r
      const rx = res.closest.x - P.x;
      const ry = res.closest.y - P.y;
      const flipperVx = -flipper.angularVelocity * ry;
      const flipperVy = flipper.angularVelocity * rx;

      // Relative velocity of ball to flipper
      const relVx = ball.vx - flipperVx;
      const relVy = ball.vy - flipperVy;
      const relVdotN = relVx * nx + relVy * ny;

      if (relVdotN < 0) {
        // Restitution depends on whether flipper is actively swinging up
        const isSwingingUp =
          flipper.isUp &&
          ((flipper.side === 'left' && flipper.angularVelocity < -1) ||
            (flipper.side === 'right' && flipper.angularVelocity > 1));

        const restitution = isSwingingUp ? 1.35 : 0.5;
        const impulseN = -(1 + restitution) * relVdotN;

        // Tangential velocity and friction
        const tx = -ny;
        const ty = nx;
        const relVdotT = relVx * tx + relVy * ty;
        const impulseT = -relVdotT * 0.25;

        ball.vx = flipperVx + relVx + nx * impulseN + tx * impulseT;
        ball.vy = flipperVy + relVy + ny * impulseN + ty * impulseT;

        // Spark feedback on energetic flip
        if (isSwingingUp) {
          this.addParticles(res.closest.x, res.closest.y, 6, '#FBBF24');
        }
      }
    }
  }
}

// Distance from point to line segment with parameter t
function pointToSegmentDistance(
  p: Vector2D,
  a: Vector2D,
  b: Vector2D
): { dist: number; closest: Vector2D; t: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {
    return { dist: Math.hypot(apx, apy), closest: a, t: 0 };
  }

  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const closest = {
    x: a.x + t * abx,
    y: a.y + t * aby,
  };

  const dist = Math.hypot(p.x - closest.x, p.y - closest.y);
  return { dist, closest, t };
}

// Spline interpolation for wireform ramp
function getSplinePoint(points: Vector2D[], t: number): Vector2D {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const scaled = t * (points.length - 1);
  const idx = Math.min(Math.floor(scaled), points.length - 2);
  const frac = scaled - idx;

  const p0 = points[idx];
  const p1 = points[idx + 1];

  return {
    x: p0.x + (p1.x - p0.x) * frac,
    y: p0.y + (p1.y - p0.y) * frac,
  };
}
