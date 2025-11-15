import { supabase } from './supabaseClient';
import type { Session, SeoSuggestion } from '../types';
import type { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // Simple UUID generation

const LOCAL_STORAGE_KEY = 'clearCueSessions';

// --- Local Storage Functions ---

const getLocalSessions = (): Session[] => {
    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        console.error("Failed to parse local sessions:", error);
        return [];
    }
};

const saveLocalSessions = (sessions: Session[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error("Failed to save local sessions:", error);
    }
};


// --- Unified Service Functions ---

export const getSessions = async (user: User | null): Promise<Session[]> => {
    if (user) {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching Supabase sessions:', error);
            return [];
        }
        return data as Session[];
    } else {
        return getLocalSessions();
    }
};

export const saveSession = async (
    sessionData: Omit<Session, 'id' | 'user_id' | 'created_at'>, 
    user: User | null
): Promise<Session> => {
    if (user) {
        const { data, error } = await supabase
            .from('sessions')
            .insert({ ...sessionData, user_id: user.id })
            .select()
            .single();

        if (error) {
            console.error('Error saving session to Supabase:', error);
            throw error;
        }
        return data as Session;
    } else {
        const sessions = getLocalSessions();
        const newSession: Session = {
            ...sessionData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        sessions.unshift(newSession); // Add to the beginning
        saveLocalSessions(sessions.slice(0, 10)); // Keep only the latest 10
        return newSession;
    }
};

export const updateSessionSuggestions = async (
    sessionId: string,
    suggestions: SeoSuggestion[],
    user: User | null
): Promise<void> => {
    if (user) {
        const { error } = await supabase
            .from('sessions')
            .update({ seo_suggestions: suggestions })
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating session suggestions in Supabase:', error);
            throw error;
        }
    } else {
        const sessions = getLocalSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex > -1) {
            sessions[sessionIndex].seoSuggestions = suggestions;
            saveLocalSessions(sessions);
        }
    }
};

export const deleteSession = async (sessionId: string, user: User | null): Promise<void> => {
    if (user) {
        const { error } = await supabase.from('sessions').delete().match({ id: sessionId, user_id: user.id });
        if (error) {
            console.error('Error deleting Supabase session:', error);
        }
    } else {
        let sessions = getLocalSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        saveLocalSessions(sessions);
    }
};