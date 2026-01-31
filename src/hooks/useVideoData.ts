import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types';
import { useEffect } from 'react';

// Map database video to app Video type
const mapVideo = (v: any): Video => ({
  video_id: v.id,
  title: v.title,
  description: '',
  thumbnail_url: v.thumbnail_url || '',
  video_url: v.url || v.embed_code || '',
  source_type: v.type as 'link' | 'embed',
  category: v.category as 'music' | 'sport' | 'live' | 'movies',
  views: v.views || 0,
  likes: v.likes || 0,
  uploader_id: v.user_id,
  created_at: new Date(v.created_at)
});

// Fetch all videos with caching
export const useVideos = (category: string = 'All') => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['videos', category],
    queryFn: async () => {
      let q = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (category !== 'All') {
        const categoryMap: Record<string, string> = {
          'Music': 'music',
          'Sports': 'sport',
          'Live': 'live',
          'Movies': 'movies'
        };
        q = q.eq('category', categoryMap[category]);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data?.map(mapVideo) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Real-time subscription for new videos
  useEffect(() => {
    const channel = supabase
      .channel('videos-realtime-hook')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'videos' },
        (payload) => {
          const newVideo = mapVideo(payload.new);
          queryClient.setQueryData(['videos', 'All'], (old: Video[] | undefined) => 
            old ? [newVideo, ...old] : [newVideo]
          );
          // Also update category-specific cache
          if (newVideo.category) {
            const catKey = newVideo.category.charAt(0).toUpperCase() + newVideo.category.slice(1);
            queryClient.setQueryData(['videos', catKey], (old: Video[] | undefined) => 
              old ? [newVideo, ...old] : [newVideo]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Fetch single video with caching
export const useVideo = (videoId: string | undefined) => {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) throw new Error('No video ID');
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      return mapVideo(data);
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch related videos
export const useRelatedVideos = (videoId: string | undefined, category: string | undefined) => {
  return useQuery({
    queryKey: ['related-videos', videoId, category],
    queryFn: async () => {
      if (!videoId || !category) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category)
        .neq('id', videoId)
        .order('views', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data?.map(mapVideo) || [];
    },
    enabled: !!videoId && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Prefetch video for faster navigation
export const usePrefetchVideo = () => {
  const queryClient = useQueryClient();

  return (videoId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['video', videoId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        return mapVideo(data);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
