import React, { useEffect } from 'react';
import { useCourses } from '../context/CourseContext';
import { SystemPanel } from './SystemPanel';

export const DungeonClearedModal: React.FC = () => {
  const { dungeonClearedEvent, clearDungeonClearedEvent } = useCourses();

  useEffect(() => {
    if (dungeonClearedEvent) {
      const timer = setTimeout(() => {
        clearDungeonClearedEvent();
      }, 5000); // Expanded slightly for easier manual click
      return () => clearTimeout(timer);
    }
  }, [dungeonClearedEvent, clearDungeonClearedEvent]);

  if (!dungeonClearedEvent) return null;

  const { courseTitle } = dungeonClearedEvent;

  return (
    <div
      onClick={clearDungeonClearedEvent}
      className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
    >
      {/* Glow overlay container */}
      <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />

      <SystemPanel
        glow={true}
        className="max-w-md w-full p-8 text-center brutalist-modal-card relative overflow-hidden flex flex-col items-center animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking card content
      >
        {/* Decorative corner lines in Green */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-xpgreen/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-xpgreen/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-xpgreen/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-xpgreen/30" />

        {/* Victory Icon */}
        <div className="w-16 h-16 rounded-full border border-xpgreen/30 bg-xpgreen/10 flex items-center justify-center text-xpgreen text-3xl mb-4 select-none animate-pulse">
          📖
        </div>

        {/* Dungeon Cleared Title */}
        <h2 className="font-display font-bold text-3xl tracking-widest bg-gradient-to-r from-xpgreen via-[#a7f3d0] to-xpgreen bg-clip-text text-transparent mb-4 animate-pulse select-none">
          DUNGEON CLEARED
        </h2>

        {/* Dungeon Info */}
        <div className="my-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-textdim font-mono block mb-1">
            System Knowledge Dungeon Sealed
          </span>
          <span className="text-xl font-display font-bold text-textmain block">
            {courseTitle}
          </span>
          <span className="text-[11px] font-mono text-xpgreen/85 block mt-2">
            All Video Lessons Completed
          </span>
        </div>

        {/* System Message */}
        <div className="border-t border-accent/15 w-full pt-4 mt-4 text-[10px] font-mono text-textdim/50 uppercase tracking-widest animate-pulse">
          ★ SYSTEM INT REWARD DISBURSED ★
        </div>

        {/* Neumorphic Action Button */}
        <button
          onClick={clearDungeonClearedEvent}
          className="mt-6 px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider neu-btn active:scale-95 cursor-pointer transition-all duration-300"
        >
          Seals Complete
        </button>

        <div className="text-[9px] font-mono text-textdim/30 mt-5">
          Wait or click button to dismiss interface
        </div>
      </SystemPanel>
    </div>
  );
};

export default DungeonClearedModal;
