import React, { useState } from 'react';
import { useTheme, PRESETS } from '../context/ThemeContext';
import type { PresetKey } from '../context/ThemeContext';
import { SystemPanel } from './SystemPanel';

export const ThemeSwitcher: React.FC = () => {
  const { presetKey, setPresetKey, overrides, setOverrides, resetToPreset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const presetsList = Object.keys(PRESETS) as PresetKey[];
  const currentPreset = PRESETS[presetKey];

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverrides((prev) => ({
      ...prev,
      accentColor: e.target.value,
    }));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverrides((prev) => ({
      ...prev,
      radiusPanel: Number(e.target.value),
    }));
  };

  const handleGlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverrides((prev) => ({
      ...prev,
      glowEnabled: e.target.checked,
    }));
  };

  const activeColor = overrides.accentColor || currentPreset.accent;
  const activeRadius = overrides.radiusPanel !== null ? overrides.radiusPanel : parseInt(currentPreset.radiusPanel) || 0;
  const activeGlow = overrides.glowEnabled !== null ? overrides.glowEnabled : currentPreset.glowEnabled;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Selector controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-panel/30 border border-panel2 rounded-lg">
        <div className="flex flex-col gap-0.5 w-full sm:w-auto">
          <span className="text-[10px] font-mono text-textdim uppercase tracking-wider">SYSTEM INTERFACE ARCHITECTURE</span>
          <span className="text-xs text-textmain font-bold">Active Protocol: <span className="text-accent">{currentPreset.name}</span></span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {presetsList.map((key) => {
            const preset = PRESETS[key];
            const isActive = presetKey === key;

            return (
              <button
                key={key}
                onClick={() => setPresetKey(key)}
                className={`px-3 py-1.5 rounded font-mono text-[10px] uppercase font-bold tracking-wider select-none cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-accent/15 border border-accent text-accent'
                    : 'border border-textdim/10 text-textdim hover:text-textmain'
                }`}
              >
                {preset.name}
              </button>
            );
          })}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 border border-accent2/25 hover:border-accent2/50 text-accent2 rounded font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-300 ${
              isOpen ? 'bg-accent2/10 text-accent2' : 'bg-accent2/5'
            }`}
          >
            {isOpen ? 'Close Customize' : '⚙ Customize'}
          </button>
        </div>
      </div>

      {/* Expandable Overrides Drawer */}
      {isOpen && (
        <SystemPanel glow={false} className="p-5 border-accent2/25 bg-panel2/40 animate-scaleUp">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-grow w-full">
              
              {/* Color picker */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono text-textdim uppercase tracking-wider block">
                  Core Accent Spectrum
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={activeColor}
                    onChange={handleColorChange}
                    className="w-10 h-8 bg-transparent border border-accent/20 rounded cursor-pointer shrink-0"
                  />
                  <span className="font-mono text-xs text-textmain uppercase select-all">
                    {activeColor}
                  </span>
                </div>
              </div>

              {/* Radius slider */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono text-textdim uppercase tracking-wider flex justify-between">
                  <span>Panel Geometric Radius</span>
                  <span className="text-accent">{activeRadius}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={activeRadius}
                  onChange={handleRadiusChange}
                  className="w-full h-1 bg-panel border-none outline-none rounded-lg cursor-pointer accent-accent"
                />
              </div>

              {/* Glow checkbox */}
              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-2.5 text-xs text-textmain font-mono tracking-wide cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activeGlow}
                    onChange={handleGlowChange}
                    className="w-4 h-4 accent-accent border-accent/20 rounded cursor-pointer"
                  />
                  Ambient Flicker Glow
                </label>
              </div>

            </div>

            {/* Reset Defaults button */}
            <div className="shrink-0 w-full md:w-auto flex justify-end">
              <button
                onClick={resetToPreset}
                className="text-[10px] font-mono bg-bronze/10 border border-bronze/40 hover:bg-bronze/20 text-bronze px-4 py-2 rounded uppercase tracking-wider font-bold cursor-pointer transition-all duration-300"
              >
                Reset Overrides
              </button>
            </div>
          </div>
        </SystemPanel>
      )}
    </div>
  );
};

export default ThemeSwitcher;
