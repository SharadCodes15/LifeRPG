import React, { useState } from 'react';
import { useCourses } from '../context/CourseContext';
import { SystemPanel } from './SystemPanel';

export const StudyDungeon: React.FC = () => {
  const { courses, addManualCourse, addYouTubeCourse, toggleVideoWatched, deleteCourse } = useCourses();

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'youtube' | 'manual'>('youtube');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [videosText, setVideosText] = useState('');
  
  // UX states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cards expanded states (courseId -> boolean)
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const hasApiKey = !!import.meta.env.VITE_YOUTUBE_API_KEY;

  const toggleExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await addYouTubeCourse(playlistUrl);
      setPlaylistUrl('');
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while importing the course.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !videosText.trim()) return;

    const titles = videosText.split('\n').filter((line) => line.trim() !== '');
    if (titles.length === 0) return;

    addManualCourse(courseTitle, titles);

    // Reset Form
    setCourseTitle('');
    setVideosText('');
    setIsFormOpen(false);
    setError(null);
  };

  const handleCancel = () => {
    setPlaylistUrl('');
    setCourseTitle('');
    setVideosText('');
    setIsFormOpen(false);
    setError(null);
  };

  return (
    <SystemPanel glow={false} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-accent/15 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">▤</span>
          <h2 className="font-display font-bold text-lg tracking-wider text-textmain">
            STUDY DUNGEON
          </h2>
        </div>
        <button
          onClick={() => {
            if (isFormOpen) {
              handleCancel();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="text-xs font-mono text-accent hover:text-accent2 transition-colors duration-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          {isFormOpen ? '✖ Close' : '✚ Add Dungeon'}
        </button>
      </div>

      {/* Add Dungeon Form Panel */}
      {isFormOpen && (
        <div className="mb-6 bg-panel2/40 border border-accent/20 rounded p-4 space-y-4 transition-all duration-300">
          <div className="flex border-b border-accent/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('youtube');
                setError(null);
              }}
              className={`flex-grow py-1.5 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition-all duration-300 ${
                activeTab === 'youtube' ? 'border-accent text-accent' : 'border-transparent text-textdim'
              }`}
            >
              YOUTUBE PLAYLIST
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('manual');
                setError(null);
              }}
              className={`flex-grow py-1.5 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition-all duration-300 ${
                activeTab === 'manual' ? 'border-accent text-accent' : 'border-transparent text-textdim'
              }`}
            >
              MANUAL ENTRIES
            </button>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-[11px] p-2 rounded font-mono">
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'youtube' ? (
            /* YouTube Import Form */
            <form onSubmit={handleYouTubeSubmit} className="space-y-3">
              {!hasApiKey && (
                <div className="bg-bronze/10 border border-bronze/35 text-bronze text-[10px] p-2.5 rounded font-mono leading-relaxed">
                  ⚠️ No VITE_YOUTUBE_API_KEY found in environmental config. YouTube extraction is disabled. Use the "Manual Entries" fallback tab.
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Playlist URL</label>
                <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent disabled:opacity-50"
                  disabled={loading || !hasApiKey}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer disabled:opacity-50 transition-colors"
                  disabled={loading || !hasApiKey}
                >
                  {loading ? 'Siphoning...' : 'Import Playlist'}
                </button>
              </div>
            </form>
          ) : (
            /* Manual Entry Form */
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Dungeon Name / Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Learn UI Design Basics"
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Videos / Milestones (One per line)</label>
                <textarea
                  value={videosText}
                  onChange={(e) => setVideosText(e.target.value)}
                  placeholder="Video 1: Getting Started&#10;Video 2: Basic Elements&#10;Video 3: Final Challenge"
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent h-24 resize-none"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-colors"
                >
                  Create Dungeon
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Courses/Dungeons List */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-accent/15 rounded-lg bg-panel2/20">
          <div className="w-10 h-10 rounded-full border border-accent/15 flex items-center justify-center text-textdim/30 mb-3 font-mono text-sm">
            ▤
          </div>
          <p className="text-xs font-semibold text-textdim mb-1 text-center font-display tracking-wide uppercase">
            NO STUDY DUNGEONS OPENED
          </p>
          <p className="text-[10px] text-textdim/50 text-center max-w-xs">
            Open a study dungeon by importing a YouTube playlist or creating one manually.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const total = course.videos.length;
            const watched = course.videos.filter((v) => v.watched).length;
            const remaining = total - watched;
            const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
            const isExpanded = expandedCourses[course.id] ?? false;

            return (
              <div
                key={course.id}
                className="bg-panel2/20 border border-accent/10 hover:border-accent/25 rounded-lg p-4 transition-all duration-300 group"
              >
                {/* Dungeon Info */}
                <div className="flex justify-between items-start gap-4">
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => toggleExpand(course.id)}
                  >
                    <h3 className="font-display font-bold text-sm tracking-wide text-textmain group-hover:text-accent transition-colors duration-300">
                      {course.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="opacity-0 group-hover:opacity-100 text-textdim hover:text-danger transition-all duration-300 text-xs font-mono cursor-pointer"
                    title="Collapse Dungeon"
                  >
                    🗑
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-grow bg-panel2 border border-accent/5 rounded-full h-2 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-textdim/80">
                      {watched}/{total}
                    </span>
                  </div>
                  
                  {/* Target Remaining Statement */}
                  <span className="text-[10px] font-mono text-accent font-semibold tracking-wide block">
                    {remaining > 0 ? (
                      `${remaining} videos remaining to clear this dungeon`
                    ) : (
                      '🎉 Dungeon Cleared!'
                    )}
                  </span>
                </div>

                {/* Video Checklist Drawer */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(course.id)}
                    className="text-[10px] font-mono text-textdim/60 hover:text-textmain flex items-center gap-1 cursor-pointer select-none"
                  >
                    {isExpanded ? '▼ Seal Video List' : '▶ Open Video List'}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-accent/10 pt-3 max-h-60 overflow-y-auto pr-1">
                      {course.videos.map((video) => (
                        <div
                          key={video.id}
                          className={`flex items-center gap-3 p-2 bg-panel2/15 border rounded transition-all duration-300 ${
                            video.watched ? 'border-accent/5 opacity-60' : 'border-accent/10 hover:border-accent/20'
                          }`}
                        >
                          {/* Circular watched checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleVideoWatched(course.id, video.id)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                              video.watched
                                ? 'bg-accent border-accent text-[9px] text-panel font-extrabold'
                                : 'border-accent/35 hover:border-accent text-transparent'
                            }`}
                          >
                            {video.watched && '✓'}
                          </button>
                          <span
                            className={`text-xs tracking-wide font-medium transition-all ${
                              video.watched ? 'line-through text-textdim/40' : 'text-textmain'
                            }`}
                          >
                            {video.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SystemPanel>
  );
};

export default StudyDungeon;
