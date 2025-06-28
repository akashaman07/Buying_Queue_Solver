const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buying-queue-solver', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async (conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    try {
      console.log('Updating product images...');
      
      // Update Smartphone X
      await Product.findOneAndUpdate(
        { name: 'Smartphone X' },
        { imageUrl: '/image/pexels-kimona-556745-2280926.jpg' }
      );
      
      // Update Wireless Headphones
      await Product.findOneAndUpdate(
        { name: 'Wireless Headphones' },
        { imageUrl: '/image/pexels-mart-production-9558265.jpg' }
      );
      
      // Update Organic Bananas
      await Product.findOneAndUpdate(
        { name: 'Organic Bananas' },
        { imageUrl: '/image/pexels-noah-erickson-97554-404280.jpg' }
      );
      
      // Update Cotton T-Shirt
      await Product.findOneAndUpdate(
        { name: 'Cotton T-Shirt' },
        { imageUrl: '/image/pexels-pavel-danilyuk-8038334.jpg' }
      );
      
      console.log('Product images updated successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error updating product images:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }); 