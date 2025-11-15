
import React from 'react';
import type { VideoData } from '../types';

interface InputSectionProps {
  videoData: VideoData;
  placeholders: VideoData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFetchMetadata: () => void;
  onFetchTranscript: () => void;
  isFetchingMeta: boolean;
  isFetchingTranscript: boolean;
}

const InputField: React.FC<{
    id: keyof VideoData;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    component?: 'input' | 'textarea';
    rows?: number;
    step: number;
}> = ({ id, label, value, onChange, placeholder, component = 'input', rows, step }) => {
    const commonProps = {
        id,
        name: id,
        value,
        onChange,
        placeholder,
        className: "w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200",
    };

    return (
        <div>
            <label htmlFor={id} className="flex items-center text-sm font-medium text-brand-text-secondary mb-2">
                <span className="flex items-center justify-center bg-brand-secondary text-brand-bg font-bold rounded-full h-5 w-5 text-xs mr-2">{step}</span>
                {label}
            </label>
            {component === 'textarea' ? (
                <textarea {...commonProps} rows={rows}></textarea>
            ) : (
                <input type="text" {...commonProps} />
            )}
        </div>
    );
};


const InputSection: React.FC<InputSectionProps> = ({ videoData, placeholders, onInputChange, onFetchMetadata, onFetchTranscript, isFetchingMeta, isFetchingTranscript }) => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-brand-text-primary">1. Nhập nội dung video</h2>
        
        <div>
            <label htmlFor="youtubeLink" className="flex items-center text-sm font-medium text-brand-text-secondary mb-2">
                <span className="flex items-center justify-center bg-brand-secondary text-brand-bg font-bold rounded-full h-5 w-5 text-xs mr-2">1</span>
                Link video YouTube
            </label>
            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    id="youtubeLink" 
                    name="youtubeLink" 
                    value={videoData.youtubeLink} 
                    onChange={onInputChange} 
                    placeholder={placeholders.youtubeLink}
                    className="flex-grow bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                />
                 <button
                    onClick={onFetchTranscript}
                    disabled={isFetchingTranscript || isFetchingMeta}
                    className="flex-shrink-0 bg-brand-secondary/80 hover:bg-brand-secondary disabled:bg-amber-700 disabled:cursor-not-allowed text-brand-bg font-bold py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center min-w-[140px]"
                >
                    {isFetchingTranscript ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                          Đang lấy...
                        </>
                     ) : 'Lấy Transcript'}
                 </button>
                <button
                    onClick={onFetchMetadata}
                    disabled={isFetchingMeta || isFetchingTranscript}
                    className="flex-shrink-0 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center min-w-[120px]"
                >
                    {isFetchingMeta ? (
                       <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                         Đang tải...
                       </>
                    ) : 'Lấy dữ liệu'}
                </button>
            </div>
        </div>
        
        <InputField id="title" label="Tiêu đề" value={videoData.title} onChange={onInputChange} placeholder={placeholders.title} step={2} />
        <InputField id="description" label="Mô tả" value={videoData.description} onChange={onInputChange} placeholder={placeholders.description} component="textarea" rows={5} step={3} />
        <InputField id="tags" label="Tags (cách nhau dấu ,)" value={videoData.tags} onChange={onInputChange} placeholder={placeholders.tags} step={4} />
        <InputField id="transcript" label="Tóm tắt nội dung / transcript (tùy chọn)" value={videoData.transcript} onChange={onInputChange} placeholder={placeholders.transcript} component="textarea" rows={5} step={5} />
    </div>
  );
};

export default InputSection;