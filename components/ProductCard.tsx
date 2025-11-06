import React from 'react';
import type { Product } from '../types';
import { StarIcon } from './IconComponents';
import { useTranslations } from '../contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { t } = useTranslations();
  
  return (
    <div className="bg-surface rounded-lg shadow-lg border border-primary/20 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 flex flex-col relative">
      {product.originalPrice && product.originalPrice > product.price && (
        <div className="absolute top-2 right-2 bg-secondary text-background text-xs font-bold px-2 py-1 rounded-full z-10 font-orbitron">
          {t('sale')}
        </div>
      )}
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-background/50 flex items-center justify-center border-b border-primary/20">
          <span className="text-text-medium text-xs font-orbitron">{t('imageNotAvailable')}</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-text-light flex-grow font-orbitron">{product.name}</h3>
        <div className="flex items-center justify-between my-2">
            <div className="flex items-baseline gap-2">
              <p className="text-secondary text-xl font-bold">₹{product.price.toLocaleString('en-IN')}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                 <del className="text-text-medium text-sm" aria-label={t('originalPriceAriaLabel')}>₹{product.originalPrice.toLocaleString('en-IN')}</del>
              )}
            </div>
            <div className="flex items-center space-x-1 text-yellow-400">
                <StarIcon className="h-5 w-5" />
                <span className="font-semibold text-text-light">{product.rating.toFixed(1)}</span>
            </div>
        </div>
        <button
          onClick={() => onAddToCart(product.id)}
          className="w-full mt-auto bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors duration-300"
        >
          {t('addToCart')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;