import React, { useState } from 'react';
import type { User } from '../types';
import * as api from '../services/api';
import { useTranslations } from '../contexts/LanguageContext';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const { t } = useTranslations();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let user: User;
      if (mode === 'register') {
        user = await api.register(name, email, password);
      } else {
        user = await api.login(email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 p-4 backdrop-blur-sm">
      <div className="bg-surface p-8 rounded-lg shadow-2xl w-full max-w-sm relative border border-primary/40">
        <h2 className="text-2xl font-bold text-text-light mb-6 text-center font-orbitron">{mode === 'login' ? t('welcomeBack') : t('createAccount')}</h2>
        {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-text-medium">{t('fullName')}</label>
              <input
                type="text" id="name" value={name} onChange={e => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-primary/50 rounded-md shadow-sm text-text-light focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-text-medium">{t('emailAddress')}</label>
            <input
              type="email" id="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-primary/50 rounded-md shadow-sm text-text-light focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password"className="block text-sm font-medium text-text-medium">{t('password')}</label>
            <input
              type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-primary/50 rounded-md shadow-sm text-text-light focus:outline-none focus:ring-primary focus:border-primary"
              required minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex justify-center px-4 py-2 text-base font-medium text-background bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-orange-800"
          >
            {isLoading ? t('processing') : (mode === 'login' ? t('login') : t('register'))}
          </button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={toggleMode} className="text-sm text-primary hover:underline">
                {mode === 'login' ? t('toggleToRegister') : t('toggleToLogin')}
            </button>
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">
            &times;
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
