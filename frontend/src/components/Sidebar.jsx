import { Link } from "react-router-dom";
import { Home, Briefcase, Camera, DollarSign, Star } from "lucide-react";

export default function Sidebar({ role }) {
  const links = role === "family"
    ? [
        { to: "/family/dashboard", icon: <Home />, label: "Dashboard" },
        { to: "/family/profile", icon: <Camera />, label: "Profile" },
        { to: "/family/post-job", icon: <Briefcase />, label: "Post Job" },
        { to: "/family/attendance", icon: <Camera />, label: "Attendance" },
        { to: "/family/payments", icon: <DollarSign />, label: "Payments" },
        { to: "/family/feedback", icon: <Star />, label: "Feedback" },
      ]
    : [
        { to: "/helper/dashboard", icon: <Home />, label: "Dashboard" },
        { to: "/helper/profile", icon: <Camera />, label: "Profile" },
        { to: "/helper/jobs", icon: <Briefcase />, label: "Jobs" },
        { to: "/helper/checkin", icon: <Camera />, label: "Check-In" },
        { to: "/helper/earnings", icon: <DollarSign />, label: "Earnings" },
        { to: "/helper/feedback", icon: <Star />, label: "Feedback" },
      ];

  return (
    <div className="w-64 h-screen bg-white shadow-lg p-5">
      <h1 className="text-xl font-bold text-blue-600 mb-8">SmartHelper</h1>
      {links.map((l,i)=>(
        <Link key={i} to={l.to} className="flex items-center gap-3 p-2 rounded hover:bg-blue-100">
          {l.icon} {l.label}
        </Link>
      ))}
    </div>
  );
}
