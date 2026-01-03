import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);



  useEffect(() => {
    API.get("/jobs").then((res) => setJobs(res.data)).catch((err) => {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    });

    API.get("/applications/helper")
      .then((res) => setAppliedJobs(res.data))
      .catch((err) => {
        // If helper endpoint not found or other error, default to no applied jobs
        console.warn("Could not fetch applied jobs (maybe not logged in as helper):", err?.message || err);
        setAppliedJobs([]);
      });
  }, []);

  
  const openApplyModal = (jobId) => {
  setSelectedJobId(jobId);
  setShowModal(true);
};

const confirmApply = async () => {
  if (!phone || !address) {
    toast.error("Phone & address are required");
    return;
  }

  // Prevent duplicate submissions
  setIsApplying(true);

  // Optimistically mark as applied so the button updates immediately
  setAppliedJobs((prev) => (prev.includes(selectedJobId) ? prev : [...prev, selectedJobId]));

  // Close modal and clear inputs immediately so user sees instant feedback
  setShowModal(false);
  setPhone("");
  setAddress("");
  setMessage("");

  try {
    const res = await API.post("/applications", {
      jobId: selectedJobId,
      phone,
      address,
      message,
    });

    if (res.data.applied) {
      toast.success("Application sent!");
    } else {
      // Rollback optimistic update if server reports already applied
      setAppliedJobs((prev) => prev.filter((id) => id !== selectedJobId));
      toast("Already applied");
    }
  } catch (err) {
    // Rollback optimistic update on error
    setAppliedJobs((prev) => prev.filter((id) => id !== selectedJobId));
    toast.error("Failed to apply. Please try again.");
  } finally {
    setIsApplying(false);
    setSelectedJobId(null);
  }
};



  return (
  <>
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Available Jobs</h2>

        {jobs.length === 0 && (
          <p className="text-gray-600">No jobs posted yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {job.category}
              </p>
              <p className="mt-1 text-gray-700">📍 {job.location}</p>
              <p className="mt-1 text-green-600 font-semibold">
                ₹{job.payPerHour}/hr
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {job.date} at {job.time} • {job.duration}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openApplyModal(job.id)}
                  disabled={appliedJobs.includes(job.id)}
                  className={`flex-1 py-2 rounded ${
                    appliedJobs.includes(job.id)
                      ? "bg-gray-400 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {appliedJobs.includes(job.id)
                    ? "Applied"
                    : "Apply Now"}
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

    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
          <h3 className="text-xl font-bold">Apply for Job</h3>

          <input
            type="text"
            placeholder="Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Current Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={confirmApply}
              disabled={isApplying}
              className={`flex-1 bg-blue-600 text-white py-2 rounded ${isApplying ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Confirm Apply
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 border rounded py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

}
