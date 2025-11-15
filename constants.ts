import type { VideoData, ApiKeyService, GeminiModel } from './types';

export const initialVideoData: VideoData = {
  title: "",
  description: "",
  tags: "",
  transcript: "",
  youtubeLink: "",
};

export const placeholderVideoData: VideoData = {
  title: "Mauna Loa Awakens: The Island's Breath Holding Moment",
  description: "Subscribe for more powerful stories of human resilience and the planet's wonders, and share your thoughts on Mauna Loa's incredible awakening in the comments below!\n\n#MaunaLoa #VolcanoAwakens #Hawaii #EarthPower #Resilience",
  tags: "Mauna Loa Eruption,Hawaii Volcano,Volcano Documentary,Lava Flow",
  transcript: "00:00:15,900 --> 00:00:18,066\nDON'T LOOK BACK OR YOU'LL PASS THROUGH THE BLIND\n\n00:00:18,066 --> 00:00:20,966\nTHE SOUND OF WATER",
  youtubeLink: "https://www.youtube.com/watch?v=FAU4s3wDsoI",
};

export const SERVICE_NAMES: Record<ApiKeyService, string> = {
    gemini: 'Google Gemini API',
    youtube: 'YouTube Data API',
    youtubeTranscript: 'YouTube Transcript API'
};

export const AVAILABLE_GEMINI_MODELS: { id: GeminiModel; name: string }[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Nhanh, Hiệu quả)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Mạnh mẽ, Sáng tạo)' },
];

export const DEFAULT_GEMINI_MODEL: GeminiModel = 'gemini-2.5-flash';
