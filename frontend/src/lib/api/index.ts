import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a mock data store for development when backend is unavailable
const mockData = {
  users: [
    {
      id: 'mock-user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'customer',
      password: 'password123', // This is just for mock purposes
      phone: '555-123-4567',
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'State',
        zipCode: '12345',
        country: 'Country'
      }
    },
    {
      id: 'mock-user-2',
      name: 'Demo Admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin123', // This is just for mock purposes
      phone: '555-987-6543',
      address: {
        street: '456 Admin Ave',
        city: 'Adminville',
        state: 'State',
        zipCode: '54321',
        country: 'Country'
      }
    },
    {
      id: 'mock-user-3',
      name: 'Demo Seller',
      email: 'seller@example.com',
      role: 'seller',
      password: 'seller123', // This is just for mock purposes
      phone: '555-567-8901',
      address: {
        street: '789 Seller Street',
        city: 'Sellersburg',
        state: 'State',
        zipCode: '67890',
        country: 'Country'
      }
    },
  ],
  products: [
    {
      _id: 'mock-product-1',
      name: 'Smartphone X',
      price: 699.99,
      description: 'Latest smartphone with amazing features',
      category: 'Electronics',
      images: ['/image/smartphone.jpg'],
      stock: 15,
    },
    {
      _id: 'mock-product-2',
      name: 'Wireless Headphones',
      price: 149.99,
      description: 'Premium noise-cancelling headphones',
      category: 'Electronics',
      images: ['/image/wireless- headphone.jpg'],
      stock: 8,
    },
    {
      _id: 'mock-product-3',
      name: 'T-shirt',
      price: 29.99,
      description: 'Comfortable cotton t-shirt',
      category: 'Clothing',
      images: ['/image/t-shirt.jpg'],
      stock: 20,
    },
    {
      _id: 'mock-product-4',
      name: 'Banana',
      price: 0.99,
      description: 'Fresh organic banana',
      category: 'Food',
      images: ['/image/banana.jpg'],
      stock: 50,
    },
  ],
  orders: [
    {
      _id: 'mock-order-1',
      user: 'mock-user-1',
      products: [
        { product: 'mock-product-1', quantity: 1, price: 699.99 },
        { product: 'mock-product-2', quantity: 1, price: 149.99 }
      ],
      totalAmount: 849.98,
      status: 'delivered',
      createdAt: new Date('2025-06-15').toISOString(),
      paymentInfo: {
        id: 'mock-payment-1',
        status: 'completed',
        method: 'credit_card'
      }
    },
    {
      _id: 'mock-order-2',
      user: 'mock-user-1',
      products: [
        { product: 'mock-product-3', quantity: 1, price: 89.99 }
      ],
      totalAmount: 89.99,
      status: 'processing',
      createdAt: new Date('2025-06-20').toISOString(),
      paymentInfo: {
        id: 'mock-payment-2',
        status: 'completed',
        method: 'credit_card'
      }
    }
  ],
  payments: [
    {
      _id: 'mock-payment-1',
      orderId: 'mock-order-1',
      amount: 849.98,
      status: 'completed',
      paymentMethod: 'credit_card',
      cardInfo: {
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025
      },
      createdAt: new Date('2025-06-15').toISOString()
    },
    {
      _id: 'mock-payment-2',
      orderId: 'mock-order-2',
      amount: 89.99,
      status: 'completed',
      paymentMethod: 'credit_card',
      cardInfo: {
        last4: '1234',
        brand: 'Mastercard',
        expiryMonth: 10,
        expiryYear: 2026
      },
      createdAt: new Date('2025-06-20').toISOString()
    }
  ],
  demoPaymentCards: [
    {
      cardNumber: '4242 4242 4242 4242',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'Demo User',
      type: 'Visa'
    },
    {
      cardNumber: '5555 5555 5555 4444',
      expiryDate: '10/26',
      cvv: '321',
      cardholderName: 'Demo User',
      type: 'Mastercard'
    }
  ]
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds to prevent timeouts
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Check if we're in the browser and we have a token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors gracefully
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network error or timeout:', error.message);
      // You can add custom handling here
    }
    
    return Promise.reject(error);
  }
);

// Function to check backend connection and Cloudinary configuration
const checkBackendStatus = async () => {
  try {
    const response = await api.get('/products?limit=1');
    return { connected: true, data: response.data };
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return { connected: false, error };
  }
};

