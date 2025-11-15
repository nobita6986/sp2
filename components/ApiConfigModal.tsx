import React, { useState, useEffect } from 'react';
import type { ApiConfig, ApiKeyEntry, ApiKeyService, ApiKeyStatus, GeminiModel } from '../types';
import { KeyIcon, XMarkIcon, TrashIcon, GeminiIcon } from './icons/UtilityIcons';
import { YoutubeIcon } from './icons/YoutubeIcon';
import * as apiValidationService from '../services/apiValidationService';
import * as apiConfigService from '../services/apiConfigService';
import { SERVICE_NAMES, AVAILABLE_GEMINI_MODELS } from '../constants';
import type { User } from '@supabase/supabase-js';

interface ApiConfigModalProps {
  initialConfig: ApiConfig;
  user: User | null;
  geminiModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  onClose: () => void;
  onConfigChange: (newConfig: ApiConfig) => void;
}

const KeyStatusBadge: React.FC<{ status: ApiKeyStatus }> = ({ status }) => {
    const styles: Record<ApiKeyStatus, string> = {
        unchecked: 'bg-gray-500 text-white',
        valid: 'bg-brand-success text-white',
        invalid: 'bg-brand-danger text-white',
    };
    const text: Record<ApiKeyStatus, string> = {
        unchecked: 'Chưa kiểm tra',
        valid: 'Hợp lệ',
        invalid: 'Không hợp lệ',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};


const ApiKeyRow: React.FC<{
    apiKey: ApiKeyEntry;
    onDelete: (id: string) => void;
    onTest: (id: string, service: ApiKeyService, key: string) => void;
    onSetActive: (id: string, service: ApiKeyService) => void;
    isTesting: boolean;
}> = ({ apiKey, onDelete, onTest, onSetActive, isTesting }) => {
    return (
        <div className="flex items-center justify-between p-2 bg-brand-bg rounded-md">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <KeyStatusBadge status={apiKey.status} />
                <p className="text-sm text-brand-text-secondary font-mono truncate">
                    {`...${apiKey.api_key.slice(-6)}`}
                </p>
            </div>
            <div className="flex items-center space-x-2">
                {apiKey.is_active ? (
                    <span className="px-2 py-1 text-xs font-bold text-green-200 bg-green-800/50 rounded-md">Đang hoạt động</span>
                ) : (
                    <button onClick={() => onSetActive(apiKey.id, apiKey.service)} className="px-2 py-1 text-xs text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md">Kích hoạt</button>
                )}
                 <button onClick={() => onTest(apiKey.id, apiKey.service, apiKey.api_key)} disabled={isTesting} className="px-2 py-1 text-xs text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md min-w-[70px]">
                    {isTesting ? 'Đang...' : 'Kiểm tra'}
                </button>
                <button onClick={() => onDelete(apiKey.id)} className="p-1.5 text-brand-text-secondary hover:text-brand-danger hover:bg-red-900/20 rounded-md">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const serviceIcons: Record<ApiKeyService, React.FC<React.SVGProps<SVGSVGElement>>> = {
    gemini: (props) => <GeminiIcon {...props} className="w-5 h-5 text-gray-400" />,
    youtube: (props) => <YoutubeIcon {...props} className="w-6 h-6 text-red-500" />,
    youtubeTranscript: (props) => <YoutubeIcon {...props} className="w-6 h-6 text-red-500" />,
};


const ApiServiceSection: React.FC<{
    service: ApiKeyService;
    keys: ApiKeyEntry[];
    geminiModel?: GeminiModel;
    onModelChange?: (model: GeminiModel) => void;
    onKeyAdded: (service: ApiKeyService, key: string) => void;
    onKeyDeleted: (id: string) => void;
    onKeyTested: (id: string, service: ApiKeyService, key: string) => void;
    onKeySetActive: (id: string, service: ApiKeyService) => void;
    testingKeyState: Record<string, boolean>;
}> = ({ service, keys, geminiModel, onModelChange, onKeyAdded, onKeyDeleted, onKeyTested, onKeySetActive, testingKeyState }) => {
    const [newKey, setNewKey] = useState('');
    const ServiceIcon = serviceIcons[service];

    const handleAdd = () => {
        if (newKey.trim()) {
            onKeyAdded(service, newKey.trim());
            setNewKey('');
        }
    };

    return (
        <div>
            <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-md font-semibold text-brand-text-primary">{SERVICE_NAMES[service]}</h3>
                {ServiceIcon && <ServiceIcon />}
            </div>

            {service === 'gemini' && onModelChange && (
                 <div className="mb-4">
                    <label htmlFor="gemini-model-select" className="text-sm text-brand-text-secondary mb-1 block">
                        Model AI (Mô hình)
                    </label>
                    <select
                        id="gemini-model-select"
                        value={geminiModel}
                        onChange={(e) => onModelChange(e.target.value as GeminiModel)}
                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary"
                    >
                        {AVAILABLE_GEMINI_MODELS.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                 </div>
            )}

            <div className="space-y-2 mb-3">
                {keys.length > 0 ? (
                    keys.map(key => <ApiKeyRow 
                        key={key.id} 
                        apiKey={key} 
                        onDelete={onKeyDeleted}
                        onTest={onKeyTested}
                        onSetActive={onKeySetActive}
                        isTesting={testingKeyState[key.id] || false}
                    />)
                ) : (
                    <p className="text-sm text-brand-text-secondary text-center py-2">Chưa có API key nào.</p>
                )}
            </div>
            <div className="flex space-x-2">
                <input
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder={`Thêm API Key mới cho ${SERVICE_NAMES[service]}`}
                    className="flex-grow bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary"
                />
                <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover rounded-md">Thêm</button>
            </div>
        </div>
    );
};


const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ initialConfig, user, geminiModel, onModelChange, onClose, onConfigChange }) => {
    const [config, setConfig] = useState<ApiConfig>(initialConfig);
    const [testingKeyState, setTestingKeyState] = useState<Record<string, boolean>>({}); // { [keyId]: isLoading }

    useEffect(() => {
        onConfigChange(config);
    }, [config, onConfigChange]);
    
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);


    const handleAddKey = async (service: ApiKeyService, apiKey: string) => {
        const newKeyEntry = await apiConfigService.addApiKey(user, { service, api_key: apiKey });
        setConfig(prev => ({
            ...prev,
            [service]: [...prev[service], newKeyEntry]
        }));
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa API key này?')) return;
        await apiConfigService.deleteApiKey(user, keyId);
        const newConfig = { ...config };
        Object.keys(newConfig).forEach(service => {
            newConfig[service as ApiKeyService] = newConfig[service as ApiKeyService].filter(key => key.id !== keyId);
        });
        setConfig(newConfig);
    };

    const handleTestKey = async (keyId: string, service: ApiKeyService, apiKey: string) => {
        setTestingKeyState(prev => ({...prev, [keyId]: true}));
        let isValid = false;
        try {
            if (service === 'gemini') isValid = await apiValidationService.validateGeminiKey(apiKey);
            else if (service === 'youtube') isValid = await apiValidationService.validateYoutubeKey(apiKey);
            else if (service === 'youtubeTranscript') isValid = await apiValidationService.validateYoutubeTranscriptKey(apiKey);
            
            const newStatus: ApiKeyStatus = isValid ? 'valid' : 'invalid';
            await apiConfigService.updateApiKeyStatus(user, keyId, newStatus);
            setConfig(prev => {
                const newConf = {...prev};
                const key = newConf[service].find(k => k.id === keyId);
                if (key) key.status = newStatus;
                return newConf;
            });

        } finally {
             setTestingKeyState(prev => ({...prev, [keyId]: false}));
        }
    };
    
    const handleSetActiveKey = async (keyId: string, service: ApiKeyService) => {
        const originalConfig = config;
        // Optimistic UI update for instant feedback
        const optimisticConfig = {
            ...config,
            [service]: config[service].map(key => ({
                ...key,
                is_active: key.id === keyId,
                 // Also reflect the status update optimistically
                status: key.id === keyId ? 'valid' as ApiKeyStatus : key.status,
            })),
        };
        setConfig(optimisticConfig);

        try {
            // Actual API call
            await apiConfigService.setActiveApiKey(user, keyId, service);
        } catch (error) {
            console.error("Failed to activate API key:", error);
            alert("Không thể kích hoạt API key. Điều này có thể do lỗi cấu hình cơ sở dữ liệu. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.");
            // Revert to the original state on failure
            setConfig(originalConfig);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-surface border border-brand-border rounded-lg shadow-xl w-full max-w-3xl transform transition-all">
                <div className="flex items-center justify-between p-4 border-b border-brand-border">
                    <h2 className="text-lg font-semibold text-brand-text-primary flex items-center">
                        <KeyIcon className="w-5 h-5 mr-2 text-brand-secondary"/>
                        Quản lý API Keys
                    </h2>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                   {(Object.keys(SERVICE_NAMES) as ApiKeyService[]).map(service => (
                       <ApiServiceSection 
                        key={service}
                        service={service}
                        keys={config[service]}
                        geminiModel={geminiModel}
                        onModelChange={onModelChange}
                        onKeyAdded={handleAddKey}
                        onKeyDeleted={handleDeleteKey}
                        onKeyTested={handleTestKey}
                        onKeySetActive={handleSetActiveKey}
                        testingKeyState={testingKeyState}
                       />
                   ))}
                </div>

                <div className="flex justify-end p-4 bg-brand-bg rounded-b-lg border-t border-brand-border">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md">Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ApiConfigModal;