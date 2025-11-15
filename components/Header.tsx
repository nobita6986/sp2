
import React from 'react';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { KeyIcon, LibraryIcon, LoginIcon, LogoutIcon } from './icons/UtilityIcons';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
    onShowApiModal: () => void;
    onShowLibraryModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, onShowApiModal, onShowLibraryModal }) => {
  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <YoutubeIcon className="h-8 w-8 text-brand-danger" />
            <h1 className="text-xl font-bold text-brand-text-primary tracking-tight hidden sm:block">
              ClearCue Checker
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button onClick={onShowLibraryModal} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary transition-colors">
                <LibraryIcon className="w-5 h-5"/>
                <span className="hidden md:inline">Thư viện</span>
             </button>
             <button onClick={onShowApiModal} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary transition-colors">
                <KeyIcon className="w-5 h-5"/>
                <span className="hidden md:inline">Cấu hình API</span>
             </button>

            <div className="w-px h-6 bg-brand-border"></div>

             {user ? (
                <div className="flex items-center space-x-3">
                    <img src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} className="w-8 h-8 rounded-full" />
                     <button onClick={onLogout} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary transition-colors">
                        <LogoutIcon className="w-5 h-5"/>
                        <span className="hidden md:inline">Đăng xuất</span>
                    </button>
                </div>
             ) : (
                <button onClick={onLogin} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary transition-colors">
                    <LoginIcon className="w-5 h-5"/>
                    <span className="hidden md:inline">Đăng nhập</span>
                </button>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
