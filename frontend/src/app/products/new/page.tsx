'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { productsAPI, checkBackendStatus } from '@/lib/api';
import Link from 'next/link';

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
          See the <Link href="https://github.com/yourusername/buying-queue-solver#cloudinary-setup" className="underline">README</Link> for detailed setup instructions.
        </p>
      </div>
    </div>
  </div>
);

export default function NewProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Backend API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    barcode: searchParams.get('barcode') || ''
  });

  // Add a state to track backend connection status
  const [backendConnected, setBackendConnected] = useState(true);

  // Add a function to check backend connection
  const checkBackendConnection = async () => {
    try {
      const status = await checkBackendStatus();
      setBackendConnected(status.connected);
    } catch (error) {
      console.error('Backend connection error:', error);
      setBackendConnected(false);
    }
  };

  // Check backend connection when the component mounts
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Check if the barcode exists when the page loads
  useEffect(() => {
    const barcode = searchParams.get('barcode');
    if (barcode) {
      checkBarcodeExists(barcode);
    }
  }, [searchParams]);

  const checkBarcodeExists = async (barcode: string) => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProductByBarcode(barcode);
      
      // If we get here, product exists
      toast.info(`Product with barcode ${barcode} already exists. Redirecting to scan page.`);
      router.push('/scan');
    } catch (error: any) {
      // If 404, product doesn't exist, which is what we want
      if (error.response?.status !== 404) {
        toast.error('Error checking barcode: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image upload is now handled in the handleSubmit function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form
      if (!formData.name || !formData.price || !formData.stock || !formData.barcode) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Create the product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        barcode: formData.barcode,
      };
      
      // Create the product
      const response = await productsAPI.createProduct(productData);
      const productId = response.data._id;
      
      // If we have an image file, upload it
      if (imageFile) {
        try {
          // Create a FormData instance for the image upload
          const imageFormData = new FormData();
          imageFormData.append('image', imageFile);
          const imageResponse = await fetch(`${apiUrl}/products/${productId}/image`, {
            method: 'POST',
            body: imageFormData,
            headers: {
              // No Content-Type header as it will be set by the browser for FormData
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            throw new Error(`Image upload failed: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Product created but image upload failed. You can add an image later.');
        }
      }
      
      toast.success('Product added successfully!');
      router.push('/scan');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error('Error adding product: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/scan" className="mr-4 text-blue-600 hover:text-blue-800 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Scan
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {!backendConnected && <BackendConnectionWarning />}
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Adding new product with barcode: <span className="font-bold">{formData.barcode}</span>
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode*
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
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
                Price ($)*
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
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                Stock Quantity*
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
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {productImage ? (
                <div className="space-y-2 text-center">
                  <img 
                    src={productImage} 
                    alt="Product preview" 
                    className="mx-auto h-64 w-auto object-contain"
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setProductImage(null);
                        setImageFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/scan"
              className="mr-4 px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className={`px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                (isLoading || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading || isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </span>
              ) : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
