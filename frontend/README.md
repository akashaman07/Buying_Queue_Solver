# Frontend

This is the frontend part of the Buying Queue Solver application.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Payment Integration

This project uses Razorpay for payment processing. To set up Razorpay:

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay Dashboard
3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
4. Create a `.env` file in the backend directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/buying_queue_solver
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

### Testing Razorpay

For testing, you can use the following test card details:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

For more information, refer to the [Razorpay Documentation](https://razorpay.com/docs/).
