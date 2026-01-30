export interface Video {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  source_type: 'link' | 'embed';
  category: 'music' | 'sport' | 'live' | 'movies';
  views: number;
  likes: number;
  uploader_id: string;
  uploader_name?: string;
  uploader_avatar?: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  text: string;
  user_id: string;
  video_id: string;
  timestamp: Date;
  user_avatar: string;
  username: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  avatar_url: string;
  email: string;
  followers_list: string[];
}
