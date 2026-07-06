import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { Stats } from '../context/PlayerContext';
import { SystemPanel } from './SystemPanel';

export const StatusWindow: React.FC = () => {
  const { stats, gainXP } = usePlayer();
  const [testAmount, setTestAmount] = useState<number>(250);
  const [selectedStat, setSelectedStat] = useState<keyof Stats>('strength');

  const statList: { key: keyof Stats; label: string; colorClass: string; desc: string }[] = [
    { key: 'strength', label: 'STR (Strength)', colorClass: 'bg-bronze', desc: 'Physical power and stamina' },
    { key: 'intellect', label: 'INT (Intellect)', colorClass: 'bg-accent', desc: 'Mental capacity and intelligence' },
    { key: 'vitality', label: 'VIT (Vitality)', colorClass: 'bg-danger', desc: 'Health, stamina, and recovery rate' },
    { key: 'focus', label: 'FOC (Focus)', colorClass: 'bg-accent2', desc: 'Concentration, discipline, and attention' },
    { key: 'willpower', label: 'WIL (Willpower)', colorClass: 'bg-xpgreen', desc: 'Mental resilience and determination' },
  ];

  return (
    <SystemPanel glow={true} className="p-6">
      <div className="flex items-center justify-between border-b border-accent/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">🛡</span>
          <h2 className="font-display font-bold text-lg tracking-wider text-textmain">
            CHARACTER STATUS
          </h2>
        </div>
        <span className="text-xs font-mono text-accent uppercase tracking-widest">
          Active Stats
        </span>
      </div>

      {/* Stats List */}
      <div className="space-y-4 mb-6">
        {statList.map(({ key, label, colorClass, desc }) => {
          const val = stats[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className="text-textdim font-medium hover:text-textmain transition-colors cursor-help" title={desc}>
                  {label}
                </span>
                <span className="text-textmain font-bold font-mono">
                  {val} <span className="text-textdim/30 text-[10px]">/ 100</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-panel2 border border-accent/10 rounded-full overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Testing Interface */}
      <div className="border-t border-accent/15 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[10px] bg-accent/10 text-accent font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-accent/20">
            SYSTEM CONTROL
          </span>
          <span className="text-[10px] text-textdim font-mono">Simulate Quest Complete</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-textdim font-mono uppercase tracking-wide">Target Attribute</label>
            <select
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value as keyof Stats)}
              className="bg-panel2 border border-accent/20 rounded p-1.5 text-xs text-textmain font-mono focus:outline-none focus:border-accent cursor-pointer transition-colors duration-300"
            >
              {statList.map(({ key }) => (
                <option key={key} value={key} className="bg-panel">
                  {key.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-textdim font-mono uppercase tracking-wide">Reward XP</label>
            <select
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="bg-panel2 border border-accent/20 rounded p-1.5 text-xs text-textmain font-mono focus:outline-none focus:border-accent cursor-pointer transition-colors duration-300"
            >
              <option value={50} className="bg-panel">50 XP</option>
              <option value={250} className="bg-panel">250 XP</option>
              <option value={1000} className="bg-panel">1000 XP</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => gainXP(testAmount, selectedStat)}
          className="w-full bg-accent/10 border border-accent/30 hover:bg-accent/25 hover:border-accent/60 text-accent font-display text-xs py-2.5 px-4 rounded transition-all duration-300 font-bold uppercase tracking-wider active:scale-[0.98] shadow-sm"
        >
          Inject +{testAmount} XP & Boost {selectedStat.toUpperCase()}
        </button>
      </div>
    </SystemPanel>
  );
};

export default StatusWindow;
