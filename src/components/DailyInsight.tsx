import React, { useState, useEffect } from 'react';
import { QUOTES } from '../data/quotes';
import type { Quote } from '../data/quotes';
import { SystemPanel } from './SystemPanel';

const getLocalDateString = (): string => {
  const offset = new Date().getTimezoneOffset();
  const localDate = new Date(Date.now() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const hashDateString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const DailyInsight: React.FC = () => {
  const todayStr = getLocalDateString();

  // Determine today's default quote deterministically
  const defaultTodayIndex = hashDateString(todayStr) % QUOTES.length;
  const defaultTodayQuote = QUOTES[defaultTodayIndex];

  // Component states
  const [selectedMood, setSelectedMood] = useState<'all' | 'discipline' | 'solitude' | 'ambition' | 'rest'>('all');
  const [activeQuote, setActiveQuote] = useState<Quote>(defaultTodayQuote);
  const [isBrowsing, setIsBrowsing] = useState<boolean>(false);

  // Update active quote deterministically when mood filter changes
  useEffect(() => {
    if (selectedMood === 'all') {
      setActiveQuote(defaultTodayQuote);
      setIsBrowsing(false);
    } else {
      const filtered = QUOTES.filter((q) => q.mood === selectedMood);
      if (filtered.length > 0) {
        const moodIndex = hashDateString(todayStr + selectedMood) % filtered.length;
        setActiveQuote(filtered[moodIndex]);
        setIsBrowsing(false);
      }
    }
  }, [selectedMood, todayStr]);

  const handleNext = () => {
    const filtered = selectedMood === 'all' ? QUOTES : QUOTES.filter((q) => q.mood === selectedMood);
    if (filtered.length <= 1) return;

    let nextQuote = activeQuote;
    // Prevent picking the exact same quote sequentially if multiple exist
    while (nextQuote.id === activeQuote.id) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      nextQuote = filtered[randomIndex];
    }
    setActiveQuote(nextQuote);
    setIsBrowsing(true);
  };

  const handleReset = () => {
    if (selectedMood === 'all') {
      setActiveQuote(defaultTodayQuote);
    } else {
      const filtered = QUOTES.filter((q) => q.mood === selectedMood);
      const moodIndex = hashDateString(todayStr + selectedMood) % filtered.length;
      setActiveQuote(filtered[moodIndex]);
    }
    setIsBrowsing(false);
  };

  const moods: { value: typeof selectedMood; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'discipline', label: 'DISCIPLINE' },
    { value: 'solitude', label: 'SOLITUDE' },
    { value: 'ambition', label: 'AMBITION' },
    { value: 'rest', label: 'REST' },
  ];

  return (
    <SystemPanel glow={true} className="p-6 relative overflow-hidden flex flex-col items-center">
      {/* Decorative background mark */}
      <span className="absolute -right-6 -bottom-10 text-9xl text-panel2/15 font-display select-none pointer-events-none italic">
        ”
      </span>

      {/* Header controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-accent/10 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">✦</span>
          <h2 className="font-display font-bold text-sm tracking-wider text-textmain">
            DAILY INSIGHT
          </h2>
        </div>

        {/* Mood filter tags */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider cursor-pointer border transition-all duration-300 ${
                selectedMood === m.value
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-panel2 border-accent/5 text-textdim hover:text-textmain'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quote display body */}
      <div className="w-full text-center py-2 px-4 max-w-2xl min-h-[70px] flex flex-col justify-center items-center">
        <p className="font-display italic text-textmain text-sm sm:text-base leading-relaxed tracking-wide animate-fadeIn">
          “ {activeQuote.text} ”
        </p>
        <span className="text-[9px] font-mono text-textdim/40 uppercase tracking-widest mt-4.5 block select-none">
          — Codex, entry {activeQuote.id.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center mt-5 w-full max-w-xs border-t border-accent/5 pt-4">
        {isBrowsing && (
          <button
            onClick={handleReset}
            className="flex-1 border border-accent/25 hover:border-accent/50 text-[10px] font-mono py-1.5 rounded transition-all cursor-pointer text-center uppercase tracking-wider text-textdim hover:text-textmain"
          >
            Today's Quote
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-accent/10 border border-accent/35 hover:bg-accent/20 text-accent text-[10px] font-mono py-1.5 rounded transition-all cursor-pointer text-center uppercase tracking-wider font-semibold active:scale-[0.98]"
        >
          Browse Next ➔
        </button>
      </div>
    </SystemPanel>
  );
};

export default DailyInsight;
