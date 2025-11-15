import { GoogleGenAI } from '@google/genai';

export const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // A lightweight, non-generative call to check authentication
        await ai.models.list(); 
        return true;
    } catch (error) {
        console.error("Gemini key validation failed:", error);
        return false;
    }
};

export const validateYoutubeKey = async (apiKey: string): Promise<boolean> => {
     if (!apiKey) return false;
    try {
        // A simple, low-cost search query effective for validation
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=google&key=${apiKey}&maxResults=1`;
        const response = await fetch(url);
        const data = await response.json();
        // A 400 error means the key is invalid, other errors could be network etc.
        if (response.status === 400 && data?.error?.message) {
            return false;
        }
        return response.ok;
    } catch (error) {
        console.error("YouTube key validation failed:", error);
        return false;
    }
};

// The youtube-transcript.io service does not have a simple validation endpoint.
// Validation for this service is omitted; it will either work or fail during use.
export const validateYoutubeTranscriptKey = async (apiKey: string): Promise<boolean> => {
    // For now, we'll optimistically return true.
    return !!apiKey;
};