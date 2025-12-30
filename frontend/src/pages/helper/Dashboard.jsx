import { Briefcase, DollarSign, Clock, Star, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelperDashboard() {
  const stats = [
    { label: 'Jobs Applied', value: '12', icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+3 this week' },
    { label: 'Jobs Assigned', value: '4', icon: Star, color: 'from-purple-500 to-purple-600', change: '1 new' },
    { label: 'Hours Worked', value: '156', icon: Clock, color: 'from-teal-500 to-teal-600', change: 'This month' },
    { label: 'Total Earnings', value: '$2,340', icon: DollarSign, color: 'from-green-500 to-green-600', change: '+$450 this week' },
  ];

  const jobRecommendations = [
    {
      id: 1,
      title: 'Part-time Housekeeper',
      family: 'Johnson Family',
      location: '123 Oak Street, Boston',
      pay: '$18/hour',
      time: 'Mon-Fri, 9AM - 1PM',
      posted: '2 hours ago',
      match: 95
    },
    {
      id: 2,
      title: 'Weekend Babysitter',
      family: 'Smith Family',
      location: '456 Elm Avenue, Cambridge',
      pay: '$20/hour',
      time: 'Sat-Sun, 10AM - 6PM',
      posted: '5 hours ago',
      match: 88
    },
    {
      id: 3,
      title: 'Evening Cook',
      family: 'Brown Family',
      location: '789 Maple Drive, Brookline',
      pay: '$25/hour',
      time: 'Mon-Thu, 5PM - 8PM',
      posted: '1 day ago',
      match: 82
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back! 🎉</h1>
        <p className="text-gray-600">Here are your job opportunities and earnings overview</p>
      </div>

      {/* Profile Completion Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Complete Your Profile</h3>
            <p className="text-purple-100">Stand out to families by completing your profile</p>
          </div>
          <Link
            to="/helper/profile"
            className="px-6 py-2 rounded-xl bg-white text-purple-600 font-medium hover:shadow-lg transition-all"
          >
            Complete Now
          </Link>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div className="bg-white rounded-full h-2 w-[85%]" />
        </div>
        <p className="text-sm text-purple-100 mt-2">85% Complete</p>
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
          {jobRecommendations.map((job) => (
            <div key={job.id} className="p-5 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {job.match}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{job.family}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{job.pay}</div>
                  <p className="text-xs text-gray-500">{job.posted}</p>
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
                <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all">
                  Apply Now
                </button>
                <button className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
