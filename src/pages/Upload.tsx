import { useState, useEffect } from 'react';
import { Upload as UploadIcon, Link as LinkIcon, Code, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { extractThumbnail, hasThumbnailSupport } from '@/lib/thumbnails';

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
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL is required' };
  }
  
  if (trimmedUrl.length > 2000) {
    return { valid: false, error: 'URL is too long (max 2000 characters)' };
  }
  
  let parsed: URL;
  try {
    parsed = new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' };
  }
  
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }
  
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

// Validate thumbnail URL
const validateThumbnailUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url.trim()) return { valid: true }; // Optional field
  
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
    }
  } catch {
    return { valid: false, error: 'Invalid thumbnail URL format' };
  }
  
  return { valid: true };
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

const Upload = () => {
  const { user, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [videoSource, setVideoSource] = useState('');
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [autoThumbnail, setAutoThumbnail] = useState('');
  const [videoType, setVideoType] = useState<VideoType>('link');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; videoSource?: string; thumbnail?: string }>({});

  // Auto-extract thumbnail when video source changes
  useEffect(() => {
    if (videoSource.trim() && hasThumbnailSupport(videoSource)) {
      const result = extractThumbnail(videoSource);
      setAutoThumbnail(result.url);
    } else {
      setAutoThumbnail('');
    }
  }, [videoSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const newErrors: { title?: string; videoSource?: string; thumbnail?: string } = {};
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    const urlValidation = validateVideoUrl(videoSource, videoType);
    if (!urlValidation.valid) {
      newErrors.videoSource = urlValidation.error;
    }
    
    const thumbnailValidation = validateThumbnailUrl(customThumbnail);
    if (!thumbnailValidation.valid) {
      newErrors.thumbnail = thumbnailValidation.error;
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

    try {
      // Use custom thumbnail if provided, otherwise use auto-extracted or default
      const finalThumbnail = customThumbnail.trim() || autoThumbnail || extractThumbnail(videoSource).url;
      const category = detectCategory(title);
      const finalVideoUrl = processVideoUrl(videoSource, videoType);

      const { error } = await supabase.from('videos').insert({
        user_id: user?.id,
        title: trimmedTitle,
        url: videoType === 'link' ? finalVideoUrl : null,
        embed_code: videoType === 'embed' ? finalVideoUrl : null,
        thumbnail_url: finalThumbnail,
        type: videoType,
        category,
        views: 0,
        likes: 0
      });

      if (error) throw error;

      // Invalidate video queries to refresh home page instantly
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      
      toast.success('Video uploaded successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
      setLoading(false);
    }
  };

  // Determine which thumbnail to show in preview
  const previewThumbnail = customThumbnail.trim() || autoThumbnail;

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
                ? 'Supports MP4, M3U8 (HLS), and direct video URLs.'
                : 'Supports YouTube, Odysee, and Vimeo embed URLs only.'
              }
            </p>
          </div>

          {/* Custom Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Thumbnail URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={customThumbnail}
                onChange={(e) => {
                  setCustomThumbnail(e.target.value);
                  if (errors.thumbnail) setErrors(prev => ({ ...prev, thumbnail: undefined }));
                }}
                placeholder="https://example.com/thumbnail.jpg"
                className={cn(
                  "w-full bg-secondary pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                  errors.thumbnail && "ring-2 ring-destructive"
                )}
              />
            </div>
            {errors.thumbnail && (
              <p className="text-destructive text-sm mt-1">{errors.thumbnail}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Leave empty to auto-extract from YouTube/Vimeo/Odysee URLs
            </p>
          </div>

          {/* Thumbnail Preview */}
          {previewThumbnail && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Thumbnail Preview</p>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={previewThumbnail} 
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80';
                  }}
                />
              </div>
              {autoThumbnail && !customThumbnail.trim() && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ✓ Auto-extracted from video URL
                </p>
              )}
            </div>
          )}

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
              <span>Thumbnails are auto-extracted for YouTube, Vimeo & Odysee videos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Add a custom thumbnail URL to override the auto-extracted one.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;
