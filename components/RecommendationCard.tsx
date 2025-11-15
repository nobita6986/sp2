
import React, { useState } from 'react';
import { ChevronDownIcon, ClipboardIcon, LightBulbIcon } from './icons/UtilityIcons';
import type { Issue } from '../types';

interface Recommendation {
    type: 'title' | 'description' | 'tags';
    content: string;
}

interface RecommendationCardProps {
  title: string;
  recommendations?: Recommendation[];
  issues?: Issue[];
}

const CopyButton: React.FC<{textToCopy: string}> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={handleCopy} className="text-brand-text-secondary hover:text-brand-text-primary transition-colors">
            {copied ? 'Đã sao chép!' : <ClipboardIcon className="w-4 h-4" />}
        </button>
    )
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, recommendations, issues }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-brand-bg border border-brand-border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <div className="flex items-center">
          <LightBulbIcon className="w-5 h-5 text-brand-secondary mr-3" />
          <h3 className="font-semibold text-brand-text-primary">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-brand-text-secondary transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-brand-border space-y-4">
          {issues && issues.map((issue, index) => (
             <div key={index} className="p-3 bg-red-900/20 rounded-md">
                 <p className="text-sm text-red-300"><span className="font-bold">Vấn đề ({issue.severity}):</span> {issue.evidence}</p>
                 <p className="text-sm text-green-300"><span className="font-bold">Đề xuất:</span> {issue.fix}</p>
             </div>
          ))}
          {recommendations && recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-brand-surface rounded-md">
                  {rec.type === 'description' || rec.type === 'tags' ? (
                     <div className="flex justify-between items-start">
                         <p className="text-sm text-brand-text-secondary whitespace-pre-wrap flex-1">{rec.content}</p>
                         <CopyButton textToCopy={rec.content} />
                     </div>
                  ) : (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-brand-text-secondary">{rec.content}</p>
                        <CopyButton textToCopy={rec.content} />
                    </div>
                  )}
              </div>
          ))}
        </div>
      )}
    </div>
  );
};
