import React, { useState } from 'react';
import type { Stats } from '../context/PlayerContext';
import { useQuests } from '../context/QuestContext';
import type { Quest } from '../context/QuestContext';
import { useCampaigns } from '../context/CampaignContext';
import { useSchedule } from '../context/ScheduleContext';
import { SystemPanel } from './SystemPanel';

// Helper date math functions
const getMondayOfDate = (d: Date): Date => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
};

const getLocalDateString = (d: Date = new Date()): string => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

export const Planner: React.FC = () => {
  const { quests } = useQuests();
  const { campaigns, toggleMilestone } = useCampaigns();
  const {
    oneOffTasks,
    milestoneDueDates,
    addOneOffTask,
    toggleOneOffTask,
    deleteOneOffTask,
    scheduleMilestone,
    unscheduleMilestone,
  } = useSchedule();

  // Navigation state: tracks the Monday date of the week being viewed
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfDate(new Date()));

  // Form states
  const [activeAddDay, setActiveAddDay] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskXp, setTaskXp] = useState(25);
  const [taskStatKey, setTaskStatKey] = useState<keyof Stats | 'none'>('none');

  // Milestone scheduling drawer state (day string -> boolean)
  const [activeScheduleDay, setActiveScheduleDay] = useState<string | null>(null);

  const todayStr = getLocalDateString();

  // Shift weeks
  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleJumpToToday = () => {
    setWeekStart(getMondayOfDate(new Date()));
  };

  // Generate the 7 days of the viewed week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const getQuestsForDate = (dateStr: string): Quest[] => {
    const saved = localStorage.getItem('ascension_quests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.questsByDate && parsed.questsByDate[dateStr]) {
          return parsed.questsByDate[dateStr];
        }
      } catch (e) {
        console.error('Failed to parse quests database', e);
      }
    }
    // Fallback template (as incomplete) for future days or if history is missing
    return quests.map((q) => ({ ...q, done: false }));
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !activeAddDay) return;

    addOneOffTask(
      taskName,
      activeAddDay,
      taskTime || undefined,
      taskXp || undefined,
      taskStatKey === 'none' ? undefined : taskStatKey
    );

    // Reset Form
    setTaskName('');
    setTaskTime('');
    setTaskXp(25);
    setTaskStatKey('none');
    setActiveAddDay(null);
  };

  // Fetch incomplete campaign milestones not already scheduled
  const getUnscheduledMilestones = () => {
    return campaigns.flatMap((c) =>
      c.milestones
        .filter((m) => !m.done && !milestoneDueDates[m.id])
        .map((m) => ({
          ...m,
          campaignId: c.id,
          campaignTitle: c.title,
        }))
    );
  };

  const statsOptions: { value: keyof Stats | 'none'; label: string }[] = [
    { value: 'none', label: 'None (No Stat Boost)' },
    { value: 'strength', label: 'STR (Strength)' },
    { value: 'intellect', label: 'INT (Intellect)' },
    { value: 'vitality', label: 'VIT (Vitality)' },
    { value: 'focus', label: 'FOC (Focus)' },
    { value: 'willpower', label: 'WIL (Willpower)' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Planner Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel2 pb-4 mb-2">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent uppercase select-none">
            WEEKLY PLANNER
          </h2>
          <p className="text-xs text-textdim mt-1 font-mono uppercase">
            Schedule campaign milestones and register one-off daily objectives
          </p>
        </div>

        {/* Navigation Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handlePrevWeek}
            className="bg-panel border border-accent/15 hover:bg-panel2 text-textmain text-xs font-mono py-1.5 px-3 rounded cursor-pointer transition-all active:scale-95 select-none"
          >
            ◀ Prev
          </button>
          <button
            onClick={handleJumpToToday}
            className="bg-accent/10 border border-accent/35 hover:bg-accent/20 text-accent text-xs font-mono font-bold py-1.5 px-4 rounded cursor-pointer transition-all active:scale-95 select-none"
          >
            Today
          </button>
          <button
            onClick={handleNextWeek}
            className="bg-panel border border-accent/15 hover:bg-panel2 text-textmain text-xs font-mono py-1.5 px-3 rounded cursor-pointer transition-all active:scale-95 select-none"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Week Columns Grid */}
      <div className="grid grid-cols-1 bp-820:grid-cols-7 gap-4 items-start">
        {weekDays.map((day) => {
          const dateStr = getLocalDateString(day);
          const isTodayDay = dateStr === todayStr;
          const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });
          const dayNum = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          const dayQuests = getQuestsForDate(dateStr);
          const dayTasks = oneOffTasks.filter((t) => t.date === dateStr);

          // Find milestones due today
          const dayMilestones = campaigns.flatMap((c) =>
            c.milestones
              .filter((m) => milestoneDueDates[m.id] === dateStr)
              .map((m) => ({
                ...m,
                campaignId: c.id,
                campaignTitle: c.title,
                isBoss: c.milestones[c.milestones.length - 1].id === m.id,
              }))
          );

          const unscheduled = getUnscheduledMilestones();

          return (
            <div
              key={dateStr}
              className={`flex flex-col bg-panel/30 border rounded-lg overflow-hidden transition-all duration-300 ${
                isTodayDay
                  ? 'border-accent shadow-[0_0_15px_rgba(110,142,251,0.1)]'
                  : 'border-panel2 hover:border-accent/15'
              }`}
            >
              {/* Day Header Card */}
              <div
                className={`py-2 px-3 text-center border-b font-mono font-bold select-none ${
                  isTodayDay ? 'bg-accent/15 border-accent text-accent' : 'bg-panel border-panel2 text-textmain'
                }`}
              >
                <span className="text-xs uppercase tracking-wide block">{dayName}</span>
                <span className="text-[10px] opacity-60 block mt-0.5">{dayNum}</span>
              </div>

              {/* Day Contents Area */}
              <div className="p-3 space-y-4 min-h-[300px] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Daily Quests Subsection (Read-only) */}
                  {dayQuests.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-textdim/55 uppercase tracking-widest block font-bold">
                        Quests
                      </span>
                      <div className="space-y-1">
                        {dayQuests.map((q) => (
                          <div key={q.id} className="flex items-center gap-1.5 opacity-65 text-[11px] py-0.5">
                            <span className={q.done ? 'text-accent font-bold' : 'text-textdim/30'}>
                              {q.done ? '☑' : '☐'}
                            </span>
                            <span className={q.done ? 'line-through text-textdim/45' : 'text-textdim'}>
                              {q.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled One-off Tasks Subsection */}
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-textdim/55 uppercase tracking-widest block font-bold">
                        Objectives
                      </span>
                      <div className="space-y-1.5">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-1.5 border rounded text-[11px] bg-panel2/25 flex items-center justify-between group/task relative ${
                              t.done ? 'border-accent/10 opacity-60' : 'border-accent/25'
                            }`}
                          >
                            <div className="flex items-center gap-2 pr-4 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleOneOffTask(t.id)}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] cursor-pointer transition-all duration-300 shrink-0 ${
                                  t.done
                                    ? 'bg-accent border-accent text-panel font-bold'
                                    : 'border-accent/30 hover:border-accent text-transparent'
                                }`}
                              >
                                ✔
                              </button>
                              <div className="truncate">
                                <span className={t.done ? 'line-through text-textdim/45' : 'text-textmain font-medium'}>
                                  {t.name}
                                </span>
                                {t.time && (
                                  <span className="text-[8px] text-textdim/50 block font-mono">
                                    ⏰ {t.time}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Task payout badges */}
                            {t.xp && !t.done && (
                              <span className="text-[8px] font-mono font-bold text-bronze shrink-0 block">
                                +{t.xp}xp
                              </span>
                            )}

                            {/* Delete trigger */}
                            <button
                              onClick={() => deleteOneOffTask(t.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover/task:opacity-100 text-[8px] text-danger font-mono transition-opacity cursor-pointer"
                              title="Delete Task"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Campaign Milestones Subsection */}
                  {dayMilestones.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-bronze uppercase tracking-widest block font-bold">
                        Milestones
                      </span>
                      <div className="space-y-1.5">
                        {dayMilestones.map((m) => (
                          <div
                            key={m.id}
                            className={`p-1.5 border rounded text-[11px] bg-bronze/5 flex items-center justify-between group/ms relative ${
                              m.done
                                ? 'border-bronze/10 opacity-60'
                                : m.isBoss
                                ? 'border-bronze shadow-[0_0_5px_rgba(201,131,74,0.1)]'
                                : 'border-bronze/35 hover:border-bronze/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 pr-4 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleMilestone(m.campaignId, m.id)}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] cursor-pointer transition-all duration-300 shrink-0 ${
                                  m.done
                                    ? 'bg-bronze border-bronze text-panel font-bold'
                                    : 'border-bronze/45 hover:border-bronze text-transparent'
                                }`}
                              >
                                ✔
                              </button>
                              <div className="truncate">
                                <span className="text-[8px] font-mono text-bronze uppercase tracking-widest block select-none">
                                  {m.isBoss ? '★ Boss Stage' : 'Milestone'}
                                </span>
                                <span className={m.done ? 'line-through text-textdim/45' : 'text-textmain font-semibold'}>
                                  {m.name}
                                </span>
                                <span className="text-[8px] text-textdim/55 block truncate">
                                  [{m.campaignTitle}]
                                </span>
                              </div>
                            </div>

                            {/* Unschedule trigger */}
                            <button
                              onClick={() => unscheduleMilestone(m.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover/ms:opacity-100 text-[8px] text-textdim hover:text-danger font-mono transition-opacity cursor-pointer"
                              title="Unschedule Milestone"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Day Action Buttons */}
                <div className="border-t border-accent/5 pt-3 space-y-1.5 mt-4">
                  <button
                    onClick={() => setActiveAddDay(dateStr)}
                    className="w-full bg-panel border border-accent/15 hover:border-accent/40 text-textmain hover:text-accent font-mono text-[10px] py-1 rounded cursor-pointer text-center transition-all"
                  >
                    ✚ Task
                  </button>

                  {unscheduled.length > 0 && (
                    <div className="relative">
                      {activeScheduleDay === dateStr ? (
                        <div className="absolute bottom-full left-0 right-0 bg-panel border border-accent2/35 rounded-lg shadow-xl z-30 p-2 max-h-40 overflow-y-auto mb-1 space-y-1">
                          <span className="text-[8px] font-mono text-textdim uppercase tracking-wider block border-b border-accent/15 pb-1 select-none">
                            Select Milestone
                          </span>
                          {unscheduled.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                scheduleMilestone(m.id, dateStr);
                                setActiveScheduleDay(null);
                              }}
                              className="w-full text-left font-sans text-[10px] text-textmain hover:text-accent2 truncate py-1 hover:bg-panel2/50 rounded block"
                            >
                              {m.name} <span className="text-textdim/55">[{m.campaignTitle}]</span>
                            </button>
                          ))}
                          <button
                            onClick={() => setActiveScheduleDay(null)}
                            className="w-full text-center font-mono text-[8px] text-danger hover:text-danger/80 border-t border-accent/10 pt-1 block cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveScheduleDay(dateStr)}
                          className="w-full bg-panel border border-accent2/15 hover:border-accent2/40 text-textmain hover:text-accent2 font-mono text-[10px] py-1 rounded cursor-pointer text-center transition-all"
                        >
                          📅 Milestone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Popover Modal */}
      {activeAddDay && (
        <div
          onClick={() => setActiveAddDay(null)}
          className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-md w-full p-6 bg-panel border-accent/40 shadow-2xl relative overflow-hidden flex flex-col animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card body
          >
            <h3 className="font-display font-bold text-base tracking-wider text-accent uppercase mb-4">
              Schedule Objective ({activeAddDay})
            </h3>

            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Objective Name</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Purchase study guides, Gym session"
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent"
                  maxLength={40}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Schedule Time</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Reward XP</label>
                  <input
                    type="number"
                    value={taskXp}
                    onChange={(e) => setTaskXp(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Trains Stat Boost</label>
                <select
                  value={taskStatKey}
                  onChange={(e) => setTaskStatKey(e.target.value as keyof Stats | 'none')}
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono cursor-pointer"
                >
                  {statsOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-panel">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-accent/10 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveAddDay(null)}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-colors"
                >
                  Schedule Objective
                </button>
              </div>
            </form>
          </SystemPanel>
        </div>
      )}
    </div>
  );
};

export default Planner;
