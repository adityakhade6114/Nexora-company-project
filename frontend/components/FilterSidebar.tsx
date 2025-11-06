import React, { useState, useEffect } from 'react';
import { StarIcon, CloseIcon } from './IconComponents';
import { useTranslations } from '../contexts/LanguageContext';

interface Filters {
  maxPrice: number;
  minRating: number;
  brands: string[];
  colors: string[];
}

interface FilterSidebarProps {
  allBrands: string[];
  allColors: string[];
  activeFilters: Filters;
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (newFilters: Filters) => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ allBrands, allColors, activeFilters, isOpen, onClose, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(activeFilters);
  const { t } = useTranslations();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }));
  };
  
  const handleRatingChange = (rating: number) => {
    setLocalFilters(prev => ({ ...prev, minRating: prev.minRating === rating ? 0 : rating }));
  };

  const handleCheckboxChange = (category: 'brands' | 'colors', value: string) => {
    setLocalFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleClear = () => {
    onClearFilters();
    onClose();
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-70 z-20 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[90vw] bg-surface shadow-2xl shadow-primary/40 border-r border-primary/30 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sidebar-title"
      >
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-primary/30 flex-shrink-0">
                <h2 id="filter-sidebar-title" className="text-xl font-bold text-text-light font-orbitron">{t('filters')}</h2>
                <button onClick={onClose} className="text-text-medium hover:text-text-light">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <form id="filter-form" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="price" className="block text-sm font-semibold text-text-medium mb-2">{t('maxPrice')}</label>
                  <input
                    type="range"
                    id="price"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={localFilters.maxPrice}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="text-center text-text-light mt-1 font-semibold">
                    ₹{localFilters.maxPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-text-medium mb-2">{t('rating')}</h3>
                    <div className="flex justify-around">
                        {[4, 3, 2, 1].map(star => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => handleRatingChange(star)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs transition-colors ${localFilters.minRating === star ? 'bg-secondary text-background border-secondary' : 'bg-transparent border-primary/40 text-text-medium hover:bg-primary/20'}`}
                            >
                                <span>{star}+</span>
                                <StarIcon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-medium mb-2">{t('brand')}</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allBrands.map(brand => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.brands.includes(brand)}
                          onChange={() => handleCheckboxChange('brands', brand)}
                          className="h-4 w-4 rounded bg-background border-primary/50 text-secondary focus:ring-secondary/50 accent-secondary"
                        />
                        <span className="text-text-light">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-text-medium mb-2">{t('color')}</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {allColors.map(color => (
                        <label key={color} className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={localFilters.colors.includes(color)}
                            onChange={() => handleCheckboxChange('colors', color)}
                            className="h-4 w-4 rounded bg-background border-primary/50 text-secondary focus:ring-secondary/50 accent-secondary"
                            />
                            <span className="text-text-light">{color}</span>
                        </label>
                        ))}
                    </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-primary/30 flex-shrink-0">
                <div className="flex flex-col space-y-2">
                    <button type="submit" form="filter-form" className="w-full bg-primary text-background font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                        {t('applyFilters')}
                    </button>
                    <button type="button" onClick={handleClear} className="w-full bg-transparent border border-text-medium text-text-medium font-semibold py-2 px-4 rounded-lg hover:bg-text-medium hover:text-background transition-colors">
                        {t('clearFilters')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
