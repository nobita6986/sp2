import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, VideoData, ApiConfig, Session, SeoSuggestion } from './types';
import { analyzeVideoContent, getSeoSuggestions } from './services/geminiService';
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
import SuggestionsModal from './components/SuggestionsModal';
import { initialVideoData, placeholderVideoData } from './constants';
import { fileToDataUrl, dataUrlToPureBase64, downloadTextFile } from './utils/fileUtils';
import type { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  // Core App State
  const [videoData, setVideoData] = useState<VideoData>(initialVideoData);
  const [thumbnail, setThumbnail] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestion[] | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState<boolean>(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState<boolean>(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);

  // User and Data State
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      gemini: [],
      youtube: [],
      youtubeTranscript: [],
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
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
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
    
    const activeYoutubeKey = apiConfig.youtube.find(k => k.is_active)?.api_key;
    if (!activeYoutubeKey) {
        setError("Vui lòng kích hoạt một YouTube Data API Key trong phần Cấu hình API.");
        setIsApiModalOpen(true);
        return;
    }

    setIsFetchingMeta(true);
    setError(null);
    try {
        const metadata = await fetchVideoMetadata(videoId, activeYoutubeKey);
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
  }, [apiConfig.youtube, videoData.youtubeLink]);

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
    const activeTranscriptKey = apiConfig.youtubeTranscript.find(k => k.is_active)?.api_key || '6918b060522a1fa0d931dad6'; // Fallback to default
    
    setIsFetchingTranscript(true);
    setError(null);
    try {
      const transcriptText = await fetchTranscript(videoId, activeTranscriptKey);
      setVideoData(prev => ({ ...prev, transcript: transcriptText }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Lỗi lấy transcript: ${errorMessage}`);
    } finally {
      setIsFetchingTranscript(false);
    }
  }, [apiConfig.youtubeTranscript, videoData.youtubeLink]);


  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setThumbnail({ file, preview });
    }
  }, []);
  
  const handleSaveSession = useCallback(async (
    resultToSave: AnalysisResult, 
    thumbnailDataUrl: string | null
  ) => {
    if (!videoData.title) return;
    
    const newSessionData: Omit<Session, 'id' | 'user_id' | 'created_at'> = {
      videoTitle: videoData.title,
      videoData,
      analysisResult: resultToSave,
      thumbnailPreview: thumbnailDataUrl,
      seoSuggestions: null,
    };
    
    try {
        const savedSession = await sessionService.saveSession(newSessionData, user);
        setCurrentSession(savedSession);
        // Refresh the session list to include the new one
        const userSessions = await sessionService.getSessions(user);
        setSessions(userSessions);
    } catch (error) {
        console.error("Failed to save session:", error);
        setError("Không thể lưu phiên làm việc.");
    }
  }, [videoData, user]);


  const handleAnalyze = async () => {
    const activeGeminiKey = apiConfig.gemini.find(k => k.is_active)?.api_key;
    if (!activeGeminiKey) {
        setError("Vui lòng kích hoạt một Gemini API Key trong phần Cấu hình API.");
        setIsApiModalOpen(true);
        return;
    }
    
    setError(null);
    setAnalysisResult(null);
    setSeoSuggestions(null);
    setCurrentSession(null);
    setIsLoading(true);

    let thumbnailDataUrl: string | null = null;
    let pureBase64: string | null = null;
    
    try {
        if (thumbnail.file) {
            thumbnailDataUrl = await fileToDataUrl(thumbnail.file);
            pureBase64 = dataUrlToPureBase64(thumbnailDataUrl);
        } else if (thumbnail.preview && thumbnail.preview.startsWith('data:')) {
            // Already a data URL from a loaded session
            thumbnailDataUrl = thumbnail.preview;
            pureBase64 = dataUrlToPureBase64(thumbnailDataUrl);
        }
        
        const model = 'gemini-2.5-flash'; 
        const result = await analyzeVideoContent(videoData, pureBase64, activeGeminiKey, model);
        setAnalysisResult(result);
        await handleSaveSession(result, thumbnailDataUrl);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Phân tích thất bại: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
      if (!analysisResult) {
          setError("Phải có kết quả phân tích trước khi nhận gợi ý.");
          return;
      }
      
      const activeGeminiKey = apiConfig.gemini.find(k => k.is_active)?.api_key;
      if (!activeGeminiKey) {
          setError("Vui lòng kích hoạt một Gemini API Key trong phần Cấu hình API.");
          setIsApiModalOpen(true);
          return;
      }

      setIsSuggestionsLoading(true);
      setError(null);

      try {
          const model = 'gemini-2.5-flash';
          const suggestions = await getSeoSuggestions(videoData, analysisResult, activeGeminiKey, model);
          setSeoSuggestions(suggestions);

          if (currentSession) {
              await sessionService.updateSessionSuggestions(currentSession.id, suggestions, user);
              // Update state for both the main session list and the current session
              const updatedSession = { ...currentSession, seoSuggestions: suggestions };
              setCurrentSession(updatedSession);
              const updatedSessions = sessions.map(s => s.id === currentSession.id ? updatedSession : s);
              setSessions(updatedSessions);
          }

          setIsSuggestionsModalOpen(true);
      } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(`Lỗi khi nhận gợi ý: ${errorMessage}`);
      } finally {
          setIsSuggestionsLoading(false);
      }
  };

 const handleDownloadSuggestions = () => {
    if (!seoSuggestions) return;

    let content = `SEO Suggestions for "${videoData.title}"\n`;
    content += "========================================\n\n";

    seoSuggestions.forEach((suggestion, index) => {
        content += `---------- Gói gợi ý #${index + 1} ----------\n\n`;
        content += `Tiêu đề:\n${suggestion.title}\n\n`;
        content += `Mô tả:\n${suggestion.description}\n\n`;
        content += `Tags:\n${suggestion.tags}\n\n`;
        content += `Văn bản trên Thumbnail:\n${suggestion.thumbnail_text}\n\n`;
        content += `Prompt tạo Thumbnail:\n${suggestion.thumbnail_prompt}\n\n`;
        content += "========================================\n\n";
    });
    
    const filename = `seo-suggestions-${videoData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    downloadTextFile(content, filename);
};


  const handleLoadSession = (session: Session) => {
      setVideoData(session.videoData);
      setAnalysisResult(session.analysisResult);
      setThumbnail({ file: null, preview: session.thumbnailPreview });
      setSeoSuggestions(session.seoSuggestions || null);
      setCurrentSession(session);
      setError(null);
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
              seoSuggestions={seoSuggestions}
              isSuggestionsLoading={isSuggestionsLoading}
              onGetSuggestions={handleGetSuggestions}
              onShowSuggestions={() => setIsSuggestionsModalOpen(true)}
            />
          </div>
        </div>
        <div className="mt-8">
          <ResultsSection result={analysisResult} isLoading={isLoading} error={error} />
        </div>
      </main>

      {isApiModalOpen && (
          <ApiConfigModal 
            initialConfig={apiConfig}
            user={user}
            onClose={() => setIsApiModalOpen(false)}
            onConfigChange={(newConfig) => {
                setApiConfig(newConfig);
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
      {isSuggestionsModalOpen && seoSuggestions && (
          <SuggestionsModal
              isOpen={isSuggestionsModalOpen}
              onClose={() => setIsSuggestionsModalOpen(false)}
              suggestions={seoSuggestions}
              onDownload={handleDownloadSuggestions}
          />
      )}
    </div>
  );
};

export default App;