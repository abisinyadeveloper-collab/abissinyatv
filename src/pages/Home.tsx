import { useState, useMemo, useCallback, memo } from 'react';
import { Search, Bell, Cast, X } from 'lucide-react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import { useVideos } from '@/hooks/useVideoData';

const categories = ['All', 'Music', 'Sports', 'Live', 'Movies'];

// Memoized video grid for performance
const VideoGrid = memo(({ videos, loading }: { videos: Video[]; loading: boolean }) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No videos found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          No videos available yet. Upload your first video!
        </p>
      </div>
    );
  }

  return (
    <>
      {videos.map((video) => (
        <VideoCard key={video.video_id} video={video} />
      ))}
    </>
  );
});

VideoGrid.displayName = 'VideoGrid';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Use optimized data hook with caching
  const { data: videos = [], isLoading } = useVideos(activeCategory);

  // Memoized filter function
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  // Memoized handlers
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
    setSearchQuery('');
  }, []);

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
                onClick={handleSearchClose}
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
              onClick={() => handleCategoryChange(category)}
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
          <VideoGrid videos={filteredVideos} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Home;
