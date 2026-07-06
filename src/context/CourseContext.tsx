import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';

export interface Video {
  id: string;
  title: string;
  watched: boolean;
}

export interface Course {
  id: string;
  title: string;
  videos: Video[];
}

export interface DungeonClearedEvent {
  courseTitle: string;
}

interface CourseContextType {
  courses: Course[];
  dungeonClearedEvent: DungeonClearedEvent | null;
  addManualCourse: (title: string, videoTitles: string[]) => void;
  addYouTubeCourse: (playlistUrl: string) => Promise<void>;
  toggleVideoWatched: (courseId: string, videoId: string) => void;
  deleteCourse: (courseId: string) => void;
  clearDungeonClearedEvent: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_courses';

export const extractPlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  return match ? match[1] : null;
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gainXP, playSFX } = usePlayer();

  // Load initial courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse courses from localStorage', e);
      }
    }
    return [];
  });

  const [dungeonClearedEvent, setDungeonClearedEvent] = useState<DungeonClearedEvent | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const addManualCourse = (title: string, videoTitles: string[]) => {
    const newCourse: Course = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      videos: videoTitles
        .filter((t) => t.trim() !== '')
        .map((t) => ({
          id: Math.random().toString(36).substring(2, 9),
          title: t.trim(),
          watched: false,
        })),
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const addYouTubeCourse = async (playlistUrl: string) => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_YOUTUBE_API_KEY is not defined in your environment.');
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      throw new Error('Invalid YouTube Playlist URL. Could not extract playlist ID.');
    }

    // 1. Fetch playlist title
    const listUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
    const listRes = await fetch(listUrl);
    let title = 'YouTube Course';
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.items?.[0]) {
        title = listData.items[0].snippet?.title || 'YouTube Course';
      }
    }

    // 2. Fetch playlist items (first 50)
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    const itemsRes = await fetch(itemsUrl);
    if (!itemsRes.ok) {
      throw new Error(`YouTube API returned error status: ${itemsRes.status}`);
    }

    const itemsData = await itemsRes.json();
    const items = itemsData.items || [];
    if (items.length === 0) {
      throw new Error('This playlist appears to contain no videos or is private.');
    }

    const videos: Video[] = items.map((item: any) => ({
      id: item.id,
      title: item.snippet?.title || 'Untitled Video',
      watched: false,
    }));

    const newCourse: Course = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      videos,
    };

    setCourses((prev) => [...prev, newCourse]);
  };

  const toggleVideoWatched = (courseId: string, videoId: string) => {
    let shouldAwardXP = false;
    let clearingCourseTitle = '';

    setCourses((prev) => {
      return prev.map((course) => {
        if (course.id !== courseId) return course;

        const updatedVideos = course.videos.map((v) => {
          if (v.id !== videoId) return v;

          const isTurningWatched = !v.watched;
          if (isTurningWatched) {
            shouldAwardXP = true;
          }
          return { ...v, watched: isTurningWatched };
        });

        // Check if all are watched
        const allCompleted = updatedVideos.length > 0 && updatedVideos.every((v) => v.watched);
        if (allCompleted) {
          clearingCourseTitle = course.title;
        }

        return { ...course, videos: updatedVideos };
      });
    });

    if (shouldAwardXP) {
      gainXP(15, 'intellect');
    }

    if (clearingCourseTitle) {
      setDungeonClearedEvent({
        courseTitle: clearingCourseTitle,
      });
      playSFX('dungeon-clear');
    }
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const clearDungeonClearedEvent = () => {
    setDungeonClearedEvent(null);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        dungeonClearedEvent,
        addManualCourse,
        addYouTubeCourse,
        toggleVideoWatched,
        deleteCourse,
        clearDungeonClearedEvent,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
