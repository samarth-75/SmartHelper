import { useEffect, useState } from "react";
import API from "../../services/api";
import { useApp } from "../../context/AppContext";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function FamilyProfile() {
  const { user, login } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", address: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadToCloudinary(file);

      if (result.success) {
        // Update form with new avatar URL
        const updatedForm = { ...form };
        const res = await API.put("/auth/profile", { ...updatedForm, avatar: result.url });
        login(res.data);
        alert("Avatar uploaded successfully");
      } else {
        alert("Failed to upload avatar: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-2xl border mb-6">
        <div className="flex gap-6">
          <div>
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=profile"} className="w-32 h-32 rounded-full border" alt="avatar" />
            <div className="mt-3">
              <label className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={uploading}
                  className="hidden" 
                />
                <button 
                  disabled={uploading}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
                  onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </label>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
              <input className="p-3 border rounded" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
              <input className="p-3 border rounded col-span-2" placeholder="Address" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} />
              <textarea className="p-3 border rounded col-span-2" placeholder="Bio" value={form.bio} onChange={(e)=>setForm({...form, bio: e.target.value})} />
            </div>

            <div className="mt-4">
              <button disabled={loading} onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all">{loading ? 'Saving...' : 'Save Profile'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border">
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
