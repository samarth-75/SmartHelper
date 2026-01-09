import React, { useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinary';
import postsService from '../services/postsService';
import API, { createPost as apiCreatePost } from '../services/api';

export default function CreatePost({ profile, onCreated }) {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!profile) return alert('Profile missing');
    setLoading(true);
    try {
      let imageUrl = null;
      if (file) {
        const res = await uploadToCloudinary(file);
        if (!res.success) throw new Error(res.error || 'Upload failed');
        imageUrl = res.url;
      }

      const post = {
        description: desc,
        imageUrl,
      };

      // Try backend first
      try {
        const saved = await apiCreatePost(post);
        setFile(null);
        setDesc('');
        setPreview(null);
        if (onCreated) onCreated(saved);
      } catch (err) {
        // Fallback to localStorage service when API fails
        const local = {
          id: `${profile.id}_${Date.now()}`,
          author: { id: profile.id, name: profile.name || profile.username || 'Helper', avatar: profile.avatar },
          imageUrl,
          description: desc,
          createdAt: new Date().toISOString(),
        };
        postsService.addPost(local);
        setFile(null);
        setDesc('');
        setPreview(null);
        if (onCreated) onCreated(local);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-4 mb-4">
      <h3 className="font-semibold mb-2">Create a Post</h3>
      <div className="flex gap-3">
        <img src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'user'}`} className="w-12 h-12 rounded-full border" />
        <div className="flex-1">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the work you did..." className="w-full border rounded p-2 mb-2" />

          <div className="flex items-center gap-3">
            <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer">
              {file ? 'Change Image' : 'Upload Image'}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <button onClick={submit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>

          {preview && <img src={preview} className="mt-3 max-h-60 object-cover rounded" />}
        </div>
      </div>
    </div>
  );
}
