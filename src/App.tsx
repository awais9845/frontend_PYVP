import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HeaderBanner from "./components/HeaderBanner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Page Views
import Home from "./pages/Home";
import About from "./pages/About";
import ExecutiveTeam from "./pages/ExecutiveTeam";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Verification from "./pages/Verification";

// Icon components for Toast
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

function MainAppLayout() {
  const { toast } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Government Portal Top Ribbon */}
      <HeaderBanner />

      {/* Main Sticky Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/executives" element={<ExecutiveTeam />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* Fallback to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* State-style Professional Footer */}
      <Footer />

      {/* Floating System Toast Alerts */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
          style={{ boxShadow: "0 10px 30px -5px rgba(0,0,0,0.15)" }}
        >
          {toast.type === "success" && (
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-0.5">
            <h4 className="text-xs font-heading font-extrabold text-slate-900 dark:text-white leading-snug">
              {toast.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
