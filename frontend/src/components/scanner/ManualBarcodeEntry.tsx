'use client';

import React, { useState } from 'react';

interface ManualBarcodeEntryProps {
  onSubmit: (barcode: string) => void;
  onCancel?: () => void;
  initialValue?: string;
}

export default function ManualBarcodeEntry({ onSubmit, onCancel, initialValue = '' }: ManualBarcodeEntryProps) {
  const [barcode, setBarcode] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    
    // Basic validation - barcodes are typically numeric or alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(barcode)) {
      setError('Barcode should contain only letters and numbers');
      return;
    }
    
    // Clear any errors
    setError('');
    
    // Call the onSubmit callback with the barcode
    onSubmit(barcode.trim());
    
    // Clear the input
    setBarcode('');
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Manual Barcode Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700 mb-1">
            Barcode
          </label>
          <input
            id="barcode-input"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-3 text-sm text-gray-500">
        <p>Tip: Enter the barcode number printed below the barcode.</p>
      </div>
    </div>
  );
} 