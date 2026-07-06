import React, { createContext, useContext, useState, useEffect } from 'react';

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'National';

export interface Stats {
  strength: number;
  intellect: number;
  vitality: number;
  focus: number;
  willpower: number;
}

export interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
  oldRank: Rank;
  newRank: Rank;
}

interface PlayerContextType {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  rank: Rank;
  stats: Stats;
  gold: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  gainXP: (amount: number, statKey?: keyof Stats, goldAmount?: number) => void;
  deductGold: (amount: number) => void;
  levelUpEvent: LevelUpEvent | null;
  clearLevelUpEvent: () => void;
  playSFX: (type: 'level-up' | 'dungeon-clear') => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_player';

export const getXPToNextLevel = (lvl: number): number => {
  return Math.round(100 * Math.pow(lvl, 1.35));
};

export const getRank = (lvl: number): Rank => {
  if (lvl >= 80) return 'National';
  if (lvl >= 60) return 'S';
  if (lvl >= 45) return 'A';
  if (lvl >= 30) return 'B';
  if (lvl >= 20) return 'C';
  if (lvl >= 10) return 'D';
  return 'E';
};

const synthesizeChime = (type: 'level-up' | 'dungeon-clear') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'level-up') {
      // Rising RPG chime (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.08 + 0.35);
        
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.45);
      });
    } else {
      // Fanfare RPG victory chime (G4, C5, E5, G5, C6 sustained)
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      const durations = [0.15, 0.15, 0.15, 0.15, 0.65];
      let time = ctx.currentTime;
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + durations[index]);
        
        osc.start(time);
        osc.stop(time + durations[index]);
        
        time += 0.07;
      });
    }
  } catch (e) {
    console.error('Synthesizer playback failure', e);
  }
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.level === 'number') return parsed.level;
      } catch (e) {
        console.error('Failed to parse level from localStorage', e);
      }
    }
    return 1;
  });

  const [currentXP, setCurrentXP] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentXP === 'number') return parsed.currentXP;
      } catch (e) {
        console.error('Failed to parse currentXP from localStorage', e);
      }
    }
    return 0;
  });

  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.stats) {
          return {
            strength: parsed.stats.strength ?? 10,
            intellect: parsed.stats.intellect ?? 10,
            vitality: parsed.stats.vitality ?? 10,
            focus: parsed.stats.focus ?? 10,
            willpower: parsed.stats.willpower ?? 10,
          };
        }
      } catch (e) {
        console.error('Failed to parse stats from localStorage', e);
      }
    }
    return {
      strength: 10,
      intellect: 10,
      vitality: 10,
      focus: 10,
      willpower: 10,
    };
  });

  const [gold, setGold] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.gold === 'number') return parsed.gold;
      } catch (e) {
        console.error('Failed to parse gold from localStorage', e);
      }
    }
    return 0;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ascension_sound_settings');
    return saved === 'true'; // defaults to false
  });

  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ level, currentXP, stats, gold })
    );
  }, [level, currentXP, stats, gold]);

  useEffect(() => {
    localStorage.setItem('ascension_sound_settings', String(soundEnabled));
  }, [soundEnabled]);

  const playSFX = (type: 'level-up' | 'dungeon-clear') => {
    if (!soundEnabled) return;
    const audioEl = document.getElementById(
      type === 'level-up' ? 'sound-level-up' : 'sound-dungeon-clear'
    ) as HTMLAudioElement;

    if (audioEl) {
      audioEl.play().catch((err) => {
        console.warn('Audio tag play blocked/failed, playing synthesizer chime instead', err);
        synthesizeChime(type);
      });
    } else {
      synthesizeChime(type);
    }
  };

  // Play Level Up sound safely on level changes
  const [prevLevel, setPrevLevel] = useState(level);
  useEffect(() => {
    if (level > prevLevel) {
      playSFX('level-up');
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  const gainXP = (amount: number, statKey?: keyof Stats, goldAmount?: number) => {
    // 1. Update stat if specified
    if (statKey) {
      setStats((prev) => ({
        ...prev,
        [statKey]: Math.min(100, prev[statKey] + 1),
      }));
    }

    // 2. Update gold
    const earnedGold = goldAmount !== undefined ? goldAmount : Math.floor(amount / 10);
    setGold((prev) => prev + earnedGold);

    // 3. Update XP and calculate level ups
    setCurrentXP((prevXP) => {
      let newXP = prevXP + amount;
      let currentLevel = level;
      let xpRequired = getXPToNextLevel(currentLevel);
      let didLevelUp = false;
      const oldLevel = level;

      while (newXP >= xpRequired) {
        newXP -= xpRequired;
        currentLevel += 1;
        xpRequired = getXPToNextLevel(currentLevel);
        didLevelUp = true;
      }

      if (didLevelUp) {
        setLevel(currentLevel);
        const oldRank = getRank(oldLevel);
        const newRank = getRank(currentLevel);
        setLevelUpEvent({
          oldLevel,
          newLevel: currentLevel,
          oldRank,
          newRank,
        });
      }

      return newXP;
    });
  };

  const deductGold = (amount: number) => {
    setGold((prev) => Math.max(0, prev - amount));
  };

  const clearLevelUpEvent = () => {
    setLevelUpEvent(null);
  };

  const xpToNextLevel = getXPToNextLevel(level);
  const rank = getRank(level);

  return (
    <PlayerContext.Provider
      value={{
        level,
        currentXP,
        xpToNextLevel,
        rank,
        stats,
        gold,
        soundEnabled,
        setSoundEnabled,
        gainXP,
        deductGold,
        levelUpEvent,
        clearLevelUpEvent,
        playSFX,
      }}
    >
      {children}
      {/* Royalty-free chimes for audio tags */}
      <audio id="sound-level-up" src="https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav" preload="auto"></audio>
      <audio id="sound-dungeon-clear" src="https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav" preload="auto"></audio>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
