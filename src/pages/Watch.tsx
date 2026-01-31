import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, Download, Bookmark, 
  MoreHorizontal, Send, UserPlus, Check, Library, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Video, Comment } from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import VideoCard from '@/components/VideoCard';
import { Skeleton } from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { useVideo, useRelatedVideos } from '@/hooks/useVideoData';
import { formatViews, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Watch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user, userProfile, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const { saveVideo, removeVideo, isVideoSaved } = useSavedVideos();
  
  // Use React Query for optimized data fetching with caching
  const { data: video, isLoading: videoLoading, error: videoError } = useVideo(videoId);
  const { data: relatedVideos = [] } = useRelatedVideos(videoId, video?.category);
  
  const [comments, setComments] = useState<Comment[]>(getDemoComments());
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState<number | null>(null);
  const [following, setFollowing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  const isSaved = video ? isVideoSaved(video.video_id) : false;
  
  // Memoized likes count (local override or from video)
  const displayLikes = useMemo(() => {
    return localLikes ?? video?.likes ?? 0;
  }, [localLikes, video?.likes]);

  // Increment view count once per video load
  useEffect(() => {
    if (videoId && video && !viewCounted) {
      supabase.rpc('increment_video_views', { video_id: videoId });
      setViewCounted(true);
    }
  }, [videoId, video, viewCounted]);

  // Reset view count flag when video changes
  useEffect(() => {
    setViewCounted(false);
    setLocalLikes(null);
    setLiked(false);
  }, [videoId]);

  const handleLike = useCallback(async () => {
    if (isGuest) {
      setAuthAction('like this video');
      setShowAuthModal(true);
      return;
    }
    
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLocalLikes(prev => {
      const current = prev ?? video?.likes ?? 0;
      return current + (wasLiked ? -1 : 1);
    });
    
    // Update in database
    if (videoId) {
      try {
        if (wasLiked) {
          await supabase.rpc('decrement_video_likes', { video_id: videoId });
        } else {
          await supabase.rpc('increment_video_likes', { video_id: videoId });
        }
        toast.success(wasLiked ? 'Like removed' : 'Added to liked videos');
      } catch (error) {
        // Revert on error
        setLiked(wasLiked);
        setLocalLikes(video?.likes ?? 0);
        toast.error('Failed to update like');
      }
    }
  }, [isGuest, liked, videoId, video?.likes, setAuthAction, setShowAuthModal]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSave = () => {
    if (isGuest) {
      setAuthAction('save videos');
      setShowAuthModal(true);
      return;
    }
    
    if (!video) return;
    
    if (isSaved) {
      removeVideo(video.video_id);
      toast.success('Removed from library');
    } else {
      saveVideo(video);
      toast.success('Saved to library');
    }
  };

  const handleDownload = async () => {
    if (!video) return;
    
    if (video.source_type === 'embed') {
      if (!isGuest) {
        saveVideo(video);
        toast.success('Saved to library (embeds cannot be downloaded)');
      } else {
        setAuthAction('save videos');
        setShowAuthModal(true);
      }
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(video.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      window.open(video.video_url, '_blank');
      toast.info('Opening video in new tab for download');
    } finally {
      setDownloading(false);
    }
  };

  const handleFollow = () => {
    if (isGuest) {
      setAuthAction('follow creators');
      setShowAuthModal(true);
      return;
    }
    setFollowing(!following);
    toast.success(following ? 'Unfollowed' : 'Following!');
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (isGuest) {
      setAuthAction('comment on videos');
      setShowAuthModal(true);
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      user_id: user!.id,
      video_id: videoId!,
      timestamp: new Date(),
      user_avatar: userProfile?.avatar_url || '',
      username: userProfile?.username || 'User'
    };

    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment posted!');
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Skeleton className="w-full aspect-video" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-4">
      <div className="lg:flex lg:gap-6 lg:p-4 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="lg:flex-1">
          {/* Video Player */}
          <VideoPlayer
            videoUrl={video.video_url}
            sourceType={video.source_type}
            title={video.title}
            thumbnail={video.thumbnail_url}
          />

          {/* Video Info */}
          <div className="p-4 space-y-4">
            <h1 className="text-lg font-semibold leading-tight">{video.title}</h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.created_at)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  liked ? "bg-primary/20 text-primary" : "bg-secondary hover:bg-accent"
                )}
              >
                <ThumbsUp className={cn("w-5 h-5", liked && "fill-current")} />
                <span className="text-sm font-medium">{formatViews(displayLikes)}</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full hover:bg-accent transition-colors">
                <ThumbsDown className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full hover:bg-accent transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full hover:bg-accent transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : video.source_type === 'embed' ? (
                  <Library className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {video.source_type === 'embed' ? 'Save' : 'Download'}
                </span>
              </button>
              
              <button 
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  isSaved ? "bg-primary/20 text-primary" : "bg-secondary hover:bg-accent"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Library'}</span>
              </button>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between py-3 border-t border-b border-border">
              <div className="flex items-center gap-3">
                <img 
                  src={video.uploader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader_id}`}
                  alt={video.uploader_name}
                  className="w-10 h-10 rounded-full bg-muted"
                />
                <div>
                  <h3 className="font-medium text-sm">{video.uploader_name || 'Anonymous'}</h3>
                  <p className="text-xs text-muted-foreground">1.2M subscribers</p>
                </div>
              </div>
              <button 
                onClick={handleFollow}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors",
                  following 
                    ? "bg-secondary text-foreground" 
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {following ? (
                  <>
                    <Check className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl p-3">
              <p className={cn(
                "text-sm text-muted-foreground",
                !showFullDescription && "line-clamp-2"
              )}>
                {video.description || 'No description available.'}
              </p>
              {video.description && video.description.length > 100 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm font-medium mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="pt-4">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
              
              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <img 
                  src={userProfile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'}
                  alt="You"
                  className="w-8 h-8 rounded-full bg-muted flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none py-2 text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2 text-primary disabled:text-muted-foreground"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img 
                      src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full bg-muted flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">12</span>
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button className="p-1 text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos - Sidebar on large screens */}
        <div className="lg:w-96 p-4 lg:p-0">
          <h3 className="font-semibold mb-4">Related Videos</h3>
          <div className="space-y-2">
            {relatedVideos.map((video) => (
              <VideoCard key={video.video_id} video={video} variant="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo data functions
const getDemoVideo = (id: string): Video => ({
  video_id: id,
  title: 'Amazing Live Concert Performance 2024 - Full Show',
  description: 'Experience the best live concert of 2024 with incredible performances from top artists. This show features stunning visuals, amazing sound quality, and unforgettable moments that will leave you speechless.',
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
});

const getDemoComments = (): Comment[] => [
  {
    id: '1',
    text: 'This is absolutely amazing! Best concert I have ever seen! 🔥',
    user_id: 'user1',
    video_id: 'demo',
    timestamp: new Date(Date.now() - 3600000),
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    username: 'MusicFan123'
  },
  {
    id: '2',
    text: 'The sound quality is incredible. Thanks for sharing!',
    user_id: 'user2',
    video_id: 'demo',
    timestamp: new Date(Date.now() - 7200000),
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    username: 'ConcertLover'
  },
  {
    id: '3',
    text: 'Been waiting for this upload! 🙌',
    user_id: 'user3',
    video_id: 'demo',
    timestamp: new Date(Date.now() - 86400000),
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    username: 'LiveShowFan'
  }
];

const getDemoRelatedVideos = (): Video[] => [
  {
    video_id: 'demo-2',
    title: 'Premier League Highlights',
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
    title: 'New Music Video Release',
    description: 'Official music video',
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
  }
];

export default Watch;
