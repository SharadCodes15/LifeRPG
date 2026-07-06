import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';

export interface Reward {
  id: string;
  name: string;
  cost: number;
}

export interface RedemptionLog {
  id: string;
  rewardName: string;
  cost: number;
  timestamp: number;
}

interface ShopContextType {
  rewards: Reward[];
  history: RedemptionLog[];
  addReward: (name: string, cost: number) => void;
  editReward: (id: string, name: string, cost: number) => void;
  deleteReward: (id: string) => void;
  redeemReward: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_shop';

const DEFAULT_REWARDS: Reward[] = [
  { id: 'default_1', name: 'Watch 1 episode of a show', cost: 10 },
  { id: 'default_2', name: 'Cheat meal / Order dessert', cost: 25 },
  { id: 'default_3', name: '30 minutes of gaming', cost: 15 },
];

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deductGold } = usePlayer();

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.rewards)) return parsed.rewards;
      } catch (e) {
        console.error('Failed to parse rewards list from localStorage', e);
      }
    }
    return DEFAULT_REWARDS;
  });

  const [history, setHistory] = useState<RedemptionLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.history)) return parsed.history;
      } catch (e) {
        console.error('Failed to parse redemption history from localStorage', e);
      }
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ rewards, history }));
  }, [rewards, history]);

  const addReward = (name: string, cost: number) => {
    const newReward: Reward = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      cost,
    };
    setRewards((prev) => [...prev, newReward]);
  };

  const editReward = (id: string, name: string, cost: number) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name, cost } : r))
    );
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  const redeemReward = (id: string) => {
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return;

    // Deduct gold from Player Context (honesty based, allowed even if short, caps at 0)
    deductGold(reward.cost);

    // Add entry to history
    const newLog: RedemptionLog = {
      id: Math.random().toString(36).substring(2, 9),
      rewardName: reward.name,
      cost: reward.cost,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newLog, ...prev]);
  };

  return (
    <ShopContext.Provider
      value={{
        rewards,
        history,
        addReward,
        editReward,
        deleteReward,
        redeemReward,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
