import React, { useState } from 'react';
import type { CartItem } from '../types';
import { TrashIcon, PlusIcon, MinusIcon, CloseIcon } from './IconComponents';
import { useTranslations } from '../contexts/LanguageContext';

interface CartProps {
  items: CartItem[];
  appliedDiscount: { code: string; discount: number } | null;
  discountError: string | null;
  onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
  onRemoveItem: (cartItemId: number) => void;
  onCheckout: () => void;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
}

const Cart: React.FC<CartProps> = ({ items, appliedDiscount, discountError, onUpdateQuantity, onRemoveItem, onCheckout, onApplyDiscount, onRemoveDiscount }) => {
  const { t } = useTranslations();
  const [discountCode, setDiscountCode] = useState('');
  
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? subtotal * appliedDiscount.discount : 0;
  const total = subtotal - discountAmount;
  
  const handleDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim()) {
      onApplyDiscount(discountCode.trim());
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg border border-primary/30">
      <h2 className="text-2xl font-bold text-text-light mb-6 border-b border-primary/30 pb-4 font-orbitron">{t('yourCart')}</h2>
      {items.length === 0 ? (
        <p className="text-text-medium text-center py-8">{t('cartEmpty')}</p>
      ) : (
        <>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-md border-2 border-primary/50" />
                ) : (
                    <div className="w-16 h-16 bg-background/50 flex items-center justify-center rounded-md border-2 border-primary/50">
                        <span className="text-text-medium/50 text-2xl font-orbitron">?</span>
                    </div>
                )}
                <div className="flex-grow mx-4">
                  <p className="font-semibold text-text-light">{item.product.name}</p>
                  <p className="text-xs font-mono text-text-medium/70">ID: {item.product.id}</p>
                  <p className="text-sm text-text-medium">₹{item.product.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full text-text-medium hover:bg-primary/50 hover:text-text-light transition-colors">
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="font-semibold w-6 text-center text-text-light">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full text-text-medium hover:bg-primary/50 hover:text-text-light transition-colors">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => onRemoveItem(item.id)} className="ml-4 text-red-500 hover:text-red-400 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-primary/30">
            {!appliedDiscount ? (
              <>
                <form onSubmit={handleDiscountSubmit} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t('discountCode')}
                    className="flex-grow bg-background border border-primary/50 rounded-md px-3 py-2 text-sm text-text-light focus:outline-none focus:ring-2 focus:ring-secondary/80"
                  />
                  <button type="submit" className="px-4 py-2 text-sm font-semibold text-background bg-primary rounded-md hover:bg-primary-hover transition-colors">
                    {t('apply')}
                  </button>
                </form>
                <p className="text-xs text-text-medium text-center mb-4">{t('tryDiscountCodes')}</p>
              </>
            ) : (
              <div className="flex justify-between items-center bg-green-500/20 text-green-300 p-2 rounded-md mb-4">
                 <p className="text-sm font-semibold">{t('codeApplied', { code: appliedDiscount.code })}</p>
                 <button onClick={onRemoveDiscount} className="p-1 rounded-full hover:bg-white/20">
                    <CloseIcon className="h-4 w-4"/>
                 </button>
              </div>
            )}
            {discountError && <p className="text-red-400 text-sm mb-4">{discountError}</p>}
            
            <div className="space-y-2 text-text-light">
                <div className="flex justify-between">
                    <span className="text-text-medium">{t('subtotal')}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedDiscount && (
                    <div className="flex justify-between text-green-400">
                        <span className="text-text-medium">{t('discount')} ({appliedDiscount.code})</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                )}
                 <div className="flex justify-between items-center text-lg font-semibold border-t border-primary/30 pt-2 mt-2">
                    <span>{t('total')}</span>
                    <span className="text-secondary text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full mt-4 bg-secondary text-background font-bold py-3 px-4 rounded-lg hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all duration-300"
            >
              {t('checkout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;