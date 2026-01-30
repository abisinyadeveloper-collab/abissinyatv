import { useState, useEffect } from 'react';
import { Video } from '@/types';

const SAVED_VIDEOS_KEY = 'abisinya_saved_videos';

export const useSavedVideos = () => {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SAVED_VIDEOS_KEY);
    if (stored) {
      try {
        setSavedVideos(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing saved videos:', e);
      }
    }
  }, []);

  const saveVideo = (video: Video) => {
    const updated = [...savedVideos.filter(v => v.video_id !== video.video_id), video];
    setSavedVideos(updated);
    localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(updated));
  };

  const removeVideo = (videoId: string) => {
    const updated = savedVideos.filter(v => v.video_id !== videoId);
    setSavedVideos(updated);
    localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(updated));
  };

  const isVideoSaved = (videoId: string) => {
    return savedVideos.some(v => v.video_id === videoId);
  };

  return { savedVideos, saveVideo, removeVideo, isVideoSaved };
};
