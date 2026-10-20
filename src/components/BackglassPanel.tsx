/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStats, StageConfig } from '../game/types.ts';
import { STAGES } from '../game/tableLayout.ts';
import { Volume2, VolumeX, Music, Zap, Sparkles, Trophy, Flame } from 'lucide-react';

interface BackglassPanelProps {
  stats: GameStats;
  stageConfig: StageConfig;
  onSelectStage: (stageId: number) => void;
  isMuted: boolean;
  isMusicEnabled: boolean;
  isCrtEnabled: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleCrt: () => void;
  onToggleInfiniteLives: () => void;
}

export const BackglassPanel: React.FC<BackglassPanelProps> = ({
  stats,
  stageConfig,
  onSelectStage,
  isMuted,
  isMusicEnabled,
  isCrtEnabled,
  onToggleMute,
  onToggleMusic,
  onToggleCrt,
  onToggleInfiniteLives,
}) => {
  // Score progress toward next stage threshold
  const scoreProgress = Math.min(100, Math.max(0, Math.round((stats.score / stats.nextStageThreshold) * 100)));
  const isStageReady = stats.score >= stats.nextStageThreshold;

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 bg-slate-950 text-slate-100 select-none border-l-2 border-red-950/70 overflow-y-auto">
      
      {/* 1. Oriental Cabinet Header Marquee */}
      <div className="mb-2 text-center pb-2 border-b border-red-900/50 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-500 font-serif text-sm">⛩</span>
          <h1 className="font-mono text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-rose-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] uppercase">
            NASTY PINBALL
          </h1>
          <span className="text-amber-500 font-serif text-sm">⛩</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono tracking-widest text-amber-500/90 mt-0.5">
          <span>悪戯ピンボール</span>
          <span>·</span>
          <span className="text-rose-400 font-semibold">{stageConfig.kanjiTitle}</span>
          <span>·</span>
          <span>{stageConfig.subtitle}</span>
        </div>
      </div>

      {/* 2. Top Illuminated Backglass Marquee with Character Art */}
      <div className="relative rounded-xl overflow-hidden border-2 border-amber-600/70 shadow-[0_0_30px_rgba(245,158,11,0.25)] bg-slate-900 group">
        {/* Backglass Heroine Image */}
        <div className="relative aspect-square w-full max-h-[310px] overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={stageConfig.backglassImage}
            alt={stageConfig.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />

          {/* Marquee Backlight & Oriental Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />

          {/* Current Stage Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-amber-500/60 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">
              {stageConfig.name}
            </span>
          </div>

          {/* Dynamic Anime Mascot Reaction Speech Bubble (Animates with Score & Events) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/95 backdrop-blur-md border border-amber-500/60 rounded-lg p-2.5 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  stats.mascotMood === 'FEVER'
                    ? 'bg-amber-400 animate-ping'
                    : stats.mascotMood === 'SHOCK'
                    ? 'bg-rose-500 animate-bounce'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <div className="text-xs truncate">
                <span className="font-bold text-amber-400 tracking-wider uppercase">
                  {stageConfig.mascotName}
                </span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="font-mono text-amber-200 font-semibold">
                  {stats.mascotMessage}
                </span>
              </div>
            </div>
            {stats.isMultiball && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white rounded animate-bounce shrink-0 ml-1">
                FEVER
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dynamic Side Panel Animation Hooked to Score: STAGE PROGRESS GAUGE */}
      <div className="my-2 p-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-red-950/50 via-slate-900/80 to-amber-950/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider">
            <Flame className={`w-3.5 h-3.5 ${scoreProgress > 70 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
            <span>PROGRESSO PARA PRÓXIMA FASE</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">
            {scoreProgress}%
          </span>
        </div>

        {/* Animated Glowing Progress Bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-950 border border-amber-900/60 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isStageReady
                ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 animate-pulse'
                : 'bg-gradient-to-r from-red-600 via-amber-500 to-rose-400'
            }`}
            style={{ width: `${scoreProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400">
          <span>ALVO: {stats.nextStageThreshold.toLocaleString()} PTS</span>
          <span className={isStageReady ? 'text-amber-300 font-bold animate-bounce' : 'text-slate-400'}>
            {isStageReady ? '★ FASE CONCLUÍDA! ★' : `FALTAM ${(Math.max(0, stats.nextStageThreshold - stats.score)).toLocaleString()} PTS`}
          </span>
        </div>
      </div>

      {/* 4. Authentic Amber Dot-Matrix Display (DMD) */}
      <div className="my-2 rounded-xl border-2 border-amber-600/50 bg-[#120803] p-3 shadow-[inset_0_0_20px_rgba(245,158,11,0.25)]">
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono tracking-widest text-amber-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>DOT MATRIX DISPLAY</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-amber-400">
            <span>BOLA {stats.ballNumber}/{stats.maxBalls}</span>
            <span>{stats.multiplier}X MULTI</span>
          </div>
        </div>

        {/* Big Tabular Numeric Score Display */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase font-mono tracking-widest text-amber-600">PONTOS</span>
          <div className="font-mono text-3xl font-black tabular-nums tracking-wider text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
            {stats.score.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5 text-xs font-mono text-amber-600/80">
          <span>RECORDE (HIGH SCORE)</span>
          <span className="tabular-nums font-bold text-amber-500">{stats.highScore.toLocaleString()}</span>
        </div>

        {/* Animated Status Ticker */}
        <div className="mt-2 py-1 px-2 rounded bg-amber-950/40 border border-amber-800/40 font-mono text-[11px] text-amber-300 text-center tracking-widest uppercase">
          {stats.isTilted
            ? '⚠ PERIGO: TILT DETECTADO · FLIPPERS TRAVADOS'
            : stats.isMultiball
            ? `★ 3 BOLAS ATIVAS NO MULTIBALL: ${(stats.multiballTimer).toFixed(1)}s ★`
            : isStageReady
            ? '★ META DE PONTUAÇÃO ATINGIDA! MUDANDO DE FASE! ★'
            : stats.lockedBalls === 2
            ? '★ ATIRE NO BURACO ESQUERDO PARA O MULTIBALL! ★'
            : stats.skillShotReady
            ? '★ TIRO DE HABILIDADE PRONTO: LANCE NAS CANALETAS SUPERIORES ★'
            : `DERRUBE ALVOS · COMPLETE ROLAGENS · ALCANCE ${stats.nextStageThreshold.toLocaleString()}`}
        </div>
      </div>

      {/* 5. USER REQUEST: STAGE SELECTOR & TEST VALIDATION (Vidas Infinitas & 5 Fases) */}
      <div className="my-2 p-2.5 rounded-xl border border-red-900/60 bg-slate-900/90 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-2">
          <span>PAINEL DE TESTES & FASES</span>
          <span className="text-[10px] text-slate-400 font-normal">VALIDAÇÃO RÁPIDA</span>
        </div>

        {/* 5 Stage Switcher Buttons */}
        <div className="grid grid-cols-5 gap-1.5 mb-2.5">
          {STAGES.map((stg) => {
            const isActive = stats.currentStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => onSelectStage(stg.id)}
                className={`py-1.5 px-1 rounded flex flex-col items-center justify-center border transition-all text-center ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-500 to-red-600 text-white border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-bold scale-[1.03]'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/50'
                }`}
                title={`${stg.name}: ${stg.subtitle}`}
              >
                <span className="text-[10px] font-mono leading-none">FASE {stg.id}</span>
                <span className="text-xs font-serif font-bold mt-0.5 leading-none">{stg.kanjiTitle.slice(0, 2)}</span>
                <span className="text-[9px] font-mono opacity-80 uppercase leading-none mt-1">
                  {stg.theme === 'neon' ? 'Praia' : stg.theme === 'jhorror' ? 'Terror' : stg.theme === 'samurai' ? 'Samurai' : stg.theme === 'shinobi' ? 'Shinobi' : 'Yokai'}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Infinite Lives Toggle Option */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MODO DE TESTE:</span>
          </span>
          <button
            onClick={onToggleInfiniteLives}
            className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              stats.infiniteLives
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Alternar vidas infinitas para testes"
          >
            <span>♾️</span>
            <span>{stats.infiniteLives ? 'VIDAS INFINITAS: LIGADO' : 'VIDAS PADRÃO (3)'}</span>
          </button>
        </div>
      </div>

      {/* 5B. ACTIVE STAGE MISSION CARD */}
      <div className="my-1 p-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span>🎯</span>
            <span>OBJETIVO / MISSÃO DA FASE</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              stats.missionCompleted
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
            }`}
          >
            {stats.missionCompleted ? '★ CONCLUÍDA! ★' : stats.missionProgress || 'EM ANDAMENTO'}
          </span>
        </div>
        <div className="text-xs font-mono text-slate-200 leading-snug">
          {stageConfig.stageMission}
        </div>
        <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
          <span>RECOMPENSA:</span>
          <span className="font-bold">{stageConfig.missionRewardText}</span>
        </div>
      </div>

      {/* 6. Mission & Feature Indicators */}
      <div className="grid grid-cols-3 gap-2 my-1">
        {/* Ball Locks */}
        <div className="p-2 rounded-lg border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] font-mono font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>TRAVAS</span>
            <span className="text-amber-400">{stats.lockedBalls}/3</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2.5 rounded-sm transition-colors ${
                  stats.lockedBalls >= num
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Drop Targets for current stage */}
        <div className="p-2 rounded-lg border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] font-mono font-semibold text-slate-400 mb-1">
            ALVOS ({stageConfig.dropTargetLetters.length})
          </div>
          <div className="flex gap-1">
            {stageConfig.dropTargetLetters.map((letter, idx) => (
              <div
                key={`${letter}-${idx}`}
                className={`flex-1 text-center py-0.5 text-[11px] font-mono font-bold rounded-sm border ${
                  stats.dropTargetsDown && stats.dropTargetsDown[idx]
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 line-through'
                    : 'bg-red-600 text-white border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Top Rollovers */}
        <div className="p-2 rounded-lg border border-slate-800 bg-slate-900/80">
          <div className="text-[10px] font-mono font-semibold text-slate-400 mb-1">
            ROLAGENS
          </div>
          <div className="flex gap-1">
            {['1', '2', '3'].map((item, idx) => (
              <div
                key={item}
                className={`flex-1 text-center py-0.5 text-[11px] font-mono font-bold rounded-sm border ${
                  stats.rolloverLanesLit && stats.rolloverLanesLit[idx]
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Tilt Bob Sensor & Tilt Warnings */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400">SENSOR DE TILT (NUDGE)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((w) => (
            <span
              key={w}
              className={`w-2.5 h-2.5 rounded-full ${
                stats.tiltWarnings >= w
                  ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                  : 'bg-slate-700'
              }`}
            />
          ))}
          <span className="text-[11px] text-slate-400 ml-1">
            {stats.isTilted ? 'TILTADO' : `${stats.tiltWarnings}/3`}
          </span>
        </div>
      </div>

      {/* 8. Arcade Settings & Audio Toggles */}
      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-700 hover:text-white'
            }`}
            title="Ativar/Desativar Efeitos Sonoros"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="font-mono text-[11px]">{isMuted ? 'MUDO' : 'SFX'}</span>
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              !isMusicEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-amber-950/40 border-amber-800 text-amber-300 hover:text-amber-200'
            }`}
            title="Ativar/Desativar Trilha Chiptune"
          >
            <Music className="w-4 h-4" />
            <span className="font-mono text-[11px]">{isMusicEnabled ? 'BGM' : 'BGM OFF'}</span>
          </button>
        </div>

        <button
          onClick={onToggleCrt}
          className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] transition-colors ${
            isCrtEnabled
              ? 'bg-amber-950/40 border-amber-700 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {isCrtEnabled ? 'CRT: LIGADO' : 'CRT: DESLIGADO'}
        </button>
      </div>

    </div>
  );
};
