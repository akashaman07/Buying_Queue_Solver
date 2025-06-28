# Cloudinary Backend Configuration Guide

This application uses Cloudinary for image storage and management. The image upload functionality has been moved to the backend for better security and control.

## Setup Instructions

1. **Create a Cloudinary account**:
   - Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
   - After signing up, you'll get access to your dashboard with your account details

2. **Get your Cloudinary credentials**:
   - From your Cloudinary dashboard, note down the following:
     - Cloud Name
     - API Key
     - API Secret

3. **Configure the backend**:
   - Create or edit the `.env` file in the `backend` directory
   - Add the following environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   - Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials

4. **Restart the backend server**:
   - If the backend server is running, restart it to apply the new environment variables

## How It Works

1. When a user uploads an image for a product:
   - The image is first sent to the backend server
   - The backend uploads the image to Cloudinary using secure credentials
   - Cloudinary returns a URL and public ID for the image
   - The backend stores this information in the product record

2. Benefits of backend-based uploads:
   - API keys and secrets are kept secure (not exposed to the client)
   - Better control over upload parameters and restrictions
   - Ability to process or validate images before uploading
   - Centralized error handling

## Troubleshooting

- **Image upload fails**: Check that your Cloudinary credentials are correctly set in the backend `.env` file
- **Backend can't connect to Cloudinary**: Verify your internet connection and that the Cloudinary service is up
- **"Unauthorized" errors**: Make sure your API key and secret are correct and have the necessary permissions

For more information, refer to the [Cloudinary Documentation](https://cloudinary.com/documentation). 