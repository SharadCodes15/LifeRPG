import React, { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { SystemPanel } from './SystemPanel';

export const LevelUpModal: React.FC = () => {
  const { levelUpEvent, clearLevelUpEvent } = usePlayer();

  useEffect(() => {
    if (levelUpEvent) {
      const timer = setTimeout(() => {
        clearLevelUpEvent();
      }, 5000); // Expanded slightly to let the user click
      return () => clearTimeout(timer);
    }
  }, [levelUpEvent, clearLevelUpEvent]);

  if (!levelUpEvent) return null;

  const { oldLevel, newLevel, oldRank, newRank } = levelUpEvent;
  const isRankUp = oldRank !== newRank;

  return (
    <div
      onClick={clearLevelUpEvent}
      className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
    >
      {/* Glow overlay container */}
      <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />

      <SystemPanel
        glow={true}
        className="max-w-md w-full p-8 text-center brutalist-modal-card relative overflow-hidden flex flex-col items-center animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card body
      >
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-accent/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-accent/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-accent/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent/30" />

        {/* Level Up Title */}
        <h2 className="font-display font-bold text-4xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent mb-6 animate-pulse">
          LEVEL UP
        </h2>

        {/* Level Comparison */}
        <div className="flex items-center gap-6 justify-center my-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-textdim font-mono mb-1">Previous</span>
            <span className="text-xl font-bold font-mono text-textdim/70">LVL {oldLevel}</span>
          </div>
          
          <div className="text-accent2 text-2xl font-bold animate-pulse">→</div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">Current</span>
            <span className="text-2xl font-extrabold font-mono text-accent animate-bounce">LVL {newLevel}</span>
          </div>
        </div>

        {/* Rank Change Display */}
        <div className="border-t border-accent/15 w-full pt-5 mt-2 flex flex-col items-center">
          {isRankUp ? (
            <div className="animate-bounce">
              <span className="text-xs font-mono font-semibold tracking-widest text-bronze uppercase block mb-1">
                ★ RANK UP DETECTED ★
              </span>
              <span className="font-display text-lg font-bold text-textmain">
                Rank {oldRank} <span className="text-bronze font-mono">➜</span> Rank {newRank}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-textdim block mb-1">
                Current Class Standing
              </span>
              <span className="font-display font-medium text-textmain uppercase tracking-wide">
                {newRank}-Rank Hunter
              </span>
            </div>
          )}
        </div>

        {/* Neumorphic Action Button */}
        <button
          onClick={clearLevelUpEvent}
          className="mt-8 px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider neu-btn active:scale-95 cursor-pointer transition-all duration-300"
        >
          Confirm Vitals UP
        </button>

        {/* System Message */}
        <div className="text-[9px] font-mono text-textdim/30 mt-5">
          Wait or click button to dismiss interface
        </div>
      </SystemPanel>
    </div>
  );
};

export default LevelUpModal;
