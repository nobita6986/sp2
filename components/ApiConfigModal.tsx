
import React, { useState } from 'react';
import type { ApiConfig, AIProvider } from '../types';
import { KeyIcon, XMarkIcon } from './icons/UtilityIcons';

interface ApiConfigModalProps {
  config: ApiConfig;
  onClose: () => void;
  onSave: (newConfig: ApiConfig) => void;
}

const MODELS: Record<AIProvider, string[]> = {
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
};

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ config, onClose, onSave }) => {
    const [currentConfig, setCurrentConfig] = useState<ApiConfig>(config);

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as AIProvider;
        setCurrentConfig(prev => ({
            ...prev,
            provider: newProvider,
            model: MODELS[newProvider][0], // Default to the first model of the new provider
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentConfig(prev => ({...prev, [name]: value}));
    }

    const handleSave = () => {
        onSave(currentConfig);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-surface border border-brand-border rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                <div className="flex items-center justify-between p-4 border-b border-brand-border">
                    <h2 className="text-lg font-semibold text-brand-text-primary flex items-center">
                        <KeyIcon className="w-5 h-5 mr-2 text-brand-secondary"/>
                        Cấu hình API
                    </h2>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="provider" className="block text-sm font-medium text-brand-text-secondary mb-2">Nhà cung cấp AI</label>
                            <select id="provider" name="provider" value={currentConfig.provider} onChange={handleProviderChange} className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary">
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="model" className="block text-sm font-medium text-brand-text-secondary mb-2">Model</label>
                            <select id="model" name="model" value={currentConfig.model} onChange={handleChange} className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary">
                                {MODELS[currentConfig.provider].map(modelName => (
                                    <option key={modelName} value={modelName}>{modelName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="geminiKey" className="block text-sm font-medium text-brand-text-secondary mb-2">Gemini API Key</label>
                        <input type="password" id="geminiKey" name="geminiKey" value={currentConfig.geminiKey} onChange={handleChange} placeholder="Nhập Gemini API Key" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary"/>
                    </div>
                    <div>
                        <label htmlFor="openAIKey" className="block text-sm font-medium text-brand-text-secondary mb-2">OpenAI API Key</label>
                        <input type="password" id="openAIKey" name="openAIKey" value={currentConfig.openAIKey} onChange={handleChange} placeholder="Nhập OpenAI API Key" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary"/>
                    </div>
                    <div>
                        <label htmlFor="youtubeKey" className="block text-sm font-medium text-brand-text-secondary mb-2">YouTube Data API Key</label>
                        <input type="password" id="youtubeKey" name="youtubeKey" value={currentConfig.youtubeKey} onChange={handleChange} placeholder="Nhập YouTube API Key để lấy metadata" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary"/>
                    </div>
                    <div>
                        <label htmlFor="youtubeTranscriptKey" className="block text-sm font-medium text-brand-text-secondary mb-2">YouTube Transcript API Key</label>
                        <input type="password" id="youtubeTranscriptKey" name="youtubeTranscriptKey" value={currentConfig.youtubeTranscriptKey} onChange={handleChange} placeholder="Nhập API Key từ youtube-transcript.io" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary"/>
                    </div>
                     <p className="text-xs text-brand-text-secondary">Nếu bạn đã đăng nhập, cấu hình sẽ được lưu vào tài khoản của bạn. Nếu không, nó sẽ được lưu trên trình duyệt này.</p>
                </div>

                <div className="flex justify-end p-4 bg-brand-bg rounded-b-lg border-t border-brand-border space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover rounded-md">Lưu cấu hình</button>
                </div>
            </div>
        </div>
    );
};

export default ApiConfigModal;