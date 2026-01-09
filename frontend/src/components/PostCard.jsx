import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import postsService from '../services/postsService';
import { toggleFollow as apiToggleFollow, deletePost as apiDeletePost } from '../services/api';

export default function PostCard({ post, currentUser, onFollowChange, onDelete, showDelete = false }) {
  const [following, setFollowing] = useState(post.isFollowing || false);
  const [count, setCount] = useState(post.followerCount ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFollow = async () => {
    try {
      const res = await apiToggleFollow(post.author.id);
      setFollowing(res.following);
      setCount(res.count);
      if (onFollowChange) onFollowChange(post.author.id, res.following);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      setIsDeleting(true);
      try {
        await apiDeletePost(post.id);
        if (onDelete) onDelete(post.id);
      } catch (err) {
        console.error('Failed to delete post:', err);
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleString();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" alt="avatar" />
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-800">{post.author.name}</div>
              {count >= 100 && <span className="text-blue-600 font-medium text-lg">✔️</span>}
            </div>
            <div className="text-xs text-gray-500">{formattedDate}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.id !== post.author.id && (
            <button onClick={handleToggleFollow} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              following ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100' : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-blue-300 hover:border-blue-400'
            }`}>
              <Heart className="w-4 h-4" fill={following ? 'currentColor' : 'none'} />
              <span className="text-sm">{following ? 'Following' : 'Follow'}</span>
            </button>
          )}
          
          {showDelete && currentUser?.id === post.author.id && (
            <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {post.imageUrl && (
        <div className="w-full bg-gray-100 flex items-center justify-center">
          <img src={post.imageUrl} alt="post" className="w-full max-h-[520px] object-contain" />
        </div>
      )}

      <div className="p-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.description}</p>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2 text-sm text-gray-600 font-medium">
        <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
        <span>{count} {count === 1 ? 'follower' : 'followers'}</span>
      </div>
    </div>
  );
}
