import React from 'react';
import { UploadIcon, SparklesIcon } from './icons/UtilityIcons';
import LoadingSpinner from './LoadingSpinner';
import type { AnalysisResult } from '../types';

interface ThumbnailSectionProps {
  thumbnailPreview: string | null;
  analysisResult: AnalysisResult | null;
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({ thumbnailPreview, analysisResult, onThumbnailChange, onAnalyze, isLoading }) => {
  const overallScore = analysisResult?.total_score?.value;
  const scoreProgress = overallScore !== undefined ? overallScore : 0;
  
  const getScoreColorClass = (s?: number) => {
    if (s === undefined) return 'text-brand-text-secondary';
    if (s >= 85) return 'text-brand-success';
    if (s >= 60) return 'text-brand-warning';
    return 'text-brand-danger';
  };
  
  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-brand-text-primary">2. Tải lên Thumbnail & Bối cảnh</h2>
      
      <div className="flex flex-col items-center justify-center w-full">
        <label htmlFor="thumbnail-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-brand-border border-dashed rounded-lg cursor-pointer bg-brand-bg hover:bg-gray-800 transition duration-200">
          {thumbnailPreview ? (
            <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-contain rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-8 h-8 mb-4 text-brand-text-secondary" />
              <p className="mb-2 text-sm text-brand-text-secondary"><span className="font-semibold">Nhấn để tải ảnh lên</span></p>
              <p className="text-xs text-brand-text-secondary">PNG, JPG or WEBP (MAX. 2MB)</p>
            </div>
          )}
          <input id="thumbnail-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onThumbnailChange} />
        </label>
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-brand-text-secondary mb-2">Bối cảnh bổ sung</label>
        <select id="context" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200">
            <option>Không đề cập</option>
            <option>Nội dung dành cho trẻ em</option>
            <option>Nội dung giáo dục</option>
            <option>Nội dung có yếu tố nhạy cảm</option>
        </select>
      </div>
      
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Đang xử lý...</span>
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span>Phân tích bằng AI</span>
          </>
        )}
      </button>
       <div className="flex items-center justify-center mt-4">
            <div className="w-full h-2 bg-brand-bg rounded-full">
                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-400 rounded-full transition-all duration-500" style={{ width: `${scoreProgress}%` }}></div>
            </div>
        </div>
        <div className="text-center">
            {overallScore !== undefined ? (
                 <p className={`text-3xl font-bold ${getScoreColorClass(overallScore)}`}>{overallScore}/100</p>
            ) : (
                <p className="text-xl font-bold text-brand-text-secondary">Chưa chấm điểm</p>
            )}
            <p className="text-sm text-brand-text-secondary">Điểm SEO tổng thể</p>
        </div>
    </div>
  );
};

export default ThumbnailSection;
