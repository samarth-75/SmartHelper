import { useState } from "react";
import { MapPin, DollarSign, Calendar, Clock, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";


export default function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    duration: "",
    payPerHour: "",
    category: "housekeeping",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Please login again.");
    return navigate("/auth");
  }

  const decoded = jwtDecode(token);

  try {
    await API.post("/jobs", {
      ...formData,
      familyId: decoded.id
    });

    toast.success("Job posted successfully!");
    navigate("/family/dashboard");
  } catch (err) {
    toast.error("Failed to post job");
  }
};


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
        <p className="text-gray-600">Find the perfect helper for your household needs</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-sm border space-y-6">
            <input
              placeholder="Job Title"
              className="w-full p-3 border rounded-xl"
              value={formData.title}
              onChange={(e)=>setFormData({...formData,title:e.target.value})}
              required
            />

            <select
              className="w-full p-3 border rounded-xl"
              value={formData.category}
              onChange={(e)=>setFormData({...formData,category:e.target.value})}
            >
              <option value="housekeeping">Housekeeping</option>
              <option value="babysitter">Babysitter</option>
              <option value="cook">Cook</option>
              <option value="elder-care">Elder Care</option>
              <option value="gardener">Gardener</option>
              <option value="driver">Driver</option>
            </select>

            <textarea
              rows="4"
              className="w-full p-3 border rounded-xl"
              placeholder="Job Description"
              value={formData.description}
              onChange={(e)=>setFormData({...formData,description:e.target.value})}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <input type="date" className="p-3 border rounded-xl"
                onChange={(e)=>setFormData({...formData,date:e.target.value})} required />
              <input type="time" className="p-3 border rounded-xl"
                onChange={(e)=>setFormData({...formData,time:e.target.value})} required />
            </div>

            <input
              className="w-full p-3 border rounded-xl"
              placeholder="Location"
              onChange={(e)=>setFormData({...formData,location:e.target.value})}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <select className="p-3 border rounded-xl"
                onChange={(e)=>setFormData({...formData,duration:e.target.value})}>
                <option value="">Select duration</option>
                <option value="2-4">2-4 hours</option>
                <option value="4-6">4-6 hours</option>
                <option value="6-8">6-8 hours</option>
                <option value="full-day">Full day</option>
              </select>

              <input type="number" className="p-3 border rounded-xl"
                placeholder="Pay / Hour"
                onChange={(e)=>setFormData({...formData,payPerHour:e.target.value})}
                required/>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl">
              Post Job
            </button>
          </form>
        </div>

        {/* LIVE PREVIEW */}
        <div className="p-6 bg-white border rounded-2xl shadow-sm sticky top-24">
          <h3 className="text-gray-500 font-semibold mb-4">Preview</h3>
          <div className="border-2 border-dashed rounded-xl p-4 space-y-2">
            <h4 className="font-bold">{formData.title || "Job Title"}</h4>
            <p className="capitalize">{formData.category}</p>
            {formData.location && <p>📍 {formData.location}</p>}
            {formData.duration && <p>⏳ {formData.duration}</p>}
            {formData.payPerHour && <p className="text-green-600 font-bold">₹{formData.payPerHour}/hr</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
