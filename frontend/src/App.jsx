import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import FamilyDashboard from "./pages/family/Dashboard";
import HelperDashboard from "./pages/helper/Dashboard";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./components/DashboardLayout";
import AllHelpers from "./pages/family/AllHelpers";
import PostJob from "./pages/family/PostJob";
import Attendance from "./pages/family/Attendance";
import Payments from "./pages/family/Payments";
import HelperJobs from "./pages/helper/Jobs";
import CheckIn from "./pages/helper/CheckIn";
import Earnings from "./pages/helper/Earnings";
import HelperAttendance from "./pages/helper/Attendance";
import JobDetails from "./pages/helper/JobDetails";
import Applications from "./pages/family/Applications";
import FamilyProfile from "./pages/family/Profile";
import HelperProfile from "./pages/helper/Profile";

function RouteStopper() {
  const location = useLocation();
  useEffect(() => {
    try { window.dispatchEvent(new Event('stopCamera')); } catch (e) {}
  }, [location.pathname]);

  useEffect(() => {
    const onUnload = () => {
      try { window.dispatchEvent(new Event('stopCamera')); } catch (e) {}
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteStopper />
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/auth" element={<AuthPage />} />

    {/* Family */}
    <Route path="/family/dashboard" element={<DashboardLayout><FamilyDashboard/></DashboardLayout>} />
    <Route path="/family/post-job" element={<DashboardLayout><PostJob/></DashboardLayout>} />
    <Route path="/family/attendance" element={<DashboardLayout><Attendance/></DashboardLayout>} />
    <Route path="/family/payments" element={<DashboardLayout><Payments/></DashboardLayout>} />
    <Route path="/family/helpers" element={<DashboardLayout><AllHelpers/></DashboardLayout>} />
    <Route path="/family/profile" element={<DashboardLayout><FamilyProfile /></DashboardLayout>} />

    {/* Helper */}
    <Route path="/helper/dashboard" element={<DashboardLayout><HelperDashboard/></DashboardLayout>} />
    <Route path="/helper/profile" element={<DashboardLayout><HelperProfile /></DashboardLayout>} />
    <Route path="/helper/attendance" element={<DashboardLayout><HelperAttendance/></DashboardLayout>} />
    <Route path="/helper/jobs" element={<DashboardLayout><HelperJobs/></DashboardLayout>} />
    <Route path="/helper/checkin" element={<DashboardLayout><CheckIn/></DashboardLayout>} />
    <Route path="/helper/earnings" element={<DashboardLayout><Earnings/></DashboardLayout>} />
    <Route
      path="/helper/jobs/:id"
      element={
        <DashboardLayout>
          <JobDetails />
        </DashboardLayout>
      }
    />
    <Route
      path="/family/applications"
      element={
        <DashboardLayout>
          <Applications />
        </DashboardLayout>
      }
    />
  </Routes>
</BrowserRouter>

  );
}
