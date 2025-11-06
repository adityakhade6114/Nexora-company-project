import type { Product, CartItem, UserInfo, Receipt, User } from '../types';

// --- MOCK DATA ---
const MOCK_BRANDS = ['DataFlow', 'KeyBorg', 'NexusVR', 'Cyber-Core', 'RetroWave', 'GlitchWear'];
const MOCK_COLORS = ['Cyan', 'Black', 'White', 'Multi-color', 'Silver', 'Brown'];


// Replaced the generic product list with a thematically-curated selection for the Nexora store.
const mockProducts: Product[] = [
    { id: 1, name: "computer keyboard", price: 699, originalPrice: 899, imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800", rating: 4.8, brand: 'KeyBorg', color: 'Black' },
    { id: 2, name: 'VR Headset "NEXUS-V"', price: 24999, imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800", rating: 4.9, brand: 'NexusVR', color: 'White' },
    { id: 4, name: "white t shirt", price: 499, originalPrice: 649, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800", rating: 4.7, brand: 'GlitchWear', color: 'White' },
    { id: 7, name: "Cyber-Cake (1kg)", price: 799, originalPrice: 999, imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800", rating: 4.6, brand: 'Cyber-Core', color: 'Brown' },
    { id: 10, name: 'Cryp-Key Pendant', price: 3999, imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800", rating: 4.9, brand: 'Cyber-Core', color: 'Silver' },
    { id: 12, name: 'RetroWave \'86 Console', price: 15999, originalPrice: 17999, imageUrl: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=800", rating: 4.9, brand: 'RetroWave', color: 'Silver' },
    { id: 17, name: 'nike sneakers', price: 9999, imageUrl: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=800", rating: 4.8, brand: 'GlitchWear', color: 'White' }
];

// --- MOCK API IMPLEMENTATION ---

// Mock DB state
let mockUsers: User[] = [
  { id: 1, name: 'Cyber Runner', email: 'runner@nexora.dev', password: 'password123' }
];
let mockCart: CartItem[] = [];
let currentUser: User | null = null;
let nextUserId = 2;
let nextCartItemId = 1;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fix: Implemented all missing API functions.
export const getProducts = async (): Promise<Product[]> => {
  await delay(500);
  return mockProducts;
};

export const getCurrentUser = async (): Promise<User | null> => {
  await delay(100);
  return currentUser;
};

export const login = async (email: string, password: string): Promise<User> => {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        mockCart = []; 
        return { id: user.id, name: user.name, email: user.email }; // Don't send password to client
    }
    throw new Error('Invalid email or password.');
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
    await delay(1000);
    if (mockUsers.some(u => u.email === email)) {
        throw new Error('An account with this email already exists.');
    }
    const newUser: User = { id: nextUserId++, name, email, password };
    mockUsers.push(newUser);
    currentUser = newUser;
    mockCart = [];
    return { id: newUser.id, name: newUser.name, email: newUser.email };
};

export const logout = async (): Promise<void> => {
    await delay(200);
    currentUser = null;
    mockCart = [];
};

export const getCart = async (): Promise<CartItem[]> => {
    await delay(300);
    if (!currentUser) {
        return [];
    }
    return JSON.parse(JSON.stringify(mockCart)); // Return a copy
};

export const addToCart = async (productId: number, quantity: number): Promise<CartItem[]> => {
    await delay(200);
    if (!currentUser) throw new Error("User not logged in");

    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");

    const existingItem = mockCart.find(item => item.product.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        mockCart.push({ id: nextCartItemId++, product, quantity });
    }
    return JSON.parse(JSON.stringify(mockCart));
};

export const updateCartItemQuantity = async (cartItemId: number, newQuantity: number): Promise<CartItem[]> => {
    await delay(150);
    if (!currentUser) throw new Error("User not logged in");
    
    if (newQuantity <= 0) {
        return removeFromCart(cartItemId);
    }
    
    const itemIndex = mockCart.findIndex(item => item.id === cartItemId);
    if (itemIndex > -1) {
        mockCart[itemIndex].quantity = newQuantity;
    }
    return JSON.parse(JSON.stringify(mockCart));
};

export const removeFromCart = async (cartItemId: number): Promise<CartItem[]> => {
    await delay(150);
    if (!currentUser) throw new Error("User not logged in");
    
    mockCart = mockCart.filter(item => item.id !== cartItemId);
    return JSON.parse(JSON.stringify(mockCart));
};

export const mergeCart = async (anonCart: Omit<CartItem, 'id'>[]): Promise<CartItem[]> => {
    await delay(500);
    if (!currentUser) throw new Error("User not logged in");

    anonCart.forEach(anonItem => {
        const existingItem = mockCart.find(item => item.product.id === anonItem.product.id);
        if (existingItem) {
            existingItem.quantity += anonItem.quantity;
        } else {
            mockCart.push({ ...anonItem, id: nextCartItemId++ });
        }
    });
    return JSON.parse(JSON.stringify(mockCart));
};

export const validateDiscountCode = async (code: string): Promise<{ discount: number } | { error: string }> => {
    await delay(400);
    const upperCode = code.toUpperCase();
    if (upperCode === 'NEXORA20') {
        return { discount: 0.20 };
    }
    if (upperCode === 'FUTURA10') {
        return { discount: 0.10 };
    }
    return { error: 'Invalid discount code.' };
};

export const checkout = async (userInfo: UserInfo, appliedDiscount: { code: string; discount: number } | null): Promise<Receipt> => {
    await delay(1500);
    if (!currentUser) throw new Error("User not logged in");
    if (mockCart.length === 0) throw new Error("Cannot checkout with an empty cart.");

    const subtotal = mockCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmount = appliedDiscount ? subtotal * appliedDiscount.discount : 0;
    const total = subtotal - discountAmount;
    
    const receipt: Receipt = {
        id: `NXR-${Date.now()}`,
        items: JSON.parse(JSON.stringify(mockCart)),
        subtotal,
        discount: appliedDiscount ? { code: appliedDiscount.code, amount: discountAmount } : undefined,
        total,
        userInfo,
        checkoutDate: new Date().toISOString()
    };
    
    // Clear cart after checkout
    mockCart = [];
    
    return receipt;
};