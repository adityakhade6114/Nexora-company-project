import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { CartIcon, UserIcon, SearchIcon, GlobeIcon, ChevronDownIcon } from './IconComponents';
import { useTranslations } from '../contexts/LanguageContext';

interface HeaderProps {
  cartItemCount: number;
  currentUser: User | null;
  onShowAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const LanguageSelector: React.FC = () => {
    const { language, changeLanguage, t } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = {
        en: 'English',
        hi: 'हिन्दी',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode: 'en' | 'hi') => {
        changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-primary/40 rounded-md hover:bg-primary/20 transition-colors">
                <GlobeIcon className="h-5 w-5 text-text-medium" />
                <span className="text-sm font-medium text-text-light uppercase">{language}</span>
                <ChevronDownIcon className={`h-4 w-4 text-text-medium transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface rounded-md shadow-lg border border-primary/50 z-20 animate-fade-in-up">
                    <ul className="py-1">
                        {Object.entries(languages).map(([code, name]) => (
                             <li key={code}>
                                <button
                                    onClick={() => handleLanguageChange(code as 'en' | 'hi')}
                                    className={`w-full text-left px-4 py-2 text-sm ${language === code ? 'bg-primary/30 text-text-light' : 'text-text-medium'} hover:bg-primary/50 hover:text-text-light transition-colors`}
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}


const Header: React.FC<HeaderProps> = ({ cartItemCount, currentUser, onShowAuth, onLogout, searchQuery, onSearchChange }) => {
  const { t } = useTranslations();
    
  return (
    <header className="bg-surface/80 shadow-lg shadow-primary/20 backdrop-blur-sm sticky top-0 z-10 border-b border-primary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <h1 className="text-4xl font-bold font-orbitron text-glow hidden md:block">
            Nexora
          </h1>

          <div className="flex-1 flex justify-center px-2 sm:px-8">
            <div className="relative w-full max-w-lg">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-text-medium" />
                </span>
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-primary/40 rounded-full text-text-light placeholder-text-medium/70 focus:outline-none focus:ring-2 focus:ring-secondary/80 transition-all"
                    aria-label="Search products"
                />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSelector />
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <UserIcon className="h-6 w-6 text-secondary" />
                <span className="hidden sm:inline text-sm font-medium text-text-light">{t('hiUser', { name: currentUser.name })}</span>
                <button 
                  onClick={onLogout}
                  className="px-3 py-1 text-sm font-semibold text-primary border border-primary rounded-md hover:bg-primary hover:text-background transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <button 
                onClick={onShowAuth}
                className="px-4 py-2 text-sm font-semibold text-background bg-primary rounded-md hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                {t('loginRegister')}
              </button>
            )}
            <div className="relative flex items-center">
              <CartIcon className="h-8 w-8 text-text-light" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-background text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;