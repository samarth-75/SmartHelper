import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from 'react-hot-toast';
import HelperProfileModal from "../../components/HelperProfileModal";

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [selectedHelperId, setSelectedHelperId] = useState(null);

  useEffect(() => {
    API.get("/applications/family").then(res => setApps(res.data));
  }, []);

  const handleAccept = async (id, jobId) => {
    if (!window.confirm("Accept this application? This will assign the job to this helper and reject other applications.")) return;
    try {
      setProcessingId(id);
      await API.post(`/applications/${id}/accept`);
      const now = new Date().toISOString();
      setApps(prev => prev.map(a => {
        if (a.id === id) return { ...a, status: 'accepted', decidedAt: now };
        if (a.jobId === jobId && a.id !== id) return { ...a, status: 'rejected', decidedAt: now };
        return a;
      }));
      toast.success('Application accepted');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Failed to accept');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this application?")) return;
    try {
      setProcessingId(id);
      await API.post(`/applications/${id}/reject`);
      const now = new Date().toISOString();
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', decidedAt: now } : a));
      toast.success('Application rejected');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Applications</h1>

      {apps.length === 0 && (
        <p className="text-gray-600 text-lg">No applications yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
            {/* Helper name header */}
            <button
              onClick={() => setSelectedHelperId(a.helperId)}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 hover:from-blue-100 hover:to-indigo-100 transition-all text-left"
            >
              <h3 className="text-lg font-bold text-blue-600 hover:text-blue-700 truncate">{a.helper}</h3>
              <p className="text-xs text-gray-600 mt-1">{a.helperEmail}</p>
            </button>

            {/* Application details */}
            <div className="p-4 space-y-3 flex-1">
              <div>
                <p className="text-xs text-gray-500 font-medium">APPLIED FOR</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{a.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Phone</p>
                  <p className="text-sm text-gray-800 mt-1 truncate">{a.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Applied</p>
                  <p className="text-xs text-gray-800 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {a.address && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Address</p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-2">{a.address}</p>
                </div>
              )}

              {a.message && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium">Message</p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-3">{a.message}</p>
                </div>
              )}
            </div>

            {/* Status and actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {a.status === 'accepted' && (
                <span className="inline-block text-green-700 bg-green-100 px-4 py-2 rounded-lg font-medium text-sm w-full text-center">✓ Accepted</span>
              )}
              {a.status === 'rejected' && (
                <span className="inline-block text-gray-600 bg-gray-200 px-4 py-2 rounded-lg font-medium text-sm w-full text-center">✗ Rejected</span>
              )}

              {(!a.status || a.status === 'pending') && (
                <div className="flex gap-2">
                  <button 
                    disabled={processingId===a.id} 
                    onClick={() => handleAccept(a.id, a.jobId)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {processingId===a.id ? '...' : 'Accept'}
                  </button>
                  <button 
                    disabled={processingId===a.id} 
                    onClick={() => handleReject(a.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {processingId===a.id ? '...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Helper Profile Modal */}
      {selectedHelperId && (
        <HelperProfileModal 
          helperId={selectedHelperId}
          onClose={() => setSelectedHelperId(null)}
        />
      )}
    </div>
  );
}
