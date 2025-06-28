'use client';

import React, { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productsAPI.getAllProducts();
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to fetch products. Using sample data instead.');
        // Use sample data as fallback
        setProducts([
          {
            _id: 'sample1',
            name: 'Sample Product 1',
            description: 'This is a sample product',
            price: 19.99,
            images: ['/image/pexels-kimona-556745-2280926.jpg'],
            category: 'Sample',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample2',
            name: 'Sample Product 2',
            description: 'Another sample product',
            price: 29.99,
            images: ['/image/pexels-mart-production-9558265.jpg'],
            category: 'Sample',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample3',
            name: 'Sample Product 3',
            description: 'Yet another sample product',
            price: 39.99,
            images: ['/image/pexels-noah-erickson-97554-404280.jpg'],
            category: 'Sample',
            seller: { name: 'Sample Store' }
          },
          {
            _id: 'sample4',
            name: 'Sample Product 4',
            description: 'Final sample product',
            price: 49.99,
            images: ['/image/pexels-pavel-danilyuk-8038334.jpg'],
            category: 'Sample',
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
    <div className="bg-gray-50 min-h-screen py-12 products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">All Products</h1>
        
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
