const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {String} imagePath - The path to the image (can be a file path or base64 data)
 * @returns {Promise} - Cloudinary upload response
 */
const uploadImage = async (imagePath) => {
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'buying_queue_solver/products',
      use_filename: true,
      unique_filename: true
    });
    
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public ID of the image to delete
 * @returns {Promise} - Cloudinary deletion response
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Image deletion failed');
  }
};

module.exports = {
  uploadImage,
  deleteImage
}; 