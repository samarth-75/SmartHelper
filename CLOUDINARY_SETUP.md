# Cloudinary Integration Setup Guide

## Overview
Cloudinary has been integrated into both the Family and Helper profiles for photo uploads.

## Setup Instructions

### 1. Create a Cloudinary Account
- Go to [Cloudinary.com](https://cloudinary.com)
- Sign up for a free account
- Access your dashboard

### 2. Get Your Cloudinary Credentials
From your Cloudinary dashboard, copy:
- **Cloud Name** - Available in Settings → Account
- **API Key** - Available in Settings → API Keys
- **API Secret** - Available in Settings → API Keys
- **Upload Preset** - Create one in Settings → Upload (set to "Unsigned" for client-side uploads)

### 3. Backend Configuration

#### Option A: Using Environment Variables (Recommended)
1. Copy `.env.example` to `.env` in the backend folder
2. Fill in your Cloudinary credentials:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Option B: Direct Configuration
If you don't need server-side uploads, you can skip this and use client-side uploads only.

### 4. Frontend Configuration

1. Copy `.env.example` to `.env` in the frontend folder
2. Add your Cloudinary credentials:
   ```
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   REACT_APP_CLOUDINARY_PRESET=your_upload_preset
   ```

### 5. How It Works

#### Frontend Flow:
1. User clicks "Upload Photo" button on their profile
2. File input opens to select an image
3. Image is uploaded to Cloudinary using the `uploadToCloudinary()` function
4. Cloudinary returns the secure URL
5. URL is sent to the backend API to update user's avatar
6. Profile updates with the new photo

#### Files Modified/Created:
- `frontend/src/utils/cloudinary.js` - Upload utility function
- `frontend/src/pages/family/Profile.jsx` - Family profile with upload
- `frontend/src/pages/helper/Profile.jsx` - Helper profile with upload
- `backend/controllers/uploadController.js` - Upload controller
- `backend/routes/uploadRoutes.js` - Upload routes
- `backend/server.js` - Added upload route registration

### 6. API Endpoints

**Upload Avatar:**
```
POST /api/upload/avatar
Headers: Authorization: Bearer {token}
Body: FormData with 'avatar' file
Response: { success: true, imageUrl, publicId }
```

### 7. Features Implemented

✅ Photo upload for Family profiles
✅ Photo upload for Helper profiles
✅ Cloudinary cloud storage
✅ Secure URL storage in database
✅ Upload status feedback
✅ Error handling
✅ Loading states

### 8. Testing

1. Start your backend: `npm start` (in backend folder)
2. Start your frontend: `npm run dev` (in frontend folder)
3. Login as a family or helper
4. Go to Profile page
5. Click "Upload Photo"
6. Select an image file
7. Wait for upload confirmation
8. Refresh to see the updated avatar

### 9. Image Optimization

By default, Cloudinary stores images in the `smarthelper/avatars` folder with automatic optimization. You can customize this in `backend/controllers/uploadController.js`:

```javascript
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'smarthelper/avatars',  // Change folder name here
    format: async (req, file) => 'png',  // Change format here
    public_id: (req, file) => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  },
});
```

### 10. Troubleshooting

**Issue: "Upload failed" error**
- Check that REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_PRESET are correct
- Ensure upload preset exists in Cloudinary dashboard

**Issue: 401 Unauthorized**
- Check that your JWT token is valid
- Ensure you're logged in

**Issue: CORS errors**
- Backend CORS is already configured in server.js
- If issues persist, check your Cloudinary CORS settings

## Security Notes

- ✅ All uploads require authentication (JWT token)
- ✅ Upload preset should be "Unsigned" for client-side uploads
- ✅ Sensitive API keys are stored only on backend
- ✅ Images are served over HTTPS from Cloudinary CDN
