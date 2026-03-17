import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateOrderId } from '../utils/auth';

export interface CartItem {
  id: string;
  name: string;
  priceNum: number;
  price: string;
  image: string;
  size: string;
  scent: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (
    customerInfo: { name: string; email: string; phone: string; address: string },
    extra: { note: string; paymentMethod: string; shippingFee: number; discountAmount: number; appliedVoucher: string | null; finalTotal: number }
  ) => any;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('app_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qtyToAdd = item.quantity || 1;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i);
      }
      return [...prev, { ...item, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const checkout = (
    customerInfo: { name: string; email: string; phone: string; address: string },
    extra: { note: string; paymentMethod: string; shippingFee: number; discountAmount: number; appliedVoucher: string | null; finalTotal: number }
  ) => {
    const snapshot = cart.map(item => ({ ...item }));
    const snapshotTotal = snapshot.reduce((s, i) => s + i.priceNum * i.quantity, 0);

    const newOrder = {
      id: generateOrderId(),
      customer: customerInfo.name,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      email: customerInfo.email,
      customerPhone: customerInfo.phone,
      phone: customerInfo.phone,
      address: customerInfo.address,
      date: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      total: snapshotTotal,
      shippingFee: extra.shippingFee,
      discountAmount: extra.discountAmount,
      appliedVoucher: extra.appliedVoucher,
      finalTotal: extra.finalTotal,
      status: 'Đang xử lý',
      paymentStatus: 'Chờ thanh toán',
      paymentMethod: extra.paymentMethod,
      note: extra.note,
      items: snapshot,
    };

    try {
      const savedOrders = localStorage.getItem('app_orders');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...orders]));
    } catch { /* localStorage full */ }

    clearCart();
    return newOrder;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, checkout, totalItems, totalPrice, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
