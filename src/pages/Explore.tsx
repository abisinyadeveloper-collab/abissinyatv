import { useState, useEffect } from 'react';
import { Search, TrendingUp, Music, Trophy, Radio, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/Skeleton';

const categories = [
  { id: 'music', name: 'Music', icon: Music, color: 'from-pink-500 to-rose-500', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 'sport', name: 'Sports', icon: Trophy, color: 'from-green-500 to-emerald-500', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },
  { id: 'live', name: 'Live', icon: Radio, color: 'from-red-500 to-orange-500', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800' },
  { id: 'movies', name: 'Movies', icon: Film, color: 'from-purple-500 to-indigo-500', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800' },
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('views', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
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
          setTrendingVideos(mappedVideos);
        } else {
          setTrendingVideos(getDemoTrending());
        }
      } catch (error) {
        console.error('Error fetching trending:', error);
        setTrendingVideos(getDemoTrending());
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const filteredVideos = trendingVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold mb-3">Explore</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos, channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto space-y-8">
        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/?category=${category.id}`}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                >
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-70`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="font-semibold">{category.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))
            ) : filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <VideoCard key={video.video_id} video={video} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No videos found</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const getDemoTrending = (): Video[] => [
  {
    video_id: 'trend-1',
    title: 'Viral Music Video - 100M Views',
    description: 'The most watched video this week',
    thumbnail_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    source_type: 'link',
    category: 'music',
    views: 100000000,
    likes: 5000000,
    uploader_id: 'user1',
    uploader_name: 'Top Artist',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
    created_at: new Date()
  },
  {
    video_id: 'trend-2',
    title: 'Championship Finals Highlights',
    description: 'Best moments from the finals',
    thumbnail_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    source_type: 'link',
    category: 'sport',
    views: 25000000,
    likes: 1200000,
    uploader_id: 'user2',
    uploader_name: 'Sports Channel',
    uploader_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    created_at: new Date(Date.now() - 86400000)
  }
];

export default Explore;
