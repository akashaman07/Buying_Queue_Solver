const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Global variable to track DB connection status
let isDbConnected = false;

// Connect to database
const initializeDB = async () => {
  isDbConnected = await connectDB();
  
  // Seed products if database is connected and collection is empty
  if (isDbConnected) {
    try {
      const Product = require('./models/Product');
      const User = require('./models/User');
      
      // Check if products exist
      const productsCount = await Product.countDocuments();
      
      if (productsCount === 0) {
        console.log('No products found, seeding demo products...');
        
        // Find or create a demo seller
        let demoSeller = await User.findOne({ email: 'demo@example.com' });
        
        if (!demoSeller) {
          demoSeller = await User.create({
            name: 'Demo Store',
            email: 'demo@example.com',
            password: 'password123',
            role: 'seller'
          });
          console.log('Demo seller created');
        }
        
        // Create demo products
        const demoProducts = [
          {
            name: 'Smartphone X',
            description: 'Latest smartphone with advanced features',
            price: 999.99,
            barcode: '123456789012',
            category: 'Electronics',
            stock: 50,
            isAvailable: true,
            imageUrl: '/image/pexels-mart-production-9558265.jpg ',
            seller: demoSeller._id
          },
          {
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling headphones',
            price: 199.99,
            barcode: '123456789013',
            category: 'Electronics',
            stock: 30,
            isAvailable: true,
            imageUrl: '/image/pexels-pavel-danilyuk-8038334.jpg ',
            seller: demoSeller._id
          },
          {
            name: 'Organic Bananas',
            description: 'Fresh organic bananas',
            price: 1.99,
            barcode: '123456789014',
            category: 'Food',
            stock: 100,
            isAvailable: true,
            imageUrl: '/image/pexels-noah-erickson-97554-404280.jpg',
            seller: demoSeller._id
          },
          {
            name: 'Cotton T-Shirt',
            description: 'Comfortable cotton t-shirt',
            price: 19.99,
            barcode: '123456789015',
            category: 'Clothing',
            stock: 200,
            isAvailable: true,
            imageUrl: '/image/pexels-kimona-556745-2280926.jpg',
            seller: demoSeller._id
          }
        ];
        
        await Product.insertMany(demoProducts);
        console.log('Demo products seeded successfully');
      }
    } catch (err) {
      console.error('Error seeding products:', err);
    }
  }
};

// Initialize database connection
initializeDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock data for when DB is unavailable
const mockProducts = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 999.99,
    barcode: '123456789012',
    category: 'Electronics',
    stock: 50,
    isAvailable: true,
    images: ['https://via.placeholder.com/300'],
    seller: {
      _id: '60d21b4667d0d8992e610c80',
      name: 'Tech Store',
      email: 'contact@techstore.com'
    },
    createdAt: new Date()
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 199.99,
    barcode: '123456789013',
    category: 'Electronics',
    stock: 30,
    isAvailable: true,
    images: ['https://via.placeholder.com/300'],
    seller: {
      _id: '60d21b4667d0d8992e610c80',
      name: 'Tech Store',
      email: 'contact@techstore.com'
    },
    createdAt: new Date()
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Organic Bananas',
    description: 'Fresh organic bananas',
    price: 1.99,
    barcode: '123456789014',
    category: 'Groceries',
    stock: 100,
    isAvailable: true,
    images: ['https://via.placeholder.com/300'],
    seller: {
      _id: '60d21b4667d0d8992e610c81',
      name: 'Fresh Market',
      email: 'contact@freshmarket.com'
    },
    createdAt: new Date()
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    barcode: '123456789015',
    category: 'Clothing',
    stock: 200,
    isAvailable: true,
    images: ['https://via.placeholder.com/300'],
    seller: {
      _id: '60d21b4667d0d8992e610c82',
      name: 'Fashion Store',
      email: 'contact@fashionstore.com'
    },
    createdAt: new Date()
  }
];

// Mock data middleware
app.use((req, res, next) => {
  // Attach mock data to the request object
  req.mockData = {
    products: mockProducts
  };
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));

// Base route
app.get('/', (req, res) => {
  res.send('Buying Queue Solver API is running');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 