import { useState } from 'react';
import { Upload as UploadIcon, Image, Link as LinkIcon, Code, ChevronDown } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'music', name: 'Music' },
  { id: 'sport', name: 'Sports' },
  { id: 'live', name: 'Live Events' },
  { id: 'movies', name: 'Movies' },
];

const Upload = () => {
  const { user, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [sourceType, setSourceType] = useState<'link' | 'embed'>('link');
  const [videoUrl, setVideoUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [category, setCategory] = useState('music');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGuest) {
      setAuthAction('upload videos');
      setShowAuthModal(true);
      return;
    }

    if (!title || !thumbnailUrl || (!videoUrl && !embedCode)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extract video URL from embed code if needed
      let finalVideoUrl = videoUrl;
      if (sourceType === 'embed' && embedCode) {
        const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
        finalVideoUrl = srcMatch ? srcMatch[1] : embedCode;
      }

      await addDoc(collection(db, 'videos'), {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        video_url: finalVideoUrl,
        source_type: sourceType,
        category,
        views: 0,
        likes: 0,
        uploader_id: user?.uid,
        created_at: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Video Uploaded!</h2>
          <p className="text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Upload Video</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video"
              rows={3}
              className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail URL *</label>
            <div className="relative">
              <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full bg-secondary pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            {thumbnailUrl && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Source Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Source *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('link')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  sourceType === 'link' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">Direct Link</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('embed')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  sourceType === 'embed' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <Code className="w-5 h-5" />
                <span className="font-medium">Embed Code</span>
              </button>
            </div>
          </div>

          {/* Video URL or Embed Code */}
          {sourceType === 'link' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Video URL *</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports MP4, M3U8 (HLS), and other video formats
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Embed Code *</label>
              <textarea
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder='<iframe src="https://odysee.com/..." ...></iframe>'
                rows={4}
                className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Paste the iframe embed code from YouTube, Odysee, etc.
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full btn-primary py-4 flex items-center justify-center gap-2",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <UploadIcon className="w-5 h-5" />
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
