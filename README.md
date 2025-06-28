# Buying Queue Solver

A web application that allows customers to scan products, pay online, and skip checkout lines.

## Overview

The Buying Queue Solver is a comprehensive solution designed to streamline the shopping experience by eliminating checkout lines. The application allows customers to scan products using their mobile devices, manage their cart, make payments online, and receive QR-coded invoices that can be verified when exiting the store.

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
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Integration
- RESTful API

### Frontend
- Next.js
- Progressive Web App (PWA)
- React Context API for state management
- QuaggaJS for barcode scanning
- Responsive UI with Tailwind CSS
- Cloudinary for image storage

## Project Structure

```
buying-queue-solver/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   └── lib/
│   ├── public/
│   └── package.json
└── README.md
```

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