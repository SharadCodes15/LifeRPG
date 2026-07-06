import { useState } from 'react';
import { StatusWindow } from './components/StatusWindow';
import { LevelUpModal } from './components/LevelUpModal';
import { DailyQuests } from './components/DailyQuests';
import { Campaigns } from './components/Campaigns';
import { CampaignClearedModal } from './components/CampaignClearedModal';
import { StudyDungeon } from './components/StudyDungeon';
import { DungeonClearedModal } from './components/DungeonClearedModal';
import { TrainingGrounds } from './components/TrainingGrounds';
import { SkillTree } from './components/SkillTree';
import { Achievements } from './components/Achievements';
import { DailyInsight } from './components/DailyInsight';
import { Planner } from './components/Planner';
import { Shop } from './components/Shop';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { MediaVault } from './components/MediaVault';
import { CourseVault } from './components/CourseVault';
import { usePlayer } from './context/PlayerContext';
import { useQuests } from './context/QuestContext';
import { useSkills } from './context/SkillContext';
import { useAchievements } from './context/AchievementContext';
import { useMedia } from './context/MediaContext';

function App() {
  const { level, currentXP, xpToNextLevel, rank, gold, soundEnabled, setSoundEnabled } = usePlayer();
  const { streak } = useQuests();
  const { hasNewSkills } = useSkills();
  const { activeTitleId, achievements } = useAchievements();
  const { bgUrl, bgType, avatarUrl, rankIconUrl } = useMedia();

  const [view, setView] = useState<'dashboard' | 'skills' | 'achievements' | 'planner' | 'shop' | 'vault'>('dashboard');

  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXP / xpToNextLevel) * 100)));
  const equippedTitle = achievements.find((a) => a.id === activeTitleId)?.title;

  return (
    <div className="min-h-screen bg-bg text-textmain flex flex-col font-sans relative">
      
      {/* Background Media Vault Layer */}
      {bgUrl && (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
          {bgType?.startsWith('video/') ? (
            <video
              src={bgUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-[0.35] filter blur-[0.5px]"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center opacity-[0.35] filter blur-[0.5px]"
              style={{ backgroundImage: `url(${bgUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-bg/40" />
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-panel2 bg-panel/50 backdrop-blur-md sticky top-0 z-50 animate-stagger-0">
        <div className="max-w-7xl mx-auto px-6 py-4 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Logo / Wordmark / Avatar */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Hunter Avatar"
                  className="w-8 h-8 rounded-full border border-accent/40 object-cover shrink-0 shadow-md"
                />
              ) : (
                <span className="text-accent text-xl font-mono tracking-widest animate-pulse">◆</span>
              )}
              <h1 className="font-display font-bold text-2xl md:text-3xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent select-none">
                ASCENSION
              </h1>
            </div>
          </div>

          {/* Navigation & Stats Wrapper */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
            {/* View Selection Tabs */}
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
              <button
                onClick={() => setView('dashboard')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 ${
                  view === 'dashboard'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('planner')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 ${
                  view === 'planner'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Planner
              </button>
              <button
                onClick={() => setView('vault')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 ${
                  view === 'vault'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Course Vault
              </button>
              <button
                onClick={() => setView('skills')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 relative ${
                  view === 'skills'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Skills
                {hasNewSkills && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setView('achievements')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 ${
                  view === 'achievements'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Trophy
              </button>
              <button
                onClick={() => setView('shop')}
                className={`text-xs font-mono font-bold tracking-widest uppercase py-1 border-b-2 cursor-pointer transition-all duration-300 ${
                  view === 'shop'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textdim hover:text-textmain'
                }`}
              >
                Shop
              </button>
            </nav>

            {/* Title, Gold, SFX, & Rank Badge Group */}
            <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 cursor-pointer select-none transition-all duration-300 border ${
                  soundEnabled
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-panel2 border-panel2 border-textdim/20 text-textdim/60 hover:text-textmain'
                }`}
                title="Toggle Sound Effects"
              >
                <span>{soundEnabled ? '🔊' : '🔇'}</span>
                <span>SFX</span>
              </button>

              {/* Gold Counter */}
              <span className="bg-panel2 text-accent px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-md select-none whitespace-nowrap badge border-none">
                🪙 {gold}g
              </span>

              {/* Equipped Title */}
              {equippedTitle && (
                <span className="bg-accent2/10 text-accent2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-md select-none animate-pulse whitespace-nowrap badge border-none">
                  🏆 {equippedTitle}
                </span>
              )}

              {/* Rank Badge */}
              <div className="flex items-center gap-2 bg-panel2 px-3 py-1 rounded-full shadow-md badge border-none">
                {rankIconUrl ? (
                  <img
                    src={rankIconUrl}
                    alt="Rank Badge Icon"
                    className="w-4.5 h-4.5 object-contain shrink-0 rounded-sm"
                  />
                ) : (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bronze opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-bronze"></span>
                  </span>
                )}
                <span className="text-bronze text-xs font-mono font-semibold tracking-wider uppercase whitespace-nowrap select-none">
                  {rank === 'National' ? 'National' : `${rank}-Rank`} Hunter
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Persistent XP Bar */}
      <div className="w-full bg-panel/30 border-b border-accent/10 px-6 py-3 md:px-8 animate-stagger-1">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-textdim font-mono">System Status:</span>
            <span className="text-sm font-bold font-mono text-accent">LEVEL {level}</span>
          </div>
          <div className="text-xs font-mono text-textdim flex items-center gap-1">
            <span className="text-accent2">{currentXP.toLocaleString()}</span>
            <span className="text-textdim/30">/</span>
            <span>{xpToNextLevel.toLocaleString()} XP</span>
            <span className="text-xpgreen ml-1.5 text-[10px] font-semibold tracking-normal px-1 bg-xpgreen/10 rounded badge border-none">
              +{xpPercent}%
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full bg-panel2 border border-accent/20 rounded-full h-2.5 overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent via-accent2 to-accent animate-xp-flow shadow-[0_0_10px_rgba(110,142,251,0.5)] transition-all duration-300 ease-out"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* Daily Insight Quotes Panel */}
            <div className="animate-stagger-2">
              <DailyInsight />
            </div>

            {/* Theme Preset Selection Architecture */}
            <div className="animate-stagger-3">
              <ThemeSwitcher />
            </div>

            {/* Media Vault Binary Files Database */}
            <div className="animate-stagger-3">
              <MediaVault />
            </div>

            <div className="grid grid-cols-1 bp-820:grid-cols-[3fr_2fr] gap-6">
              {/* Main Column (~60%) */}
              <div className="space-y-6">
                {/* Daily Quests Component */}
                <div className="animate-stagger-3">
                  <DailyQuests />
                </div>

                {/* Campaigns Component */}
                <div className="animate-stagger-4">
                  <Campaigns />
                </div>

                {/* Training Grounds Focus Timer Component */}
                <div className="animate-stagger-5">
                  <TrainingGrounds />
                </div>
              </div>

              {/* Side Column (~40%) */}
              <div className="space-y-6">
                {/* Character Status Window */}
                <div className="animate-stagger-3">
                  <StatusWindow />
                </div>

                {/* Study Dungeon Component */}
                <div className="animate-stagger-4">
                  <StudyDungeon />
                </div>
              </div>
            </div>
          </div>
        )}
        {view === 'planner' && <Planner />}
        {view === 'skills' && <SkillTree />}
        {view === 'achievements' && <Achievements />}
        {view === 'shop' && <Shop />}
        {view === 'vault' && <CourseVault />}
      </main>

      {/* Footer */}
      <footer className="border-t border-panel2 py-6 bg-panel/20 mt-12 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-textdim font-mono">
            ASCENSION SYSTEM v1.0.0-ALPHA
          </span>
          <span className="text-sm font-mono text-bronze font-semibold uppercase tracking-widest badge px-3 py-1 bg-panel2 border-none">
            🔥 {streak > 0 ? `${streak}-day streak` : 'streak reset'}
          </span>
          <span className="text-xs text-textdim/50 font-mono">
            Secure connection active. Keep ascending.
          </span>
        </div>
      </footer>

      {/* Level Up Notification Modal Overlay */}
      <LevelUpModal />

      {/* Campaign Victory Modal Overlay */}
      <CampaignClearedModal />

      {/* Study Dungeon Victory Modal Overlay */}
      <DungeonClearedModal />
    </div>
  );
}

export default App;
