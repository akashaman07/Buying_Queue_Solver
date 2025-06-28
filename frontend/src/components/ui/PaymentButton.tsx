'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError?: (error: any) => void;
}

export default function PaymentButton({ orderId, amount, onSuccess, onError }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Demo payment cards for quick selection
  const demoCards = [
    {
      cardNumber: '4242 4242 4242 4242',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'Demo User',
      type: 'Visa'
    },
    {
      cardNumber: '5555 5555 5555 4444',
      expiryDate: '10/26',
      cvv: '321',
      cardholderName: 'Demo User',
      type: 'Mastercard'
    }
  ];

  const selectDemoCard = (card: typeof demoCards[0]) => {
    setCardDetails(card);
  };

  const handlePayment = async () => {
    setShowModal(true);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        throw new Error('Please fill in all card details');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock payment data
      const mockPaymentData = {
        id: `pay_${Date.now()}`,
        orderId,
        amount,
        status: 'completed',
        cardInfo: {
          last4: cardDetails.cardNumber.slice(-4),
          brand: cardDetails.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
          expiryDate: cardDetails.expiryDate,
          cardholderName: cardDetails.cardholderName
        },
        createdAt: new Date().toISOString()
      };

      toast.success('Payment successful!');
      setShowModal(false);
      
      // Store receipt data in localStorage for the receipt page
      localStorage.setItem('receipt_data', JSON.stringify({
        paymentId: mockPaymentData.id,
        orderId: mockPaymentData.orderId,
        amount: mockPaymentData.amount,
        date: mockPaymentData.createdAt,
        cardInfo: {
          last4: mockPaymentData.cardInfo.last4,
          brand: mockPaymentData.cardInfo.brand,
          expiryDate: mockPaymentData.cardInfo.expiryDate,
          cardholderName: mockPaymentData.cardInfo.cardholderName
        },
        timestamp: Date.now(),
        storeInfo: {
          name: 'Buying Queue Solver',
          address: '123 Shopping Mall, Main Street',
          phone: '+1 (555) 123-4567',
          email: 'support@buyingqueuesolver.com',
          website: 'www.buyingqueuesolver.com'
        }
      }));
      
      onSuccess(mockPaymentData);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 rounded-md text-white font-bold text-lg ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount)}`
        )}
      </button>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-800 mb-2 font-medium">Amount to pay: <span className="font-bold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}</span></p>
              <p className="text-gray-700 text-sm font-medium">Order ID: {orderId}</p>
            </div>

            <div className="mb-4">
              <p className="font-bold text-gray-900 mb-2">Quick select demo card:</p>
              <div className="flex gap-2 mb-4">
                {demoCards.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => selectDemoCard(card)}
                    className={`px-4 py-2 border-2 rounded-md flex items-center gap-2 shadow-sm ${
                      card.cardNumber === cardDetails.cardNumber 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {card.type === 'Visa' ? (
                      <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded">Visa</div>
                    ) : (
                      <div className="bg-red-600 text-white font-bold px-2 py-1 rounded">MC</div>
                    )}
                    <span className="text-gray-900 font-medium">•••• {card.cardNumber.slice(-4)}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={processPayment}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardDetails.cardholderName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-2 px-4 py-2 border-2 border-gray-300 text-gray-800 font-bold rounded-md hover:bg-gray-100"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-700 text-center bg-gray-50 p-2 rounded-md border border-gray-200">
              <p className="font-medium">This is a demo payment form. No real payments will be processed.</p>
              <p className="font-medium">Use any of the demo cards above for testing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 