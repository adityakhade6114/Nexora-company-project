import React from 'react';
import type { Receipt } from '../types';
import { CloseIcon } from './IconComponents';
import { useTranslations } from '../contexts/LanguageContext';

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-2xl shadow-secondary/30 w-full max-w-lg relative p-8 animate-fade-in-up border border-secondary/40">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-medium hover:text-text-light">
          <CloseIcon />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-secondary font-orbitron">{t('thankYou')}</h2>
          <p className="text-sm text-text-medium mt-1">{t('receiptGenerated')}</p>
        </div>
        <div className="bg-background/50 p-4 rounded-lg space-y-4 border border-secondary/20">
            <div className="flex justify-between">
                <span className="font-semibold text-text-medium">{t('receiptId')}</span>
                <span className="font-mono text-sm text-text-light">{receipt.id}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-semibold text-text-medium">{t('date')}</span>
                <span className="text-sm text-text-light">{new Date(receipt.checkoutDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-semibold text-text-medium">{t('billedTo')}</span>
                <span className="text-sm text-text-light">{receipt.userInfo.name} ({receipt.userInfo.email})</span>
            </div>
        </div>
        
        <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2 text-text-light font-orbitron">{t('orderSummary')}</h3>
            <div className="border-t border-b border-secondary/20 divide-y divide-secondary/20">
            {receipt.items.map(item => (
                <div key={item.id} className="flex justify-between py-2">
                    <span className="text-text-medium">{item.product.name} (x{item.quantity})</span>
                    <span className="font-medium text-text-light">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            ))}
            </div>
        </div>
        
        <div className="mt-6 flex justify-end">
            <div className="text-right w-full max-w-xs space-y-2">
                 <div className="flex justify-between">
                    <span className="text-text-medium">{t('subtotal')}</span>
                    <span className="text-text-light">₹{receipt.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {receipt.discount && (
                    <div className="flex justify-between text-green-400">
                        <span className="text-text-medium">{t('discount')} ({receipt.discount.code})</span>
                        <span className="text-green-400">-₹{receipt.discount.amount.toLocaleString('en-IN')}</span>
                    </div>
                )}
                <div className="flex justify-between items-center border-t border-secondary/30 pt-2">
                    <p className="text-text-medium font-bold text-lg">{t('total')}</p>
                    <p className="text-3xl font-bold text-secondary font-orbitron">₹{receipt.total.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>

        <button
            onClick={onClose}
            className="w-full mt-8 bg-primary text-background font-bold py-2 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors duration-300"
        >
            {t('close')}
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;
