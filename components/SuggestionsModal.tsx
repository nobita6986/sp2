import React, { useState } from 'react';
import type { SeoSuggestion } from '../types';
import { XMarkIcon, LightBulbIcon, ClipboardIcon, CameraIcon, PencilIcon, CheckIcon } from './icons/UtilityIcons';
import LoadingSpinner from './LoadingSpinner';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SeoSuggestion[];
  onDownload: () => void;
  onEditImage: (prompt: string) => Promise<string>;
}

const CopyButton: React.FC<{ textToCopy: string; className?: string }> = ({ textToCopy, className = '' }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={handleCopy} title="Copy to clipboard" className={`p-1.5 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg rounded-md transition-colors ${className}`}>
            {copied ? <span className="text-xs">Đã sao chép!</span> : <ClipboardIcon className="w-4 h-4" />}
        </button>
    )
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, onDownload, onEditImage }) => {
  if (!isOpen) return null;

  const [imageStates, setImageStates] = useState<Record<number, { loading: boolean; url: string | null; error: string | null }>>({});
  const [editedPrompts, setEditedPrompts] = useState<Record<number, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentEditText, setCurrentEditText] = useState('');


  const handleGenerateImage = async (index: number, prompt: string) => {
    setImageStates(prev => ({ ...prev, [index]: { loading: true, url: null, error: null } }));
    try {
        const newImageUrl = await onEditImage(prompt);
        setImageStates(prev => ({ ...prev, [index]: { loading: false, url: newImageUrl, error: null } }));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setImageStates(prev => ({ ...prev, [index]: { loading: false, url: null, error: message } }));
    }
  };
  
  const handleStartEdit = (index: number, currentPrompt: string) => {
    setEditingIndex(index);
    setCurrentEditText(currentPrompt);
  };
  
  const handleSaveEdit = (index: number) => {
    setEditedPrompts(prev => ({ ...prev, [index]: currentEditText }));
    setEditingIndex(null);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface border border-brand-border rounded-lg shadow-xl w-full max-w-4xl transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <h2 className="text-lg font-semibold text-brand-text-primary flex items-center">
            <LightBulbIcon className="w-5 h-5 mr-2 text-brand-secondary" />
            Gói gợi ý SEO từ AI
          </h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
             const imageState = imageStates[index];
             const isEditing = editingIndex === index;
             const currentPrompt = editedPrompts[index] || suggestion.thumbnail_prompt;
             return (
            <div key={index} className="bg-brand-bg border border-brand-border rounded-lg p-4 space-y-3">
              <h3 className="text-md font-bold text-brand-secondary">Gói gợi ý #{index + 1}</h3>
              
              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">TIÊU ĐỀ</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 pr-10">{suggestion.title}</p>
                <CopyButton textToCopy={suggestion.title} className="absolute top-2 right-2" />
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">MÔ TẢ</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 whitespace-pre-wrap pr-10">{suggestion.description}</p>
                 <CopyButton textToCopy={suggestion.description} className="absolute top-2 right-2"/>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">TAGS</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 pr-10">{suggestion.tags}</p>
                 <CopyButton textToCopy={suggestion.tags} className="absolute top-2 right-2"/>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="relative">
                    <label className="text-xs font-semibold text-brand-text-secondary">Gợi ý Thumbnail</label>
                    <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 h-full pr-10">{suggestion.thumbnail_text}</p>
                    <CopyButton textToCopy={suggestion.thumbnail_text} className="absolute top-2 right-2"/>
                 </div>
                 <div className="relative">
                    <label className="text-xs font-semibold text-brand-text-secondary">PROMPT TẠO/CHỈNH SỬA THUMBNAIL</label>
                    <div className="text-sm p-2 bg-brand-surface rounded-md mt-1 h-full flex flex-col justify-between">
                         <div>
                            {isEditing ? (
                                <textarea
                                    value={currentEditText}
                                    onChange={(e) => setCurrentEditText(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-md p-2 text-brand-text-primary text-sm min-h-[100px] focus:ring-2 focus:ring-brand-primary"
                                    autoFocus
                                />
                            ) : (
                                <p className="pr-16">{currentPrompt}</p>
                            )}
                           <div className="absolute top-2 right-2 flex items-center space-x-1">
                                {isEditing ? (
                                    <button onClick={() => handleSaveEdit(index)} title="Lưu" className="p-1.5 text-brand-text-secondary hover:text-brand-success hover:bg-brand-bg rounded-md transition-colors">
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleStartEdit(index, currentPrompt)} title="Chỉnh sửa" className="p-1.5 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg rounded-md transition-colors">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <CopyButton textToCopy={currentPrompt} />
                            </div>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                             {imageState?.url && (
                                <img src={imageState.url} alt={`Generated thumbnail for suggestion ${index + 1}`} className="w-full rounded-md border border-brand-border" />
                             )}

                             <button 
                                onClick={() => handleGenerateImage(index, currentPrompt)}
                                disabled={imageState?.loading}
                                className="w-full text-xs flex items-center justify-center bg-brand-primary/80 hover:bg-brand-primary disabled:bg-indigo-700 disabled:cursor-wait text-white font-bold py-2 px-2 rounded-md transition duration-200"
                            >
                                {imageState?.loading ? <><LoadingSpinner /> <span className="ml-2">Đang tạo...</span></> : <><CameraIcon className="w-4 h-4 mr-1"/> {imageState?.url ? 'Tạo lại ảnh' : 'Tạo ảnh theo gợi ý này'}</>}
                            </button>

                             {imageState?.error && <p className="text-xs text-brand-danger mt-1 text-center">Lỗi: {imageState.error}</p>}
                        </div>

                    </div>
                 </div>
              </div>
            </div>
          )})}
        </div>
         <div className="flex justify-between items-center p-4 bg-brand-bg rounded-b-lg border-t border-brand-border sticky bottom-0">
            <p className="text-xs text-brand-text-secondary">Chỉnh sửa ảnh thumbnail gốc bằng AI.</p>
            <div>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md mr-2">Đóng</button>
              <button onClick={onDownload} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover rounded-md">Tải về (.txt)</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;