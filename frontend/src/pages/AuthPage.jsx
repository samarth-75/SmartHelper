import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Eye, EyeOff, Users, Briefcase } from "lucide-react";
import API from "../services/api.js";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(params.get("role") || "family");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isLogin) {
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      navigate(res.data.role === "family" ? "/family/dashboard" : "/helper/dashboard");
    } else {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });

      toast.success("Registration successful. Please login.");
      setFormData({
        name: "",
        email: "",
        password: ""
      });
      setIsLogin(true);
    }
  } catch (err) {
    toast.error(err.response?.data?.error || "Something went wrong");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">

        <div className="hidden md:flex flex-col justify-center p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-teal-600 text-white">
          <h2 className="text-4xl font-bold mb-4">SmartHelper</h2>
          <p className="text-blue-100">
            Join thousands of families and helpers creating safer, smarter homes together.
          </p>

          <div className="space-y-4"> <div className="flex items-start gap-6"> <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"> ✓ </div> <p>AI-powered matching system</p> </div> <div className="flex items-start gap-3"> <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"> ✓ </div> <p>Verified and trusted profiles</p> </div> <div className="flex items-start gap-3"> <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"> ✓ </div> <p>Secure payment processing</p> </div> </div> 
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">{isLogin ? "Sign In" : "Create Account"}</h3>

          <div className="flex gap-3 mb-6">
            <RoleCard active={role === "family"} onClick={() => setRole("family")} icon={<Users />} text="Family" />
            <RoleCard active={role === "helper"} onClick={() => setRole("helper")} icon={<Briefcase />} text="Helper" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            )}

            <input
              className="w-full p-3 border rounded-xl"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border rounded-xl pr-10"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p onClick={() => setIsLogin(!isLogin)} className="text-center mt-4 text-blue-600 cursor-pointer">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 border rounded-xl ${active ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
    >
      <div className="flex flex-col items-center">
        <div className={active ? "text-blue-600" : "text-gray-400"}>{icon}</div>
        <span className={active ? "text-blue-600" : "text-gray-600"}>{text}</span>
      </div>
    </button>
  );
}
