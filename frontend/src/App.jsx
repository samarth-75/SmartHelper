import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import FamilyDashboard from "./pages/family/Dashboard";
import HelperDashboard from "./pages/helper/Dashboard";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./components/DashboardLayout";
import AllHelpers from "./pages/family/AllHelpers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/family/dashboard"
          element={
            <DashboardLayout>
              <FamilyDashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/family/helpers"
          element={
            <DashboardLayout>
              <AllHelpers />
            </DashboardLayout>
          }
        />

        <Route
          path="/helper/dashboard"
          element={
            <DashboardLayout>
              <HelperDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/helper/dashboard"
          element={
            <DashboardLayout>
              <HelperDashboard />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
