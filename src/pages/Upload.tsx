import { useState } from 'react';
import { Upload as UploadIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Upload = () => {
  const { user, userProfile, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-detect source type from URL
  const detectSourceType = (url: string): 'link' | 'embed' => {
    const embedPatterns = [
      'youtube.com/embed',
      'youtube.com/watch',
      'youtu.be',
      'odysee.com',
      'rumble.com/embed',
      'vimeo.com',
      'dailymotion.com',
      'facebook.com/video',
      'tiktok.com'
    ];
    return embedPatterns.some(pattern => url.toLowerCase().includes(pattern)) ? 'embed' : 'link';
  };

  // Auto-generate thumbnail from video URL
  const generateThumbnail = (url: string): string => {
    // YouTube thumbnail extraction
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    // Default placeholder
    return 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800';
  };

  // Auto-detect category from title
  const detectCategory = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('football') || lowerTitle.includes('sport') || lowerTitle.includes('goal') || lowerTitle.includes('match')) {
      return 'sport';
    }
    if (lowerTitle.includes('live') || lowerTitle.includes('stream')) {
      return 'live';
    }
    if (lowerTitle.includes('movie') || lowerTitle.includes('film') || lowerTitle.includes('trailer')) {
      return 'movies';
    }
    return 'music'; // Default
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGuest) {
      setAuthAction('upload videos');
      setShowAuthModal(true);
      return;
    }

    if (!title.trim() || !videoUrl.trim()) {
      toast.error('Please enter a title and video URL');
      return;
    }

    setLoading(true);

    try {
      const sourceType = detectSourceType(videoUrl);
      const thumbnailUrl = generateThumbnail(videoUrl);
      const category = detectCategory(title);

      // Convert embed URLs to proper format
      let finalVideoUrl = videoUrl;
      if (sourceType === 'embed') {
        // Convert YouTube watch URLs to embed URLs
        const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (youtubeMatch) {
          finalVideoUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }
      }

      const docRef = await addDoc(collection(db, 'videos'), {
        title: title.trim(),
        description: '',
        thumbnail_url: thumbnailUrl,
        video_url: finalVideoUrl,
        source_type: sourceType,
        category,
        views: 0,
        likes: 0,
        uploader_id: user?.uid,
        uploader_name: userProfile?.username || 'Anonymous',
        uploader_avatar: userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`,
        created_at: serverTimestamp()
      });

      toast.success('Video uploaded successfully!');
      // Redirect to the new video
      navigate(`/watch/${docRef.id}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Quick Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">Just paste a link and go!</p>
        </div>
      </header>

      <div className="px-4 py-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full bg-secondary px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
              required
              autoFocus
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Link *</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube, MP4, or any video link"
                className="w-full bg-secondary pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supports YouTube, MP4, M3U8 (HLS), Odysee, and more
            </p>
          </div>

          {/* Auto-detection preview */}
          {videoUrl && (
            <div className="bg-card/50 rounded-xl p-4 border border-border animate-in fade-in">
              <p className="text-sm font-medium mb-2">Auto-detected:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-secondary rounded-full text-xs">
                  Type: {detectSourceType(videoUrl).toUpperCase()}
                </span>
                {title && (
                  <span className="px-3 py-1 bg-secondary rounded-full text-xs">
                    Category: {detectCategory(title)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !title.trim() || !videoUrl.trim()}
            className={cn(
              "w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg font-semibold",
              (loading || !title.trim() || !videoUrl.trim()) && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                Upload & Watch
              </>
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Tips:</h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Just paste a YouTube or video link - we'll auto-detect everything else!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>For MP4 files, paste the direct link to the video file.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Include keywords like "football" or "live" in the title for better categorization.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;
