import { useState, useEffect } from 'react';
import { Search, Bell, Cast } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/Skeleton';

const categories = ['All', 'Music', 'Sports', 'Live', 'Movies'];

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      
      // Add timeout for poor connections
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      try {
        let q;
        if (activeCategory === 'All') {
          q = query(collection(db, 'videos'), orderBy('created_at', 'desc'), limit(20));
        } else {
          q = query(
            collection(db, 'videos'),
            where('category', '==', activeCategory.toLowerCase()),
            orderBy('created_at', 'desc'),
            limit(20)
          );
        }
        
        const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
        
        if (snapshot.empty) {
          // No videos in DB, use demo data
          setVideos(getDemoVideos());
        } else {
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
          setVideos(videosData.length > 0 ? videosData : getDemoVideos());
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        // Set demo data on error or timeout
        setVideos(getDemoVideos());
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeCategory]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-primary">ABISINYA</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Cast className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Category pills */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground hover:bg-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Video feed */}
      <div className="px-4 py-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No videos found</p>
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
    video_id: '1',
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
    video_id: '2',
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
    video_id: '3',
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
    video_id: '4',
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
    video_id: '5',
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
    video_id: '6',
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
