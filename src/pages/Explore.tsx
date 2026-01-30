import { useState, useEffect } from 'react';
import { Search, TrendingUp, Music, Trophy, Radio, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoCardSkeleton, CategoryCardSkeleton } from '@/components/Skeleton';

const categories = [
  { id: 'music', name: 'Music', icon: Music, color: 'from-pink-500 to-rose-500', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 'sport', name: 'Sports', icon: Trophy, color: 'from-green-500 to-emerald-500', image: 'https://images.unsplash.com/photo-1461896836934- voices-f8b7c9e3?w=800' },
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
        const q = query(
          collection(db, 'videos'),
          orderBy('views', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const videosData = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            video_id: doc.id,
            title: data.title || '',
            description: data.description || '',
            thumbnail_url: data.thumbnail_url || '',
            video_url: data.video_url || '',
            source_type: data.source_type || 'link',
            category: data.category || 'music',
            views: data.views || 0,
            likes: data.likes || 0,
            uploader_id: data.uploader_id || '',
            uploader_name: data.uploader_name || '',
            uploader_avatar: data.uploader_avatar || '',
            created_at: data.created_at || new Date()
          } as Video;
        });
        setTrendingVideos(videosData);
      } catch (error) {
        console.error('Error fetching trending:', error);
        // Demo data
        setTrendingVideos([
          {
            video_id: '1',
            title: 'Viral Music Video - 100M Views',
            description: '',
            thumbnail_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            video_url: '',
            source_type: 'link',
            category: 'music',
            views: 100000000,
            likes: 5000000,
            uploader_id: 'user1',
            uploader_name: 'Top Artist',
            created_at: new Date()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

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
                  to={`/explore/${category.id}`}
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
            ) : (
              trendingVideos.map((video) => (
                <VideoCard key={video.video_id} video={video} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
