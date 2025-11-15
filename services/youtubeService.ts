
import type { VideoData } from '../types';

export const fetchVideoMetadata = async (videoId: string, apiKey: string): Promise<Partial<VideoData> & { thumbnailUrl?: string }> => {
  if (!apiKey) {
    throw new Error('YouTube API key is not provided.');
  }
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch video data from YouTube API.');
    }
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      const thumbnails = snippet.thumbnails;
      // Prioritize highest resolution thumbnail
      const thumbnailUrl = thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

      return {
        title: snippet.title || '',
        description: snippet.description || '',
        tags: (snippet.tags || []).join(','),
        thumbnailUrl: thumbnailUrl,
      };
    } else {
      throw new Error('Video not found or access is restricted.');
    }
  } catch (error) {
    console.error('YouTube API fetch error:', error);
    throw error;
  }
};
