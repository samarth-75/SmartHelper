import { useEffect, useState } from "react";
import API from "../../services/api";
import { useApp } from "../../context/AppContext";

export default function FamilyProfile() {
  const { user, login } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", address: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", address: user.address || "", bio: user.bio || "" });
      API.get("/auth/family/assigned-helpers").then((res) => setAssigned(res.data)).catch(() => setAssigned([]));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await API.put("/auth/profile", form);
      login(res.data);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex gap-6">
          <div>
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=profile"} className="w-32 h-32 rounded-full border" alt="avatar" />
            <p className="text-sm text-gray-500 mt-2">Avatar upload is disabled for now.</p>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
              <input className="p-3 border rounded" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
              <input className="p-3 border rounded col-span-2" placeholder="Address" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} />
              <textarea className="p-3 border rounded col-span-2" placeholder="Bio" value={form.bio} onChange={(e)=>setForm({...form, bio: e.target.value})} />
            </div>

            <div className="mt-4">
              <button disabled={loading} onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Saving...' : 'Save Profile'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Assigned Helpers</h2>
        {assigned.length === 0 && <p className="text-gray-600">No helpers assigned yet.</p>}
        {assigned.map(a=> (
          <div key={a.jobId} className="flex items-center gap-4 p-3 border rounded mb-3">
            <img src={a.helperAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=helper'} className="w-12 h-12 rounded-full" alt="helper" />
            <div className="flex-1">
              <div className="font-semibold">{a.helperName} <span className="text-sm text-gray-500">— {a.helperEmail}</span></div>
              <div className="text-sm text-gray-600">Job: {a.title}</div>
            </div>
            <div className="text-sm text-gray-500">{a.date} {a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
