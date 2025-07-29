'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

interface Order {
  id: string;
  date: string;
  timestamp: number;
  status: string;
  total: number;
  items: OrderItem[];
  paymentId?: string;
}

// Order retention period in milliseconds
const ORDER_RETENTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
const RECENT_ORDER_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    // Restrict access to customers and admins only
    if (user?.role !== 'customer' && user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Load orders from localStorage and check for recent purchases
    loadOrders();

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, router, isLoading]);

  // Handle storage changes (when orders are cleared from another page)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'user_orders' || event.key === null) {
      loadOrders();
    }
  };

  const loadOrders = () => {
    if (!isAuthenticated) return;

    try {
      // Check for receipt data (current purchase)
      const storedReceipt = localStorage.getItem('receipt_data');
      let currentPurchase: Order | null = null;

      if (storedReceipt) {
        const receiptData = JSON.parse(storedReceipt);
        
        // Create order from receipt data
        currentPurchase = {
          id: `order-${receiptData.timestamp}`,
          date: new Date(receiptData.timestamp).toISOString(),
          timestamp: receiptData.timestamp,
          status: 'Completed',
          total: receiptData.amount,
          items: receiptData.items || [],
          paymentId: receiptData.paymentId
        };
      }

      // Load existing orders from localStorage
      const storedOrders = localStorage.getItem('user_orders');
      let existingOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Filter out expired orders
      const now = Date.now();
      existingOrders = existingOrders.filter(order => 
        (now - order.timestamp) <= ORDER_RETENTION_PERIOD
      );

      // Add current purchase if it doesn't exist already
      if (currentPurchase) {
        const orderExists = existingOrders.some(order => order.id === currentPurchase?.id);
        if (!orderExists) {
          existingOrders.unshift(currentPurchase);
          
          // Save updated orders to localStorage
          localStorage.setItem('user_orders', JSON.stringify(existingOrders));
          
          toast.info('Your recent purchase has been added to your order history');
        }
      }

      // Sort orders by date (newest first)
      existingOrders.sort((a, b) => b.timestamp - a.timestamp);
      
      setOrders(existingOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Add some mock orders if none exist
      if (orders.length === 0) {
        setOrders(getMockOrders());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get mock orders
  const getMockOrders = (): Order[] => {
    const now = Date.now();
    return [
      {
        id: 'order-1',
        date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        timestamp: now - 2 * 24 * 60 * 60 * 1000,
        status: 'Delivered',
        total: 149.97,
        items: [
          { id: 'item-1', name: 'Smartphone X', quantity: 1, price: 99.99, total: 99.99 },
          { id: 'item-2', name: 'Wireless Headphones', quantity: 1, price: 49.98, total: 49.98 }
        ]
      },
      {
        id: 'order-2',
        date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        timestamp: now - 7 * 24 * 60 * 60 * 1000,
        status: 'Processing',
        total: 89.99,
        items: [
          { id: 'item-3', name: 'Smart Watch', quantity: 1, price: 89.99, total: 89.99 }
        ]
      }
    ];
  };

  // Helper function to determine if an order is recent
  const isRecentOrder = (timestamp: number): boolean => {
    return (Date.now() - timestamp) < RECENT_ORDER_THRESHOLD;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View receipt for a specific order
  const viewReceipt = (order: Order) => {
    // Store the order data in localStorage for receipt page
    const receiptData = {
      paymentId: order.paymentId || `pay_${order.id}`,
      orderId: order.id,
      amount: order.total,
      date: order.date,
      cardInfo: {
        last4: '1234',
        brand: 'Visa',
        expiryDate: '12/25'
      },
      timestamp: order.timestamp,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total || (item.price * item.quantity)
      }))
    };
    
    localStorage.setItem('receipt_data', JSON.stringify(receiptData));
    router.push('/receipt');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your orders</h2>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 orders-page">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div 
              key={order.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                isRecentOrder(order.timestamp) ? 'border-2 border-blue-400' : ''
              }`}
            >
              {isRecentOrder(order.timestamp) && (
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                  <p className="text-blue-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Recent Purchase
                  </p>
                </div>
              )}
              
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                    <p className="text-gray-700 font-medium">Placed on {formatDate(order.date)}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-700 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-800">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg text-gray-800">Total</p>
                    <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => viewReceipt(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                      </svg>
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
              
              {isRecentOrder(order.timestamp) && (
                <div className="bg-blue-50 px-6 py-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Note:</span> This order will be available in your history for 30 days.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2 text-gray-900">You haven't placed any orders yet</h2>
          <p className="text-gray-700 font-medium mb-6">Browse our products and place your first order!</p>
          <Link 
            href="/products" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Shop Now
          </Link>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold mb-2 text-gray-800">Order History Information</h2>
        <p className="text-gray-700">
          Your order history is stored for 30 days. After that period, older orders will be automatically removed from your history.
        </p>
        <p className="text-gray-700 mt-2">
          Recent purchases (within the last 24 hours) are highlighted in blue.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            href="/test-orders" 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
            Test Order Expiration
          </Link>
        </div>
      </div>
    </div>
  );
}