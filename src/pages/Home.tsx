import { useState, useEffect, useMemo } from 'react';
import { Search, Bell, Cast, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';

const categories = ['All', 'Music', 'Sports', 'Live', 'Movies'];

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch videos from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      
      let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (activeCategory !== 'All') {
        const categoryMap: Record<string, string> = {
          'Music': 'music',
          'Sports': 'sport',
          'Live': 'live',
          'Movies': 'movies'
        };
        query = query.eq('category', categoryMap[activeCategory]);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching videos:', error);
        setVideos(getDemoVideos());
      } else if (data && data.length > 0) {
        const mappedVideos: Video[] = data.map(v => ({
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
        }));
        setVideos(mappedVideos);
      } else {
        setVideos(getDemoVideos());
      }
      
      setLoading(false);
    };

    fetchVideos();

    // Set up real-time subscription for new videos
    const channel = supabase
      .channel('videos-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'videos'
        },
        (payload) => {
          const newVideo = payload.new;
          const mappedVideo: Video = {
            video_id: newVideo.id,
            title: newVideo.title,
            description: '',
            thumbnail_url: newVideo.thumbnail_url || '',
            video_url: newVideo.url || newVideo.embed_code || '',
            source_type: newVideo.type as 'link' | 'embed',
            category: newVideo.category as 'music' | 'sport' | 'live' | 'movies',
            views: newVideo.views || 0,
            likes: newVideo.likes || 0,
            uploader_id: newVideo.user_id,
            created_at: new Date(newVideo.created_at)
          };
          setVideos(prev => [mappedVideo, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory]);

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {showSearch ? (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full bg-secondary pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-primary">ABISINYA</h1>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <Cast className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Category pills */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === category
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-accent"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search indicator */}
      {searchQuery && (
        <div className="px-4 py-2 max-w-6xl mx-auto">
          <p className="text-sm text-muted-foreground">
            Showing results for "<span className="text-foreground font-medium">{searchQuery}</span>"
            {filteredVideos.length > 0 && ` (${filteredVideos.length} found)`}
          </p>
        </div>
      )}

      {/* Video feed */}
      <div className="px-4 py-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          ) : filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchQuery 
                  ? `No videos match "${searchQuery}". Try a different search term.`
                  : 'No videos available in this category yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo data for testing
const getDemoVideos = (): Video[] => [
  {
    video_id: 'demo-1',
    title: 'Amazing Live Concert Performance 2024',
    description: 'An incredible live performance from the biggest artists',
    thumbnail_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    source_type: 'link',
    category: 'music',
    views: 1250000,
    likes: 45000,
    uploader_id: 'user1',
    uploader_name: 'Music Channel',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music',
    created_at: new Date(Date.now() - 86400000)
  },
  {
    video_id: 'demo-2',
    title: 'Premier League Highlights - Best Goals',
    description: 'Top 10 goals from this week',
    thumbnail_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    source_type: 'link',
    category: 'sport',
    views: 890000,
    likes: 32000,
    uploader_id: 'user2',
    uploader_name: 'Sports Daily',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    created_at: new Date(Date.now() - 172800000)
  },
  {
    video_id: 'demo-3',
    title: 'Trending Music Video - New Release',
    description: 'Official music video for the latest hit',
    thumbnail_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    source_type: 'embed',
    category: 'music',
    views: 5600000,
    likes: 234000,
    uploader_id: 'user3',
    uploader_name: 'VEVO',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vevo',
    created_at: new Date(Date.now() - 259200000)
  },
  {
    video_id: 'demo-4',
    title: 'Live Football Match - Championship Final',
    description: 'Watch the championship final live',
    thumbnail_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    source_type: 'link',
    category: 'live',
    views: 125000,
    likes: 8900,
    uploader_id: 'user4',
    uploader_name: 'Live Sports',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=live',
    created_at: new Date()
  },
  {
    video_id: 'demo-5',
    title: 'Blockbuster Movie Trailer 2024',
    description: 'Official trailer for the most anticipated movie',
    thumbnail_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    source_type: 'link',
    category: 'movies',
    views: 3400000,
    likes: 156000,
    uploader_id: 'user5',
    uploader_name: 'MovieTrailers',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=movies',
    created_at: new Date(Date.now() - 345600000)
  },
  {
    video_id: 'demo-6',
    title: 'Acoustic Session - Unplugged Live',
    description: 'Beautiful acoustic performance',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    source_type: 'link',
    category: 'music',
    views: 780000,
    likes: 45000,
    uploader_id: 'user6',
    uploader_name: 'Acoustic Vibes',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=acoustic',
    created_at: new Date(Date.now() - 432000000)
  }
];

export default Home;
