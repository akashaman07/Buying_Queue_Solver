'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productsAPI.getAllProducts({ limit: 8 });
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to fetch products. Using sample data instead.');
        // Use sample data as fallback
        setFeaturedProducts([
          {
            _id: 'sample1',
            name: 'Smartphone X',
            description: 'Latest smartphone with amazing features',
            price: 699.99,
            images: ['/image/smartphone.jpg'],
            category: 'Electronics',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample2',
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling headphones',
            price: 149.99,
            images: ['/image/wireless-headphone.jpg'],
            category: 'Electronics',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample3',
            name: 'T-shirt',
            description: 'Comfortable cotton t-shirt',
            price: 29.99,
            images: ['/image/t-shirt.jpg'],
            category: 'Clothing',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample4',
            name: 'Banana',
            description: 'Fresh organic banana',
            price: 0.99,
            images: ['/image/banana.jpg'],
            category: 'Food',
            seller: { name: 'Sample Store' }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);



  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-20 px-4 rounded-lg shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
            Skip the Checkout Lines, Shop with Ease
          </h1>
          <p className="text-2xl mb-10 font-medium text-blue-100">
            Scan products, pay online, and walk out without waiting in line.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan"
              className="bg-white text-blue-700 px-8 py-4 rounded-md font-bold text-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Scanning
            </Link>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="bg-blue-800 text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-blue-900 transition-colors border border-blue-400 shadow-md"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-14 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-700 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              1
            </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Scan Products</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Use your phone camera to scan product barcodes while shopping in-store.
            </p>
          </div>
            <div className="text-center bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-700 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              2
            </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Pay Online</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
              Complete your purchase securely through our app with any payment method.
            </p>
          </div>
            <div className="text-center bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-700 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              3
            </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Skip the Line</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
              Show your digital receipt QR code and walk out without waiting in checkout lines.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
          </Link>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        )}
        </div>
      </section>

      {/* Demo Account Information */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Demo Accounts</h2>
            <p className="text-gray-700 font-medium mb-6 text-center">
              Use these demo accounts to test the application without creating an account.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-blue-700 mb-2">Customer</h3>
                <p className="text-gray-700 font-medium mb-4">Browse products, add to cart, and checkout</p>
                <div className="bg-white p-4 rounded-md border border-blue-100">
                  <p className="font-mono text-sm text-gray-800 mb-1">
                    <span className="font-bold text-blue-700">Email:</span> demo@example.com
                  </p>
                  <p className="font-mono text-sm text-gray-800">
                    <span className="font-bold text-blue-700">Password:</span> password123
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-lg border-2 border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">Admin</h3>
                <p className="text-gray-700 font-medium mb-4">Manage products, orders, and users</p>
                <div className="bg-white p-4 rounded-md border border-indigo-100">
                  <p className="font-mono text-sm text-gray-800 mb-1">
                    <span className="font-bold text-indigo-700">Email:</span> admin@example.com
                  </p>
                  <p className="font-mono text-sm text-gray-800">
                    <span className="font-bold text-indigo-700">Password:</span> admin123
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-b from-purple-50 to-white p-6 rounded-lg border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-purple-700 mb-2">Seller</h3>
                <p className="text-gray-700 font-medium mb-4">Add products and manage inventory</p>
                <div className="bg-white p-4 rounded-md border border-purple-100">
                  <p className="font-mono text-sm text-gray-800 mb-1">
                    <span className="font-bold text-purple-700">Email:</span> seller@example.com
                  </p>
                  <p className="font-mono text-sm text-gray-800">
                    <span className="font-bold text-purple-700">Password:</span> seller123
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">
                <span className="font-bold">Note:</span> This is a demo application. No real authentication or payments are processed.
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-md border border-blue-500">
                Try Demo Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-6 rounded-lg text-center shadow-lg cta-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-6 text-white">Ready to Transform Your Shopping Experience?</h2>
          <p className="text-2xl text-white mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of customers who are saving time and enjoying a hassle-free shopping experience.
          </p>
          <Link
            href={isAuthenticated ? '/scan' : '/register'}
            className="bg-blue-600 text-white px-10 py-4 rounded-md font-bold text-xl hover:bg-blue-700 transition-colors shadow-md inline-block"
          >
            {isAuthenticated ? 'Start Shopping' : 'Sign Up Now'}
          </Link>
        </div>
      </section>


    </div>
  );
}
