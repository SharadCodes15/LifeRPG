import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import type { Stats } from './PlayerContext';

export interface OneOffTask {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  xp?: number;
  statKey?: keyof Stats;
  done: boolean;
}

interface ScheduleContextType {
  oneOffTasks: OneOffTask[];
  milestoneDueDates: Record<string, string>; // milestoneId -> dateStr
  addOneOffTask: (name: string, date: string, time?: string, xp?: number, statKey?: keyof Stats) => void;
  toggleOneOffTask: (id: string) => void;
  deleteOneOffTask: (id: string) => void;
  scheduleMilestone: (milestoneId: string, date: string) => void;
  unscheduleMilestone: (milestoneId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_schedule';

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gainXP } = usePlayer();

  const initialState = (() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          oneOffTasks: (parsed.oneOffTasks || []) as OneOffTask[],
          milestoneDueDates: (parsed.milestoneDueDates || {}) as Record<string, string>,
        };
      } catch (e) {
        console.error('Failed to parse schedule from localStorage', e);
      }
    }
    return {
      oneOffTasks: [] as OneOffTask[],
      milestoneDueDates: {} as Record<string, string>,
    };
  })();

  const [oneOffTasks, setOneOffTasks] = useState<OneOffTask[]>(initialState.oneOffTasks);
  const [milestoneDueDates, setMilestoneDueDates] = useState<Record<string, string>>(initialState.milestoneDueDates);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ oneOffTasks, milestoneDueDates })
    );
  }, [oneOffTasks, milestoneDueDates]);

  const addOneOffTask = (
    name: string,
    date: string,
    time?: string,
    xp?: number,
    statKey?: keyof Stats
  ) => {
    const newTask: OneOffTask = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      date,
      time: time || undefined,
      xp: xp || undefined,
      statKey: statKey || undefined,
      done: false,
    };
    setOneOffTasks((prev) => [...prev, newTask]);
  };

  const toggleOneOffTask = (id: string) => {
    let taskToAward: OneOffTask | null = null;

    setOneOffTasks((prev) => {
      return prev.map((task) => {
        if (task.id !== id) return task;

        const isTurningDone = !task.done;
        if (isTurningDone && task.xp) {
          taskToAward = task;
        }
        return { ...task, done: isTurningDone };
      });
    });

    if (taskToAward) {
      const t = taskToAward as OneOffTask;
      gainXP(t.xp || 0, t.statKey);
    }
  };

  const deleteOneOffTask = (id: string) => {
    setOneOffTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const scheduleMilestone = (milestoneId: string, date: string) => {
    setMilestoneDueDates((prev) => ({
      ...prev,
      [milestoneId]: date,
    }));
  };

  const unscheduleMilestone = (milestoneId: string) => {
    setMilestoneDueDates((prev) => {
      const updated = { ...prev };
      delete updated[milestoneId];
      return updated;
    });
  };

  return (
    <ScheduleContext.Provider
      value={{
        oneOffTasks,
        milestoneDueDates,
        addOneOffTask,
        toggleOneOffTask,
        deleteOneOffTask,
        scheduleMilestone,
        unscheduleMilestone,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
