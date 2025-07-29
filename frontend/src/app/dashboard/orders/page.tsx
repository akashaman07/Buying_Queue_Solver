'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { toast } from 'react-toastify';

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  items?: Array<{name: string, quantity: number, price: number}>;
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a seller/admin
    if (!isLoading && (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin'))) {
      router.push('/login');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, user, router, isLoading]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // In a production app, we would fetch from the API
      // const response = await ordersAPI.getAllOrders();
      // setOrders(response.data);
      
      // Using mock data for now
      const mockOrders = [
        {
          id: 'ORD-2025-001',
          customer: 'John Doe',
          date: '2025-06-27',
          amount: 149.99,
          status: 'Delivered',
          items: [
            {name: 'Wireless Headphones', quantity: 1, price: 149.99}
          ]
        },
        {
          id: 'ORD-2025-002',
          customer: 'Jane Smith',
          date: '2025-06-26',
          amount: 89.99,
          status: 'Processing',
          items: [
            {name: 'T-shirt', quantity: 3, price: 29.99}
          ]
        },
        {
          id: 'ORD-2025-003',
          customer: 'Robert Johnson',
          date: '2025-06-25',
          amount: 299.99,
          status: 'Shipped',
          items: [
            {name: 'Smartphone X', quantity: 1, price: 299.99}
          ]
        },
        {
          id: 'ORD-2025-004',
          customer: 'Emily Wilson',
          date: '2025-06-24',
          amount: 199.99,
          status: 'Delivered',
          items: [
            {name: 'Wireless Headphones', quantity: 1, price: 149.99},
            {name: 'T-shirt', quantity: 1, price: 29.99},
            {name: 'Banana', quantity: 20, price: 0.99}
          ]
        },
        {
          id: 'ORD-2025-005',
          customer: 'Michael Brown',
          date: '2025-06-23',
          amount: 129.99,
          status: 'Processing',
          items: [
            {name: 'Wireless Headphones', quantity: 1, price: 129.99}
          ]
        },
        {
          id: 'ORD-2025-006',
          customer: 'Sarah Johnson',
          date: '2025-06-15',
          amount: 79.99,
          status: 'Cancelled',
          items: [
            {name: 'T-shirt', quantity: 2, price: 39.99}
          ]
        },
        {
          id: 'ORD-2025-007',
          customer: 'David Lee',
          date: '2025-06-10',
          amount: 249.99,
          status: 'Delivered',
          items: [
            {name: 'Smartphone X', quantity: 1, price: 249.99}
          ]
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter === 'custom' && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    } else if (dateFilter === 'last7days') {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= sevenDaysAgo;
      });
    } else if (dateFilter === 'last30days') {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= thirtyDaysAgo;
      });
    }
    
    setFilteredOrders(result);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter, dateRange]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setUpdatedStatus(order.status);
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      // In a real app, you would call the API
      // await ordersAPI.updateOrderStatus(selectedOrder.id, updatedStatus);
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id ? { ...order, status: updatedStatus } : order
      );
      
      setOrders(updatedOrders);
      applyFilters(); // Re-apply filters to update filtered orders
      toast.success(`Order ${selectedOrder.id} status updated to ${updatedStatus}`);
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Access Required</h2>
          <p className="text-gray-800 font-medium mb-6">You need to be logged in as a seller or admin to access this page.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative z-10">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-8"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {dateFilter === 'custom' && (
        <div className="mb-6 flex items-center space-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' : 
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-red-100 text-red-800 border border-red-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleUpdateOrder(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found matching the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-auto">
            <div className="flex justify-between items-center border-b p-6 bg-gray-200 rounded-t-lg">
              <h3 className="text-xl font-bold text-black">Order Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-black hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 bg-white">
              {/* Order Summary Card */}
              <div className="bg-gray-200 border border-gray-300 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-black">#{selectedOrder.id}</h4>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                    ${selectedOrder.status === 'Delivered' ? 'bg-green-200 text-black border border-green-500' : 
                      selectedOrder.status === 'Processing' ? 'bg-yellow-200 text-black border border-yellow-500' :
                      selectedOrder.status === 'Shipped' ? 'bg-blue-200 text-black border border-blue-500' :
                      'bg-red-200 text-black border border-red-500'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-black">Customer</p>
                    <p className="font-semibold text-black">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Order Date</p>
                    <p className="font-semibold text-black">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Total Amount</p>
                    <p className="font-bold text-lg text-black">${selectedOrder.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Payment Method</p>
                    <p className="font-semibold text-black">Credit Card</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items Section */}
              <div>
                <h4 className="text-lg font-bold text-black mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Order Items
                </h4>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-200">
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                          Order Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                          ${selectedOrder.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Shipping Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
                  <h5 className="font-bold text-black mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Shipping Address
                  </h5>
                  <p className="text-sm text-black">123 Main Street</p>
                  <p className="text-sm text-black">Apt 4B</p>
                  <p className="text-sm text-black">New York, NY 10001</p>
                  <p className="text-sm text-black">United States</p>
                </div>
                
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
                  <h5 className="font-bold text-black mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    Payment Information
                  </h5>
                  <p className="text-sm text-black">Payment Method: Credit Card</p>
                  <p className="text-sm text-black">Card: •••• •••• •••• 4242</p>
                  <p className="text-sm text-black">Payment Status: Paid</p>
                  <p className="text-sm text-black">Transaction ID: TXN-{selectedOrder.id.slice(-4)}</p>
                </div>
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-2 bg-gray-200 rounded-b-lg">
              <button
                onClick={() => handleUpdateOrder(selectedOrder)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Modal */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="flex justify-between items-center border-b p-4 bg-gray-200 rounded-t-lg">
              <h3 className="text-lg font-bold text-black">Update Order Status</h3>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-black hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-black">
                Update the status for order <span className="font-bold">#{selectedOrder.id}</span>
              </p>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-black mb-1">
                  Order Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={updatedStatus}
                    onChange={(e) => setUpdatedStatus(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-8 text-black"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-2 bg-gray-200 rounded-b-lg">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 font-medium"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
