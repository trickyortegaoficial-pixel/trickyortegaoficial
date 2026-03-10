export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  role: 'admin' | 'fan';
  subscription_active: boolean;
}

export interface Song {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string;
  spotify_url?: string;
  youtube_url?: string;
  apple_music_url?: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string;
  description: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  created_at: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  media_type: 'image' | 'video';
}

export interface Settings {
  id: string;
  hero_video_url: string;
  hero_phrase: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  spotify_url: string;
}

export interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video' | 'audio';
  uploaded_by: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: Profile;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
