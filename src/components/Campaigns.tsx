import React, { useState } from 'react';
import { useCampaigns } from '../context/CampaignContext';
import { SystemPanel } from './SystemPanel';
import type { Stats } from '../context/PlayerContext';

export const Campaigns: React.FC = () => {
  const { campaigns, addCampaign, deleteCampaign, toggleMilestone } = useCampaigns();

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<{ name: string; xp: number; statKey: keyof Stats }[]>([
    { name: 'Research objective and set environment', xp: 100, statKey: 'intellect' },
    { name: 'Complete core implementation features', xp: 200, statKey: 'focus' },
    { name: 'Final Trial: Project deployment & review', xp: 500, statKey: 'willpower' },
  ]);

  // Card expanded states (campaign ID -> boolean)
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});

  const toggleExpand = (campaignId: string) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  const handleAddMilestoneRow = () => {
    setMilestones((prev) => [...prev, { name: '', xp: 100, statKey: 'strength' }]);
  };

  const handleRemoveMilestoneRow = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || milestones.length === 0) return;

    addCampaign(title, description, milestones);

    // Reset Form
    setTitle('');
    setDescription('');
    setMilestones([
      { name: 'Research phase', xp: 100, statKey: 'intellect' },
      { name: 'Final Trial: Build completion', xp: 500, statKey: 'willpower' },
    ]);
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setMilestones([
      { name: 'Research objective and set environment', xp: 100, statKey: 'intellect' },
      { name: 'Complete core implementation features', xp: 200, statKey: 'focus' },
      { name: 'Final Trial: Project deployment & review', xp: 500, statKey: 'willpower' },
    ]);
    setIsFormOpen(false);
  };

  const statsOptions: { value: keyof Stats; label: string }[] = [
    { value: 'strength', label: 'STR' },
    { value: 'intellect', label: 'INT' },
    { value: 'vitality', label: 'VIT' },
    { value: 'focus', label: 'FOC' },
    { value: 'willpower', label: 'WIL' },
  ];

  return (
    <SystemPanel glow={false} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-accent/15 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent2 text-lg">❖</span>
          <h2 className="font-display font-bold text-lg tracking-wider text-textmain">
            CAMPAIGNS
          </h2>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="text-xs font-mono text-accent2 hover:text-accent transition-colors duration-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          {isFormOpen ? '✖ Close' : '✚ Form Campaign'}
        </button>
      </div>

      {/* Campaign Builder Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-panel2/40 border border-accent2/20 rounded p-4 space-y-4 transition-all duration-300"
        >
          <h3 className="text-xs font-mono font-bold text-accent2 uppercase tracking-wider">
            Initiate Long-Term Campaign
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build Portfolios, Practice Run"
                className="w-full bg-bg border border-accent2/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent2 transition-colors duration-300"
                maxLength={40}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Description / Ultimate Objective</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the campaign arc's parameters and ultimate target..."
                className="w-full bg-bg border border-accent2/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent2 h-16 resize-none transition-colors duration-300"
                maxLength={200}
              />
            </div>

            {/* Milestones Builder */}
            <div className="space-y-2 border-t border-accent2/10 pt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-textdim uppercase tracking-wider font-bold">Milestones / Trial Phases</span>
                <button
                  type="button"
                  onClick={handleAddMilestoneRow}
                  className="text-[10px] font-mono text-accent2 hover:text-accent flex items-center gap-1 cursor-pointer"
                >
                  ✚ Add Step
                </button>
              </div>

              {milestones.map((m, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center bg-bg/40 border border-accent2/10 p-2 rounded relative group/row"
                >
                  <div className="flex-grow space-y-1">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                      placeholder={`Step ${index + 1} Name`}
                      className="w-full bg-bg border border-accent2/10 rounded px-2 py-1 text-xs text-textmain focus:outline-none focus:border-accent2"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-textdim uppercase">XP:</span>
                        <input
                          type="number"
                          value={m.xp}
                          onChange={(e) => handleMilestoneChange(index, 'xp', Math.max(1, Number(e.target.value)))}
                          className="w-full bg-bg border border-accent2/10 rounded px-1.5 py-0.5 text-xs text-textmain font-mono"
                          min={1}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-textdim uppercase">Stat:</span>
                        <select
                          value={m.statKey}
                          onChange={(e) => handleMilestoneChange(index, 'statKey', e.target.value)}
                          className="w-full bg-bg border border-accent2/10 rounded p-0.5 text-[10px] text-textmain font-mono cursor-pointer"
                        >
                          {statsOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-panel">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestoneRow(index)}
                      className="text-danger hover:text-danger/80 text-xs px-1 cursor-pointer"
                      title="Remove Step"
                    >
                      ✖
                    </button>
                  )}
                  {index === milestones.length - 1 && (
                    <div className="absolute -top-2 right-2 bg-bronze/10 border border-bronze/35 text-bronze text-[7px] font-mono font-bold px-1.5 rounded uppercase tracking-wider select-none">
                      Boss
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded transition-colors duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent2/15 border border-accent2/40 hover:bg-accent2/25 text-accent2 text-xs font-mono font-bold rounded transition-colors duration-300 cursor-pointer"
            >
              Initialize Campaign
            </button>
          </div>
        </form>
      )}

      {/* Campaigns list */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-accent/15 rounded-lg bg-panel2/20">
          <div className="w-10 h-10 rounded-full border border-accent/15 flex items-center justify-center text-textdim/30 mb-3 font-mono text-sm">
            ❖
          </div>
          <p className="text-xs font-semibold text-textdim mb-1 text-center font-display tracking-wide uppercase">
            NO ACTIVE CAMPAIGNS
          </p>
          <p className="text-[10px] text-textdim/50 text-center max-w-xs">
            Form a long-term campaign with custom progression milestones to embark on complex training arcs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const total = campaign.milestones.length;
            const completed = campaign.milestones.filter((m) => m.done).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isExpanded = expandedCampaigns[campaign.id] ?? false;

            return (
              <div
                key={campaign.id}
                className="bg-panel2/20 border border-accent/10 hover:border-accent/25 rounded-lg p-4 transition-all duration-300 group"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start gap-4">
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => toggleExpand(campaign.id)}
                  >
                    <h3 className="font-display font-bold text-sm tracking-wide text-textmain group-hover:text-accent2 transition-colors duration-300">
                      {campaign.title}
                    </h3>
                    {campaign.description && (
                      <p className="text-xs text-textdim/60 mt-1 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="opacity-0 group-hover:opacity-100 text-textdim hover:text-danger transition-all duration-300 text-xs font-mono cursor-pointer"
                    title="Terminate Campaign"
                  >
                    🗑
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-grow bg-panel2 border border-accent/5 rounded-full h-2.5 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent transition-all duration-300 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-textdim/80 whitespace-nowrap min-w-[70px] text-right">
                    {completed}/{total} Trials ({pct}%)
                  </span>
                </div>

                {/* Milestones checklist */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(campaign.id)}
                    className="text-[10px] font-mono text-textdim/60 hover:text-textmain flex items-center gap-1 cursor-pointer select-none"
                  >
                    {isExpanded ? '▼ Hide Milestone Trials' : '▶ Show Milestone Trials'}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-accent/10 pt-3">
                      {campaign.milestones.map((m, index) => {
                        const isBoss = index === total - 1;

                        if (isBoss) {
                          // Boss Milestone Style
                          return (
                            <div
                              key={m.id}
                              className={`border rounded p-3 transition-all duration-300 flex items-center justify-between gap-3 ${
                                m.done
                                  ? 'border-bronze/10 bg-bronze/5 opacity-55'
                                  : 'border-bronze/45 bg-bronze/10 hover:border-bronze shadow-[0_0_8px_rgba(201,131,74,0.1)]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleMilestone(campaign.id, m.id)}
                                  className={`w-5 h-5 rounded border flex items-center justify-center font-mono text-xs transition-all duration-300 cursor-pointer ${
                                    m.done
                                      ? 'bg-bronze/25 border-bronze text-bronze'
                                      : 'border-bronze/40 hover:border-bronze text-transparent'
                                  }`}
                                >
                                  ✔
                                </button>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-bronze uppercase tracking-widest block mb-0.5 select-none">
                                    ★ FINAL TRIAL (BOSS STAGE) ★
                                  </span>
                                  <span
                                    className={`text-xs font-medium tracking-wide transition-all ${
                                      m.done ? 'line-through text-textdim/50' : 'text-textmain font-bold'
                                    }`}
                                  >
                                    {m.name}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[8px] font-mono font-semibold uppercase tracking-wider text-textdim/40 px-1.5 py-0.5 bg-panel border border-accent/5 rounded">
                                  {m.statKey.slice(0, 3)}
                                </span>
                                <span className="bg-panel border border-bronze text-bronze text-[9px] font-mono font-bold px-2.5 py-0.5 rounded shadow">
                                  +{m.xp} XP
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Normal Milestone Style
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center justify-between p-2.5 bg-panel2/15 border rounded transition-all duration-300 ${
                              m.done
                                ? 'border-accent/5 opacity-60'
                                : 'border-accent/15 hover:border-accent/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => toggleMilestone(campaign.id, m.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center font-mono text-[9px] transition-all duration-300 cursor-pointer ${
                                  m.done
                                    ? 'bg-accent/25 border-accent text-accent'
                                    : 'border-accent/20 hover:border-accent text-transparent'
                                }`}
                              >
                                ✔
                              </button>
                              <span
                                className={`text-xs tracking-wide font-medium transition-all ${
                                  m.done ? 'line-through text-textdim/40' : 'text-textmain'
                                }`}
                              >
                                {m.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-mono font-semibold uppercase tracking-wider text-textdim/40 px-1.5 py-0.5 bg-panel border border-accent/5 rounded">
                                {m.statKey.slice(0, 3)}
                              </span>
                              <span className="bg-panel border border-bronze/35 text-bronze text-[9px] font-mono font-semibold px-2 py-0.5 rounded shadow-sm">
                                +{m.xp} XP
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SystemPanel>
  );
};

export default Campaigns;
