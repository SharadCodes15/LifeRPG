import React from 'react';
import { useAchievements } from '../context/AchievementContext';
import { SystemPanel } from './SystemPanel';

export const Achievements: React.FC = () => {
  const { achievements, unlockedAchievements, activeTitleId, equipTitle } = useAchievements();

  const getUnlockDetails = (id: string) => {
    return unlockedAchievements.find((u) => u.id === id);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="border-b border-panel2 pb-4 mb-2">
        <h2 className="font-display font-bold text-2xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent uppercase select-none">
          ACHIEVEMENTS & TITLES
        </h2>
        <p className="text-xs text-textdim mt-1 font-mono uppercase">
          Evaluate trials, claim victory titles, and equip them to your hunter badge
        </p>
      </div>

      {/* Grid of Achievement cards */}
      <div className="grid grid-cols-1 bp-820:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const unlock = getUnlockDetails(ach.id);
          const isUnlocked = !!unlock;
          const isEquipped = activeTitleId === ach.id;

          return (
            <SystemPanel
              key={ach.id}
              glow={isUnlocked && isEquipped}
              className={`p-5 flex flex-col justify-between border transition-all duration-300 min-h-[190px] relative ${
                isUnlocked
                  ? 'bg-panel border-accent/25 hover:border-accent/40 shadow-sm'
                  : 'bg-panel/10 border-textdim/5 opacity-55'
              }`}
            >
              {/* Card top details */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3
                    className={`font-display font-bold text-base tracking-wide ${
                      isUnlocked ? 'text-textmain' : 'text-textdim'
                    }`}
                  >
                    {ach.title}
                  </h3>
                  {isUnlocked ? (
                    <span className="text-xs" title="Unlocked">
                      🏆
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-40" title="Locked">
                      🔒
                    </span>
                  )}
                </div>

                <p className="text-xs text-textdim/70 leading-relaxed mb-4">
                  {ach.conditionDescription}
                </p>
              </div>

              {/* Card bottom details */}
              <div className="border-t border-accent/10 pt-3 flex items-center justify-between gap-3">
                {isUnlocked ? (
                  <>
                    <span className="text-[9px] font-mono text-textdim/60">
                      Unlocked {formatDate(unlock.unlockDate)}
                    </span>

                    {isEquipped ? (
                      <div className="flex items-center gap-1.5">
                        <span className="bg-bronze/15 border border-bronze/40 text-bronze text-[9px] font-mono font-bold px-2 py-1 rounded uppercase tracking-wider select-none">
                          Equipped
                        </span>
                        <button
                          onClick={() => equipTitle(null)}
                          className="text-[9px] font-mono text-textdim hover:text-textmain cursor-pointer"
                          title="Unequip Title"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => equipTitle(ach.id)}
                        className="text-[9px] font-mono bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent px-2 py-1 rounded uppercase tracking-wider font-semibold cursor-pointer active:scale-95 transition-all duration-300"
                      >
                        Equip Title
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-mono text-textdim/40 uppercase tracking-widest">
                      Locked Trial
                    </span>
                    <span className="text-[9px] font-mono text-textdim/30">
                      Vitals Insufficient
                    </span>
                  </>
                )}
              </div>
            </SystemPanel>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
