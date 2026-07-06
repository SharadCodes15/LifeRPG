import React, { useState } from 'react';
import { useQuests } from '../context/QuestContext';
import type { Quest } from '../context/QuestContext';
import { SystemPanel } from './SystemPanel';
import type { Stats } from '../context/PlayerContext';

export const DailyQuests: React.FC = () => {
  const { quests, addQuest, updateQuest, deleteQuest, toggleQuest } = useQuests();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [xp, setXp] = useState(50);
  const [statKey, setStatKey] = useState<keyof Stats>('strength');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingQuest) {
      updateQuest(editingQuest.id, name, xp, statKey);
      setEditingQuest(null);
    } else {
      addQuest(name, xp, statKey);
    }

    // Reset Form
    setName('');
    setXp(50);
    setStatKey('strength');
    setIsFormOpen(false);
  };

  const handleEditClick = (quest: Quest) => {
    setEditingQuest(quest);
    setName(quest.name);
    setXp(quest.xp);
    setStatKey(quest.statKey);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditingQuest(null);
    setName('');
    setXp(50);
    setStatKey('strength');
    setIsFormOpen(false);
  };

  const statsOptions: { value: keyof Stats; label: string }[] = [
    { value: 'strength', label: 'STR (Strength)' },
    { value: 'intellect', label: 'INT (Intellect)' },
    { value: 'vitality', label: 'VIT (Vitality)' },
    { value: 'focus', label: 'FOC (Focus)' },
    { value: 'willpower', label: 'WIL (Willpower)' },
  ];

  return (
    <SystemPanel glow={false} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-accent/15 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">✦</span>
          <h2 className="font-display font-bold text-lg tracking-wider text-textmain">
            DAILY QUESTS
          </h2>
        </div>
        <button
          onClick={() => {
            if (isFormOpen) {
              handleCancel();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="text-xs font-mono text-accent hover:text-accent2 transition-colors duration-300 uppercase tracking-wider flex items-center gap-1"
        >
          {isFormOpen ? '✖ Close' : '✚ Register'}
        </button>
      </div>

      {/* Inline Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 bg-panel2/40 border border-accent/20 rounded p-4 space-y-3 transition-all duration-300"
        >
          <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
            {editingQuest ? 'Modify Quest Parameters' : 'Register Daily Quest'}
          </h3>

          <div className="space-y-1">
            <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Quest Objective</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 50 Pushups, Read 20 mins, Study React"
              className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent transition-colors duration-300"
              maxLength={40}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">XP Reward</label>
              <input
                type="number"
                value={xp}
                onChange={(e) => setXp(Math.max(1, Number(e.target.value)))}
                className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent font-mono"
                min={1}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Trains Attribute</label>
              <select
                value={statKey}
                onChange={(e) => setStatKey(e.target.value as keyof Stats)}
                className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono cursor-pointer"
              >
                {statsOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-panel">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded transition-colors duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded transition-colors duration-300 cursor-pointer"
            >
              {editingQuest ? 'Save Updates' : 'Initialize Quest'}
            </button>
          </div>
        </form>
      )}

      {/* Quest List */}
      {quests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-accent/15 rounded-lg bg-panel2/20">
          <div className="w-10 h-10 rounded-full border border-accent/15 flex items-center justify-center text-textdim/30 mb-3 font-mono text-sm">
            !
          </div>
          <p className="text-xs font-semibold text-textdim mb-1 text-center font-display tracking-wide uppercase">
            NO ACTIVE QUESTS FOR TODAY
          </p>
          <p className="text-[10px] text-textdim/50 text-center max-w-xs">
            Begin the daily training cycle by registering your habits using the top right button.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center justify-between p-3.5 bg-panel2/20 border rounded transition-all duration-300 group ${
                quest.done ? 'border-accent/5' : 'border-accent/15 hover:border-accent/35'
              }`}
            >
              {/* Checkbox and Label */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleQuest(quest.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center font-mono text-xs transition-all duration-300 cursor-pointer ${
                    quest.done
                      ? 'bg-accent/25 border-accent text-accent'
                      : 'border-accent/30 hover:border-accent text-transparent'
                  }`}
                >
                  ✔
                </button>
                <span
                  className={`text-sm tracking-wide font-medium transition-all duration-300 ${
                    quest.done ? 'line-through text-textdim/40 font-normal' : 'text-textmain'
                  }`}
                >
                  {quest.name}
                </span>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-textdim/40 px-1.5 py-0.5 bg-panel border border-accent/5 rounded">
                    {quest.statKey.slice(0, 3)}
                  </span>
                  <span className="bg-panel border border-bronze/30 text-bronze text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                    +{quest.xp} XP
                  </span>
                </div>

                {/* CRUD Actions on Hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity duration-300">
                  <button
                    onClick={() => handleEditClick(quest)}
                    className="text-[11px] text-accent hover:text-accent2 transition-colors cursor-pointer"
                    title="Edit Quest"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => deleteQuest(quest.id)}
                    className="text-[11px] text-danger hover:text-danger/80 transition-colors cursor-pointer"
                    title="Delete Quest"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SystemPanel>
  );
};

export default DailyQuests;
