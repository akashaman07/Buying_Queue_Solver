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
      console.log('Fixing product images...');
      
      // Get all products
      const products = await Product.find({});
      console.log(`Found ${products.length} products to update`);
      
      // Define correct image mapping
      const imageMapping = {
        'Smartphone X': '/image/pexels-kimona-556745-2280926.jpg',
        'Wireless Headphones': '/image/pexels-mart-production-9558265.jpg',
        'Organic Bananas': '/image/pexels-noah-erickson-97554-404280.jpg',
        'Cotton T-Shirt': '/image/pexels-pavel-danilyuk-8038334.jpg'
      };
      
      // Update each product with the correct image
      for (const product of products) {
        const correctImage = imageMapping[product.name];
        
        if (correctImage) {
          console.log(`Updating ${product.name} with image: ${correctImage}`);
          
          await Product.findByIdAndUpdate(
            product._id,
            { imageUrl: correctImage }
          );
        } else {
          console.log(`No image mapping found for product: ${product.name}`);
        }
      }
      
      console.log('Product images fixed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error fixing product images:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }); 