# Buying Queue Solver

A modern web application that revolutionizes the retail shopping experience by allowing customers to scan products, pay online, and skip checkout lines entirely.

## Overview

The Buying Queue Solver is a comprehensive solution designed to address the common frustration of long checkout lines in retail stores. By leveraging modern web technologies, the application creates a seamless shopping experience where customers can:

1. Scan product barcodes using their mobile device's camera
2. Build and manage their shopping cart in real-time
3. Complete secure payments online through Stripe integration
4. Receive digital QR-coded receipts for verification when exiting the store

This approach not only enhances customer satisfaction by eliminating wait times but also helps retailers optimize staff allocation and improve store efficiency.

## Features

### Customer Features
- Barcode scanning using device camera
- Product browsing and search
- Shopping cart management
- Secure online payments via Stripe
- Order history and tracking
- QR-coded invoices for verification
- Push notifications for order updates

### Seller Features
- Inventory management
- Order processing
- Sales analytics dashboard
- Customer management
- Product catalog management
- Product image upload via Cloudinary

## Tech Stack

### Backend
- **Node.js with Express**: Chosen for its non-blocking I/O model, which enables handling multiple concurrent requests efficiently - perfect for a retail application with potentially high traffic.
- **MongoDB with Mongoose**: A NoSQL database that provides the flexibility to evolve the data schema as the application grows, with Mongoose adding structure through schemas and models.
- **JWT Authentication**: Ensures secure, stateless authentication that works well with mobile devices and doesn't require server-side sessions.
- **Stripe Payment Integration**: A reliable, secure payment processing solution with extensive documentation and strong developer support.
- **RESTful API**: Provides a standardized approach to API design that ensures scalability and ease of integration with various clients.

### Frontend
- **Next.js**: Offers server-side rendering and static site generation capabilities, improving performance and SEO while providing an excellent developer experience.
- **Progressive Web App (PWA)**: Enables offline functionality and app-like experience on mobile devices without requiring users to download from app stores.
- **React Context API**: Provides efficient state management without the overhead of additional libraries, perfect for managing shopping cart and user authentication states.
- **QuaggaJS**: A robust barcode scanner library that works directly in the browser, eliminating the need for native app development.
- **Tailwind CSS**: Allows for rapid UI development with a utility-first approach, ensuring consistent design and responsive layouts across all devices.
- **Cloudinary**: Handles image optimization, transformation, and delivery, crucial for a product catalog that requires high-quality images with fast loading times.

## Project Structure

The project follows a clean, modular architecture that separates the backend and frontend codebases:

```
buying-queue-solver/
├── backend/                  # Node.js/Express server
│   ├── config/              # Configuration files (database, etc.)
│   ├── controllers/         # Request handlers for each route
│   ├── middleware/          # Custom middleware (auth, error handling, etc.)
│   ├── models/              # Mongoose models for MongoDB
│   ├── routes/              # API route definitions
│   ├── utils/               # Utility functions and helpers
│   ├── server.js            # Main application entry point
│   └── package.json         # Backend dependencies
├── frontend/                # Next.js application
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js app directory (pages, layouts)
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context providers
│   │   └── lib/             # Utility functions, API clients
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
└── README.md                # Project documentation
```

This structure follows best practices for full-stack JavaScript applications, with clear separation of concerns and modular organization that makes the codebase maintainable and scalable.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe account for payment processing
- Cloudinary account for image storage

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   STRIPE_SECRET_KEY=your_stripe_secret_key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Cloudinary Setup
1. Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. After signing up, you'll get your cloud name from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set "Upload preset name" (e.g., buying_queue_solver)
   - Set "Signing Mode" to "Unsigned"
   - Configure other options as needed
   - Click "Save"
4. Update your `.env.local` file with your cloud name and upload preset

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/profile/update` - Update own profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create product (seller/admin)
- `PUT /api/products/:id` - Update product (seller/admin)
- `DELETE /api/products/:id` - Delete product (seller/admin)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (customer)
- `PUT /api/orders/:id` - Update order status (seller/admin)
- `PUT /api/orders/:id/cancel` - Cancel order (customer/admin)

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/process` - Process payment
- `POST /api/payments/:id/refund` - Process refund (admin)

## Testing Payment Integration

For testing payments, you can use the following test card details:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

## Deployment Options

### Backend Deployment
- **Heroku**: Easy deployment with MongoDB Atlas integration
- **AWS Elastic Beanstalk**: Scalable solution for production environments
- **Digital Ocean**: Cost-effective option with simple scaling

### Frontend Deployment
- **Vercel**: Optimized for Next.js applications with automatic deployments
- **Netlify**: Simple deployment with continuous integration
- **AWS Amplify**: Comprehensive solution with additional AWS service integration

## Business Benefits & Impact

### For Retailers
- **Reduced Operational Costs**: Less need for checkout staff, allowing reallocation to customer service
- **Improved Customer Flow**: Elimination of bottlenecks at checkout areas
- **Enhanced Data Collection**: Better insights into shopping patterns and product popularity
- **Competitive Advantage**: Modern shopping experience that differentiates from competitors

### For Customers
- **Time Savings**: No more waiting in checkout lines
- **Contactless Experience**: Minimized physical contact, especially valuable post-pandemic
- **Transparent Shopping**: Real-time cart total and pricing visibility
- **Digital Receipts**: Easy access to purchase history without paper waste

## Why This Technology Stack?

The technology choices for this project were made with several key considerations in mind:

1. **Scalability**: The Node.js/Express backend paired with MongoDB provides excellent horizontal scaling capabilities to handle growing user bases.

2. **Developer Experience**: Next.js and React offer a superior developer experience with hot reloading, component-based architecture, and extensive community support.

3. **Performance**: Server-side rendering capabilities of Next.js ensure fast initial page loads, critical for e-commerce user experience.

4. **Mobile-First Approach**: PWA capabilities and responsive design with Tailwind CSS ensure excellent mobile usability, essential for in-store scanning.

5. **Security**: JWT authentication and Stripe's secure payment processing protect sensitive user and payment data.

6. **Time to Market**: The JavaScript ecosystem across both frontend and backend allows for rapid development and iteration.

## Contributing

Contributions to the Buying Queue Solver project are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Stripe](https://stripe.com/) for payment processing
- [Cloudinary](https://cloudinary.com/) for image management
- [QuaggaJS](https://github.com/serratus/quaggaJS) for barcode scanning
- [Next.js](https://nextjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for the database