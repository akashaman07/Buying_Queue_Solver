'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  barcode?: string;
  imageUrl?: string;
  images?: string[];
  finalPrice?: number;
  stock?: number;
  category: string;
  description: string;
  discount?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'buying_queue_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Refs to track actions that need toast notifications
  const toastMessageRef = useRef<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const loadCart = () => {
      if (typeof window === 'undefined') return;
      
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    };

    loadCart();
  }, []);

  // Handle toast notifications
  useEffect(() => {
    if (toastMessageRef.current) {
      const { type, message } = toastMessageRef.current;
      
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      } else if (type === 'info') {
        toast.info(message);
      }
      
      // Reset the ref
      toastMessageRef.current = null;
    }
  }, [items]); // This will run after items state has been updated

  // Update totals whenever items change
  useEffect(() => {
    const newTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const newTotalAmount = items.reduce(
      (sum, item) => {
        // Use finalPrice if available, otherwise use price
        const priceToUse = item.product.finalPrice !== undefined ? 
          item.product.finalPrice : 
          item.product.price;
        return sum + priceToUse * item.quantity;
      },
      0
    );

    setTotalItems(newTotalItems);
    setTotalAmount(newTotalAmount);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    if (quantity <= 0) return;

    // Get the effective stock (default to 10 if not provided)
    const effectiveStock = product.stock !== undefined ? product.stock : 10;

    setItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.product._id === product._id);

      if (existingItemIndex !== -1) {
        // Product exists, update quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check stock availability
        if (newQuantity > effectiveStock) {
          // Set toast message instead of calling toast directly
          toastMessageRef.current = {
            type: 'error',
            message: `Only ${effectiveStock} items available in stock`
          };
          return prevItems;
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };
        
        // Set toast message instead of calling toast directly
        toastMessageRef.current = {
          type: 'success',
          message: `Added ${quantity} more ${product.name} to cart`
        };
        return updatedItems;
      } else {
        // Check stock availability
        if (quantity > effectiveStock) {
          // Set toast message instead of calling toast directly
          toastMessageRef.current = {
            type: 'error',
            message: `Only ${effectiveStock} items available in stock`
          };
          return prevItems;
        }
        
        // Product doesn't exist, add new item
        // Set toast message instead of calling toast directly
        toastMessageRef.current = {
          type: 'success',
          message: `Added ${product.name} to cart`
        };
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.product._id === productId);
      if (removedItem) {
        // Set toast message instead of calling toast directly
        toastMessageRef.current = {
          type: 'info',
          message: `Removed ${removedItem.product.name} from cart`
        };
      }
      return prevItems.filter((item) => item.product._id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product._id === productId) {
          // Get the effective stock (default to 10 if not provided)
          const effectiveStock = item.product.stock !== undefined ? item.product.stock : 10;
          
          // Check stock availability
          if (quantity > effectiveStock) {
            // Set toast message instead of calling toast directly
            toastMessageRef.current = {
              type: 'error',
              message: `Only ${effectiveStock} items available in stock`
            };
            return item;
          }
          
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    // Set toast message instead of calling toast directly
    toastMessageRef.current = {
      type: 'info',
      message: 'Cart cleared'
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 