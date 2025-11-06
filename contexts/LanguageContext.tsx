import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import translations from '../translations';

type Language = 'en' | 'hi';
type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: keyof Translations, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nexora_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nexora_language', language);
  }, [language]);


  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = useCallback((key: keyof Translations, options?: { [key: string]: string | number }) => {
    let text = (translations[language] && translations[language][key]) || translations.en[key];
    if (options) {
      Object.keys(options).forEach(optKey => {
        text = text.replace(`{${optKey}}`, String(options[optKey]));
      });
    }
    return text;
  }, [language]);
  

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};