
import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, VideoData, ApiConfig, Session } from './types';
import { analyzeVideoContent } from './services/geminiService';
import { fetchVideoMetadata } from './services/youtubeService';
import { fetchTranscript } from './services/transcriptService';
import { extractVideoId } from './utils/youtubeUtils';
import { supabase } from './services/supabaseClient';
import * as sessionService from './services/sessionService';
import * as apiConfigService from './services/apiConfigService';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ThumbnailSection from './components/ThumbnailSection';
import ResultsSection from './components/ResultsSection';
import ApiConfigModal from './components/ApiConfigModal';
import LibraryModal from './components/LibraryModal';
import { initialVideoData, placeholderVideoData } from './constants';
import { fileToBase64 } from './utils/fileUtils';
import type { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  // Core App State
  const [videoData, setVideoData] = useState<VideoData>(initialVideoData);
  const [thumbnail, setThumbnail] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState<boolean>(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);

  // User and Data State
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      geminiKey: '',
      openAIKey: '',
      youtubeKey: '',
      youtubeTranscriptKey: '6918b060522a1fa0d931dad6',
  });

  // Supabase Auth Effect
  useEffect(() => {
    const loadDataForUser = async (currentUser: User | null) => {
        const [userSessions, config] = await Promise.all([
            sessionService.getSessions(currentUser),
            apiConfigService.getApiConfig(currentUser)
        ]);
        setSessions(userSessions);
        setApiConfig(config);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadDataForUser(currentUser); // Load sessions and config on auth change
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        loadDataForUser(currentUser); // Load initial sessions and config
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleFetchMetadata = useCallback(async () => {
    const url = videoData.youtubeLink;
    if (!url) {
        setError("Vui lòng nhập một link YouTube.");
        return;
    }
    const videoId = extractVideoId(url);

    if (!videoId) {
      setError("Link YouTube không hợp lệ.");
      return;
    }
    
    if (!apiConfig.youtubeKey) {
        setError("Vui lòng nhập YouTube Data API Key trong phần Cấu hình API.");
        setIsApiModalOpen(true);
        return;
    }

    setIsFetchingMeta(true);
    setError(null);
    try {
        const metadata = await fetchVideoMetadata(videoId, apiConfig.youtubeKey);
        const { thumbnailUrl, ...videoMeta } = metadata;

        setVideoData(prev => ({
            ...prev,
            ...videoMeta,
            youtubeLink: url
        }));

        if (thumbnailUrl) {
          const imageResponse = await fetch(thumbnailUrl);
          if (!imageResponse.ok) {
            throw new Error('Không thể tải thumbnail.');
          }
          const imageBlob = await imageResponse.blob();
          const thumbnailFile = new File([imageBlob], 'thumbnail.jpg', { type: imageBlob.type });
          const preview = URL.createObjectURL(thumbnailFile);
          setThumbnail({ file: thumbnailFile, preview: preview });
        }

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Lỗi lấy metadata: ${errorMessage}`);
    } finally {
        setIsFetchingMeta(false);
    }
  }, [apiConfig.youtubeKey, videoData.youtubeLink]);

  const handleFetchTranscript = useCallback(async () => {
    const url = videoData.youtubeLink;
    if (!url) {
      setError("Vui lòng nhập một link YouTube trước.");
      return;
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Link YouTube không hợp lệ.");
      return;
    }
    if (!apiConfig.youtubeTranscriptKey) {
      setError("Vui lòng nhập YouTube Transcript API Key trong Cấu hình API.");
      setIsApiModalOpen(true);
      return;
    }

    setIsFetchingTranscript(true);
    setError(null);
    try {
      const transcriptText = await fetchTranscript(videoId, apiConfig.youtubeTranscriptKey);
      setVideoData(prev => ({ ...prev, transcript: transcriptText }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Lỗi lấy transcript: ${errorMessage}`);
    } finally {
      setIsFetchingTranscript(false);
    }
  }, [apiConfig.youtubeTranscriptKey, videoData.youtubeLink]);


  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setThumbnail({ file, preview });
    }
  }, []);
  
  const handleSaveSession = useCallback(async (resultToSave: AnalysisResult) => {
    if (!videoData.title) return; // Don't save if there's no title
    
    const newSession: Omit<Session, 'id' | 'user_id' | 'created_at'> = {
      videoTitle: videoData.title,
      videoData,
      analysisResult: resultToSave,
      thumbnailPreview: null, // Thumbnail saving is disabled to prevent potential rendering bugs.
    };
    
    try {
        await sessionService.saveSession(newSession, user);
        const userSessions = await sessionService.getSessions(user);
        setSessions(userSessions);
    } catch (error) {
        console.error("Failed to save session:", error);
    }
  }, [videoData, user]);


  const handleAnalyze = async () => {
    if (!apiConfig.geminiKey) {
        setError("Vui lòng nhập Gemini API Key trong phần Cấu hình API.");
        setIsApiModalOpen(true);
        return;
    }
    
    setError(null);
    setAnalysisResult(null);
    setIsLoading(true);

    let pureBase64: string | null = null;
    if (thumbnail.file) {
      try {
        pureBase64 = await fileToBase64(thumbnail.file);
      } catch (err) {
        setError('Lỗi xử lý ảnh thumbnail.');
        setIsLoading(false);
        return;
      }
    }
    
    try {
        const result = await analyzeVideoContent(videoData, pureBase64, apiConfig);
        setAnalysisResult(result);
        await handleSaveSession(result);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Phân tích thất bại: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLoadSession = (session: Session) => {
      setVideoData(session.videoData);
      setAnalysisResult(session.analysisResult);
      setThumbnail({ file: null, preview: session.thumbnailPreview });
      setIsLibraryModalOpen(false);
  }

  const handleDeleteSession = async (sessionId: string) => {
      await sessionService.deleteSession(sessionId, user);
      const userSessions = await sessionService.getSessions(user);
      setSessions(userSessions);
  }


  return (
    <div className="bg-brand-bg min-h-screen text-brand-text-primary font-sans">
      <Header 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShowApiModal={() => setIsApiModalOpen(true)}
        onShowLibraryModal={() => setIsLibraryModalOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <InputSection 
              videoData={videoData} 
              placeholders={placeholderVideoData} 
              onInputChange={handleInputChange} 
              onFetchMetadata={handleFetchMetadata}
              onFetchTranscript={handleFetchTranscript}
              isFetchingMeta={isFetchingMeta}
              isFetchingTranscript={isFetchingTranscript}
            />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <ThumbnailSection
              thumbnailPreview={thumbnail.preview}
              analysisResult={analysisResult}
              onThumbnailChange={handleThumbnailChange}
              onAnalyze={handleAnalyze}
              isLoading={isLoading || isFetchingMeta}
            />
          </div>
        </div>
        <div className="mt-8">
          <ResultsSection result={analysisResult} isLoading={isLoading} error={error} />
        </div>
      </main>

      {isApiModalOpen && (
          <ApiConfigModal 
            config={apiConfig}
            onClose={() => setIsApiModalOpen(false)}
            onSave={async (newConfig) => {
                try {
                    await apiConfigService.saveApiConfig(newConfig, user);
                    setApiConfig(newConfig);
                    setIsApiModalOpen(false);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                    setError(`Không thể lưu cấu hình API: ${errorMessage}`);
                }
            }}
          />
      )}
      {isLibraryModalOpen && (
          <LibraryModal
            sessions={sessions}
            isOpen={isLibraryModalOpen}
            onClose={() => setIsLibraryModalOpen(false)}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
          />
      )}
    </div>
  );
};

export default App;
