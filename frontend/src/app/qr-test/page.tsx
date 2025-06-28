'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function QRTestPage() {
  const [qrData, setQrData] = useState('https://example.com/test');
  const [qrSize, setQrSize] = useState(240);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [qrData, qrSize]);

  const generateQRCode = async () => {
    try {
      setErrorMessage('');
      const dataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: qrSize,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrorMessage('Failed to generate QR code. Please check your input data.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Test</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="qrData" className="block text-sm font-medium text-gray-700 mb-1">
              QR Code Content
            </label>
            <input
              type="text"
              id="qrData"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="qrSize" className="block text-sm font-medium text-gray-700 mb-1">
              QR Code Size
            </label>
            <input
              type="range"
              id="qrSize"
              min="120"
              max="400"
              step="20"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{qrSize}px</div>
          </div>

          <button
            onClick={generateQRCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Regenerate QR Code
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Generated QR Code</h2>
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-4 border-black qr-container">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Test QR Code" 
                  className="mx-auto qr-code"
                  style={{ width: `${qrSize}px`, height: `${qrSize}px` }}
                />
              ) : (
                <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Loading QR code...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center text-gray-700">
            <p className="mb-2">Test your scanner by scanning the QR code above.</p>
            <p className="text-sm text-gray-500">The QR code should contain: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{qrData}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
} 