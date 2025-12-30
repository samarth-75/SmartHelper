import { Briefcase, Users, Clock, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FamilyDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Jobs", value: "3", icon: Briefcase, color: "from-blue-500 to-blue-600", change: "+2 this month" },
    { label: "Assigned Helpers", value: "5", icon: Users, color: "from-teal-500 to-teal-600", change: "2 new" },
    { label: "Hours This Week", value: "42", icon: Clock, color: "from-purple-500 to-purple-600", change: "+8 hours" },
    { label: "Pending Payments", value: "₹1,250", icon: DollarSign, color: "from-green-500 to-green-600", change: "3 pending" },
  ];

  const activeHelpers = [
    { id: 1, name: "Maria Garcia", role: "Housekeeper", status: "Working", hours: "4.5h today", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", rating: 4.9 },
    { id: 2, name: "Sarah Lee", role: "Nanny", status: "Off Duty", hours: "8h this week", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", rating: 5.0 },
    { id: 3, name: "Anna Johnson", role: "Cook", status: "Working", hours: "3h today", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna", rating: 4.8 },
  ];

  const recommendedHelpers = [
    { id: 1, name: "Ramesh Patil", skill: "House Cleaning", rating: 4.9 },
    { id: 2, name: "Asha More", skill: "Cooking", rating: 4.8 },
    { id: 3, name: "Sunil Desai", skill: "Elder Care", rating: 4.7 },
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
            <button className="text-blue-600 text-sm">View All</button>
          </div>
          {activeHelpers.map((h) => (
            <div key={h.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl">
              <img src={h.avatar} className="w-12 h-12 rounded-full border" />
              <div className="flex-1">
                <div className="font-semibold">{h.name}</div>
                <p className="text-sm text-gray-600">{h.role}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${h.status === "Working" ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{h.status}</span>
                <p className="text-xs text-gray-500">{h.hours}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 Recommended Helpers */}
        <div className="p-6 rounded-2xl bg-white border shadow-sm">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">SmartMatch – Recommended Helpers</h2>
            <button onClick={() => navigate("/family/helpers")} className="text-blue-600 text-sm">View All</button>
          </div>
          {recommendedHelpers.map((h) => (
            <div key={h.id} className="flex justify-between p-3 hover:bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold">{h.name}</div>
                <p className="text-sm text-gray-600">{h.skill}</p>
              </div>
              <div className="text-yellow-500 font-medium">⭐ {h.rating}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white">Post New Job</button>
        <button className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">View Schedule</button>
        <button className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">Process Payment</button>
      </div>
    </div>
  );
}
