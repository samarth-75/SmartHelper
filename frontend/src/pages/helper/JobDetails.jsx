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
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);


  useEffect(() => {
    // load job details
    API.get("/jobs")
      .then((res) => {
        const found = res.data.find((j) => j.id == id);
        setJob(found);
      })
      .catch(() => toast.error("Failed to load job"));

    // load helper's applied job ids
    API.get("/applications/helper")
      .then((res) => {
        if (res.data.includes(Number(id))) setApplied(true);
      })
      .catch(() => {
        // not logged in as helper or endpoint unavailable — ignore
        setApplied(false);
      });
  }, [id]);

  if (!job) return <p className="p-8">Loading...</p>;

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

  // Optimistically mark as applied
  setApplied(true);

  // Close modal and clear inputs immediately for instant feedback
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
      // Rollback optimistic update if server says already applied
      setApplied(false);
      toast("Already applied");
    }
  } catch (err) {
    // Rollback optimistic update on error
    setApplied(false);
    toast.error("Failed to apply. Please try again.");
  } finally {
    setIsApplying(false);
    setSelectedJobId(null);
  }
};


  return (
    <>
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
            onClick={() => openApplyModal(job.id)}
            className={`w-full mt-4 py-3 rounded-xl ${
                applied ? "bg-gray-400 text-white" : "bg-gradient-to-r from-blue-600 to-teal-600 text-white"
            }`}
            >
            {applied ? "Applied" : "Apply Now"}
        </button>
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
