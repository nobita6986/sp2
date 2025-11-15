
export const fetchTranscript = async (videoId: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error('YouTube Transcript API key is not provided.');
    }
    const API_URL = 'https://www.youtube-transcript.io/api/transcripts'; 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: [videoId] }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0 && data[0].transcript) {
            // Assuming the API returns an array of results for the given IDs
            return data[0].transcript;
        } else if (data.transcript) {
            // Fallback for a single object response
             return data.transcript;
        } else {
            throw new Error('Transcript not found in API response or video has no transcript.');
        }
    } catch (error) {
        console.error('youtube-transcript.io API fetch error:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch transcript: ${error.message}`);
        }
        throw new Error('An unknown error occurred while fetching the transcript.');
    }
};
