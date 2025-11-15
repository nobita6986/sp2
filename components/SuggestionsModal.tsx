import React, { useState } from 'react';
import type { SeoSuggestion } from '../types';
import { XMarkIcon, LightBulbIcon, ClipboardIcon } from './icons/UtilityIcons';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SeoSuggestion[];
  onDownload: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={handleCopy} title="Copy to clipboard" className="absolute top-2 right-2 p-1.5 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg rounded-md transition-colors">
            {copied ? 'Copied!' : <ClipboardIcon className="w-4 h-4" />}
        </button>
    )
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, onDownload }) => {
  if (!isOpen) return null;

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
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-brand-bg border border-brand-border rounded-lg p-4 space-y-3">
              <h3 className="text-md font-bold text-brand-secondary">Gói gợi ý #{index + 1}</h3>
              
              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">TIÊU ĐỀ</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 pr-10">{suggestion.title}</p>
                <CopyButton textToCopy={suggestion.title} />
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">MÔ TẢ</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 whitespace-pre-wrap pr-10">{suggestion.description}</p>
                 <CopyButton textToCopy={suggestion.description} />
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-brand-text-secondary">TAGS</label>
                <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 pr-10">{suggestion.tags}</p>
                 <CopyButton textToCopy={suggestion.tags} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="relative">
                    <label className="text-xs font-semibold text-brand-text-secondary">VĂN BẢN TRÊN THUMBNAIL</label>
                    <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 h-full pr-10">{suggestion.thumbnail_text}</p>
                    <CopyButton textToCopy={suggestion.thumbnail_text} />
                 </div>
                 <div className="relative">
                    <label className="text-xs font-semibold text-brand-text-secondary">PROMPT TẠO THUMBNAIL</label>
                    <p className="text-sm p-2 bg-brand-surface rounded-md mt-1 h-full pr-10">{suggestion.thumbnail_prompt}</p>
                     <CopyButton textToCopy={suggestion.thumbnail_prompt} />
                 </div>
              </div>
            </div>
          ))}
        </div>
         <div className="flex justify-between items-center p-4 bg-brand-bg rounded-b-lg border-t border-brand-border sticky bottom-0">
            <p className="text-xs text-brand-text-secondary">Lưu lại các gợi ý này để sử dụng sau.</p>
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