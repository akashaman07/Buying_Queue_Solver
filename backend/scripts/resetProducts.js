const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import models
const Product = require('../models/Product');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buying-queue-solver', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async (conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    try {
      // Delete all existing products
      console.log('Deleting existing products...');
      await Product.deleteMany({});
      console.log('All products deleted');

      // Find or create a demo seller
      console.log('Finding or creating demo seller...');
      let demoSeller = await User.findOne({ email: 'demo@example.com' });
      
      if (!demoSeller) {
        demoSeller = await User.create({
          name: 'Demo Store',
          email: 'demo@example.com',
          password: 'password123',
          role: 'seller'
        });
        console.log('Demo seller created');
      } else {
        console.log('Using existing demo seller');
      }
      
      // Create demo products
      console.log('Creating new demo products...');
      const demoProducts = [
        {
          name: 'Smartphone X',
          description: 'Latest smartphone with advanced features',
          price: 999.99,
          barcode: '123456789012',
          category: 'Electronics',
          stock: 50,
          isAvailable: true,
          imageUrl: '/image/pexels-kimona-556745-2280926.jpg',
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
          imageUrl: '/image/pexels-mart-production-9558265.jpg',
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
          imageUrl: '/image/pexels-pavel-danilyuk-8038334.jpg',
          seller: demoSeller._id
        }
      ];
      
      await Product.insertMany(demoProducts);
      console.log('Demo products created successfully');

      console.log('Done! Products have been reset and reseeded.');
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }); 