import React, { useState } from 'react';
import type { UserInfo } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface CheckoutFormProps {
    onCheckout: (userInfo: UserInfo) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCheckout, onCancel, isProcessing }) => {
    const { t } = useTranslations();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string, email?: string }>({});

    const validate = () => {
        const newErrors: { name?: string, email?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required.';
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onCheckout({ name, email });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 p-4 backdrop-blur-sm">
            <div className="bg-surface p-8 rounded-lg shadow-2xl shadow-primary/30 w-full max-w-md animate-fade-in-up border border-primary/40">
                <h2 className="text-2xl font-bold text-text-light mb-6 font-orbitron">{t('checkoutTitle')}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-text-medium">{t('fullName')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.name ? 'border-red-500' : 'border-primary/50'} rounded-md shadow-sm text-text-light focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                            required
                        />
                         {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-text-medium">{t('emailAddress')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.email ? 'border-red-500' : 'border-primary/50'} rounded-md shadow-sm text-text-light focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                            required
                        />
                         {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-text-light bg-background border border-primary/50 rounded-md hover:bg-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-background bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-orange-800"
                        >
                            {isProcessing ? t('processing') : t('confirmPurchase')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
