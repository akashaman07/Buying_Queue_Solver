'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import { productsAPI, checkBackendStatus } from '@/lib/api';
import { toast } from 'react-toastify';

// Component to display when backend API connection is missing
const BackendConnectionWarning = () => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          <strong>Backend API connection is required.</strong> Make sure your backend server is running and Cloudinary is configured in the backend environment.
        </p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
          # In backend/.env file:<br/>
          CLOUDINARY_CLOUD_NAME=your_cloud_name<br/>
          CLOUDINARY_API_KEY=your_api_key<br/>
          CLOUDINARY_API_SECRET=your_api_secret
        </pre>
        <p className="mt-2 text-sm text-yellow-700">
          See the README for detailed setup instructions.
        </p>
      </div>
    </div>
  </div>
);

export default function AddNewProductPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scanningMode, setScanningMode] = useState<'initial' | 'scanning' | 'product_found' | 'product_not_found'>('initial');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [existingProduct, setExistingProduct] = useState<any>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [backendConnected, setBackendConnected] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    barcode: ''
  });

  // Check backend connection when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkBackendStatus();
        setBackendConnected(status.connected);
      } catch (error) {
        console.error('Backend connection error:', error);
        setBackendConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be where we'd submit to the API
    toast.success('Product added successfully! (This is a demo)');
    // Reset form and state
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      barcode: ''
    });
    setScannedBarcode('');
    setExistingProduct(null);
    setProductImage(null);
    setScanningMode('initial');
  };

  useEffect(() => {
    // Redirect if not authenticated or not a seller/admin
    if (!isLoading && (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin'))) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router, isLoading]);

  const handleBarcodeDetected = async (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
    
    try {
      // Check if product exists in database
      const response = await productsAPI.getProductByBarcode(barcode);
      
      // If we get here, product was found
      setExistingProduct(response.data);
      setScanningMode('product_found');
      toast.info(`Product with barcode ${barcode} already exists in the database`);
      
      // Pre-fill form with existing product data
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        price: response.data.price?.toString() || '',
        category: response.data.category || '',
        stock: response.data.stock?.toString() || '',
        image: response.data.images?.[0] || '',
        barcode: barcode
      });
      
    } catch (error: any) {
      // Product not found, continue with adding a new product
      if (error.response && error.response.status === 404) {
        setScanningMode('product_not_found');
        setFormData(prev => ({
          ...prev,
          barcode: barcode
        }));
        toast.info(`No product found with barcode ${barcode}. You can add this as a new product.`);
      } else {
        // Some other error occurred
        toast.error('Error checking barcode: ' + (error.message || 'Unknown error'));
        setScanningMode('initial');
      }
    }
  };

  const startCamera = async () => {
    setIsTakingPhoto(true);
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setProductImage(imageDataUrl);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsTakingPhoto(false);
      }
    }
  };

  const resetCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsTakingPhoto(false);
    setProductImage(null);
  };

  const startOver = () => {
    setScannedBarcode('');
    setExistingProduct(null);
    setProductImage(null);
    setScanningMode('initial');
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      barcode: ''
    });
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
    <div className="container mx-auto px-4 py-8 relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {!backendConnected && <BackendConnectionWarning />}
        
        {scanningMode === 'initial' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Start by Scanning a Barcode</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              First, scan the product barcode to check if it already exists in our database. 
              If it does, you can update the inventory. If not, you'll be able to add it as a new product.
            </p>
            <button
              onClick={() => {
                setShowScanner(true);
                setScanningMode('scanning');
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold text-lg flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
              </svg>
              Scan Barcode
            </button>
          </div>
        )}

        {scanningMode === 'scanning' && showScanner && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Scan Product Barcode</h2>
            <BarcodeScanner onDetected={handleBarcodeDetected} />
          </div>
        )}

        {scanningMode === 'product_found' && existingProduct && (
          <div className="mb-8 border-b pb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Product with barcode <span className="font-bold">{scannedBarcode}</span> already exists in the database.
                    You can update its details below.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Existing Product Details</h2>
              <button
                onClick={startOver}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Scan Different Barcode
              </button>
            </div>
            
            {existingProduct.images && existingProduct.images.length > 0 && (
              <div className="flex justify-center mb-6">
                <img 
                  src={existingProduct.images[0]} 
                  alt={existingProduct.name} 
                  className="h-48 w-auto object-contain border rounded-md"
                />
              </div>
            )}
          </div>
        )}

        {scanningMode === 'product_not_found' && (
          <div className="mb-8 border-b pb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    No product found with barcode <span className="font-bold">{scannedBarcode}</span>.
                    You can add this as a new product.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Take Product Photo</h2>
              <button
                onClick={startOver}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Scan Different Barcode
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              {!isTakingPhoto && !productImage && (
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Take Product Photo
                </button>
              )}
              
              {isTakingPhoto && (
                <div className="w-full max-w-lg">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={takePhoto}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={resetCamera}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
              
              {productImage && (
                <div className="w-full max-w-lg">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <img 
                      src={productImage} 
                      alt="Product" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startCamera}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Retake Photo
                    </button>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          image: productImage
                        }));
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      Use This Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(scanningMode === 'product_found' || scanningMode === 'product_not_found') && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {scanningMode === 'product_found' ? 'Update Product Details' : 'Enter New Product Details'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  readOnly
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverages</option>
                  <option value="home">Home & Garden</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {!productImage && (
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/dashboard"
                className="mr-4 px-6 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scanningMode === 'product_found' ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
