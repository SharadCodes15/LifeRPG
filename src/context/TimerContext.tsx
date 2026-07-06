import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TimerLog {
  timestamp: number;
  durationMinutes: number;
}

interface TimerContextType {
  history: TimerLog[];
  totalMinutesToday: number;
  totalMinutesThisWeek: number;
  logSession: (durationMinutes: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_timer';

const isToday = (timestamp: number): boolean => {
  return new Date(timestamp).toDateString() === new Date().toDateString();
};

const isThisWeek = (timestamp: number): boolean => {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp <= ONE_WEEK_MS;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<TimerLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse timer log from localStorage', e);
      }
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const logSession = (durationMinutes: number) => {
    const newLog: TimerLog = {
      timestamp: Date.now(),
      durationMinutes,
    };
    setHistory((prev) => [...prev, newLog]);
  };

  // Compute stats
  const totalMinutesToday = history
    .filter((log) => isToday(log.timestamp))
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  const totalMinutesThisWeek = history
    .filter((log) => isThisWeek(log.timestamp))
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  return (
    <TimerContext.Provider
      value={{
        history,
        totalMinutesToday,
        totalMinutesThisWeek,
        logSession,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
