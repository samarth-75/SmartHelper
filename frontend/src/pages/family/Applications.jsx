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

      {apps.map((a) => (
        <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
          <p><b>Helper:</b> {a.helper}</p>
          <p><b>Applied for:</b> {a.title}</p>
        </div>
      ))}
    </div>
  );
}
