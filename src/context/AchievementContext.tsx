import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import type { Stats } from './PlayerContext';
import { useQuests } from './QuestContext';
import { useCampaigns } from './CampaignContext';
import type { Campaign } from './CampaignContext';
import { useCourses } from './CourseContext';
import type { Course } from './CourseContext';

export interface Achievement {
  id: string;
  title: string;
  conditionDescription: string;
  condition: (
    playerLevel: number,
    stats: Stats,
    streak: number,
    campaigns: Campaign[],
    courses: Course[]
  ) => boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockDate: number;
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  activeTitleId: string | null;
  equipTitle: (id: string | null) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_achievements';

const getLifetimeQuestsCompleted = (): number => {
  const saved = localStorage.getItem('ascension_quests');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.questsByDate) {
        return Object.values(parsed.questsByDate)
          .flat()
          .filter((q: any) => q.done).length;
      }
    } catch (e) {
      console.error('Failed to parse quests for achievements count', e);
    }
  }
  return 0;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'novice_hunter',
    title: 'Novice Hunter',
    conditionDescription: 'Reach Level 5',
    condition: (lvl) => lvl >= 5,
  },
  {
    id: 'elite_hunter',
    title: 'Elite Hunter',
    conditionDescription: 'Reach Level 30 (B-Rank)',
    condition: (lvl) => lvl >= 30,
  },
  {
    id: 'apex_sovereign',
    title: 'Apex Sovereign',
    conditionDescription: 'Reach Level 50',
    condition: (lvl) => lvl >= 50,
  },
  {
    id: 'quest_initiate',
    title: 'Quest Initiate',
    conditionDescription: 'Complete 5 daily quests lifetime',
    condition: () => getLifetimeQuestsCompleted() >= 5,
  },
  {
    id: 'task_slayer',
    title: 'Task Slayer',
    conditionDescription: 'Complete 50 daily quests lifetime',
    condition: () => getLifetimeQuestsCompleted() >= 50,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    conditionDescription: 'Reach a 7-day completion streak',
    condition: (_, __, streak) => streak >= 7,
  },
  {
    id: 'dungeon_raider',
    title: 'Dungeon Raider',
    conditionDescription: 'Clear at least one study dungeon (course)',
    condition: (_, __, ___, ____, courses) =>
      courses.some((c) => c.videos.length > 0 && c.videos.every((v) => v.watched)),
  },
  {
    id: 'campaign_conqueror',
    title: 'Campaign Conqueror',
    conditionDescription: 'Successfully complete one long-term campaign',
    condition: (_, __, ___, campaigns) =>
      campaigns.some((c) => c.milestones.length > 0 && c.milestones.every((m) => m.done)),
  },
];

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level, stats } = usePlayer();
  const { streak } = useQuests();
  const { campaigns } = useCampaigns();
  const { courses } = useCourses();

  // Unlocked list
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  // Active title
  const [activeTitleId, setActiveTitleId] = useState<string | null>(null);
  // Toast notifications
  const [toastTitle, setToastTitle] = useState<string | null>(null);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.unlocked)) {
          setUnlocked(parsed.unlocked);
        }
        if (typeof parsed.activeTitleId === 'string' || parsed.activeTitleId === null) {
          setActiveTitleId(parsed.activeTitleId);
        }
      } catch (e) {
        console.error('Failed to load achievements from localStorage', e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ unlocked, activeTitleId })
    );
  }, [unlocked, activeTitleId]);

  // Reactive unlock checks
  useEffect(() => {
    const currentUnlockedIds = unlocked.map((u) => u.id);
    let updatedUnlocked = [...unlocked];
    let didChange = false;

    ACHIEVEMENTS.forEach((ach) => {
      if (!currentUnlockedIds.includes(ach.id)) {
        const isMet = ach.condition(level, stats, streak, campaigns, courses);
        if (isMet) {
          updatedUnlocked.push({
            id: ach.id,
            unlockDate: Date.now(),
          });
          didChange = true;
          // Trigger the bottom-right toast
          triggerToast(ach.title);
        }
      }
    });

    if (didChange) {
      setUnlocked(updatedUnlocked);
    }
  }, [level, stats, streak, campaigns, courses]);

  const triggerToast = (title: string) => {
    setToastTitle(title);
  };

  // Toast auto-dismissal
  useEffect(() => {
    if (toastTitle) {
      const timer = setTimeout(() => {
        setToastTitle(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastTitle]);

  const equipTitle = (id: string | null) => {
    if (id === null || unlocked.some((u) => u.id === id)) {
      setActiveTitleId(id);
    }
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        unlockedAchievements: unlocked,
        activeTitleId,
        equipTitle,
      }}
    >
      {children}

      {/* Title Earned Toast alert */}
      {toastTitle && (
        <div className="fixed bottom-6 right-6 bg-panel border border-bronze/40 text-bronze px-4 py-3.5 rounded-lg shadow-2xl z-[99999] animate-scaleUp flex items-center gap-2.5 font-mono text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bronze opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-bronze"></span>
          </span>
          🏆 Title Earned: {toastTitle}
        </div>
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
