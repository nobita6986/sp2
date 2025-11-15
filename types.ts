import type { User } from '@supabase/supabase-js';

// --- NEW API KEY MANAGEMENT SCHEMA ---
export type ApiKeyService = 'gemini' | 'youtube' | 'youtubeTranscript';
export type ApiKeyStatus = 'unchecked' | 'valid' | 'invalid';

export interface ApiKeyEntry {
    id: string;
    user_id?: string;
    service: ApiKeyService;
    api_key: string;
    is_active: boolean;
    status: ApiKeyStatus;
    created_at: string;
}

// The new ApiConfig structure holds arrays of keys for each service
export interface ApiConfig {
    gemini: ApiKeyEntry[];
    youtube: ApiKeyEntry[];
    youtubeTranscript: ApiKeyEntry[];
}
// --- END NEW API KEY MANAGEMENT SCHEMA ---


export interface VideoData {
  title: string;
  description: string;
  tags: string;
  transcript: string;
  youtubeLink: string;
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