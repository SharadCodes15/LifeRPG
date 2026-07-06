import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import type { Stats } from './PlayerContext';

export interface Skill {
  id: string;
  name: string;
  statKey: keyof Stats;
  unlockAtStat: number;
  description: string;
}

interface SkillContextType {
  skills: Skill[];
  acknowledgedSkillIds: string[];
  unlockedSkillIds: string[];
  hasNewSkills: boolean;
  acknowledgeSkill: (id: string) => void;
  acknowledgeAllUnlocked: () => void;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_skills';

export const SKILLS: Skill[] = [
  // Strength (STR)
  {
    id: 'str_1',
    name: 'Iron Body',
    statKey: 'strength',
    unlockAtStat: 15,
    description: 'Toughen your muscular and skeletal structures. Passively increases physical resistance to exhaustion and fatigue.',
  },
  {
    id: 'str_2',
    name: 'Heavy Strike',
    statKey: 'strength',
    unlockAtStat: 35,
    description: 'Unleash high-impact kinetic output. Trains explosive muscle fiber recruitment and joint stability.',
  },
  {
    id: 'str_3',
    name: 'Limit Break',
    statKey: 'strength',
    unlockAtStat: 60,
    description: 'Temporarily bypass safety thresholds in raw force generation. Grants surges of high physical power.',
  },
  {
    id: 'str_4',
    name: 'Goliath Force',
    statKey: 'strength',
    unlockAtStat: 85,
    description: 'Peak muscular capacity. Possess structural force potential capable of breaking heavy barriers.',
  },

  // Intellect (INT)
  {
    id: 'int_1',
    name: 'Fast Learning',
    statKey: 'intellect',
    unlockAtStat: 15,
    description: 'Optimize cognitive mapping. Absorb and recall new structural information and concepts with higher fidelity.',
  },
  {
    id: 'int_2',
    name: 'Hyper-Focus',
    statKey: 'intellect',
    unlockAtStat: 35,
    description: 'Intense cognitive centering. Accelerate calculation speeds and mental problem-solving capabilities under pressure.',
  },
  {
    id: 'int_3',
    name: 'Polymath Recall',
    statKey: 'intellect',
    unlockAtStat: 60,
    description: 'Cross-reference multiple subjects instantly. Enhances lateral logic flows and situational deduction.',
  },
  {
    id: 'int_4',
    name: 'System Insight',
    statKey: 'intellect',
    unlockAtStat: 85,
    description: 'Complete mental model analysis. Possess insight into complex system parameters and core mechanisms.',
  },

  // Vitality (VIT)
  {
    id: 'vit_1',
    name: 'Rapid Recovery',
    statKey: 'vitality',
    unlockAtStat: 15,
    description: 'Accelerate physical healing during resting phases. Enhances cellular repair cycles and sleep quality.',
  },
  {
    id: 'vit_2',
    name: 'Stamina Boost',
    statKey: 'vitality',
    unlockAtStat: 35,
    description: 'Increase VO2 Max capacity. Reduces oxygen depletion rates during intensive aerobic or physical training.',
  },
  {
    id: 'vit_3',
    name: 'Immune Shield',
    statKey: 'vitality',
    unlockAtStat: 60,
    description: 'Maximize biological resilience. Total structural resistance to common biological contaminants and fatigue toxins.',
  },
  {
    id: 'vit_4',
    name: 'Indestructible',
    statKey: 'vitality',
    unlockAtStat: 85,
    description: 'Peak cell durability. Stabilizes core vitals even when subject to high physical stress or extreme environmental conditions.',
  },

  // Focus (FOC)
  {
    id: 'foc_1',
    name: 'Deep Work',
    statKey: 'focus',
    unlockAtStat: 15,
    description: 'Initiate flows of undisturbed attention. Filter out external distractions and maintain single-task alignment.',
  },
  {
    id: 'foc_2',
    name: 'Flow Control',
    statKey: 'focus',
    unlockAtStat: 35,
    description: 'Transition between cognitive focus fields with minimal delay. Eliminates residual attention residue.',
  },
  {
    id: 'foc_3',
    name: 'Time Dilation',
    statKey: 'focus',
    unlockAtStat: 60,
    description: 'Subjective clock rate deceleration during intensive focus. Grants increased observation and precision rates.',
  },
  {
    id: 'foc_4',
    name: 'Absolute Zone',
    statKey: 'focus',
    unlockAtStat: 85,
    description: 'Flawless execution. Complete synchronization of mental action with zero distraction or mental friction.',
  },

  // Willpower (WIL)
  {
    id: 'wil_1',
    name: 'Resolute Mind',
    statKey: 'willpower',
    unlockAtStat: 15,
    description: 'Overcome initial emotional barriers to entry. Restructure habit cues to eliminate standard procrastination loops.',
  },
  {
    id: 'wil_2',
    name: 'Iron Will',
    statKey: 'willpower',
    unlockAtStat: 35,
    description: 'Maintain mental persistence when faced with active resistance, friction, or mental exhaustion.',
  },
  {
    id: 'wil_3',
    name: 'Grit Protocol',
    statKey: 'willpower',
    unlockAtStat: 60,
    description: 'Prevent decay of commitment over long timelines. Willpower metrics remain stable regardless of immediate rewards.',
  },
  {
    id: 'wil_4',
    name: 'Unbreakable Sovereign',
    statKey: 'willpower',
    unlockAtStat: 85,
    description: 'Complete mental sovereignty. Complete dominance over internal impulses, bad habits, and external pressures.',
  },
];

export const SkillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stats } = usePlayer();

  const [acknowledgedSkillIds, setAcknowledgedSkillIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse claimed skills from localStorage', e);
      }
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(acknowledgedSkillIds));
  }, [acknowledgedSkillIds]);

  // Compute unlocked skill IDs based on current player stats
  const unlockedSkillIds = SKILLS.filter(
    (skill) => stats[skill.statKey] >= skill.unlockAtStat
  ).map((skill) => skill.id);

  // Checks if there are any unlocked skills that the user hasn't claimed/acknowledged yet
  const hasNewSkills = unlockedSkillIds.some(
    (id) => !acknowledgedSkillIds.includes(id)
  );

  const acknowledgeSkill = (id: string) => {
    if (!acknowledgedSkillIds.includes(id)) {
      setAcknowledgedSkillIds((prev) => [...prev, id]);
    }
  };

  const acknowledgeAllUnlocked = () => {
    const newClaimed = [...acknowledgedSkillIds];
    let changed = false;

    unlockedSkillIds.forEach((id) => {
      if (!newClaimed.includes(id)) {
        newClaimed.push(id);
        changed = true;
      }
    });

    if (changed) {
      setAcknowledgedSkillIds(newClaimed);
    }
  };

  return (
    <SkillContext.Provider
      value={{
        skills: SKILLS,
        acknowledgedSkillIds,
        unlockedSkillIds,
        hasNewSkills,
        acknowledgeSkill,
        acknowledgeAllUnlocked,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
};

export const useSkills = () => {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
};
