import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [processingId, setProcessingId] = useState(null);

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
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Failed to accept');
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
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Applications</h1>

      {apps.length === 0 && (
        <p className="text-gray-600">No applications yet.</p>
      )}

      {apps.map((a) => (
        <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p><b>Helper:</b> {a.helper} {a.helperEmail ? (<span className="text-sm text-gray-500">— <a href={`mailto:${a.helperEmail}`} className="text-blue-600">{a.helperEmail}</a></span>) : null}</p>
              <p><b>Phone:</b> {a.phone}</p>
              <p><b>Address:</b> {a.address}</p>
              <p><b>Message:</b> {a.message || "—"}</p>
              <p><b>Applied for:</b> {a.title}</p>
              <p className="text-sm text-gray-500">Applied at: {a.createdAt}</p>
            </div>

            <div className="ml-4 flex items-center">
              {a.status === 'accepted' && (
                <span className="text-green-700 bg-green-100 px-3 py-1 rounded">Accepted</span>
              )}
              {a.status === 'rejected' && (
                <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded">Rejected</span>
              )}

              {(!a.status || a.status === 'pending') && (
                <div className="flex gap-2">
                  <button disabled={processingId===a.id} onClick={() => handleAccept(a.id, a.jobId)} className="bg-green-600 text-white px-3 py-1 rounded">{processingId===a.id ? 'Processing...' : 'Accept'}</button>
                  <button disabled={processingId===a.id} onClick={() => handleReject(a.id)} className="bg-red-600 text-white px-3 py-1 rounded">{processingId===a.id ? 'Processing...' : 'Reject'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
