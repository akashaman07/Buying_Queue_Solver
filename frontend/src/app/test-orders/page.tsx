'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  date: string;
  timestamp: number;
  status: string;
  total: number;
  items: OrderItem[];
  paymentId: string;
}

// Order retention period in milliseconds
const ORDER_RETENTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

export default function TestOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const storedOrders = localStorage.getItem('user_orders');
      const existingOrders = storedOrders ? JSON.parse(storedOrders) : [];
      setOrders(existingOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestOrders = () => {
    const now = Date.now();
    const testOrders: Order[] = [
      // Recent order (1 hour ago)
      {
        id: `order-${now - 1 * 60 * 60 * 1000}`,
        date: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        timestamp: now - 1 * 60 * 60 * 1000,
        status: 'Completed',
        total: 149.97,
        paymentId: `pay_${now - 1 * 60 * 60 * 1000}`,
        items: [
          { id: 'item-1', name: 'Smartphone X', quantity: 1, price: 99.99, total: 99.99 },
          { id: 'item-2', name: 'Wireless Headphones', quantity: 1, price: 49.98, total: 49.98 }
        ]
      },
      // Order from 3 days ago
      {
        id: `order-${now - 3 * 24 * 60 * 60 * 1000}`,
        date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: now - 3 * 24 * 60 * 60 * 1000,
        status: 'Delivered',
        total: 89.99,
        paymentId: `pay_${now - 3 * 24 * 60 * 60 * 1000}`,
        items: [
          { id: 'item-3', name: 'Smart Watch', quantity: 1, price: 89.99, total: 89.99 }
        ]
      },
      // Order from 15 days ago
      {
        id: `order-${now - 15 * 24 * 60 * 60 * 1000}`,
        date: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: now - 15 * 24 * 60 * 60 * 1000,
        status: 'Delivered',
        total: 129.99,
        paymentId: `pay_${now - 15 * 24 * 60 * 60 * 1000}`,
        items: [
          { id: 'item-4', name: 'Bluetooth Speaker', quantity: 1, price: 129.99, total: 129.99 }
        ]
      },
      // Order from 29 days ago (almost expired)
      {
        id: `order-${now - 29 * 24 * 60 * 60 * 1000}`,
        date: new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: now - 29 * 24 * 60 * 60 * 1000,
        status: 'Delivered',
        total: 59.99,
        paymentId: `pay_${now - 29 * 24 * 60 * 60 * 1000}`,
        items: [
          { id: 'item-5', name: 'Fitness Tracker', quantity: 1, price: 59.99, total: 59.99 }
        ]
      },
      // Order from 31 days ago (should be expired)
      {
        id: `order-${now - 31 * 24 * 60 * 60 * 1000}`,
        date: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: now - 31 * 24 * 60 * 60 * 1000,
        status: 'Delivered',
        total: 199.99,
        paymentId: `pay_${now - 31 * 24 * 60 * 60 * 1000}`,
        items: [
          { id: 'item-6', name: 'Gaming Console', quantity: 1, price: 199.99, total: 199.99 }
        ]
      },
    ];

    // Save to localStorage
    localStorage.setItem('user_orders', JSON.stringify(testOrders));
    setOrders(testOrders);
    toast.success('Test orders generated successfully');
  };

  const clearAllOrders = () => {
    localStorage.removeItem('user_orders');
    setOrders([]);
    toast.info('All orders cleared');
    
    // Also remove receipt data to ensure it doesn't get re-added
    localStorage.removeItem('receipt_data');
    
    // Dispatch storage event to notify other pages
    window.dispatchEvent(new Event('storage'));
    
    // Force navigation to orders page to ensure it refreshes
    router.push('/orders');
  };

  const simulateExpiration = () => {
    const now = Date.now();
    const filteredOrders = orders.filter(order => 
      (now - order.timestamp) <= ORDER_RETENTION_PERIOD
    );
    
    localStorage.setItem('user_orders', JSON.stringify(filteredOrders));
    setOrders(filteredOrders);
    
    const expiredCount = orders.length - filteredOrders.length;
    if (expiredCount > 0) {
      toast.info(`${expiredCount} expired order(s) removed`);
    } else {
      toast.info('No orders have expired yet');
    }
  };

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

  const getDaysAgo = (timestamp: number) => {
    const now = Date.now();
    const diffDays = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) {
      const diffHours = Math.floor((now - timestamp) / (60 * 60 * 1000));
      return diffHours <= 1 ? 'Less than an hour ago' : `${diffHours} hours ago`;
    }
    
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  const getDaysUntilExpiration = (timestamp: number) => {
    const now = Date.now();
    const expirationDate = timestamp + ORDER_RETENTION_PERIOD;
    const daysLeft = Math.ceil((expirationDate - now) / (24 * 60 * 60 * 1000));
    
    return daysLeft <= 0 ? 'Expired' : 
           daysLeft === 1 ? '1 day left' : 
           `${daysLeft} days left`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order History Test</h1>
        <Link 
          href="/orders"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateTestOrders}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            Generate Test Orders
          </button>
          <button
            onClick={simulateExpiration}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
          >
            Simulate Expiration Check
          </button>
          <button
            onClick={clearAllOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Clear All Orders
          </button>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Current Orders ({orders.length})</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Expires In
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {getDaysAgo(order.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getDaysUntilExpiration(order.timestamp) === 'Expired' ? 'bg-red-100 text-red-800' :
                        parseInt(getDaysUntilExpiration(order.timestamp)) < 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getDaysUntilExpiration(order.timestamp)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-700 text-center py-8">No orders found. Generate test orders to see them here.</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-2 text-gray-800">About This Test Page</h2>
        <p className="text-gray-700 mb-2">
          This page demonstrates the order history expiration functionality. Orders older than 30 days are automatically removed.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li><strong>Generate Test Orders</strong> - Creates sample orders with various timestamps</li>
          <li><strong>Simulate Expiration Check</strong> - Removes orders older than 30 days</li>
          <li><strong>Clear All Orders</strong> - Removes all orders from storage</li>
        </ul>
      </div>
    </div>
  );
} 