import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import FamilyDashboard from "./pages/family/Dashboard";
import HelperDashboard from "./pages/helper/Dashboard";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/family/dashboard" element={<FamilyDashboard />} />
        <Route path="/helper/dashboard" element={<HelperDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
