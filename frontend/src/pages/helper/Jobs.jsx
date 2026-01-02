import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);


  useEffect(() => {
  API.get("/jobs").then(res => setJobs(res.data));
  API.get("/applications/helper").then(res => setAppliedJobs(res.data));
}, []);

  
  const apply = async (jobId) => {
  const res = await API.post("/applications", { jobId });

  if(res.data.applied){
    toast.success("Application sent!");
    setAppliedJobs([...appliedJobs, jobId]);
  } else {
    toast("Already applied");
  }
};


  return (
    <div className="flex">

      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Available Jobs</h2>

        {jobs.length === 0 && (
          <p className="text-gray-600">No jobs posted yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{job.category}</p>
              <p className="mt-1 text-gray-700">📍 {job.location}</p>
              <p className="mt-1 text-green-600 font-semibold">₹{job.payPerHour}/hr</p>
              <p className="text-sm text-gray-500 mt-1">
                {job.date} at {job.time} • {job.duration}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => apply(job.id)}
                  disabled={appliedJobs.includes(job.id)}
                  className={`flex-1 py-2 rounded ${
                    appliedJobs.includes(job.id)
                      ? "bg-gray-400 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {appliedJobs.includes(job.id) ? "Applied" : "Apply Now"}
                </button>
                <button
                  onClick={() => navigate(`/helper/jobs/${job.id}`)}
                  className="flex-1 border border-gray-300 rounded py-2"
                >
                  View Details
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
