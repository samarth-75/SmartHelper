import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  DollarSign,
  MessageSquare,
  Scan,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              SmartHelper
            </span>
          </div>

          <Link
            to="/login"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Trusted Helpers.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Safer Homes.
            </span>{" "}
            Smarter Living.
          </h1>

          <p className="text-xl text-gray-600 mb-10">
            Connect with verified household helpers powered by AI intelligence and
            face recognition technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/auth?role=family"
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              I'm a Family
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/auth?role=helper"
              className="px-8 py-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-all"
            >
              I'm a Helper
            </Link>
          </div>

          <div className="relative">
            <div className="w-full h-96 rounded-3xl bg-gradient-to-br from-blue-100 via-teal-50 to-blue-50 flex items-center justify-center shadow-2xl">
              <div className="absolute left-1/4 w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute right-1/4 w-32 h-32 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Shield className="w-16 h-16 text-teal-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            SmartHelper
          </span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature icon={<Scan />} title="Face Recognition Attendance"
            text="Track helper attendance with AI-powered facial verification." />

          <Feature icon={<CheckCircle2 />} title="Verified Helpers"
            text="All helpers go through identity and background checks." />

          <Feature icon={<DollarSign />} title="Secure Payments"
            text="Transparent payroll system with automated calculations." />

          <Feature icon={<MessageSquare />} title="AI Chatbot Support"
            text="24/7 intelligent assistant for families and helpers." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          <span className="font-semibold text-blue-600">SmartHelper</span>
          <span className="text-gray-500 text-sm">© 2024 SmartHelper</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition text-center">
      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}
