import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, CartItem, UserInfo, Receipt, User } from './types';
import * as api from './services/api';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';
import ReceiptModal from './components/ReceiptModal';
import AuthModal from './components/AuthModal';
import FilterSidebar from './components/FilterSidebar';
import { useTranslations } from './contexts/LanguageContext';
import { FilterIcon } from './components/IconComponents';

const ANONYMOUS_CART_KEY = 'nexora_anon_cart';

const INITIAL_FILTERS = {
  maxPrice: 50000,
  minRating: 0,
  brands: [] as string[],
  colors: [] as string[],
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const { t } = useTranslations();

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [user, fetchedProducts] = await Promise.all([
        api.getCurrentUser(),
        api.getProducts(),
      ]);
      
      setCurrentUser(user);
      setProducts(fetchedProducts);

      if (user) {
        const userCart = await api.getCart();
        setCartItems(userCart);
      } else {
        const anonCart = JSON.parse(localStorage.getItem(ANONYMOUS_CART_KEY) || '[]');
        setCartItems(anonCart);
      }
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  const handleAddToCart = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
  
    if (currentUser) {
      const updatedCart = await api.addToCart(productId, 1);
      setCartItems(updatedCart);
    } else {
      setCartItems(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === productId);
        if (existingItem) {
          return prevCart.map(item => 
            item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // For anon cart, ID can be temporary since it's only client-side
          const newItem: CartItem = { id: Date.now(), product, quantity: 1 };
          return [...prevCart, newItem];
        }
      });
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (currentUser) {
        const updatedCart = await api.updateCartItemQuantity(cartItemId, newQuantity);
        setCartItems(updatedCart);
    } else {
      setCartItems(prevCart => {
        if (newQuantity <= 0) {
          return prevCart.filter(item => item.id !== cartItemId);
        }
        return prevCart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item);
      });
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    if (currentUser) {
        const updatedCart = await api.removeFromCart(cartItemId);
        setCartItems(updatedCart);
    } else {
        setCartItems(prevCart => prevCart.filter(item => item.id !== cartItemId));
    }
  };
  
  const handleProceedToCheckout = () => {
    if (currentUser) {
      setShowCheckout(true);
    } else {
      setShowAuthModal(true);
    }
  }

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);

    const anonCart: Omit<CartItem, 'id'>[] = JSON.parse(localStorage.getItem(ANONYMOUS_CART_KEY) || '[]');
    if (anonCart.length > 0) {
      setIsLoading(true);
      try {
        const mergedCart = await api.mergeCart(anonCart);
        setCartItems(mergedCart);
        localStorage.removeItem(ANONYMOUS_CART_KEY);
      } catch (err) {
        setError('Could not merge local cart with server. Please check your cart.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const userCart = await api.getCart();
      setCartItems(userCart);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCartItems([]);
    setAppliedDiscount(null);
  };

  const handleCheckout = async (userInfo: UserInfo) => {
    setIsProcessingCheckout(true);
    try {
      const newReceipt = await api.checkout(userInfo, appliedDiscount);
      setReceipt(newReceipt);
      setShowCheckout(false);
      setCartItems([]);
      setAppliedDiscount(null);
    } catch (err) {
      setError('Checkout failed. Please try again.');
      console.error(err);
    } finally {
      setIsProcessingCheckout(false);
    }
  };
  
  const handleApplyDiscount = async (code: string) => {
    setDiscountError(null);
    const result = await api.validateDiscountCode(code);
    if ('discount' in result) {
      setAppliedDiscount({ code: code.toUpperCase(), discount: result.discount });
    } else {
      setDiscountError(result.error);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError(null);
  }

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);
  const allColors = useMemo(() => [...new Set(products.map(p => p.color))], [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => p.price <= filters.maxPrice)
      .filter(p => p.rating >= filters.minRating)
      .filter(p => filters.brands.length === 0 || filters.brands.includes(p.brand))
      .filter(p => filters.colors.length === 0 || filters.colors.includes(p.color));
  }, [products, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header 
        cartItemCount={cartItemCount} 
        currentUser={currentUser}
        onShowAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FilterSidebar 
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        allBrands={allBrands}
        allColors={allColors}
        activeFilters={filters}
        onApplyFilters={setFilters}
        onClearFilters={() => setFilters(INITIAL_FILTERS)}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
        
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-lg text-text-medium font-orbitron animate-pulse">{t('loading')}</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col lg:flex-row lg:space-x-8">
              <div className="lg:w-2/3">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-text-light font-orbitron">{t('products')}</h2>
                    <button 
                        onClick={() => setIsFilterSidebarOpen(true)}
                        className="flex items-center space-x-2 px-3 py-2 border border-primary/40 rounded-md hover:bg-primary/20 transition-colors"
                        aria-label={t('openFiltersAriaLabel')}
                      >
                        <FilterIcon className="h-5 w-5 text-text-medium" />
                        <span className="text-sm font-medium text-text-light hidden sm:inline">{t('filters')}</span>
                    </button>
                </div>
                {filteredProducts.length > 0 ? (
                  <ProductList products={filteredProducts} onAddToCart={handleAddToCart} />
                ) : (
                  <div className="text-center py-16 px-6 bg-surface/50 rounded-lg border border-primary/20">
                      <p className="text-xl text-text-light font-orbitron">{t('noGearFound')}</p>
                      <p className="text-text-medium mt-2">{t('noGearMessage')}</p>
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 mt-8 lg:mt-0">
                <div className="lg:sticky lg:top-28 self-start">
                  <Cart 
                    items={cartItems} 
                    appliedDiscount={appliedDiscount}
                    discountError={discountError}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveFromCart}
                    onCheckout={handleProceedToCheckout}
                    onApplyDiscount={handleApplyDiscount}
                    onRemoveDiscount={handleRemoveDiscount}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {showCheckout && (
        <CheckoutForm 
          onCheckout={handleCheckout} 
          onCancel={() => setShowCheckout(false)} 
          isProcessing={isProcessingCheckout}
        />
      )}
      {receipt && (
        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
};

export default App;