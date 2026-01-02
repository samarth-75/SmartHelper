import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);


  useEffect(() => {
    API.get("/jobs")
      .then((res) => {
        const found = res.data.find((j) => j.id == id);
        setJob(found);
      })
      .catch(() => toast.error("Failed to load job"));
  },
    API.get("/applications/helper").then(res=>{
    if(res.data.includes(Number(id))) setApplied(true);
    })

  , [id]);

  if (!job) return <p className="p-8">Loading...</p>;

  const apply = async () => {
  const res = await API.post("/applications", { jobId: id });

  if(res.data.applied){
    toast.success("Applied!");
    setApplied(true);
  } else {
    toast("Already applied");
  }
};


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white p-8 rounded-2xl shadow space-y-4">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-gray-600 capitalize">{job.category}</p>

        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <p>📍 {job.location}</p>
          <p>💰 ₹{job.payPerHour} / hour</p>
          <p>🗓 {job.date}</p>
          <p>⏰ {job.time} — {job.duration}</p>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Job Description</h3>
          <p className="text-gray-600">{job.description}</p>
        </div>

        {/* Apply Button */}
        <button
            disabled={applied}
            onClick={apply}
            className={`w-full mt-4 py-3 rounded-xl ${
                applied ? "bg-gray-400 text-white" : "bg-gradient-to-r from-blue-600 to-teal-600 text-white"
            }`}
            >
            {applied ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}
