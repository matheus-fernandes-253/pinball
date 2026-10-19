/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlOverlayProps {
  onLeftFlipperDown: () => void;
  onLeftFlipperUp: () => void;
  onRightFlipperDown: () => void;
  onRightFlipperUp: () => void;
  onPlungerDown: () => void;
  onPlungerUp: () => void;
  onNudge: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  isPaused: boolean;
  plungerPower: number;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  onLeftFlipperDown,
  onLeftFlipperUp,
  onRightFlipperDown,
  onRightFlipperUp,
  onPlungerDown,
  onPlungerUp,
  onNudge,
  onTogglePause,
  onRestart,
  isPaused,
  plungerPower,
}) => {
  return (
    <div className="w-full bg-slate-950/90 border-t border-slate-800 p-3 select-none flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300">
      {/* 1. Touch/Mouse Quick Action Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        {/* Left Flipper Button */}
        <button
          onMouseDown={onLeftFlipperDown}
          onMouseUp={onLeftFlipperUp}
          onTouchStart={onLeftFlipperDown}
          onTouchEnd={onLeftFlipperUp}
          className="px-5 py-2.5 rounded-lg font-mono font-bold text-sm bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
        >
          LEFT FLIP [Z]
        </button>

        {/* Nudge Button */}
        <button
          onClick={onNudge}
          className="px-3.5 py-2.5 rounded-lg font-mono text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 active:scale-95 transition-all"
        >
          NUDGE [X]
        </button>

        {/* Spring Plunger Button */}
        <div className="relative">
          <button
            onMouseDown={onPlungerDown}
            onMouseUp={onPlungerUp}
            onTouchStart={onPlungerDown}
            onTouchEnd={onPlungerUp}
            className={`px-5 py-2.5 rounded-lg font-mono font-bold text-sm transition-all shadow-md active:scale-95 ${
              plungerPower > 0
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {plungerPower > 0
              ? `LAUNCH (${Math.round(plungerPower * 100)}%)`
              : 'PLUNGER [SPACE]'}
          </button>
        </div>

        {/* Right Flipper Button */}
        <button
          onMouseDown={onRightFlipperDown}
          onMouseUp={onRightFlipperUp}
          onTouchStart={onRightFlipperDown}
          onTouchEnd={onRightFlipperUp}
          className="px-5 py-2.5 rounded-lg font-mono font-bold text-sm bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
        >
          RIGHT FLIP [/]
        </button>
      </div>

      {/* 2. Keyboard Control Hints for Arcade Purists */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
        <div>
          <span className="text-rose-400 font-bold">Z / ←</span> Flip Left
        </div>
        <span>·</span>
        <div>
          <span className="text-rose-400 font-bold">/ / →</span> Flip Right
        </div>
        <span>·</span>
        <div>
          <span className="text-amber-400 font-bold">SPACE / ↓</span> Pull Plunger
        </div>
        <span>·</span>
        <div>
          <span className="text-cyan-400 font-bold">X / N</span> Nudge
        </div>
      </div>

      {/* 3. Utility / Menu Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:text-white text-slate-400 transition-colors"
          title={isPaused ? 'Resume Game' : 'Pause Game'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
        <button
          onClick={onRestart}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:text-white text-slate-400 transition-colors"
          title="Restart Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