// Helper function to simulate API delay for mock responses
const mockDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API calls
const authAPI = {
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      
      // If network error or backend unavailable, use mock data for development
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock register due to connection issue');
        await mockDelay();
        
        // Check if email already exists in mock data
        if (mockData.users.some(user => user.email === userData.email)) {
          throw { 
            response: { 
              data: { message: 'Email already in use' } 
            } 
          };
        }
        
        // Create mock user
        const mockUser = {
          id: `mock-user-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'customer',
          password: userData.password,
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        };
        
        // Add to mock data
        mockData.users.push(mockUser);
        
        return { 
          success: true, 
          user: mockUser,
          token: 'mock-token-' + Date.now()
        };
      }
      
      throw error;
    }
  },
  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If network error or backend unavailable, use mock data for development
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock login due to connection issue');
        await mockDelay();
        
        // Find user in mock data
        const user = mockData.users.find(
          user => user.email === credentials.email && user.password === credentials.password
        );
        
        if (!user) {
          throw { 
            response: { 
              data: { message: 'Invalid email or password' } 
            } 
          };
        }
        
        // Return mock user without password
        const { password, ...userWithoutPassword } = user;
        return {
          success: true,
          token: 'mock-token-' + Date.now(),
          user: userWithoutPassword
        };
      }
      
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // If network error, just return success
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock logout due to connection issue');
        await mockDelay();
        return { success: true };
      }
      
      throw error;
    }
  },
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('GetMe error:', error);
      
      // If network error, use mock data
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock user data due to connection issue');
        await mockDelay();
        
        // In a real app, you'd use the token to identify the user
        // Here we'll just return the first mock user
        const { password, ...userWithoutPassword } = mockData.users[0];
        
        return {
          success: true,
          data: userWithoutPassword
        };
      }
      
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // If network error or backend unavailable, use mock data for development
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock getCurrentUser due to connection issue');
        await mockDelay();
        
        // In a real app, this would use the token to identify the user
        // For mock purposes, we'll just return null to indicate no user is logged in
        return { user: null };
      }
      throw error;
    }
  },
  updateUser: async (userData: any) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error: any) {
      // If network error or backend unavailable, use mock data for development
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock updateUser due to connection issue');
        await mockDelay();
        
        // In a real app, this would update the user in the database
        // For mock purposes, we'll just return the updated user data
        return {
          success: true,
          user: userData
        };
      }
      throw error;
    }
  },
};

// Products API calls
const productsAPI = {
  getAllProducts: async (params?: any) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      console.error('GetAllProducts error:', error);
      
      // If network error, use mock data
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('Using mock product data due to connection issue');
        await mockDelay();
        
        return {
          success: true,
          data: mockData.products,
          pagination: {
            total: mockData.products.length,
            page: 1,
            limit: mockData.products.length,
            pages: 1
          }
        };
      }
      
      throw error;
    }
  },
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`GetProductById error for ID ${id}:`, error);
      throw error;
    }
  },
  getProductByBarcode: async (barcode: string) => {
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error(`GetProductByBarcode error for barcode ${barcode}:`, error);
      throw error;
    }
  },
  createProduct: async (productData: any) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('CreateProduct error:', error);
      throw error;
    }
  },
  updateProduct: async (id: string, productData: any) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`UpdateProduct error for ID ${id}:`, error);
      throw error;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`DeleteProduct error for ID ${id}:`, error);
      throw error;
    }
  },
};

// Orders API calls
const ordersAPI = {
  getAllOrders: async (params?: any) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('GetAllOrders error:', error);
      throw error;
    }
  },
  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`GetOrderById error for ID ${id}:`, error);
      throw error;
    }
  },
  createOrder: async (orderData: any) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('CreateOrder error:', error);
      throw error;
    }
  },
  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await api.put(`/orders/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error(`UpdateOrderStatus error for ID ${id}:`, error);
      throw error;
    }
  },
  cancelOrder: async (id: string) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`CancelOrder error for ID ${id}:`, error);
      throw error;
    }
  },
};

// Payments API calls
const paymentsAPI = {
  getAllPayments: async (params?: any) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      console.error('GetAllPayments error:', error);
      throw error;
    }
  },
  getPaymentById: async (id: string) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`GetPaymentById error for ID ${id}:`, error);
      throw error;
    }
  },
  createPaymentIntent: async (orderId: string) => {
    try {
      const response = await api.post('/payments/create-payment-intent', { orderId });
      return response.data;
    } catch (error) {
      console.error(`CreatePaymentIntent error for order ID ${orderId}:`, error);
      throw error;
    }
  },
  processPayment: async (paymentData: any) => {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('ProcessPayment error:', error);
      throw error;
    }
  },
  processRefund: async (id: string, reason?: string) => {
    try {
      const response = await api.post(`/payments/${id}/refund`, { reason });
      return response.data;
    } catch (error) {
      console.error(`ProcessRefund error for ID ${id}:`, error);
      throw error;
    }
  },
};

// Users API calls
const usersAPI = {
  getAllUsers: async (params?: any) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('GetAllUsers error:', error);
      throw error;
    }
  },
  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`GetUserById error for ID ${id}:`, error);
      throw error;
    }
  },
  createUser: async (userData: any) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('CreateUser error:', error);
      throw error;
    }
  },
  updateUser: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`UpdateUser error for ID ${id}:`, error);
      throw error;
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`DeleteUser error for ID ${id}:`, error);
      throw error;
    }
  },
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/users/profile/update', userData);
      return response.data;
    } catch (error) {
      console.error('UpdateProfile error:', error);
      throw error;
    }
  },
};

// Export all the API modules
export {
  api as default,
  authAPI,
  productsAPI,
  ordersAPI,
  paymentsAPI,
  usersAPI,
  checkBackendStatus
};