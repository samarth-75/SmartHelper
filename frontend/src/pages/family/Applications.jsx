import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    API.get("/applications/family").then(res => setApps(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Applications</h1>

      {apps.length === 0 && (
        <p className="text-gray-600">No applications yet.</p>
      )}

      {apps.map((a) => (
        <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
          <p><b>Helper:</b> {a.helper} {a.helperEmail ? (<span className="text-sm text-gray-500">— <a href={`mailto:${a.helperEmail}`} className="text-blue-600">{a.helperEmail}</a></span>) : null}</p>
          <p><b>Phone:</b> {a.phone}</p>
          <p><b>Address:</b> {a.address}</p>
          <p><b>Message:</b> {a.message || "—"}</p>
          <p><b>Applied for:</b> {a.title}</p>
          <p className="text-sm text-gray-500">Applied at: {a.createdAt}</p>
        </div>
      ))}
    </div>
  );
}
