import { useState, useRef } from 'react';
import { Upload as UploadIcon, Link as LinkIcon, Code, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type VideoType = 'link' | 'embed';

// Allowed domains for embed videos
const ALLOWED_EMBED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
  'odysee.com',
  'www.odysee.com'
];

// Validate URL format and domain restrictions
const validateVideoUrl = (url: string, type: VideoType): { valid: boolean; error?: string } => {
  // Trim whitespace
  const trimmedUrl = url.trim();
  
  // Check for empty URL
  if (!trimmedUrl) {
    return { valid: false, error: 'URL is required' };
  }
  
  // Check URL length (prevent DoS with extremely long URLs)
  if (trimmedUrl.length > 2000) {
    return { valid: false, error: 'URL is too long (max 2000 characters)' };
  }
  
  // Validate URL format
  let parsed: URL;
  try {
    parsed = new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' };
  }
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }
  
  // For embed type, enforce domain whitelist
  if (type === 'embed') {
    const isAllowedDomain = ALLOWED_EMBED_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
    
    if (!isAllowedDomain) {
      return { 
        valid: false, 
        error: 'Embed videos must be from YouTube, Vimeo, or Odysee. Please use a supported platform.' 
      };
    }
  }
  
  return { valid: true };
};

const Upload = () => {
  const { user, userProfile, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [videoSource, setVideoSource] = useState('');
  const [videoType, setVideoType] = useState<VideoType>('link');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; videoSource?: string }>({});
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-generate thumbnail from video URL
  const generateThumbnail = (url: string): string => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800';
  };

  // Auto-detect category from title
  const detectCategory = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('football') || lowerTitle.includes('sport') || lowerTitle.includes('goal')) {
      return 'sport';
    }
    if (lowerTitle.includes('live') || lowerTitle.includes('stream')) {
      return 'live';
    }
    if (lowerTitle.includes('movie') || lowerTitle.includes('film') || lowerTitle.includes('trailer')) {
      return 'movies';
    }
    return 'music';
  };

  // Convert YouTube watch URLs to embed URLs
  const processVideoUrl = (url: string, type: VideoType): string => {
    if (type === 'embed') {
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const newErrors: { title?: string; videoSource?: string } = {};
    
    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    // Validate video URL
    const urlValidation = validateVideoUrl(videoSource, videoType);
    if (!urlValidation.valid) {
      newErrors.videoSource = urlValidation.error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (isGuest) {
      setAuthAction('upload videos');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setErrors({});

    // Set a max loading time of 0.5 seconds before redirect
    timeoutRef.current = setTimeout(() => {
      navigate('/');
      toast.success('Video uploaded!');
    }, 500);

    try {
      const thumbnailUrl = generateThumbnail(videoSource);
      const category = detectCategory(title);
      const finalVideoUrl = processVideoUrl(videoSource, videoType);

      const { error } = await supabase.from('videos').insert({
        user_id: user?.id,
        title: title.trim(),
        url: videoType === 'link' ? finalVideoUrl : null,
        embed_code: videoType === 'embed' ? finalVideoUrl : null,
        thumbnail_url: thumbnailUrl,
        type: videoType,
        category,
        views: 0,
        likes: 0
      });

      if (error) throw error;

      // Clear timeout and redirect immediately if upload finished fast
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      navigate('/');
      toast.success('Video uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      toast.error(err.message || 'Failed to upload video');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Quick Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a video link or embed code</p>
        </div>
      </header>

      <div className="px-4 py-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Type Toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setVideoType('link')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                videoType === 'link' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LinkIcon className="w-4 h-4" />
              Direct Link
            </button>
            <button
              type="button"
              onClick={() => setVideoType('embed')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                videoType === 'embed' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code className="w-4 h-4" />
              Embed Code
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
              }}
              placeholder="Enter video title"
              className={cn(
                "w-full bg-secondary px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg transition-all",
                errors.title && "ring-2 ring-destructive"
              )}
              autoFocus
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Video Source */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {videoType === 'link' ? 'Video URL *' : 'Embed Code / URL *'}
            </label>
            <div className="relative">
              {videoType === 'link' ? (
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              ) : (
                <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="text"
                value={videoSource}
                onChange={(e) => {
                  setVideoSource(e.target.value);
                  if (errors.videoSource) setErrors(prev => ({ ...prev, videoSource: undefined }));
                }}
                placeholder={videoType === 'link' 
                  ? "https://example.com/video.mp4" 
                  : "https://youtube.com/watch?v=... or embed URL"
                }
                className={cn(
                  "w-full bg-secondary pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                  errors.videoSource && "ring-2 ring-destructive"
                )}
              />
            </div>
            {errors.videoSource && (
              <p className="text-destructive text-sm mt-1">{errors.videoSource}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {videoType === 'link' 
                ? 'Supports MP4, M3U8 (HLS), and direct video URLs. Note: Direct links are user-submitted and not verified.'
                : 'Supports YouTube, Odysee, and Vimeo embed URLs only.'
              }
            </p>
            {videoType === 'link' && (
              <p className="text-xs text-destructive/80 mt-1">
                ⚠️ Direct links are not verified. Only link to trusted video sources.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg font-semibold transition-all",
              loading && "opacity-70"
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
                Upload Video
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
              <span>Use "Direct Link" for MP4, M3U8, or any direct video file URLs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use "Embed Code" for YouTube, Odysee, or Vimeo videos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Include keywords like "football" or "live" for automatic categorization.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;
