'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const useDemoAccount = (type: string) => {
    let demoEmail = 'demo@example.com';
    let demoPassword = 'password123';
    
    if (type === 'admin') {
      demoEmail = 'admin@example.com';
      demoPassword = 'admin123';
    } else if (type === 'seller') {
      demoEmail = 'seller@example.com';
      demoPassword = 'seller123';
    }
    
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-6 px-6">
          <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
          <p className="text-blue-100 text-center mt-2">Sign in to your account</p>
        </div>
        
        {/* Demo Accounts Section */}
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Demo Accounts</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => useDemoAccount('customer')}
              className="py-2 px-3 bg-white border border-blue-200 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Customer Demo
            </button>
            <button
              onClick={() => useDemoAccount('admin')}
              className="py-2 px-3 bg-white border border-blue-200 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Admin Demo
            </button>
            <button
              onClick={() => useDemoAccount('seller')}
              className="py-2 px-3 bg-white border border-blue-200 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Seller Demo
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center font-medium">
            Click any button to fill the form with demo credentials
          </p>
          <div className="mt-3 text-xs text-gray-700 bg-blue-50 p-2 rounded-md border border-blue-100">
            <p className="font-semibold text-blue-800">Demo Credentials:</p>
            <ul className="list-disc list-inside mt-1">
              <li className="text-gray-700 font-medium">Customer: demo@example.com / password123</li>
              <li className="text-gray-700 font-medium">Admin: admin@example.com / admin123</li>
              <li className="text-gray-700 font-medium">Seller: seller@example.com / seller123</li>
            </ul>
            <p className="mt-1 text-gray-600 font-medium">No real authentication or payments are processed in this demo.</p>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-800 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-800 text-sm font-bold">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-700 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                isSubmitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
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
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-700 hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 