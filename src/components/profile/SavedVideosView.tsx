import { ChevronLeft, Bookmark, Trash2 } from 'lucide-react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';

interface SavedVideosViewProps {
  videos: Video[];
  onBack: () => void;
  onRemove: (videoId: string) => void;
}

const SavedVideosView = ({ videos, onBack, onRemove }: SavedVideosViewProps) => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Saved Videos</h1>
            <p className="text-xs text-muted-foreground">{videos.length} videos</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {videos.length > 0 ? (
          <div className="space-y-2">
            {videos.map((video) => (
              <div key={video.video_id} className="relative group">
                <VideoCard video={video} variant="horizontal" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(video.video_id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved videos</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Videos you save will appear here for easy access
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedVideosView;
