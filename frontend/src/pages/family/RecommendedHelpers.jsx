import { useEffect, useState } from 'react';
import { getHelpers } from '../../services/api';

export default function RecommendedHelpers() {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    getHelpers().then((res) => setHelpers(res)).catch(() => setHelpers([]));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Recommended Helpers</h1>
      <p className="text-gray-600 mb-6">Helpers recommended by SmartMatch (based on ratings)</p>

      {helpers.length === 0 && <p className="text-gray-600">No helpers found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helpers.map((h) => (
          <div key={h.id} className="p-4 bg-white rounded-xl shadow-sm flex items-center gap-4">
            <img src={h.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.name}`} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <div className="font-semibold">{h.name}</div>
              <div className="text-sm text-gray-600">{h.bio || '—'}</div>
            </div>
            <div className="text-yellow-500 font-medium">⭐ {h.avgRating || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
