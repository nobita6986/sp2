
import { supabase } from './supabaseClient';
import type { ApiConfig } from '../types';
import type { User } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'clearCueApiConfig';
const DEFAULT_CONFIG: ApiConfig = {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    geminiKey: '',
    openAIKey: '',
    youtubeKey: '',
    youtubeTranscriptKey: '6918b060522a1fa0d931dad6', // Default key for convenience
};

// --- Local Storage Functions ---
const getLocalConfig = (): ApiConfig => {
    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            // Merge with default to ensure all keys are present
            return { ...DEFAULT_CONFIG, ...JSON.parse(localData) };
        }
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error("Failed to parse local API config:", error);
        return DEFAULT_CONFIG;
    }
};

const saveLocalConfig = (config: ApiConfig) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
        console.error("Failed to save local API config:", error);
    }
};

// --- Unified Service Functions ---
export const getApiConfig = async (user: User | null): Promise<ApiConfig> => {
    if (user) {
        const { data, error } = await supabase
            .from('user_api_configs')
            .select('provider, model, gemini_key, openai_key, youtube_key, youtube_transcript_key')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, which is not an error here
            console.error('Error fetching Supabase API config:', error);
            return DEFAULT_CONFIG; // Fallback
        }
        
        if (data) {
             // Map DB column names to camelCase keys
            return {
                provider: data.provider || 'gemini',
                model: data.model || 'gemini-2.5-flash',
                geminiKey: data.gemini_key || '',
                openAIKey: data.openai_key || '',
                youtubeKey: data.youtube_key || '',
                youtubeTranscriptKey: data.youtube_transcript_key || '',
            };
        }
        return DEFAULT_CONFIG;
    } else {
        return getLocalConfig();
    }
};

export const saveApiConfig = async (config: ApiConfig, user: User | null): Promise<void> => {
    if (user) {
        const { error } = await supabase.from('user_api_configs').upsert({
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            gemini_key: config.geminiKey,
            openai_key: config.openAIKey,
            youtube_key: config.youtubeKey,
            youtube_transcript_key: config.youtubeTranscriptKey,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Error saving API config to Supabase:', error);
            throw new Error(error.message);
        }
    } else {
        saveLocalConfig(config);
    }
};