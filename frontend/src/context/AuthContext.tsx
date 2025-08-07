'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // First check local storage for mock auth
        const storedUser = localStorage.getItem('mockUser');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Check if token exists, if not create one
          if (!localStorage.getItem('token')) {
            const mockToken = `mock-token-${parsedUser.role}-${Date.now()}`;
            localStorage.setItem('token', mockToken);
            console.log('Generated new token for existing mock user');
          } else {
            console.log('Token already exists for mock user');
          }
          
          setIsLoading(false);
          return;
        }
        
        // If no mock user, try API
        const res = await authAPI.getCurrentUser();
        if (res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Not authenticated or error checking auth');
      } finally {
      setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try to use demo credentials first
      if (email === 'demo@example.com' && password === 'password123') {
        const mockUser = {
          id: 'mock-user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'customer',
          phone: '555-123-4567',
          address: {
            street: '123 Main Street',
            city: 'Anytown',
            state: 'State',
            zipCode: '12345',
            country: 'Country'
          }
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        
        // Generate and store a mock token
        const mockToken = `mock-token-customer-${Date.now()}`;
        localStorage.setItem('token', mockToken);
        
        toast.success('Logged in as demo user!');
        return { success: true, user: mockUser, token: mockToken };
      }
      
      // Admin demo login
      if (email === 'admin@example.com' && password === 'admin123') {
        const mockAdmin = {
          id: 'mock-user-2',
          name: 'Demo Admin',
          email: 'admin@example.com',
          role: 'admin',
          phone: '555-987-6543',
          address: {
            street: '456 Admin Ave',
            city: 'Adminville',
            state: 'State',
            zipCode: '54321',
            country: 'Country'
          }
        };
        
        setUser(mockAdmin);
        setIsAuthenticated(true);
        localStorage.setItem('mockUser', JSON.stringify(mockAdmin));
        
        // Generate and store a mock token
        const mockToken = `mock-token-admin-${Date.now()}`;
        localStorage.setItem('token', mockToken);
        
        toast.success('Logged in as admin!');
        return { success: true, user: mockAdmin, token: mockToken };
      }
      
      // Seller demo login
      if (email === 'seller@example.com' && password === 'seller123') {
        const mockSeller = {
          id: 'mock-user-3',
          name: 'Demo Seller',
          email: 'seller@example.com',
          role: 'seller',
          phone: '555-567-8901',
          address: {
            street: '789 Seller Street',
            city: 'Sellersburg',
            state: 'State',
            zipCode: '67890',
            country: 'Country'
          }
        };
        
        setUser(mockSeller);
        setIsAuthenticated(true);
        localStorage.setItem('mockUser', JSON.stringify(mockSeller));
        
        // Generate and store a mock token
        const mockToken = `mock-token-seller-${Date.now()}`;
        localStorage.setItem('token', mockToken);
        
        toast.success('Logged in as seller!');
        return { success: true, user: mockSeller, token: mockToken };
      }

      // If not a demo user, try real API
      const res = await authAPI.login({ email, password });
      setUser(res.user);
      setIsAuthenticated(true);
      
      // Store the token in localStorage
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      
      return res;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register(userData);
      setUser(res.user);
      setIsAuthenticated(true);
      
      // Store the token in localStorage
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      
      return res;
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('token');
    router.push('/');
    toast.info('Logged out successfully');
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      // If using mock auth, update locally
      if (localStorage.getItem('mockUser') && user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return { success: true, user: updatedUser };
      }
      
      // Otherwise use API
      const res = await authAPI.updateUser(userData);
      setUser(res.user);
      return res;
    } catch (error: any) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};