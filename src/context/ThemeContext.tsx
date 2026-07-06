import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemePreset {
  name: string;
  bg: string;
  panel: string;
  panel2: string;
  text: string;
  textdim: string;
  accent: string;
  accent2: string;
  radiusPanel: string;
  neuOut: string;
  neuIn: string;
  glowA: string;
  glowB: string;
  glowEnabled: boolean;
}

export type PresetKey = 'shadowMonarch' | 'berserker' | 'neobrutalArcade' | 'neumorphSlate';

export const PRESETS: Record<PresetKey, ThemePreset> = {
  shadowMonarch: {
    name: 'Shadow Monarch',
    bg: '#0a0d13',
    panel: '#11161f',
    panel2: '#161c28',
    text: '#e7eaf2',
    textdim: '#8892a6',
    accent: '#6e8efb',
    accent2: '#a78bfa',
    radiusPanel: '8px',
    neuOut: '4px 4px 10px rgba(0, 0, 0, 0.4), -4px -4px 10px rgba(255, 255, 255, 0.03)',
    neuIn: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.02)',
    glowA: '0 0 15px 0px rgba(110, 142, 251, 0.15)',
    glowB: '0 0 25px 3px rgba(110, 142, 251, 0.35)',
    glowEnabled: true,
  },
  berserker: {
    name: 'Berserker',
    bg: '#0f0d0a',
    panel: '#181411',
    panel2: '#221b16',
    text: '#f2ebe7',
    textdim: '#a69588',
    accent: '#c9834a',
    accent2: '#f59e0b',
    radiusPanel: '12px',
    neuOut: '4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.02)',
    neuIn: 'inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.01)',
    glowA: '0 0 15px 0px rgba(201, 131, 74, 0.15)',
    glowB: '0 0 25px 3px rgba(201, 131, 74, 0.35)',
    glowEnabled: true,
  },
  neobrutalArcade: {
    name: 'Neobrutal Arcade',
    bg: '#faf6ee',
    panel: '#ffffff',
    panel2: '#f3edd7',
    text: '#1c1917',
    textdim: '#57534e',
    accent: '#ec4899',
    accent2: '#14b8a6',
    radiusPanel: '4px',
    neuOut: '2px 2px 0px rgba(0, 0, 0, 0.15)',
    neuIn: 'inset 2px 2px 0px rgba(0, 0, 0, 0.08)',
    glowA: 'none',
    glowB: 'none',
    glowEnabled: false,
  },
  neumorphSlate: {
    name: 'Neumorph Slate',
    bg: '#1e222b',
    panel: '#252a37',
    panel2: '#2c3242',
    text: '#f1f5f9',
    textdim: '#64748b',
    accent: '#94a3b8',
    accent2: '#cbd5e1',
    radiusPanel: '20px',
    neuOut: '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.04)',
    neuIn: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.03)',
    glowA: 'none',
    glowB: 'none',
    glowEnabled: false,
  },
};

export interface ThemeOverrides {
  accentColor: string | null;
  radiusPanel: number | null;
  glowEnabled: boolean | null;
}

interface ThemeContextType {
  presetKey: PresetKey;
  setPresetKey: (key: PresetKey) => void;
  overrides: ThemeOverrides;
  setOverrides: React.Dispatch<React.SetStateAction<ThemeOverrides>>;
  resetToPreset: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_theme';

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  let r = 110, g = 142, b = 251;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  }
  return { r, g, b };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presetKey, setPresetKeyState] = useState<PresetKey>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.presetKey in PRESETS) return parsed.presetKey;
      } catch (e) {
        console.error(e);
      }
    }
    return 'shadowMonarch';
  });

  const [overrides, setOverrides] = useState<ThemeOverrides>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.overrides) {
          return {
            accentColor: parsed.overrides.accentColor ?? null,
            radiusPanel: parsed.overrides.radiusPanel ?? null,
            glowEnabled: parsed.overrides.glowEnabled ?? null,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      accentColor: null,
      radiusPanel: null,
      glowEnabled: null,
    };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ presetKey, overrides })
    );
  }, [presetKey, overrides]);

  // Apply custom CSS properties to document root
  useEffect(() => {
    const root = document.documentElement;
    const preset = PRESETS[presetKey];

    const activeAccent = overrides.accentColor || preset.accent;
    const activeRadius = overrides.radiusPanel !== null ? `${overrides.radiusPanel}px` : preset.radiusPanel;
    const activeGlowOn = overrides.glowEnabled !== null ? overrides.glowEnabled : preset.glowEnabled;

    const { r, g, b } = hexToRgb(activeAccent);

    // Inject styles
    root.style.setProperty('--bg', preset.bg);
    root.style.setProperty('--panel', preset.panel);
    root.style.setProperty('--panel2', preset.panel2);
    root.style.setProperty('--text', preset.text);
    root.style.setProperty('--textdim', preset.textdim);
    root.style.setProperty('--accent', activeAccent);
    root.style.setProperty('--accent2', preset.accent2);
    root.style.setProperty('--radius-panel', activeRadius);
    root.style.setProperty('--neu-out', preset.neuOut);
    root.style.setProperty('--neu-in', preset.neuIn);
    root.style.setProperty('--border', `rgba(${r}, ${g}, ${b}, 0.22)`);
    root.style.setProperty('--border-strong', `rgba(${r}, ${g}, ${b}, 0.45)`);

    if (activeGlowOn) {
      root.style.setProperty('--glow-a', `0 0 15px 0px rgba(${r}, ${g}, ${b}, 0.15)`);
      root.style.setProperty('--glow-b', `0 0 25px 3px rgba(${r}, ${g}, ${b}, 0.35)`);
    } else {
      root.style.setProperty('--glow-a', 'none');
      root.style.setProperty('--glow-b', 'none');
    }
  }, [presetKey, overrides]);

  const setPresetKey = (key: PresetKey) => {
    setPresetKeyState(key);
  };

  const resetToPreset = () => {
    setOverrides({
      accentColor: null,
      radiusPanel: null,
      glowEnabled: null,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        presetKey,
        setPresetKey,
        overrides,
        setOverrides,
        resetToPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
