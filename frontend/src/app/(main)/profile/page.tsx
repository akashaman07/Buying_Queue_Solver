'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: AddressData;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
    
    // Populate form with user data when available
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
    }
  }, [user, isAuthenticated, router, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData as any)[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you would update the user profile via API
      console.log('Profile update data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 profile-page">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    required
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-700 mt-1 font-medium">Email cannot be changed</p>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-2">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Address Information</h3>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-2 flex justify-end space-x-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 font-medium"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Full Name</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formData.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Email Address</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formData.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Phone Number</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formData.phone || 'Not provided'}</p>
                </div>
                
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Address</h3>
                  
                  {formData.address.street || formData.address.city ? (
                    <div className="mt-1">
                      <p className="text-gray-800 font-medium">{formData.address.street}</p>
                      <p className="text-gray-800 font-medium">
                        {[
                          formData.address.city,
                          formData.address.state,
                          formData.address.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-gray-800 font-medium">{formData.address.country}</p>
                    </div>
                  ) : (
                    <p className="text-gray-700 font-medium">No address information provided</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/orders" 
            className="text-blue-700 hover:text-blue-800 font-semibold"
          >
            View Your Orders →
          </Link>
        </div>
      </div>
    </div>
  );
}