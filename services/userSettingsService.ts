import { supabase } from './supabaseClient';
import type { UserSettings, GeminiModel } from '../types';
import { DEFAULT_GEMINI_MODEL } from '../constants';
import type { User } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'clearCueUserSettings';

// --- Local Storage Functions ---
const getLocalSettings = (): UserSettings => {
    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const settings = localData ? JSON.parse(localData) : {};
        return {
            geminiModel: settings.geminiModel || DEFAULT_GEMINI_MODEL,
        };
    } catch (error) {
        console.error("Failed to parse local user settings:", error);
        return { geminiModel: DEFAULT_GEMINI_MODEL };
    }
};

const saveLocalSettings = (settings: UserSettings) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save local user settings:", error);
    }
};

// --- Unified Service Functions ---
export const getUserSettings = async (user: User | null): Promise<UserSettings> => {
    if (user) {
        const { data, error } = await supabase
            .from('user_settings')
            .select('gemini_model')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
            console.error('Error fetching user settings from Supabase:', error);
            // Fallback to local settings in case of DB error
            return getLocalSettings();
        }
        
        return {
            geminiModel: data?.gemini_model || DEFAULT_GEMINI_MODEL,
        };

    } else {
        return getLocalSettings();
    }
};

export const updateUserSettings = async (user: User | null, settings: Partial<UserSettings>): Promise<void> => {
    if (user) {
        const { geminiModel } = settings;
        if (!geminiModel) return;

        const { error } = await supabase
            .from('user_settings')
            .upsert({ user_id: user.id, gemini_model: geminiModel }, { onConflict: 'user_id' });
        
        if (error) {
            console.error('Error updating user settings in Supabase:', error);
            throw error;
        }

    } else {
        const currentSettings = getLocalSettings();
        const newSettings = { ...currentSettings, ...settings };
        saveLocalSettings(newSettings);
    }
};
