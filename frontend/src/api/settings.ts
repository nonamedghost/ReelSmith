import apiClient from './client';

export interface AppSettings {
  provider: "veo" | "pexels" | "hybrid";
  uploadToYoutube: boolean;
  maxLibraryReels: number;
}

export interface YoutubeStatus {
  isConnected: boolean;
  channelName?: string;
  avatarUrl?: string;
}

export const getSettings = async () => {
  const response = await apiClient.get<{
    success: boolean;
    settings: AppSettings;
  }>('/settings');

  return response.data.settings;
};

export const saveSettings = async (settings: AppSettings) => {
  const response = await apiClient.post<{ success: boolean }>('/settings', settings);
  return response.data;
};

export const getYoutubeStatus = async (): Promise<YoutubeStatus> => {
  const response = await apiClient.get("/youtube/status");

  return {
    isConnected: response.data.youtube.connected,
    channelName: response.data.youtube.channelName,
    avatarUrl: response.data.youtube.avatarUrl,
  };
};

export const getYoutubeAuthUrl = async () => {
  const response = await apiClient.get<{ url: string }>('/youtube/auth-url');
  return response.data;
};

export const disconnectYoutube = async () => {
  const response = await apiClient.post<{ success: boolean }>('/youtube/disconnect');
  return response.data;
};
