import { useEffect, useState } from 'react';
import { getFamilyAssignedHelpers } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AssignedHelpers() {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    getFamilyAssignedHelpers()
      .then((res) => setHelpers(res))
      .catch((err) => setHelpers([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assigned Helpers</h1>
        <Link to="/family/post-job" className="text-blue-600">Post New Job</Link>
      </div>

      {helpers.length === 0 && <p className="text-gray-600">No helpers currently assigned to your jobs.</p>}

      <div className="grid gap-4">
        {helpers.map((h) => (
          <div key={h.jobId} className="p-4 bg-white rounded-xl shadow-sm flex items-center gap-4">
            <img src={h.helperAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.helperName}`} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <div className="font-semibold">{h.helperName}</div>
              <div className="text-sm text-gray-600">Job: {h.title}</div>
              <div className="text-sm text-gray-500">{h.date} • {h.time}</div>
            </div>
            <div className="text-right">
              <button className="px-3 py-1 rounded border">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
