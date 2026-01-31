// Thumbnail extraction utilities for video URLs

interface ThumbnailResult {
  url: string;
  source: 'youtube' | 'vimeo' | 'odysee' | 'default';
}

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract Vimeo video ID
const extractVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract Odysee thumbnail
const extractOdyseeId = (url: string): string | null => {
  // Odysee URLs format: odysee.com/@channel/video-name
  const match = url.match(/odysee\.com\/(@[^\/]+\/[^\/\?]+)/);
  if (match) return match[1];
  return null;
};

// Generate thumbnail URL from video URL
export const extractThumbnail = (videoUrl: string): ThumbnailResult => {
  // YouTube - highest quality thumbnail
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return {
      url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      source: 'youtube'
    };
  }
  
  // Vimeo - use their thumbnail API (requires async fetch in real app)
  const vimeoId = extractVimeoId(videoUrl);
  if (vimeoId) {
    // Vimeo thumbnail placeholder - in production, use their oEmbed API
    return {
      url: `https://vumbnail.com/${vimeoId}.jpg`,
      source: 'vimeo'
    };
  }
  
  // Odysee
  const odyseeId = extractOdyseeId(videoUrl);
  if (odyseeId) {
    return {
      url: `https://thumbnails.odycdn.com/optimize/s:640:360/quality:85/plain/https://thumbnails.lbry.com/${encodeURIComponent(odyseeId)}`,
      source: 'odysee'
    };
  }
  
  // Default placeholder for direct links
  return {
    url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
    source: 'default'
  };
};

// Get multiple thumbnail quality options for YouTube (for fallback)
export const getYouTubeThumbnails = (videoId: string): string[] => [
  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
];

// Check if URL is from a supported platform with thumbnail extraction
export const hasThumbnailSupport = (url: string): boolean => {
  return !!(extractYouTubeId(url) || extractVimeoId(url) || extractOdyseeId(url));
};
