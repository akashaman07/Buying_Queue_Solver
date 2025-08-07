'use client';

import React, { useState, useEffect, useRef } from 'react';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ManualBarcodeEntry from '@/components/scanner/ManualBarcodeEntry';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '@/components/ui/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { stopAllCameraStreams, setupCameraCleanupListeners } from '@/lib/utils/cameraUtils';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Debounce timer for barcode processing
  const processingRef = useRef(false);
  // Check for barcode in URL parameters
  const searchParams = useSearchParams();
  
  // Process barcode from URL if present
  useEffect(() => {
    const urlBarcode = searchParams.get('barcode');
    if (urlBarcode && isMountedRef.current && !processingRef.current) {
      processBarcode(urlBarcode);
    }
  }, [searchParams]);

  // Set mounted ref on mount and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Set up camera cleanup listeners
    const cleanupListeners = setupCameraCleanupListeners();
    
    return () => {
      isMountedRef.current = false;
      
      // Make sure camera is stopped when component unmounts
      setIsScanning(false);
      stopAllCameraStreams();
      
      // Clean up event listeners
      cleanupListeners();
    };
  }, []);
  
  // Ensure we clean up camera resources when navigating away
  useEffect(() => {
    // Add event listener for beforeunload to clean up camera
    const handleBeforeUnload = () => {
      setIsScanning(false);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleScanStart = () => {
    setIsScanning(true);
    setError(null);
    setShowManualEntry(false);
  };

  const handleScanStop = () => {
    setIsScanning(false);
  };

  const processBarcode = async (barcode: string) => {
    // Prevent multiple simultaneous processing of the same barcode
    if (processingRef.current) return;
    
    processingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Store the scanned barcode
    setLastScannedBarcode(barcode);

    try {
      const response = await productsAPI.getProductByBarcode(barcode);
      if (isMountedRef.current) {
        setScannedProduct(response.data);
        toast.success('Product found!');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      
      if (!isMountedRef.current) return;
      
      // If product not found, offer to create a new one
      if (error.response?.status === 404) {
        toast.info(`Product with barcode ${barcode} not found. Redirecting to product creation.`);
        // Redirect to product creation page with the barcode
        router.push(`/products/new?barcode=${barcode}`);
      } else {
        const errorMessage = error.response?.data?.message || `Error scanning product. Please try again.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      // Reset processing flag after a short delay to prevent rapid repeated scans
      setTimeout(() => {
        processingRef.current = false;
      }, 1000);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Immediately stop scanning when barcode is detected
    setIsScanning(false);
    
    // Force stop all camera streams
    stopAllCameraStreams();
    
    // Process the barcode
    processBarcode(barcode);
    
    // Double-check after a short delay that camera is really off
    setTimeout(stopAllCameraStreams, 1000);
  };

  const handleManualSubmit = (barcode: string) => {
    processBarcode(barcode);
    setShowManualEntry(false);
  };

  const handleAddToCart = () => {
    if (scannedProduct) {
      addItem(scannedProduct);
      toast.success(`${scannedProduct.name} added to cart!`);
    }
  };

  const handleAddToInventory = async () => {
    if (scannedProduct) {
      try {
        // Update product stock by adding the specified quantity
        const updatedProduct = {
          ...scannedProduct,
          stock: (parseInt(scannedProduct.stock) || 0) + quantityToAdd
        };
        
        console.log('Updating product with ID:', scannedProduct._id);
        console.log('Updated product data:', updatedProduct);
        
        // Make the API call to update the product
        const result = await productsAPI.updateProduct(scannedProduct._id, updatedProduct);
        console.log('Update result:', result);
        
        // Update the local scannedProduct state with the new stock value
        setScannedProduct({
          ...scannedProduct,
          stock: (parseInt(scannedProduct.stock) || 0) + quantityToAdd
        });
        
        toast.success(`Added ${quantityToAdd} units of ${scannedProduct.name} to inventory!`);
        
        // Don't reset immediately to show the updated stock
        setTimeout(() => {
          // Reset for next scan
          setScannedProduct(null);
          setQuantityToAdd(1);
          setIsScanning(true);
        }, 2000); // Show the updated stock for 2 seconds before resetting
      } catch (error) {
        console.error('Error updating inventory:', error);
        toast.error('Failed to update inventory. Please try again.');
      }
    }
  };

  const handleScanAgain = () => {
    setScannedProduct(null);
    setError(null);
    setIsScanning(true);
    setShowManualEntry(false);
  };

  const handleAddNewProduct = () => {
    if (lastScannedBarcode) {
      router.push(`/products/new?barcode=${lastScannedBarcode}`);
    } else {
      toast.error('No barcode scanned. Please scan a barcode first.');
    }
  };

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    if (isScanning) {
      setIsScanning(false);
    }
  };

  const handleScanError = (error: any) => {
    console.error('Scanner error:', error);
    setError('Error accessing camera. Please check permissions and try again.');
    toast.error('Error accessing camera. Please check permissions and try again.');
    // Ensure scanning state is turned off on error
    setIsScanning(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 scan-page">
      <h1 className="text-3xl font-bold mb-6">Scan Products</h1>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isLoading && !scannedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Scan a Product Barcode</h2>
            <p className="text-gray-600">
              {user?.role === 'customer' 
                ? 'Position the barcode within the scanner view to add products to your cart.'
                : (user?.role === 'seller' || user?.role === 'admin')
                ? 'Position the barcode within the scanner view to add products to inventory.'
                : 'Position the barcode within the scanner view to scan products.'}
              {' '}If the product is not found, you'll be redirected to create a new one.
            </p>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={toggleManualEntry}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {showManualEntry ? 'Hide Manual Entry' : 'Enter Barcode Manually'}
              </button>
            </div>
          </div>

          {showManualEntry && (
            <div className="mb-6">
              <ManualBarcodeEntry 
                onSubmit={handleManualSubmit} 
                onCancel={toggleManualEntry} 
                initialValue={lastScannedBarcode || ''}
              />
            </div>
          )}

          {isScanning ? (
            <BarcodeScanner 
              onDetected={handleBarcodeDetected} 
              onError={handleScanError}
              autoClose={true} 
            />
          ) : (
            !showManualEntry && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">Ready to scan products</p>
                <button
                  onClick={handleScanStart}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 scan-button"
                >
                  Start Scanner
                </button>
              </div>
            )
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              <p>{error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lastScannedBarcode && (
                  <button
                    onClick={handleAddNewProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add New Product
                  </button>
                )}
                <button
                  onClick={toggleManualEntry}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Enter Barcode Manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && scannedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scanned Product</h2>
          
          <div className="mb-6">
            <ProductCard product={scannedProduct} />
          </div>

          {(user?.role === 'seller' || user?.role === 'admin') && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Add to Inventory:
              </label>
              <input
                type="number"
                min="1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current stock: {scannedProduct.stock || 0} units
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {user?.role === 'customer' ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add to Cart
              </button>
            ) : (user?.role === 'seller' || user?.role === 'admin') ? (
              <button
                onClick={handleAddToInventory}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add to Inventory
              </button>
            
            ) : (
              <button
                onClick={() => toast.info('Please log in to perform actions')}
                className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed"
                disabled
              >
                Login Required
              </button>
            )}
            <button
              onClick={handleScanAgain}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Scan Another Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}