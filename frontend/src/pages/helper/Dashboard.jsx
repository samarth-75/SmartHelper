import { Briefcase, DollarSign, Clock, Star, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API, { getHelperAssignedJobs, getHelperApplications } from '../../services/api';
import toast from 'react-hot-toast';

export default function HelperDashboard() {
  const [appliedCount, setAppliedCount] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [assignedCount, setAssignedCount] = useState(0);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Apply modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Fetch helper's applied job IDs and all jobs together so we can filter out applied ones
    Promise.all([
      getHelperApplications().catch(() => []),
      API.get('/jobs').then((r) => r.data).catch(() => [])
    ])
      .then(([apps, jobs]) => {
        const applied = apps || [];
        setAppliedJobs(applied);
        setAppliedCount(applied.length);
        const filtered = (jobs || []).filter((job) => !applied.includes(job.id));
        setRecommendedJobs(filtered.slice(0, 3));
      })
      .catch(() => {
        setAppliedJobs([]);
        setAppliedCount(0);
        setRecommendedJobs([]);
      });

    // Assigned jobs
    getHelperAssignedJobs().then((res) => setAssignedCount((res || []).length)).catch(() => setAssignedCount(0));

    // Payments -> hours and earnings
    API.get('/payments/helper').then((res) => {
      const p = res.data || [];
      const totalHours = p.reduce((acc, cur) => acc + (cur.hoursWorked || 0), 0);
      const earnings = p.reduce((acc, cur) => acc + (cur.amount || 0), 0);
      setHoursWorked(totalHours);
      setTotalEarnings(earnings);
    }).catch(() => { setHoursWorked(0); setTotalEarnings(0); });
  }, []);

  // Open apply modal
  const openApplyModal = (jobId) => {
    setSelectedJobId(jobId);
    setShowModal(true);
  };

  const confirmApply = async () => {
    if (!phone || !address) {
      toast.error('Phone & address are required');
      return;
    }

    // Prevent duplicate submissions
    setIsApplying(true);

    // Optimistic update
    setAppliedJobs((prev) => (prev.includes(selectedJobId) ? prev : [...prev, selectedJobId]));
    setAppliedCount((c) => c + (appliedJobs.includes(selectedJobId) ? 0 : 1));

    // Close modal and clear inputs
    setShowModal(false);
    setPhone('');
    setAddress('');
    setMessage('');

    try {
      const res = await API.post('/applications', {
        jobId: selectedJobId,
        phone,
        address,
        message,
      });

      if (res.data.applied) {
        toast.success('Application sent!');
      } else {
        // Rollback optimistic update if server reports already applied
        setAppliedJobs((prev) => prev.filter((id) => id !== selectedJobId));
        setAppliedCount((c) => Math.max(0, c - 1));
        toast('Already applied');
      }
    } catch (err) {
      // Rollback optimistic update on error
      setAppliedJobs((prev) => prev.filter((id) => id !== selectedJobId));
      setAppliedCount((c) => Math.max(0, c - 1));
      toast.error('Failed to apply. Please try again.');
    } finally {
      setIsApplying(false);
      setSelectedJobId(null);
    }
  };

  const stats = [
    { label: 'Jobs Applied', value: appliedCount, icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+ recent' },
    { label: 'Jobs Assigned', value: assignedCount, icon: Star, color: 'from-purple-500 to-purple-600', change: '' },
    { label: 'Hours Worked', value: hoursWorked, icon: Clock, color: 'from-teal-500 to-teal-600', change: '' },
    { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: DollarSign, color: 'from-green-500 to-green-600', change: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back! 🎉</h1>
        <p className="text-gray-600">Here are your job opportunities and earnings overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Job Recommendations */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Recommended Jobs for You</h2>
            <p className="text-sm text-gray-600 mt-1">Based on your profile and preferences</p>
          </div>
          <Link to="/helper/jobs" className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View All Jobs
          </Link>
        </div>
        
        <div className="space-y-4">
          {recommendedJobs.map((job) => (
            <div key={job.id} className="p-5 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {/* Simple match score placeholder */}
                      {Math.round((Math.random()*15)+75)}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{job.payPerHour}/hr</div>
                  <p className="text-xs text-gray-500">{job.date || job.time}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.time}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link to={`/helper/jobs/${job.id}`} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all text-center">
                  View Details
                </Link>
                <button
                  onClick={() => openApplyModal(job.id)}
                  disabled={appliedJobs.includes(job.id)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${appliedJobs.includes(job.id) ? 'bg-gray-300 text-white border-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {appliedJobs.includes(job.id) ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
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
                className={`flex-1 bg-blue-600 text-white py-2 rounded ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/helper/jobs" className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white hover:shadow-xl transition-all group block">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-lg">Browse Jobs</span>
          </div>
          <p className="text-sm text-blue-100">Find new opportunities near you</p>
        </Link>

        <Link to="/helper/attendance" className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl transition-all group block">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-lg">Mark Attendance</span>
          </div>
          <p className="text-sm text-purple-100">Check-in/out with face recognition</p>
        </Link>

        <Link to="/helper/earnings" className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-xl transition-all group block">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-lg">View Earnings</span>
          </div>
          <p className="text-sm text-green-100">Track your payments and history</p>
        </Link>
      </div>
    </div>
  );
}
