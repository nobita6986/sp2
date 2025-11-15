import { supabase } from './supabaseClient';
import type { ApiConfig, ApiKeyEntry, ApiKeyService, ApiKeyStatus } from '../types';
import type { User } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'clearCueApiKeys';

const DEFAULT_CONFIG: ApiConfig = {
    gemini: [],
    youtube: [],
    youtubeTranscript: [],
};

const groupKeysByService = (keys: ApiKeyEntry[]): ApiConfig => {
    const config: ApiConfig = { ...DEFAULT_CONFIG };
    keys.forEach(key => {
        if (config[key.service]) {
            config[key.service].push(key);
        }
    });
    return config;
};

const flattenConfig = (config: ApiConfig): ApiKeyEntry[] => {
    return [...config.gemini, ...config.youtube, ...config.youtubeTranscript];
};

// --- Local Storage Functions ---
const getLocalConfig = (): ApiConfig => {
    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
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
            .from('api_keys')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.error('Error fetching API keys from Supabase:', error);
            return DEFAULT_CONFIG;
        }
        return groupKeysByService(data as ApiKeyEntry[]);
    } else {
        return getLocalConfig();
    }
};

export const addApiKey = async (user: User | null, newKey: { service: ApiKeyService; api_key: string }): Promise<ApiKeyEntry> => {
    if (user) {
        const { data, error } = await supabase
            .from('api_keys')
            .insert({ ...newKey, user_id: user.id })
            .select()
            .single();
        
        if (error) {
            console.error('Error adding API key to Supabase:', error);
            throw error;
        }
        return data as ApiKeyEntry;
    } else {
        const config = getLocalConfig();
        const keyEntry: ApiKeyEntry = {
            id: crypto.randomUUID(),
            ...newKey,
            is_active: false,
            status: 'unchecked',
            created_at: new Date().toISOString(),
        };
        config[newKey.service].push(keyEntry);
        saveLocalConfig(config);
        return keyEntry;
    }
};

export const deleteApiKey = async (user: User | null, keyId: string): Promise<void> => {
     if (user) {
        const { error } = await supabase.from('api_keys').delete().match({ id: keyId, user_id: user.id });
        if (error) {
            console.error('Error deleting API key from Supabase:', error);
            throw error;
        }
    } else {
        let config = getLocalConfig();
        Object.keys(config).forEach(service => {
            config[service as ApiKeyService] = config[service as ApiKeyService].filter(key => key.id !== keyId);
        });
        saveLocalConfig(config);
    }
}

export const updateApiKeyStatus = async (user: User | null, keyId: string, status: ApiKeyStatus): Promise<void> => {
     if (user) {
        const { error } = await supabase
            .from('api_keys')
            .update({ status })
            .match({ id: keyId, user_id: user.id });
         if (error) {
            console.error('Error updating key status in Supabase:', error);
            throw error;
        }
    } else {
        let config = getLocalConfig();
         Object.keys(config).forEach(service => {
            const key = config[service as ApiKeyService].find(k => k.id === keyId);
            if (key) {
                key.status = status;
            }
        });
        saveLocalConfig(config);
    }
};

export const setActiveApiKey = async (user: User | null, keyId: string, service: ApiKeyService): Promise<void> => {
    if (user) {
        // Step 1: Deactivate all other keys for this service
        const { error: deactivateError } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .match({ user_id: user.id, service: service });

        if (deactivateError) {
            console.error('Error deactivating old keys:', deactivateError);
            throw deactivateError;
        }

        // Step 2: Activate the selected key
        const { error: activateError } = await supabase
            .from('api_keys')
            .update({ is_active: true })
            .match({ user_id: user.id, id: keyId });
        
        if (activateError) {
            console.error('Error activating new key:', activateError);
            throw activateError;
        }
    } else {
        let config = getLocalConfig();
        // Deactivate all for the service
        config[service].forEach(key => key.is_active = false);
        // Activate the selected one
        const keyToActivate = config[service].find(key => key.id === keyId);
        if (keyToActivate) {
            keyToActivate.is_active = true;
        }
        saveLocalConfig(config);
    }
};