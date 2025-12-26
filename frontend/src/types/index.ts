// Types pour l'application

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
  sessions_invalidated: number;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  youtube_url: string;
  category: number | null;
  category_name: string | null;
  order: number;
  is_published: boolean;
  embed_url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

export interface VideoListItem {
  id: number;
  title: string;
  description: string;
  category: number | null;
  category_name: string | null;
  thumbnail_url: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
  video_count: number;
  created_at: string;
}

export interface CategoryWithVideos extends Category {
  videos: VideoListItem[];
}

export interface DashboardData {
  categories: CategoryWithVideos[];
  uncategorized_videos: VideoListItem[];
  total_videos: number;
  user: {
    first_name: string;
    username: string;
  };
}

export interface Session {
  id: number;
  created_at: string;
  ip_address: string;
  user_agent: string;
}
