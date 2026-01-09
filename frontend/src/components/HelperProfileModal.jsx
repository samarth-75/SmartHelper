import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import API, { getHelperRating } from '../services/api';

export default function HelperProfileModal({ helperId, onClose }) {
  const [helper, setHelper] = useState(null);
  const [rating, setRating] = useState({ avgRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        // Fetch helper details
        const res = await API.get(`/auth/helpers`);
        const helpers = res.data;
        const found = helpers.find(h => h.id === helperId);
        setHelper(found || null);

        // Fetch helper rating
        const ratingRes = await getHelperRating(helperId);
        setRating(ratingRes);
      } catch (err) {
        console.error('Failed to fetch helper:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHelper();
  }, [helperId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <p className="text-center text-gray-500">Helper not found</p>
          <button onClick={onClose} className="w-full mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  const avgRating = parseFloat(rating.avgRating).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Name */}
          <div className="text-center">
            <img 
              src={helper.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${helper.name}`} 
              className="w-24 h-24 rounded-full mx-auto border-4 border-blue-200 object-cover" 
              alt={helper.name}
            />
            <h3 className="text-2xl font-bold text-gray-800 mt-4">{helper.name}</h3>
            <p className="text-gray-600 mt-1">{helper.email}</p>
          </div>

          {/* Rating */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                <span className="text-2xl font-bold text-gray-800">{avgRating}</span>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">{rating.total} {rating.total === 1 ? 'review' : 'reviews'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            {helper.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="text-gray-800">{helper.phone}</span>
              </div>
            )}
            {helper.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Address:</span>
                <span className="text-gray-800">{helper.address}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {helper.bio && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700"><b>About:</b></p>
              <p className="text-gray-700 mt-2">{helper.bio}</p>
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
