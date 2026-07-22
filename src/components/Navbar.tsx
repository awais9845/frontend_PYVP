import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Landmark,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  CheckCircle,
  Moon,
  Sun,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const isChairmanOnly =
    user &&
    ((user.member &&
      ((user.member as any).designation === "Chairman" ||
        (user.member as any).executiveRole === "Chairman")) ||
      user.email === "chairman@pyvp.gov.pk" ||
      user.role === "admin" ||
      user.role === "superAdmin" ||
      user.role === "chairman" ||
      (user as any).executivePosition === "Chairman PYVP");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync dark class on document element
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About PYVP", path: "/about" },
    { name: "Executive Assembly", path: "/executives" },
    { name: "Chairman's Portal", path: "/cabinet" },
    { name: "Verification", path: "/verify" },
  ];

  return (
    <nav
      id="main-navigation"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-900/95 shadow-md py-3 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 py-4 border-b border-slate-100 dark:border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo / Crest Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-full bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-all duration-300">
            <Landmark className="h-6 w-6 text-gold-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg leading-none tracking-tight text-slate-800 dark:text-slate-100">
                PYVP
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                Official
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
              Pakistan Youth Vision Parliament
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth Actions / Tools */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gold-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="pic"
                    className="h-7 w-7 rounded-full object-cover border border-emerald-600"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-300">
                    {user.fullName.charAt(0)}
                  </div>
                )}
                <span className="max-w-[120px] truncate">{user.fullName}</span>
                {user.role === "admin" && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1 rounded">
                    Admin
                  </span>
                )}
              </Link>

              {/* Conditional Quick Admin Link */}
              {(user.role === "admin" || user.role === "superAdmin") && (
                <Link
                  to="/admin"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  Admin Console
                </Link>
              )}

              {/* Conditional Quick Cabinet Link */}
              {isChairmanOnly && (
                <Link
                  to="/cabinet"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  Chairman Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Log out of system"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <Link
                to="/dashboard"
                onClick={() => logout()}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Member Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => logout()}
                className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-700/15"
              >
                Apply Online
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gold-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-inner animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 border-l-4 border-emerald-600"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {user ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 px-4">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="pic"
                      className="h-9 w-9 rounded-full object-cover border border-emerald-600"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-300">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {user.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {(user.member as any)?.designation || user.role} Account
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 px-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-lg transition-all"
                    >
                      <UserIcon className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {(user.role === "admin" || user.role === "superAdmin") && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs py-2.5 rounded-lg border border-amber-500/25"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  {isChairmanOnly && (
                    <Link
                      to="/cabinet"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs py-2.5 rounded-lg border border-emerald-500/25"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Chairman Dashboard
                    </Link>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold text-sm py-2.5 rounded-lg transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out Session
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <Link
                  to="/dashboard"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-lg shadow-sm"
                >
                  Apply Online
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
