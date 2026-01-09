// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
};

// Upload image to Cloudinary using fetch
export const uploadToCloudinary = async (file) => {
  if (!file) {
    return {
      success: false,
      error: 'No file provided',
    };
  }

  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'Please select an image file',
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'unsigned');

  try {
    const cloudName = cloudinaryConfig.cloudName;
    
    if (!cloudName || cloudName === 'your-cloud-name') {
      return {
        success: false,
        error: 'Cloudinary configuration missing. Please check VITE_CLOUDINARY_CLOUD_NAME in .env',
      };
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      success: true,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image. Please try again.',
    };
  }
};
