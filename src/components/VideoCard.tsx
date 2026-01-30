import { Play, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Video } from '@/types';
import { formatViews, formatTimeAgo } from '@/lib/format';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'compact' | 'horizontal';
}

const VideoCard = ({ video, variant = 'default' }: VideoCardProps) => {
  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/watch/${video.video_id}`}
        className="flex gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
      >
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground">{video.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{video.uploader_name || 'Anonymous'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </span>
            <span>•</span>
            <span>{formatTimeAgo(video.created_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link 
        to={`/watch/${video.video_id}`}
        className="video-card group"
      >
        <div className="relative aspect-video bg-muted">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-2">
          <h3 className="font-medium text-xs line-clamp-2">{video.title}</h3>
          <p className="text-[10px] text-muted-foreground mt-1">{formatViews(video.views)} views</p>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/watch/${video.video_id}`}
      className="video-card group block"
    >
      <div className="relative aspect-video bg-muted">
        <img 
          src={video.thumbnail_url} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.category === 'live' ? 'LIVE' : '3:45'}
        </div>
      </div>
      <div className="p-3">
        <div className="flex gap-3">
          <img 
            src={video.uploader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader_id}`}
            alt={video.uploader_name}
            className="w-9 h-9 rounded-full bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 leading-tight">{video.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{video.uploader_name || 'Anonymous'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
