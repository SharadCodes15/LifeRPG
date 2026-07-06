import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { usePlayer } from '../context/PlayerContext';
import { SystemPanel } from './SystemPanel';

export const TrainingGrounds: React.FC = () => {
  const { logSession, totalMinutesToday } = useTimer();
  const { gainXP } = usePlayer();

  // Settings
  const [duration, setDuration] = useState<number>(25); // Minutes
  const [autoBreak, setAutoBreak] = useState<boolean>(false);

  // Timer states
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

  // Toast notification
  const [showToast, setShowToast] = useState<boolean>(false);

  // Synchronize initial seconds left when duration setting changes (if timer not running)
  useEffect(() => {
    if (!isActive && mode === 'focus') {
      setSecondsLeft(duration * 60);
    }
  }, [duration, isActive, mode]);

  // Main timer useEffect loop
  useEffect(() => {
    let intervalId: any = null;

    if (isActive && endTimestamp) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const left = Math.max(0, Math.round((endTimestamp - now) / 1000));

        setSecondsLeft(left);

        if (left === 0) {
          // Timer naturally completed!
          setIsActive(false);
          setEndTimestamp(null);
          handleSessionCompletion();
        }
      }, 200); // 200ms tick rate is highly responsive
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, endTimestamp]);

  // Toast timer auto-dismissal
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSessionCompletion = () => {
    if (mode === 'focus') {
      // 1. Award XP Focus
      gainXP(10, 'focus');

      // 2. Trigger transient completion toast
      setShowToast(true);

      // 3. Log focus minutes
      logSession(duration);

      // 4. Check auto-break setting
      if (autoBreak) {
        setMode('break');
        const breakSeconds = 5 * 60;
        setSecondsLeft(breakSeconds);
        setEndTimestamp(Date.now() + breakSeconds * 1000);
        setIsActive(true); // Auto-start the break
      } else {
        setSecondsLeft(duration * 60);
      }
    } else {
      // Break mode completed, return to focus mode
      setMode('focus');
      setSecondsLeft(duration * 60);
      setIsActive(false);
    }
  };

  const handleStart = () => {
    if (isActive) return;
    const targetEnd = Date.now() + secondsLeft * 1000;
    setEndTimestamp(targetEnd);
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    setEndTimestamp(null);
  };

  const handleReset = () => {
    setIsActive(false);
    setEndTimestamp(null);
    setMode('focus');
    setSecondsLeft(duration * 60);
  };

  // Skip focus timer helper for developers
  const handleDevSkip = () => {
    setIsActive(false);
    setEndTimestamp(null);
    handleSessionCompletion();
  };

  // Formatter
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const displayTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressPct =
    mode === 'focus'
      ? ((duration * 60 - secondsLeft) / (duration * 60)) * 100
      : ((5 * 60 - secondsLeft) / (5 * 60)) * 100;

  return (
    <SystemPanel glow={false} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-accent/15 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">⚡</span>
          <h2 className="font-display font-bold text-lg tracking-wider text-textmain">
            TRAINING GROUNDS
          </h2>
        </div>
        <div className="text-[9px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 border border-accent/30 rounded bg-accent/5">
          {mode === 'focus' ? 'Focus Session' : 'Rest Phase'}
        </div>
      </div>

      <div className="flex flex-col items-center py-4">
        {/* Large Time Display */}
        <div className="font-mono text-5xl md:text-6xl font-extrabold text-textmain tracking-widest drop-shadow-[0_0_15px_rgba(110,142,251,0.25)] select-none">
          {displayTime}
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-48 bg-panel2 border border-accent/5 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              mode === 'focus' ? 'bg-accent' : 'bg-xpgreen'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Daily Stats Summary */}
        <div className="text-[10px] font-mono text-textdim/70 mt-3 text-center uppercase tracking-wide">
          Today's Focus: <span className="text-accent font-bold">{totalMinutesToday} mins</span>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 justify-center mt-6 w-full max-w-xs">
          {isActive ? (
            <button
              onClick={handlePause}
              className="flex-1 bg-bronze/10 border border-bronze/40 hover:bg-bronze/20 text-bronze text-xs font-mono font-bold py-2 rounded transition-all cursor-pointer text-center uppercase tracking-wider"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 bg-accent/10 border border-accent/40 hover:bg-accent/20 text-accent text-xs font-mono font-bold py-2 rounded transition-all cursor-pointer text-center uppercase tracking-wider"
            >
              Start
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono py-2 rounded transition-all cursor-pointer text-center uppercase tracking-wider"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="border-t border-accent/15 pt-4 mt-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Duration</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 25, 45, 60].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => !isActive && setDuration(t)}
                  className={`py-1 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                    duration === t
                      ? 'bg-accent/15 border-accent text-accent font-bold'
                      : 'border-accent/10 hover:border-accent/30 text-textdim'
                  } ${isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={isActive}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 text-[10px] text-textdim font-mono tracking-wide cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoBreak}
                onChange={(e) => setAutoBreak(e.target.checked)}
                className="w-3.5 h-3.5 accent-accent border-accent/20 rounded cursor-pointer"
              />
              Auto Break (5m)
            </label>
          </div>
        </div>

        {/* Developer controls */}
        <div className="flex items-center justify-between border-t border-accent/10 pt-3">
          <span className="text-[8px] font-mono text-textdim/40 uppercase tracking-widest">
            Dev Override Status Active
          </span>
          <button
            onClick={handleDevSkip}
            className="text-[9px] font-mono text-accent hover:text-accent2 transition-colors cursor-pointer border border-accent/25 px-2 py-0.5 rounded bg-accent/5 uppercase tracking-wide font-medium"
          >
            Simulate Expire
          </button>
        </div>
      </div>

      {/* Corner Toast Payout Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-panel border border-accent/30 text-accent px-4 py-3 rounded-lg shadow-2xl z-[99999] animate-scaleUp flex items-center gap-2.5 font-mono text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          🔥 +10 XP — Session Logged (Focus +1)
        </div>
      )}
    </SystemPanel>
  );
};

export default TrainingGrounds;
