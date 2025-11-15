
import React from 'react';
import type { Session } from '../types';
import { LibraryIcon, XMarkIcon, TrashIcon } from './icons/UtilityIcons';

interface LibraryModalProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ sessions, isOpen, onClose, onLoadSession, onDeleteSession }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface border border-brand-border rounded-lg shadow-xl w-full max-w-3xl transform transition-all flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text-primary flex items-center">
            <LibraryIcon className="w-5 h-5 mr-2 text-brand-secondary" />
            Thư viện phiên làm việc
          </h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-brand-text-secondary">Chưa có phiên làm việc nào được lưu.</p>
              <p className="text-sm text-brand-text-secondary mt-1">
                Một phiên sẽ tự động được lưu sau mỗi lần bạn phân tích thành công.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-brand-border">
              {sessions.map((session) => (
                <li key={session.id} className="py-3 flex items-center justify-between hover:bg-brand-bg/50 rounded-md px-2 -mx-2">
                  <div>
                    <p className="font-medium text-brand-text-primary truncate max-w-md">{session.videoTitle}</p>
                    <p className="text-xs text-brand-text-secondary">
                      Lưu lúc: {new Date(session.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onLoadSession(session)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-md"
                    >
                      Tải
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bạn có chắc muốn xóa phiên này?')) {
                                onDeleteSession(session.id);
                            }
                        }}
                        className="p-1.5 text-brand-text-secondary hover:text-brand-danger hover:bg-red-900/20 rounded-md"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
         <div className="flex justify-end p-4 bg-brand-bg rounded-b-lg border-t border-brand-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text-primary bg-brand-surface hover:bg-gray-700 border border-brand-border rounded-md">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
