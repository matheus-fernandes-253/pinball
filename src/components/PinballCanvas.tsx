/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { PinballPhysics } from '../game/physics.ts';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  RAMP_PATH,
} from '../game/tableLayout.ts';
import {
  Flipper,
  JetBumper,
  DropTarget,
  Slingshot,
  RolloverLane,
  WallSegment,
  StageConfig,
} from '../game/types.ts';

interface PinballCanvasProps {
  physics: PinballPhysics;
  leftFlipper: Flipper;
  rightFlipper: Flipper;
  bumpers: JetBumper[];
  dropTargets: DropTarget[];
  slingshots: Slingshot[];
  rollovers: RolloverLane[];
  walls: WallSegment[];
  stageConfig: StageConfig;
}

export const PinballCanvas: React.FC<PinballCanvasProps> = ({
  physics,
  leftFlipper,
  rightFlipper,
  bumpers,
  dropTargets,
  slingshots,
  rollovers,
  walls,
  stageConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playfieldImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load generated playfield art asset dynamically based on stageConfig
    if (!stageConfig.playfieldImage) {
      playfieldImgRef.current = null;
      return;
    }
    const img = new Image();
    img.src = stageConfig.playfieldImage;
    img.onload = () => {
      playfieldImgRef.current = img;
    };
  }, [stageConfig.playfieldImage, stageConfig.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = performance.now() * 0.001;
      ctx.save();

      // Camera Shake
      if (physics.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * physics.cameraShake;
        const shakeY = (Math.random() - 0.5) * physics.cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Playfield Base & Pixel Art Background Decal
      ctx.fillStyle = stageConfig.tableBgColor;
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      if (playfieldImgRef.current) {
        ctx.save();
        ctx.imageSmoothingEnabled = false; // Crisp 16-bit retro arcade aesthetic
        ctx.globalAlpha = 0.62;
        ctx.drawImage(playfieldImgRef.current, 0, 0, TABLE_WIDTH, TABLE_HEIGHT);
        ctx.restore();
      }

      // 1B. DISTINCTIVE CREATIVE ANIMATIONS PER STAGE
      if (stageConfig.theme === 'neon') {
        // Stage 1 BEACH BIKINI: Animated ocean wave caustics & sparkling sunlight
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const waveY = 780 + i * 28;
          for (let x = 40; x <= 610; x += 20) {
            const yOffset = Math.sin(x * 0.02 + now * 2.5 + i) * 6;
            if (x === 40) ctx.moveTo(x, waveY + yOffset);
            else ctx.lineTo(x, waveY + yOffset);
          }
          ctx.stroke();
        }
        // Floating sunbeam sparkles
        for (let s = 0; s < 7; s++) {
          const sx = 100 + (s * 85 + Math.sin(now * 1.5 + s) * 20) % 480;
          const sy = 160 + (s * 75 + Math.cos(now * 2 + s) * 25) % 450;
          const sAlpha = 0.3 + 0.45 * Math.sin(now * 3 + s);
          ctx.fillStyle = `rgba(253, 224, 71, ${Math.max(0, sAlpha)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (stageConfig.theme === 'jhorror') {
        // Stage 2 J-HORROR: Floating Will-o'-the-Wisps (Hitodama) & glowing Ofudas
        ctx.save();
        for (let g = 0; g < 4; g++) {
          const gx = 180 + g * 110 + Math.sin(now * 1.6 + g * 1.5) * 25;
          const gy = 820 - ((now * 45 + g * 190) % 760);
          const gAlpha = 0.35 + 0.35 * Math.sin(now * 2.5 + g);

          const grad = ctx.createRadialGradient(gx, gy, 2, gx, gy, 26);
          grad.addColorStop(0, `rgba(56, 189, 248, ${gAlpha})`);
          grad.addColorStop(0.5, `rgba(168, 85, 247, ${gAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(gx, gy, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (stageConfig.theme === 'samurai') {
        // Stage 3 SAMURAI: Swirling falling pink sakura petals
        ctx.save();
        for (let p = 0; p < 18; p++) {
          const px = ((p * 42 + now * 35) % 580) + 40;
          const py = ((p * 55 + now * 65 + Math.sin(p + now) * 25) % 880);
          const prot = p + now * (1.2 + (p % 3) * 0.4);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(prot);
          ctx.fillStyle = p % 2 === 0 ? 'rgba(251, 113, 133, 0.65)' : 'rgba(244, 63, 94, 0.55)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 8, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      } else if (stageConfig.theme === 'shinobi') {
        // Stage 4 MECHA SHINOBI: Digital laser scanline sweep & glowing circuit data packets
        ctx.save();
        const scanY = (now * 240) % TABLE_HEIGHT;
        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 8);
        scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        scanGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.35)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(40, scanY - 4, 570, 4);

        for (let c = 0; c < 5; c++) {
          const cx = 110 + c * 105;
          const cy = ((now * 170 + c * 180) % 700) + 120;
          ctx.fillStyle = '#38BDF8';
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 8;
          ctx.fillRect(cx - 3, cy - 3, 6, 6);
        }
        ctx.restore();
      } else if (stageConfig.theme === 'yokai') {
        // Stage 5 YOKAI ONI: Magma fissure heat glow & rising hellfire embers
        ctx.save();
        const magmaGrad = ctx.createLinearGradient(0, 780, 0, 960);
        magmaGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
        magmaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.45)');
        ctx.fillStyle = magmaGrad;
        ctx.fillRect(35, 780, 585, 180);

        for (let e = 0; e < 16; e++) {
          const ex = 80 + ((e * 40 + Math.sin(now * 2 + e) * 35) % 480);
          const ey = 900 - ((now * 80 + e * 70) % 680);
          const eAlpha = 0.3 + 0.5 * Math.sin(now * 4 + e);
          ctx.fillStyle = e % 3 === 0 ? `rgba(168, 85, 247, ${Math.max(0, eAlpha)})` : `rgba(249, 115, 22, ${Math.max(0, eAlpha)})`;
          ctx.beginPath();
          ctx.arc(ex, ey, 3 + (e % 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Top Stage Mission Pill Overlay
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = stageConfig.accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(100, 24, 460, 26, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🎯 ${stageConfig.stageMission}`, 330, 37);
      ctx.restore();

      // 2. Draw Top Rollover Lanes (A - B - C)
      rollovers.forEach((lane) => {
        ctx.save();
        ctx.fillStyle = lane.lit ? 'rgba(245, 158, 11, 0.85)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = lane.lit ? '#F59E0B' : '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lane.x - lane.width / 2, lane.y - lane.height / 2, lane.width, lane.height, 6);
        ctx.fill();
        ctx.stroke();

        // Glowing letter
        ctx.fillStyle = lane.lit ? '#FFFFFF' : '#94A3B8';
        ctx.font = 'bold 20px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lane.letter, lane.x, lane.y);
        ctx.restore();
      });

      // 3. Draw Table Walls & Wire Guides
      walls.forEach((w) => {
        ctx.save();
        if (w.isGate) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = stageConfig.theme === 'samurai' ? '#78350F' : stageConfig.theme === 'jhorror' ? '#450A0A' : '#64748B';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
        }
        ctx.beginPath();
        ctx.moveTo(w.p1.x, w.p1.y);
        ctx.lineTo(w.p2.x, w.p2.y);
        ctx.stroke();

        // Chrome/Gold inner highlight
        if (!w.isGate) {
          ctx.strokeStyle = stageConfig.theme === 'samurai' ? '#FDE68A' : stageConfig.theme === 'jhorror' ? '#F87171' : '#E2E8F0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 4. Draw Ball Lock Scoop (Left Side at x=65, y=335)
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = stageConfig.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(65, 335, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = stageConfig.accentColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOCK', 65, 338);
      ctx.restore();

      // 5. Draw 3-Bank Drop Targets with Stage Custom Letters & Colors
      dropTargets.forEach((t) => {
        ctx.save();
        if (t.isDown) {
          // Flattened into table
          ctx.fillStyle = '#111827';
          ctx.fillRect(t.x, t.y, t.width, t.height);
          ctx.strokeStyle = '#374151';
          ctx.strokeRect(t.x, t.y, t.width, t.height);
        } else {
          // Upright target
          ctx.fillStyle = stageConfig.dropTargetColor;
          ctx.fillRect(t.x, t.y, t.width, t.height);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(t.x, t.y, t.width, t.height);

          // Letter / Kanji
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px "Noto Sans JP", "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.letter, t.x + t.width / 2, t.y + t.height / 2);
        }
        ctx.restore();
      });

      // 6. Draw Themed Jet Bumpers (Circle, Cursed Eye, Sakura, Shuriken, or Oni Skull)
      bumpers.forEach((b) => {
        ctx.save();
        const pulse = b.hitTimer * 8;
        const R = b.radius + pulse;

        // Outer glow aura
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, R + 14);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, R + 12, 0, Math.PI * 2);
        ctx.fill();

        if (stageConfig.bumperShape === 'cursed_eye') {
          // J-HORROR: Hexagonal Cursed Eyeball with Bloodshot Veins and Dilating Red Pupil
          ctx.save();
          ctx.translate(b.x, b.y);

          // Hexagon base
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = Math.cos(angle) * R;
            const hy = Math.sin(angle) * R;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fillStyle = '#180305';
          ctx.fill();
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Sclera & Iris
          ctx.fillStyle = '#450A0A';
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.65, 0, Math.PI * 2);
          ctx.fill();

          // Eyeball pupil
          const pupilRadius = (R * 0.32) + (b.hitTimer * 6);
          ctx.fillStyle = b.hitTimer > 0.1 ? '#FFFFFF' : '#EF4444';
          ctx.beginPath();
          ctx.arc(0, 0, pupilRadius, 0, Math.PI * 2);
          ctx.fill();

          // Score text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${b.score}`, 0, 0);

          ctx.restore();
        } else if (stageConfig.bumperShape === 'sakura') {
          // SAMURAI: 8-Petal Japanese Cherry Blossom Crest
          ctx.save();
          ctx.translate(b.x, b.y);

          // Draw 8 rounded petals
          for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#FB7185';
            ctx.beginPath();
            ctx.ellipse(0, -R * 0.55, R * 0.32, R * 0.48, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FDE68A';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Gold center jewel
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Score text
          ctx.fillStyle = '#1C1917';
          ctx.font = 'bold 11px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${b.score}`, 0, 0);

          ctx.restore();
        } else if (stageConfig.bumperShape === 'shuriken') {
          // MECHA SHINOBI: 4-Pointed Ninja Throwing Star
          ctx.save();
          ctx.translate(b.x, b.y);

          ctx.fillStyle = '#083344';
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          const s = R * 1.15;
          const inner = R * 0.35;
          for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const next = angle + Math.PI / 4;
            ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
            ctx.lineTo(Math.cos(next) * inner, Math.sin(next) * inner);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Center core
          ctx.fillStyle = b.hitTimer > 0.1 ? '#FFFFFF' : '#06B6D4';
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#082F49';
          ctx.font = 'bold 11px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${b.score}`, 0, 0);

          ctx.restore();
        } else if (stageConfig.bumperShape === 'oni_skull') {
          // YOKAI: Horned Demon Oni Bumper
          ctx.save();
          ctx.translate(b.x, b.y);

          // Demon horns
          ctx.fillStyle = '#EA580C';
          ctx.beginPath();
          ctx.moveTo(-R * 0.6, -R * 0.3);
          ctx.lineTo(-R * 0.8, -R * 1.05);
          ctx.lineTo(-R * 0.3, -R * 0.6);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(R * 0.6, -R * 0.3);
          ctx.lineTo(R * 0.8, -R * 1.05);
          ctx.lineTo(R * 0.3, -R * 0.6);
          ctx.closePath();
          ctx.fill();

          // Demon Face Body
          ctx.fillStyle = '#450A0A';
          ctx.beginPath();
          ctx.arc(0, 0, R, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#F97316';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Glowing demon eyes
          ctx.fillStyle = b.hitTimer > 0.1 ? '#FFFFFF' : '#FBBF24';
          ctx.beginPath();
          ctx.ellipse(-R * 0.35, -R * 0.15, 6, 4, -0.2, 0, Math.PI * 2);
          ctx.ellipse(R * 0.35, -R * 0.15, 6, 4, 0.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FDE047';
          ctx.font = 'bold 11px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${b.score}`, 0, R * 0.25);

          ctx.restore();
        } else {
          // NEON: Classic Circular Dome Bumper
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = b.color;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Center jewel
          ctx.fillStyle = b.hitTimer > 0.1 ? '#FFFFFF' : b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 12px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${b.score}`, b.x, b.y);
        }

        ctx.restore();
      });

      // 7. Draw Themed Slingshots
      slingshots.forEach((s) => {
        ctx.save();
        ctx.fillStyle = s.hitTimer > 0.1 ? '#FFFFFF' : stageConfig.slingshotColor;
        ctx.beginPath();
        ctx.moveTo(s.p1.x, s.p1.y);
        ctx.lineTo(s.p2.x, s.p2.y);
        ctx.lineTo(s.p3.x, s.p3.y);
        ctx.closePath();
        ctx.fill();

        // Rubber rebound band
        ctx.strokeStyle = stageConfig.accentColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(s.p1.x, s.p1.y);
        ctx.lineTo(s.p2.x, s.p2.y);
        ctx.stroke();

        // Posts
        [s.p1, s.p2, s.p3].forEach((pt) => {
          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // 8. Draw Wireform Habitrail Ramp
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      RAMP_PATH.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Chrome highlight inner rail
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ramp entrance arrow
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ RAMP', 485, 545);
      ctx.restore();

      // 9. Draw Flippers
      [leftFlipper, rightFlipper].forEach((flipper) => {
        ctx.save();
        ctx.translate(flipper.pivot.x, flipper.pivot.y);
        ctx.rotate(flipper.currentAngle);

        const L = flipper.length;
        const R1 = flipper.baseRadius;
        const R2 = flipper.tipRadius;

        // Flipper body capsule
        ctx.fillStyle = '#E11D48'; // Retro arcade red rubber
        ctx.strokeStyle = '#FFE4E6';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(0, 0, R1, Math.PI / 2, -Math.PI / 2, true);
        ctx.arc(L, 0, R2, -Math.PI / 2, Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White rubber band stripe
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -R1 + 3);
        ctx.lineTo(L, -R2 + 2);
        ctx.stroke();

        // Pivot cap
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(0, 0, R1 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      // 10. Draw Spring Plunger
      ctx.save();
      const plungerX = 642;
      const plungerY = 890 + physics.plungerTension * 35;
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Coiled spring
      const springTop = 855;
      const springBottom = plungerY;
      const coils = 6;
      ctx.beginPath();
      ctx.moveTo(plungerX, springTop);
      for (let i = 1; i <= coils; i++) {
        const cy = springTop + ((springBottom - springTop) / coils) * i;
        const cx = plungerX + (i % 2 === 0 ? 8 : -8);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(plungerX, springBottom);
      ctx.stroke();

      // Plunger tip rod
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(plungerX - 12, plungerY, 24, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 11. Draw Steel Balls & Motion Blur Trails
      physics.balls.forEach((ball) => {
        if (!ball.active) return;
        ctx.save();

        // Draw Motion Trail
        if (ball.trail.length > 1) {
          ctx.beginPath();
          for (let i = 0; i < ball.trail.length; i++) {
            const pt = ball.trail[i];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = ball.radius * 0.9;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw Chrome Steel Ball with specular highlights
        const ballGrad = ctx.createRadialGradient(
          ball.x - ball.radius * 0.35,
          ball.y - ball.radius * 0.35,
          ball.radius * 0.1,
          ball.x,
          ball.y,
          ball.radius
        );
        ballGrad.addColorStop(0, '#FFFFFF');
        ballGrad.addColorStop(0.3, '#E2E8F0');
        ballGrad.addColorStop(0.75, '#64748B');
        ballGrad.addColorStop(1, '#1E293B');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Specular dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 12. Draw Visual Explosion Particle System
      physics.particles.forEach((p) => {
        ctx.save();

        if (p.type === 'ring') {
          // Expanding Shockwave Ring with Additive Glow
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 3.5 * p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.stroke();

          // Inner bright accent ring
          if (p.secondaryColor) {
            ctx.strokeStyle = p.secondaryColor;
            ctx.lineWidth = Math.max(0.8, 1.5 * p.alpha);
            ctx.stroke();
          }
        } else if (p.type === 'flash') {
          // Central Flash Halo
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = p.alpha * 0.9;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(1, p.size));
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          // High-Velocity Motion-Stretched Laser Spark
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1.5, p.size);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          // Laser streak trailing along velocity
          ctx.lineTo(p.x - p.vx * 0.032, p.y - p.vy * 0.032);
          ctx.stroke();
        } else if (p.type === 'star') {
          // 90s Anime 4-Pointed Sparkle Star
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          const s = Math.max(1, p.size);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'debris') {
          // Tumbling Shattered Target Shard
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          const w = p.width || p.size;
          const h = p.height || p.size;
          ctx.fillStyle = p.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else {
          // Standard Circular Sparkle
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 13. Draw Score Popups
      physics.popups.forEach((pop) => {
        ctx.save();
        ctx.globalAlpha = pop.alpha;
        ctx.fillStyle = pop.color;
        ctx.font = 'bold 16px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [physics, leftFlipper, rightFlipper, bumpers, dropTargets, slingshots, rollovers, walls, stageConfig]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2 overflow-hidden select-none">
      {/* Outer Pinball Wooden Cabinet Edges */}
      <div className="relative rounded-2xl border-4 border-amber-950 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-900">
        <canvas
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          className="w-full max-h-[85vh] aspect-[700/960] object-contain block cursor-crosshair"
        />

        {/* Glass Glare Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent" />
      </div>
    </div>
  );
};
