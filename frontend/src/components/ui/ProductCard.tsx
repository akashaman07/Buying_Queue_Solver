'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  barcode?: string;
  category: string;
  stock?: number;
  finalPrice?: number;
  discount?: number;
  seller?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    // Just pass the product as is - CartContext now handles optional fields
    addItem(product, 1);
  };

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get the image URL from either imageUrl or images array
  const getImageUrl = () => {
    let imageUrl = '';
    
    if (product.imageUrl) {
      imageUrl = product.imageUrl;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    } else {
      imageUrl = '/image/pexels-kimona-556745-2280926.jpg'; // Local fallback image
    }
    
    return imageUrl;
  };

  // Get stock information or default to 10
  const getStock = () => {
    return product.stock !== undefined ? product.stock : 10;
  };

  // Get discount or default to 0
  const getDiscount = () => {
    return product.discount || 0;
  };

  // Get final price or calculate from discount
  const getFinalPrice = () => {
    if (product.finalPrice) {
      return product.finalPrice;
    }
    const discount = getDiscount();
    return discount > 0 ? product.price * (1 - discount / 100) : product.price;
  };

  // Check if image is external (starts with http)
  const isExternalImage = (url: string) => {
    return url.startsWith('http');
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 product-card">
      <div className="relative h-56 w-full">
        {isExternalImage(imageUrl) ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
        <Image
            src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
        )}
        {getDiscount() > 0 && (
          <div className="absolute top-0 right-0 bg-red-600 text-white py-1 px-3 text-sm font-bold rounded-bl-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {getDiscount()}% OFF
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-700 text-base mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            {getDiscount() > 0 ? (
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-700 mr-2">
                  {formatPrice(getFinalPrice())}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-blue-700">{formatPrice(product.price)}</span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            {getStock() > 0 ? `${getStock()} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 bg-blue-50 px-2 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {product.category}
          </span>
          {user?.role === 'customer' || user?.role === 'admin' ? (
            <button
              onClick={handleAddToCart}
              disabled={getStock() <= 0}
              className={`px-4 py-2 rounded-md font-medium flex items-center ${
                getStock() > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart
            </button>
          ) : (
            <div className="px-4 py-2 rounded-md font-medium flex items-center bg-gray-100 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {user?.role === 'seller' ? 'Seller View' : user?.role === 'admin' ? 'Admin View' : 'View Only'}
            </div>
          )}
        </div>
        
        {product.barcode && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Barcode: {product.barcode}</span>
          </div>
        )}
      </div>
    </div>
  );
}