import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import type { Stats } from './PlayerContext';

export interface Quest {
  id: string;
  name: string;
  xp: number;
  statKey: keyof Stats;
  done: boolean;
  recurring: 'daily';
}

interface QuestContextType {
  quests: Quest[];
  streak: number;
  lastCompletedDate: string | null;
  addQuest: (name: string, xp: number, statKey: keyof Stats) => void;
  updateQuest: (id: string, name: string, xp: number, statKey: keyof Stats) => void;
  deleteQuest: (id: string) => void;
  toggleQuest: (id: string) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_quests';

export const getLocalDateString = (d: Date = new Date()): string => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

export const QuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gainXP } = usePlayer();

  // Load initial state synchronously
  const state = (() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          questsByDate: parsed.questsByDate || {},
          streak: parsed.streak ?? 0,
          lastCompletedDate: parsed.lastCompletedDate || null,
        };
      } catch (e) {
        console.error('Failed to parse quests from localStorage', e);
      }
    }
    return {
      questsByDate: {} as Record<string, Quest[]>,
      streak: 0,
      lastCompletedDate: null as string | null,
    };
  })();

  const [questsByDate, setQuestsByDate] = useState<Record<string, Quest[]>>(state.questsByDate);
  const [streak, setStreak] = useState<number>(state.streak);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(state.lastCompletedDate);

  const todayStr = getLocalDateString();

  // Handle daily carry-over & streak reset on mount
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    // 1. Check if streak was broken (missed yesterday)
    if (lastCompletedDate && lastCompletedDate !== todayStr && lastCompletedDate !== yesterdayStr) {
      setStreak(0);
    }

    // 2. Initialize today's quests (carry over from the most recent day with quests)
    if (!questsByDate[todayStr]) {
      const dates = Object.keys(questsByDate).sort();
      if (dates.length > 0) {
        const mostRecentDate = dates[dates.length - 1];
        const recentQuests = questsByDate[mostRecentDate] || [];
        // Carry over as active (done: false)
        const carriedQuests = recentQuests.map((q) => ({
          ...q,
          done: false,
        }));
        setQuestsByDate((prev) => ({
          ...prev,
          [todayStr]: carriedQuests,
        }));
      } else {
        // Default seed if completely fresh, or just empty
        setQuestsByDate((prev) => ({
          ...prev,
          [todayStr]: [],
        }));
      }
    }
  }, [lastCompletedDate, todayStr]);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ questsByDate, streak, lastCompletedDate })
    );
  }, [questsByDate, streak, lastCompletedDate]);

  const addQuest = (name: string, xp: number, statKey: keyof Stats) => {
    const newQuest: Quest = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      xp,
      statKey,
      done: false,
      recurring: 'daily',
    };
    setQuestsByDate((prev) => ({
      ...prev,
      [todayStr]: [...(prev[todayStr] || []), newQuest],
    }));
  };

  const updateQuest = (id: string, name: string, xp: number, statKey: keyof Stats) => {
    setQuestsByDate((prev) => {
      const todayQuests = prev[todayStr] || [];
      const updated = todayQuests.map((q) =>
        q.id === id ? { ...q, name, xp, statKey } : q
      );
      return {
        ...prev,
        [todayStr]: updated,
      };
    });
  };

  const deleteQuest = (id: string) => {
    setQuestsByDate((prev) => {
      const todayQuests = prev[todayStr] || [];
      const updated = todayQuests.filter((q) => q.id !== id);
      return {
        ...prev,
        [todayStr]: updated,
      };
    });
  };

  const toggleQuest = (id: string) => {
    let questToAward: Quest | null = null;

    setQuestsByDate((prev) => {
      const todayQuests = prev[todayStr] || [];
      const targetQuest = todayQuests.find((q) => q.id === id);
      if (!targetQuest) return prev;

      if (!targetQuest.done) {
        questToAward = targetQuest;
      }

      const updatedQuests = todayQuests.map((q) =>
        q.id === id ? { ...q, done: !q.done } : q
      );

      const allCompleted = updatedQuests.length > 0 && updatedQuests.every((q) => q.done);

      if (allCompleted) {
        if (lastCompletedDate !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = getLocalDateString(yesterday);

          let newStreak = 1;
          if (lastCompletedDate === yesterdayStr) {
            newStreak = streak + 1;
          }

          setStreak(newStreak);
          setLastCompletedDate(todayStr);
        }
      } else {
        if (lastCompletedDate === todayStr) {
          setStreak((prevStreak) => Math.max(0, prevStreak - 1));
          
          const completedDates = Object.keys(prev)
            .filter((d) => d !== todayStr)
            .filter((d) => prev[d].length > 0 && prev[d].every((q) => q.done));

          const lastVal = completedDates.length > 0 ? completedDates.sort()[completedDates.length - 1] : null;
          setLastCompletedDate(lastVal);
        }
      }

      return {
        ...prev,
        [todayStr]: updatedQuests,
      };
    });

    if (questToAward) {
      const q = questToAward as Quest;
      gainXP(q.xp, q.statKey);
    }
  };

  const quests = questsByDate[todayStr] || [];

  return (
    <QuestContext.Provider
      value={{
        quests,
        streak,
        lastCompletedDate,
        addQuest,
        updateQuest,
        deleteQuest,
        toggleQuest,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
};
