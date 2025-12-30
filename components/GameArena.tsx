
import React from 'react';
import { GameState } from '../types';

interface GameArenaProps {
  state: GameState;
  maxMonsterHP: number;
}

const GameArena: React.FC<GameArenaProps> = ({ state, maxMonsterHP }) => {
  const monsterHPPercent = Math.min(100, Math.max(0, (state.monsterHP / maxMonsterHP) * 100));
  const heroHPPercent = Math.min(100, Math.max(0, (state.heroHP / 100) * 100));
  const heroManaPercent = Math.min(100, Math.max(0, (state.heroMana / 100) * 100));

  return (
    <div className="bg-[#1a1a1a] p-6 flex items-center justify-around h-52 rounded-t-xl relative overflow-hidden border-b-4 border-slate-800">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid grid-cols-12 gap-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="text-4xl">⚔️</div>
        ))}
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center z-10 w-40">
        <div className={`text-5xl mb-3 transition-transform ${state.isFighting ? 'animate-bounce' : ''}`}>🧝‍♂️</div>
        <div className="text-white text-xs font-black uppercase mb-1 tracking-widest opacity-80">Hero</div>
        
        {/* HP Bar */}
        <div className="w-full h-2.5 bg-gray-900 rounded-full border border-gray-700 overflow-hidden mb-1">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
            style={{ width: `${heroHPPercent}%` }}
          />
        </div>
        
        {/* Mana Bar */}
        <div className="w-full h-2.5 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
            style={{ width: `${heroManaPercent}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-[8px] text-cyan-400 font-bold mt-1 px-1">
          <span>MP</span>
          <span>{Math.floor(state.heroMana)} / 100</span>
        </div>
      </div>

      <div className="text-white pixel-font text-xl font-black italic opacity-20">BATTLE_LOG</div>

      {/* Monster */}
      <div className="flex flex-col items-center z-10 w-40">
        <div className={`text-7xl mb-3 transition-all duration-200 ${state.isFighting && state.currentStep?.includes('ACTION') ? 'scale-110 -translate-x-2' : ''}`}>
          {state.monsterHP > 0 ? (maxMonsterHP > 100 ? '🐲' : '💀') : '💨'}
        </div>
        {state.monsterHP > 0 ? (
          <>
            <div className="text-white text-xs font-black uppercase mb-1 tracking-widest opacity-80">Boss</div>
            <div className="w-full h-3 bg-gray-900 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
              <div 
                className="h-full bg-rose-600 transition-all duration-300 shadow-[0_0_12px_rgba(225,29,72,0.6)]" 
                style={{ width: `${monsterHPPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-rose-400 font-bold mt-1">HP: {state.monsterHP}</div>
          </>
        ) : (
          <div className="text-yellow-400 font-black animate-pulse pixel-font text-xs uppercase">Cleared!</div>
        )}
      </div>

      {/* Logs Overlay */}
      <div className="absolute bottom-2 left-6 right-6 bg-black/60 text-emerald-400 text-[10px] p-2 rounded-lg font-mono border border-emerald-500/20 backdrop-blur-sm">
        <span className="opacity-50">PROG_LOG > </span> {state.logs[state.logs.length - 1] || "READY_TO_START"}
      </div>
    </div>
  );
};

export default GameArena;
