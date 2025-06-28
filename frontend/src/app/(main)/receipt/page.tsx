'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

interface ReceiptData {
  paymentId: string;
  orderId: string;
  amount: number;
  date: string;
  cardInfo: {
    last4: string;
    brand: string;
    expiryDate: string;
    cardholderName?: string;
  };
  timestamp: number;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  storeInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

export default function ReceiptPage() {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrDetail, setShowQrDetail] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get receipt data from localStorage
    const storedReceipt = localStorage.getItem('receipt_data');
    if (!storedReceipt) {
      // No receipt data, redirect to orders
      router.push('/orders');
      toast.info('No receipt data found');
      return;
    }

    try {
      const parsedReceipt = JSON.parse(storedReceipt);
      
      // Check if receipt is older than 30 minutes (1800000 ms)
      const now = Date.now();
      if (now - parsedReceipt.timestamp > 1800000) {
        localStorage.removeItem('receipt_data');
        router.push('/orders');
        toast.info('Receipt has expired');
        return;
      }
      
      setReceiptData(parsedReceipt);

      // Generate QR code data
      const qrData = JSON.stringify({
        exitTicket: true,
        orderId: parsedReceipt.orderId,
        paymentId: parsedReceipt.paymentId,
        timestamp: parsedReceipt.timestamp,
        amount: parsedReceipt.amount,
        customerId: user?.id || 'guest',
        items: parsedReceipt.items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price
        })) || []
      });
      
      setQrValue(qrData);
      
      // Generate QR code as data URL
      generateQRCode(qrData);
    } catch (error) {
      console.error('Error parsing receipt data:', error);
      localStorage.removeItem('receipt_data');
      router.push('/orders');
      toast.error('Invalid receipt data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, user?.id]);

  // Generate QR code as data URL
  const generateQRCode = async (data: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handlePrint = () => {
    window.print();
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

  // Toggle QR detail view
  const toggleQrDetail = () => {
    setShowQrDetail(!showQrDetail);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Receipt Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any receipt data.</p>
          <Link 
            href="/orders" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 receipt-page">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Purchase Receipt</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center justify-center print:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Receipt
          </button>
          <Link 
            href="/orders"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium flex items-center justify-center print:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>

      {/* Receipt Card */}
      <div ref={printRef} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Purchase Receipt</h2>
              <p className="text-blue-100">Thank you for your purchase!</p>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-xl font-bold">{receiptData.storeInfo?.name || 'Buying Queue Solver'}</span>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="p-6">
          {/* Store Information */}
          {receiptData.storeInfo && (
            <div className="mb-6 text-center">
              <p className="font-medium text-gray-800">{receiptData.storeInfo.address}</p>
              <p className="font-medium text-gray-800">{receiptData.storeInfo.phone} | {receiptData.storeInfo.email}</p>
              <p className="font-medium text-gray-800">{receiptData.storeInfo.website}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">Order Information</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex justify-between">
                  <span className="font-bold">Order ID:</span> 
                  <span className="font-medium text-gray-900">{receiptData.orderId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold">Payment ID:</span> 
                  <span className="font-medium text-gray-900">{receiptData.paymentId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold">Date:</span> 
                  <span className="font-medium text-gray-900">{formatDate(receiptData.date)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold">Payment Method:</span> 
                  <span className="font-medium text-gray-900">
                    {receiptData.cardInfo.brand} •••• {receiptData.cardInfo.last4}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">Customer Information</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex justify-between">
                  <span className="font-bold">Name:</span> 
                  <span className="font-medium text-gray-900">{user?.name || 'Guest'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold">Email:</span> 
                  <span className="font-medium text-gray-900">{user?.email || 'Not provided'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold">Transaction Time:</span> 
                  <span className="font-medium text-gray-900">
                    {new Date(receiptData.timestamp).toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Purchased Items */}
          {receiptData.items && receiptData.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">Purchased Items</h3>
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receiptData.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        Subtotal:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        ${(receiptData.amount / 1.08).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        Tax (8%):
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        ${(receiptData.amount - (receiptData.amount / 1.08)).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={3} className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-base font-bold text-blue-700 text-right">
                        ${receiptData.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Exit Ticket QR Code */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Store Exit Ticket</h3>
              </div>
              <p className="text-gray-700 font-medium mb-4 max-w-lg mx-auto">
                Please show this QR code to the staff when leaving the store. 
                This serves as proof of purchase and will be scanned at the exit.
              </p>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-4 border-black qr-container">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Exit QR Code" 
                      className="mx-auto qr-code"
                      style={{ width: '240px', height: '240px' }}
                    />
                  ) : (
                    <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Loading QR code...</p>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={toggleQrDetail}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mx-auto print:hidden"
              >
                {showQrDetail ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Hide QR Code Details
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    View QR Code Details
                  </>
                )}
              </button>
              
              {showQrDetail && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 text-left max-w-lg mx-auto">
                  <h4 className="font-bold text-gray-900 mb-2">QR Code Contents:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto text-gray-800 border border-gray-200">
                    {JSON.stringify(JSON.parse(qrValue), null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex items-center justify-center mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 text-sm font-medium">
                  This exit ticket is valid for 30 minutes after purchase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 text-center border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-700 font-medium">
                Thank you for shopping with us!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                For any questions, please contact our customer support
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-700 font-medium">{receiptData.storeInfo?.name || 'Buying Queue Solver'}</p>
              <p className="text-gray-500 text-sm">{receiptData.storeInfo?.email || 'support@buyingqueuesolver.com'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-xs">
              Receipt ID: {receiptData.paymentId} • Generated on {new Date(receiptData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 