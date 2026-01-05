import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    API.get('/attendance/family')
      .then(res => setRecords(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Attendance Records</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          {records.length === 0 ? (
            <p className="text-gray-600">No attendance records yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th>Date</th>
                  <th>Helper</th>
                  <th>Action</th>
                  <th>Location</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.helperName} — {r.helperEmail}</td>
                    <td className="capitalize">{r.action.replace('-', ' ')}</td>
                    <td>{r.lat ? `${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}` : 'Unknown'}</td>
                    <td>{new Date(r.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
