import type { User } from '@supabase/supabase-js';

export type AIProvider = 'gemini' | 'openai';

export interface ApiConfig {
    provider: AIProvider;
    model: string;
    geminiKey: string;
    openAIKey: string;
    youtubeKey: string;
    youtubeTranscriptKey: string;
}

export interface VideoData {
  title: string;
  description: string;
  tags: string;
  transcript: string;
  youtubeLink: string;
}

// Giữ lại interface cũ để tương thích, nhưng ApiConfig mới sẽ được ưu tiên sử dụng
export interface ApiKeys {
  gemini: string;
  youtube: string;
}

// Fix: Add Issue interface for RecommendationCard.tsx
// This type seems to be from a deprecated data structure but is still referenced.
export interface Issue {
  ruleId: string;
  severity: string;
  evidence: string;
  fix: string;
}

// --- NEW V2 SCORING SCHEMA ---
export interface Score {
  value: number;
  max: number;
  min?: number;
}

export interface CategoryScore extends Score {
  percent_of_category: number;
}

export interface Subcriterion {
  id: string;
  label: string;
  score: Score;
  explanation: string;
  suggestions: string[];
}

export interface Category {
  id: string;
  label: string;
  score: CategoryScore;
  summary: string;
  subcriteria: Subcriterion[];
}

export interface TotalScore {
  value: number;
  max: number;
  percent: number;
  grade: string;
  summary: string;
}

export interface Recommendations {
  priority_order: string[];
  quick_wins: string[];
  by_category?: Record<string, string[]>;
}

export interface AnalysisResult {
  total_score: TotalScore;
  categories: Category[];
  recommendations: Recommendations;
}

export interface SeoSuggestion {
  title: string;
  description: string;
  tags: string;
  thumbnail_text: string;
  thumbnail_prompt: string;
}

export interface Session {
    id: string;
    user_id?: string;
    created_at: string;
    videoTitle: string;
    videoData: VideoData;
    analysisResult: AnalysisResult;
    thumbnailPreview: string | null;
    seoSuggestions?: SeoSuggestion[] | null;
}