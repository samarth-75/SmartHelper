import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  PlusCircle,
  FileText,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getChatbaseToken } from "../services/api";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isFamilyDashboard = location.pathname.startsWith("/family");

  const familyMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/family/dashboard" },
    { icon: User, label: "Profile", path: "/family/profile" },
    { icon: PlusCircle, label: "Post Job", path: "/family/post-job" },
    { icon: FileText, label: "Applications", path: "/family/applications" },
    { icon: Clock, label: "Attendance", path: "/family/attendance" },
    { icon: DollarSign, label: "Payments", path: "/family/payments" },
    { icon: Star, label: "Feedback", path: "/family/feedback" },
  ];

  const helperMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/helper/dashboard" },
    { icon: User, label: "Profile", path: "/helper/profile" },
    { icon: FileText, label: "Browse Jobs", path: "/helper/jobs" },
    { icon: Clock, label: "Attendance", path: "/helper/attendance" },
    { icon: DollarSign, label: "Earnings", path: "/helper/earnings" },
    { icon: Star, label: "Reviews", path: "/helper/reviews" },
  ];

  const menuItems = isFamilyDashboard ? familyMenuItems : helperMenuItems;

  const handleLogout = () => {
    // stop any active camera streams in other components before logout
    try { window.dispatchEvent(new Event('stopCamera')); } catch (e) {}
    logout();
    navigate("/");
  };

  // dispatch stopCamera on any route change to ensure cameras are stopped
  useEffect(() => {
    try { window.dispatchEvent(new Event('stopCamera')); } catch (e) {}
  }, [location.pathname]);

  // When a user is present, request a short-lived Chatbase identity token and identify the widget
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    let pollTimer = null;

    const identifyOnce = (cbToken) => {
      if (!cbToken) return;
      try {
        console.debug('Attempting Chatbase identify', { cbTokenPresent: !!cbToken });
        // Call immediately - the proxy will queue this until the embed loads
        window.chatbase?.('identify', { token: cbToken });
      } catch (e) {
        console.error('Chatbase identify error', e);
      }
    };

    const identify = async () => {
      try {
        const res = await getChatbaseToken();
        const cbToken = res?.token;
        if (!mounted) return;
        if (!cbToken) {
          console.warn('No chatbase token returned from server');
          return;
        }

        identifyOnce(cbToken);

        // If embed is not initialized yet, poll until it is and identify again to ensure UI registers the user
        try {
          const state = window.chatbase && window.chatbase('getState');
          let tries = 0;
          if (state !== 'initialized') {
            pollTimer = setInterval(() => {
              try {
                const s = window.chatbase && window.chatbase('getState');
                if (s === 'initialized') {
                  identifyOnce(cbToken);
                  clearInterval(pollTimer);
                }
                if (++tries > 20) { // stop after ~5s
                  clearInterval(pollTimer);
                }
              } catch (e) {
                // ignore transient errors
              }
            }, 250);
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Chatbase identify failed', err);
      }
    };

    identify();
    return () => { mounted = false; if (pollTimer) clearInterval(pollTimer); };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <Shield className="text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                SmartHelper
              </span>
            </Link>
          </div>

          <Link to={isFamilyDashboard ? "/family/profile" : "/helper/profile"} className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
            </div>
            <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-blue-500" />
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform top-[73px] z-30`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location.pathname === item.path ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t">
              <Link to={isFamilyDashboard ? "/family/ai-assistant" : "/helper/ai-assistant"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-600 hover:bg-purple-50">
                <MessageSquare /> AI Assistant
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50">
                <LogOut /> Logout
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
