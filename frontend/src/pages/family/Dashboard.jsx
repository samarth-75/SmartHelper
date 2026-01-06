import { Briefcase, Users, Clock, DollarSign, Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API, { getFamilyAssignedHelpers, getHelpers, fetchFamilyPayments } from "../../services/api";

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [assignedHelpers, setAssignedHelpers] = useState([]);
  const [recommendedHelpers, setRecommendedHelpers] = useState([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [hoursThisWeek, setHoursThisWeek] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    // load profile
    API.get('/auth/profile').then((res) => {
      setProfile(res.data);
      // After profile, fetch jobs to compute counts
      API.get('/jobs').then((r) => {
        const myJobs = r.data.filter((j) => j.familyId === res.data.id);
        setJobsCount(myJobs.length);
      }).catch(() => setJobsCount(0));
    }).catch(() => setProfile(null));

    getFamilyAssignedHelpers().then((rows) => setAssignedHelpers(rows)).catch(() => setAssignedHelpers([]));
    getHelpers().then((rows) => setRecommendedHelpers(rows)).catch(() => setRecommendedHelpers([]));

    fetchFamilyPayments().then((p) => {
      // compute hours in last 7 days and pending amount
      const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const hours = (p || []).reduce((acc, cur) => {
        const created = new Date(cur.createdAt).getTime();
        if (created >= oneWeekAgo) return acc + (cur.hoursWorked || 0);
        return acc;
      }, 0);
      const pending = (p || []).reduce((acc, cur) => (cur.status === 'pending' ? acc + (cur.amount || 0) : acc), 0);
      setHoursThisWeek(hours);
      setPendingAmount(pending);
    }).catch(() => { setHoursThisWeek(0); setPendingAmount(0); });
  }, []);

  const stats = [
    { label: "Active Jobs", value: jobsCount, icon: Briefcase, color: "from-blue-500 to-blue-600", change: "+new" },
    { label: "Assigned Helpers", value: assignedHelpers.length, icon: Users, color: "from-teal-500 to-teal-600", change: `${assignedHelpers.length > 0 ? 'new' : ''}` },
    { label: "Hours This Week", value: hoursThisWeek, icon: Clock, color: "from-purple-500 to-purple-600", change: "+ since last week" },
    { label: "Pending Payments", value: `₹${pendingAmount}`, icon: DollarSign, color: "from-green-500 to-green-600", change: "pending" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your household today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-6 rounded-2xl bg-white border hover:shadow-xl">
              <div className="flex justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Helpers */}
        <div className="p-6 rounded-2xl bg-white border shadow-sm">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Active Helpers</h2>
            <Link to="/family/assigned-helpers" className="text-blue-600 text-sm">View All</Link>
          </div>
          {assignedHelpers.map((h) => (
            <div key={h.jobId} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl">
              <img src={h.helperAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.helperName}`} className="w-12 h-12 rounded-full border" />
              <div className="flex-1">
                <div className="font-semibold">{h.helperName}</div>
                <p className="text-sm text-gray-600">{h.title}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${h.date ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{h.date || ""}</span>
                <p className="text-xs text-gray-500">{h.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 Recommended Helpers */}
        <div className="p-6 rounded-2xl bg-white border shadow-sm">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">SmartMatch – Recommended Helpers</h2>
            <Link to="/family/recommended-helpers" className="text-blue-600 text-sm">View All</Link>
          </div>
          {recommendedHelpers.slice(0,3).map((h) => (
            <div key={h.id} className="flex justify-between p-3 hover:bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold">{h.name}</div>
                <p className="text-sm text-gray-600">{h.bio || '—'}</p>
              </div>
              <div className="text-yellow-500 font-medium">⭐ {h.avgRating || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/family/post-job" className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white block">Post New Job</Link>
        <Link to="/family/attendance" className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white block">View Schedule</Link>
        <Link to="/family/payments" className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white block">Process Payment</Link>
      </div>
    </div>
  );
}
