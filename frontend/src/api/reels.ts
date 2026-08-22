import apiClient from './client';

export interface ReelGenerationParams {
  topic: string;
  scriptText?: string;
  voice: string;
  provider: string;
  uploadToYoutube: boolean;
}

export interface ReelMetadata {
  title: string;
  description: string;
  tags: string[];
}

export interface Reel {
  id: string;
  topic: string;
  script: string;
  voice: string;
  duration: number;
  provider: string;
  createdAt: string;
  videoPath: string;
  youtubeUploadStatus: 'idle' | 'pending' | 'success' | 'failed';
  youtubeVideoId?: string;
  metadata?: ReelMetadata;
}

export const getRandomTopic = async () => {
  const response = await apiClient.get<{ category: string; topic: string }>('/api/topics/random');
  return response.data;
};

export const generateReel = async (params: ReelGenerationParams) => {
  const response = await apiClient.post<{
    success: boolean;
    jobId: string;
    message: string;
  }>("/api/reels/generate", params);
  return response.data;
};

export const getReels = async () => {
  const response = await apiClient.get<{
    success: boolean;
    reels: Reel[];
  }>('/api/reels');

  return response.data.reels;
};

export const getLatestReel = async () => {
  const response = await apiClient.get<{
    success: boolean;
    reel: Reel | null;
  }>('/api/reels/latest');

  return response.data.reel;
};

export const deleteReel = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean }>(`/api/reels/${id}`);
  return response.data;
};

export const uploadReelToYouTube = async (id: string) => {
  const response = await apiClient.post<{
    success: boolean;
    reelId: string;
    videoId: string;
    url: string;
  }>(`/api/reels/${id}/upload`);

  return response.data;
};