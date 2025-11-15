import React, { useState } from 'react';
import type { AnalysisResult, Category, Subcriterion } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ClipboardIcon, LightBulbIcon } from './icons/UtilityIcons';
import { ScoreCard } from './ScoreCard';

interface ResultsSectionProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'excellent':
        case 'very_good':
            return 'text-brand-success';
        case 'good':
        case 'average':
            return 'text-brand-warning';
        case 'poor':
            return 'text-brand-danger';
        default:
            return 'text-brand-primary';
    }
}

const SubcriterionDisplay: React.FC<{ sub: Subcriterion }> = ({ sub }) => (
    <div className="ml-4 pl-4 border-l border-brand-border py-2">
        <div className="flex justify-between items-center">
            <p className="font-semibold text-brand-text-primary">{sub.label}</p>
            <p className={`font-bold ${getGradeColor(sub.score.value > (sub.score.max * 0.7) ? 'good' : 'poor')}`}>
                {sub.score.value}/{sub.score.max}
            </p>
        </div>
        <p className="text-sm text-brand-text-secondary mt-1">{sub.explanation}</p>
        {sub.suggestions && sub.suggestions.length > 0 && (
            <div className="mt-2 text-xs text-green-300 bg-green-900/30 p-2 rounded-md">
                <p className="font-bold">Gợi ý:</p>
                <ul className="list-disc list-inside">
                    {sub.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
        )}
    </div>
);

const CategoryAccordion: React.FC<{ category: Category }> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-brand-bg border border-brand-border rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center space-x-4">
                    <ScoreCard title={category.label} scoreValue={category.score.value} scoreMax={category.score.max} />
                    <div>
                        <h4 className="font-semibold text-brand-text-primary">{category.label}</h4>
                        <p className="text-sm text-brand-text-secondary">{category.summary}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-brand-text-secondary transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-brand-border space-y-3">
                    {category.subcriteria.map(sub => <SubcriterionDisplay key={sub.id} sub={sub} />)}
                </div>
            )}
        </div>
    );
};

const RecommendationList: React.FC<{title: string, items: string[]}> = ({title, items}) => (
    <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
        <h4 className="font-semibold text-brand-text-primary flex items-center mb-2">
            <LightBulbIcon className="w-5 h-5 text-brand-secondary mr-2" />
            {title}
        </h4>
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 text-brand-success mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm text-brand-text-secondary">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);


const ResultsSection: React.FC<ResultsSectionProps> = ({ result, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
        <LoadingSpinner />
        <p className="mt-4 text-brand-text-secondary">AI đang phân tích, vui lòng chờ trong giây lát...</p>
        <p className="text-sm text-brand-text-secondary mt-2">Quá trình này có thể mất đến 30 giây.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-brand-danger rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-brand-danger mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-brand-text-primary">Đã xảy ra lỗi</h3>
        <p className="text-brand-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
        <div className="bg-brand-surface border-2 border-dashed border-brand-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <CheckCircleIcon className="w-12 h-12 text-brand-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-brand-text-primary">Sẵn sàng để phân tích</h3>
            <p className="text-brand-text-secondary mt-2 max-w-md">Nhập thông tin video và thumbnail của bạn, sau đó nhấp vào 'Phân tích bằng AI' để xem báo cáo chi tiết.</p>
        </div>
    );
  }

  const { total_score, categories, recommendations } = result;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-brand-text-primary mb-4">3. Kết quả phân tích SEO</h2>
        <div className="flex items-center p-4 rounded-lg bg-brand-bg">
            <div className="text-center mr-6 flex-shrink-0">
              <p className={`text-6xl font-bold ${getGradeColor(total_score.grade)}`}>{total_score.value}</p>
              <p className="text-brand-text-secondary">trên {total_score.max}</p>
              <p className={`text-sm font-semibold capitalize mt-1 ${getGradeColor(total_score.grade)}`}>{total_score.grade.replace('_', ' ')}</p>
           </div>
           <div className="border-l border-brand-border pl-6">
              <h3 className="text-lg font-semibold text-brand-text-primary">Tổng quan</h3>
              <p className="text-brand-text-secondary">{total_score.summary}</p>
           </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-text-primary">Phân tích chi tiết theo hạng mục</h3>
        {categories.map(category => (
          <CategoryAccordion key={category.id} category={category} />
        ))}
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecommendationList title="Quick Wins (Hành động nhanh)" items={recommendations.quick_wins} />
        <RecommendationList title="Thứ tự ưu tiên" items={recommendations.priority_order} />
      </div>

    </div>
  );
};

export default ResultsSection;
