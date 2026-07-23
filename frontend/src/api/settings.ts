import apiClient from './client';

export interface BackendSettings {
  DEEPGRAM_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  PEXELS_API_KEY?: string;
  YOUTUBE_CLIENT_ID?: string;
  YOUTUBE_CLIENT_SECRET?: string;
}

export interface YoutubeStatus {
  isConnected: boolean;
  channelName?: string;
  avatarUrl?: string;
}

export const getSettings = async () => {
  const response = await apiClient.get<BackendSettings>('/api/settings');
  return response.data;
};

export const saveSettings = async (settings: BackendSettings) => {
  const response = await apiClient.post<{ success: boolean }>('/api/settings', settings);
  return response.data;
};

export const getYoutubeStatus = async () => {
  const response = await apiClient.get<YoutubeStatus>('/api/youtube/status');
  return response.data;
};

export const getYoutubeAuthUrl = async () => {
  const response = await apiClient.get<{ url: string }>('/api/youtube/auth-url');
  return response.data;
};

export const disconnectYoutube = async () => {
  const response = await apiClient.post<{ success: boolean }>('/api/youtube/disconnect');
  return response.data;
};
