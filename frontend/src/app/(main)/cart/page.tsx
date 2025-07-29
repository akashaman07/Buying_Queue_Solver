'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import PaymentButton from '@/components/ui/PaymentButton';
import { toast } from 'react-toastify';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [orderId, setOrderId] = useState<string>(`order_${Date.now()}`);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'customer' && user?.role !== 'admin') {
      router.push('/dashboard');
      toast.error('Access Restricted: Only customers and admins can access the shopping cart.');
    }
  }, [isAuthenticated, user, router]);

  // Show access denied for non-customers and non-admins
  if (isAuthenticated && user?.role !== 'customer' && user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Shopping cart is only available for customers and admins. As a {user?.role}, you can manage inventory and orders from your dashboard.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    // Update receipt data with cart items
    const storedReceipt = localStorage.getItem('receipt_data');
    
    if (storedReceipt) {
      try {
        const receiptData = JSON.parse(storedReceipt);
        
        // Add cart items to receipt data
        receiptData.items = items.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.finalPrice !== undefined ? item.product.finalPrice : item.product.price,
          quantity: item.quantity,
          total: (item.product.finalPrice !== undefined ? item.product.finalPrice : item.product.price) * item.quantity
        }));
        
        localStorage.setItem('receipt_data', JSON.stringify(receiptData));

        // Save to order history
        saveToOrderHistory(receiptData);
      } catch (error) {
        console.error('Error updating receipt data with items:', error);
      }
    }
    
    // Clear the cart
    clearCart();
    
    // Redirect to receipt page
    router.push('/receipt');
  };

  // Save purchase to order history
  const saveToOrderHistory = (receiptData: any) => {
    try {
      // First check if user_orders exists at all
      const storedOrders = localStorage.getItem('user_orders');
      
      // If there's no user_orders key, it might have been cleared
      // Create a new array to store orders
      let existingOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Create order object
      const newOrder = {
        id: `order-${receiptData.timestamp}`,
        date: new Date(receiptData.timestamp).toISOString(),
        timestamp: receiptData.timestamp,
        status: 'Completed',
        total: receiptData.amount,
        items: receiptData.items || [],
        paymentId: receiptData.paymentId
      };
      
      // Check if order already exists
      const orderExists = existingOrders.some((order: any) => order.id === newOrder.id);
      
      if (!orderExists) {
        // Add new order to the beginning of the array
        existingOrders.unshift(newOrder);
        
        // Save updated orders
        localStorage.setItem('user_orders', JSON.stringify(existingOrders));
        
        // Dispatch storage event to notify other pages
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Error saving order to history:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <button 
            onClick={() => router.push('/scan')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Start Scanning Products
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get image URL
  const getImageUrl = (item: any) => {
    if (item.product.imageUrl) {
      return item.product.imageUrl;
    } else if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0];
    }
    return '/placeholder-product.jpg';
  };

  // Helper function to get product price
  const getProductPrice = (item: any) => {
    return item.product.finalPrice !== undefined ? item.product.finalPrice : item.product.price;
  };

  const tax = totalAmount * 0.08; // 8% tax
  const total = totalAmount + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image 
                              src={getImageUrl(item)} 
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-sm text-gray-500">ID: {item.product._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${getProductPrice(item).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-md hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="bg-gray-100 text-gray-700 px-4 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-md hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${(getProductPrice(item) * item.quantity).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => removeItem(item.product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h2>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800 font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="text-gray-800 font-medium">${tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-200 my-4"></div>
            
            <div className="flex justify-between mb-6">
              <span className="text-gray-800 font-semibold">Total</span>
              <span className="text-gray-900 font-bold">${total.toFixed(2)}</span>
            </div>
            
            <PaymentButton 
              orderId={orderId}
              amount={parseFloat(total.toFixed(2))}
              onSuccess={handlePaymentSuccess}
            />
            
            <button 
              onClick={() => router.push('/scan')}
              className="mt-4 w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add More Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}