import React, { useState } from 'react';
import { Camera, X, Send } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import API, { createPost as apiCreatePost } from '../services/api';
import postsService from '../services/postsService';
import toast from 'react-hot-toast';

export default function CreatePostModal({ profile, onCreated, onClose }) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (file) {
        const res = await uploadToCloudinary(file);
        if (!res.success) throw new Error(res.error || 'Upload failed');
        imageUrl = res.url;
      }

      const post = {
        description,
        imageUrl,
      };

      try {
        const saved = await apiCreatePost(post);
        toast.success('Post created!');
        setDescription('');
        setFile(null);
        setPreview(null);
        if (onCreated) onCreated(saved);
        onClose();
      } catch (err) {
        // Fallback to localStorage
        const local = {
          id: `${profile.id}_${Date.now()}`,
          author: { id: profile.id, name: profile.name || 'Helper', avatar: profile.avatar },
          imageUrl,
          description,
          createdAt: new Date().toISOString(),
        };
        postsService.addPost(local);
        toast.success('Post created locally!');
        setDescription('');
        setFile(null);
        setPreview(null);
        if (onCreated) onCreated(local);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Profile section */}
          <div className="flex items-center gap-3">
            <img
              src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              alt="profile"
            />
            <div>
              <div className="font-semibold text-gray-800">{profile?.name || 'You'}</div>
              <div className="text-xs text-gray-500">Posting now</div>
            </div>
          </div>

          {/* Image upload section */}
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {preview ? 'Change photo' : 'Add a photo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {preview ? 'Click to change' : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </label>

            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-60 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What did you do today?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share details about the work you completed... (e.g., Cleaned the kitchen, organized pantry, mopped floors, etc.)"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:outline-none resize-none h-24 text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length} characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
