import React, { useState } from 'react';
import { useSkills } from '../context/SkillContext';
import type { Skill } from '../context/SkillContext';
import { usePlayer } from '../context/PlayerContext';
import type { Stats } from '../context/PlayerContext';
import { SystemPanel } from './SystemPanel';

export const SkillTree: React.FC = () => {
  const { skills, unlockedSkillIds, acknowledgedSkillIds, acknowledgeSkill, acknowledgeAllUnlocked, hasNewSkills } = useSkills();
  const { stats } = usePlayer();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const categories: { key: keyof Stats; label: string; colorClass: string; textClass: string; icon: string }[] = [
    { key: 'strength', label: 'STRENGTH', colorClass: 'border-bronze bg-bronze/10 text-bronze', textClass: 'text-bronze', icon: '🛡' },
    { key: 'intellect', label: 'INTELLECT', colorClass: 'border-accent bg-accent/10 text-accent', textClass: 'text-accent', icon: '🔮' },
    { key: 'vitality', label: 'VITALITY', colorClass: 'border-danger bg-danger/10 text-danger', textClass: 'text-danger', icon: '❤️' },
    { key: 'focus', label: 'FOCUS', colorClass: 'border-accent2 bg-accent2/10 text-accent2', textClass: 'text-accent2', icon: '⚡' },
    { key: 'willpower', label: 'WILLPOWER', colorClass: 'border-xpgreen bg-xpgreen/10 text-xpgreen', textClass: 'text-xpgreen', icon: '👑' },
  ];

  const handleNodeClick = (skill: Skill, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setSelectedSkill(skill);
    acknowledgeSkill(skill.id);
  };

  const getSkillsForStat = (statKey: keyof Stats) => {
    return skills.filter((s) => s.statKey === statKey).sort((a, b) => a.unlockAtStat - b.unlockAtStat);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Skill Tree Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-panel2 pb-4 mb-2">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent uppercase select-none">
            SKILL TREE MASTERIES
          </h2>
          <p className="text-xs text-textdim mt-1 font-mono uppercase">
            Milestone achievements unlocked by stat progression
          </p>
        </div>

        {hasNewSkills && (
          <button
            onClick={acknowledgeAllUnlocked}
            className="text-xs font-mono bg-bronze/10 border border-bronze/40 hover:bg-bronze/20 text-bronze px-3 py-1.5 rounded uppercase tracking-wider font-semibold cursor-pointer active:scale-95 transition-all duration-300"
          >
            Claim All Unlocked Skills
          </button>
        )}
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 bp-820:grid-cols-5 gap-6">
        {categories.map((cat) => {
          const catSkills = getSkillsForStat(cat.key);
          const currentStatValue = stats[cat.key];

          return (
            <div key={cat.key} className="flex flex-col items-center">
              {/* Category Header Card */}
              <div
                className={`w-full py-2.5 px-3 rounded-t-lg border-t border-x text-center font-display font-extrabold text-xs tracking-widest flex items-center justify-center gap-1.5 shadow select-none ${cat.colorClass}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="font-mono text-[10px] font-bold opacity-80">({currentStatValue})</span>
              </div>

              {/* Skill Path Box */}
              <div className="w-full bg-panel/30 border border-panel2 rounded-b-lg p-4 flex flex-col items-center space-y-6 relative min-h-[460px]">
                {/* Vertical Timeline Connection Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-panel2 z-0" />

                {catSkills.map((skill) => {
                  const isUnlocked = unlockedSkillIds.includes(skill.id);
                  const isAcknowledged = acknowledgedSkillIds.includes(skill.id);
                  const isNew = isUnlocked && !isAcknowledged;

                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleNodeClick(skill, isUnlocked)}
                      className={`w-full z-10 p-3 rounded-lg border transition-all duration-300 relative select-none ${
                        isUnlocked
                          ? `bg-panel border-accent/25 hover:border-accent hover:bg-panel2 cursor-pointer shadow-[0_0_12px_rgba(110,142,251,0.05)] hover:shadow-[0_0_15px_rgba(110,142,251,0.15)]`
                          : 'bg-panel/10 border-textdim/5 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {/* Unread Glowing Pulse Badge */}
                      {isNew && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
                        </span>
                      )}

                      {/* Locked Lock Icon */}
                      {!isUnlocked && (
                        <span className="absolute top-2 right-2 text-[9px] opacity-40" title="Locked">
                          🔒
                        </span>
                      )}

                      {/* Unlocked Check Badge */}
                      {isUnlocked && isAcknowledged && (
                        <span className={`absolute top-2.5 right-2.5 text-[8px] font-bold ${cat.textClass}`}>
                          ●
                        </span>
                      )}

                      <h4
                        className={`text-xs font-bold tracking-wide ${
                          isUnlocked ? 'text-textmain' : 'text-textdim'
                        }`}
                      >
                        {skill.name}
                      </h4>

                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                        {isUnlocked ? (
                          <span className={`font-semibold ${cat.textClass}`}>UNLOCKED</span>
                        ) : (
                          <span className="text-textdim/55">LOCKED</span>
                        )}
                        <span className="text-textdim/50 font-semibold">
                          {skill.unlockAtStat} {cat.key.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Popover Modal Overlay */}
      {selectedSkill && (
        <div
          onClick={() => setSelectedSkill(null)}
          className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-md w-full p-7 text-center border-accent/40 bg-panel shadow-2xl relative overflow-hidden flex flex-col items-center animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent modal dismiss when clicking details card
          >
            {/* Popover Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/35 flex items-center justify-center text-accent text-2xl mb-2.5">
                ★
              </div>
              <h3 className="font-display font-extrabold text-xl tracking-wider text-textmain uppercase">
                {selectedSkill.name}
              </h3>
              <span className="text-[9px] font-mono uppercase tracking-widest text-accent2 bg-accent2/10 border border-accent2/20 px-2.5 py-0.5 rounded mt-1.5">
                Unlocked at {selectedSkill.unlockAtStat} {selectedSkill.statKey.toUpperCase()}
              </span>
            </div>

            {/* Description Body */}
            <p className="text-sm text-textdim font-sans leading-relaxed text-center px-2 py-4 bg-panel2/30 border border-accent/5 rounded-md">
              {selectedSkill.description}
            </p>

            {/* Close controls */}
            <div className="w-full mt-6">
              <button
                onClick={() => setSelectedSkill(null)}
                className="w-full bg-accent/15 border border-accent/30 hover:bg-accent/25 text-accent text-xs font-mono font-bold py-2 rounded cursor-pointer transition-colors duration-300"
              >
                Close Parameters
              </button>
            </div>
          </SystemPanel>
        </div>
      )}
    </div>
  );
};

export default SkillTree;
