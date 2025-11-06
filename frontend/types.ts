export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating: number;
  brand: string;
  color: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // The password is not always present in user objects returned by the API
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface Receipt {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
  };
  total: number;
  userInfo: UserInfo;
  checkoutDate: string;
}
