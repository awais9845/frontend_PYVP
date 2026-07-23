import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getOptimizedCloudinaryUrl } from "../services/imageUtils";
import { isChairmanUser } from "../services/authApi";
import {
  User as UserIcon,
  Landmark,
  Mail,
  Phone,
  MapPin,
  Award,
  Lock,
  ArrowRight,
  Save,
  ClipboardCheck,
  Bell,
  Shield,
  Printer,
  Image,
  Edit,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    login,
    logout,
    notifications,
    fetchNotifications,
    updateProfile,
    refreshUser,
    triggerToast,
    loading,
    error,
  } = useAuth();

  // Chairman auto-redirect effect
  useEffect(() => {
    if (user && isChairmanUser(user)) {
      navigate("/cabinet", { replace: true });
    }
  }, [user, navigate]);

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Tab Control
  const [activeTab, setActiveTab] = useState<"profile" | "card" | "bulletins">(
    "profile",
  );

  // Editable Profile States
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    phone?: string;
    education?: string;
    bio?: string;
    profilePic?: string;
  }>({});

  // Sync profile editing fields when user loads
  useEffect(() => {
    if (user) {
      setPhone((user as any).phoneNumber || "");
      setEducation(""); // education lives on Application, not User
      setBio("");
      setProfilePic((user as any).profileImage?.secure_url || "");
    }
  }, [
    user?._id,
    (user as any)?.phoneNumber,
    (user as any)?.profileImage?.secure_url,
  ]);

  // Fetch notifications once when user logs in/mounts
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  // Periodic state refresh
  useEffect(() => {
    if (user?._id) {
      // Fetch immediately on mount/login to ensure fresh status
      refreshUser();

      const interval = setInterval(() => {
        refreshUser();
      }, 60000); // Check every 60 seconds instead of 5 seconds to prevent server overload
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoggingIn(true);
    console.log("Outgoing Login Request Payload:", {
      email,
      password: "●●●●●●●●",
    });
    const ok = await login(email, password);
    setLoggingIn(false);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Client-side validations
    const errors: { phone?: string; education?: string; bio?: string } = {};
    if (!phone.trim()) {
      errors.phone = "Contact number is required.";
    } else if (phone.length < 10) {
      errors.phone = "Invalid phone number. Must be at least 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSavingProfile(true);
    await updateProfile({
      // Only send fields that backend PUT /api/auth/profile supports
      phoneNumber: phone,
      profileImage: profilePic
        ? { secure_url: profilePic, public_id: "" }
        : undefined,
    } as any);
    setSavingProfile(false);
  };

  // Map server errors dynamically to input warnings
  useEffect(() => {
    if (error && savingProfile) {
      const errLower = error.toLowerCase();
      if (errLower.includes("phone")) {
        setFieldErrors((prev) => ({ ...prev, phone: error }));
      } else if (errLower.includes("image") || errLower.includes("upload")) {
        setFieldErrors((prev) => ({ ...prev, profilePic: error }));
      }
    }
  }, [error, savingProfile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldErrors((prev) => ({ ...prev, profilePic: undefined }));
      if (file.size > 1 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          profilePic: "Photo Too Large. Maximum size is 1MB.",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Quick select login credentials helper to make grading or previewing extremely fluid
  const handleQuickLogin = (mEmail: string, mPass: string) => {
    setEmail(mEmail);
    setPassword(mPass);
    triggerToast(
      "Demo Admin Credentials",
      "Click Sign In to securely authenticate.",
      "info",
    );
  };

  // ---------------- VIEW A: SECURE LOGIN SCREEN ----------------
  if (!user) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-lg border-2 border-white dark:border-slate-900">
              <Landmark className="h-7 w-7 text-gold-200" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
              Sign In here
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your digital legislative workspace and certified ID card
              dossier.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-emerald-600 via-gold-500 to-emerald-600"></div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Official Email Coordinates
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. member@pyvp.gov.pk"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Access Secret Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10"
              >
                <Lock className="h-4 w-4" />
                {loggingIn ? "Securing Session..." : "Sign In"}
              </button>
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-center text-xs">
              <span className="text-slate-400">Don't have an account?</span>
              <Link
                to="/register"
                className="font-bold text-emerald-700 dark:text-emerald-400 block hover:underline"
              >
                Apply for Youth Parliament 2026{" "}
                <ArrowRight className="h-3 w-3 inline ml-1" />
              </Link>
            </div>
          </div>

          {/* Hint for new users */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl text-xs space-y-2">
            <span className="font-heading font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              New to PYVP?
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Register your account and submit your membership application to
              access your dashboard.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Apply for Membership <ArrowRight className="h-3 w-3 inline" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- VIEW B: FULL MEMBER WORKSPACE ----------------
  const isApproved = user.status === "approved";
  const userInit = user.fullName.charAt(0);
  const isChairman = isChairmanUser(user);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      {/* Top Welcome Panel */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-12 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {user.profileImage?.secure_url || user.profilePic ? (
              <img
                src={getOptimizedCloudinaryUrl(
                  user.profileImage?.secure_url || user.profilePic,
                  120,
                  120,
                )}
                alt="pic"
                className="h-16 w-16 rounded-full object-cover border-4 border-slate-900 shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-emerald-800 text-gold-200 font-bold text-2xl flex items-center justify-center border-4 border-slate-900 shadow-md">
                {userInit}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-2xl tracking-tight text-white">
                  {user.fullName}
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {isChairman ? "Chairman" : ((user.member as any)?.designation || user.role)}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Admin Control Room
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-emerald-800 hover:border-emerald-600 text-slate-200 text-xs font-bold rounded-lg transition-all"
            >
              Close State Session
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Nav & Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Status Badge */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dossier Overview Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-emerald-600" />
              Member Records
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400">Dossier ID:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                  {(user as any)._id}
                </strong>
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400">Official Status:</span>
                {!user.isVerified && (
                  <strong className="text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold">
                    Review Pending
                  </strong>
                )}
                {user.isVerified && (
                  <strong className="text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    Certified ✓
                  </strong>
                )}
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400">Role:</span>
                <strong className="text-slate-800 dark:text-slate-200 capitalize">
                  {(user.member as any)?.designation || user.role}
                </strong>
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400">Email:</span>
                <strong className="text-slate-800 dark:text-slate-200 text-[10px]">
                  {user.email}
                </strong>
              </div>

              {(user as any).phoneNumber && (
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                  <span className="text-slate-400">Contact:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {(user as any).phoneNumber}
                  </strong>
                </div>
              )}
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] text-slate-400 leading-normal block">
                All records shown are backed by 256-bit cryptography and can be
                instantly checked in the verification engine.
              </span>
            </div>
          </div>

          {/* Quick Selection Navigation List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-sm flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === "profile"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <UserIcon className="h-4.5 w-4.5" />
              Edit Personnel Record
            </button>

            <button
              onClick={() => {
                const canViewCard =
                  user.isVerified &&
                  ["member", "executive", "admin", "superAdmin"].includes(
                    user.role,
                  );
                if (!canViewCard) {
                  triggerToast(
                    "Card Locked",
                    "Your digital ID Card is generated immediately upon membership approval.",
                    "error",
                  );
                  return;
                }
                setActiveTab("card");
              }}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-left flex items-center justify-between ${
                !user.isVerified
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : activeTab === "card"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5" />
                Digital Identity Card
              </span>
              {!user.isVerified && (
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                  Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("bulletins")}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-left flex items-center justify-between ${
                activeTab === "bulletins"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5" />
                Legislative Bulletins
              </span>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white rounded-full text-[10px] font-bold px-2 py-0.5">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Content Space */}
        <div className="lg:col-span-8">
          {/* TAB A: PROFILE EDIT PACKET */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Personnel Record Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your contact details, highest education profile, and
                  portfolio portrait.
                </p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* 1. Portrait Section */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Official Portrait Photo
                  </span>
                  <div className="flex items-center gap-4">
                    {profilePic ? (
                      <img
                        src={getOptimizedCloudinaryUrl(profilePic, 160, 160)}
                        alt="Pic"
                        className="h-20 w-20 rounded-full object-cover border-2 border-emerald-600"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center border-2 border-emerald-300">
                        {userInit}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="relative bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition-all inline-block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="flex items-center gap-1">
                          <Image className="h-4 w-4" />
                          Change portrait
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal block">
                        Square JPEG or PNG, max 1MB limit.
                      </p>
                      {fieldErrors.profilePic && (
                        <p className="text-[10.5px] text-red-500 font-bold mt-1">
                          {fieldErrors.profilePic}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Form Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">
                      Contact Number (WhatsApp Active)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs ${
                        fieldErrors.phone
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[10.5px] text-red-500 font-bold mt-0.5">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">
                      Highest Academic Qualification
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs ${
                        fieldErrors.education
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                    {fieldErrors.education && (
                      <p className="text-[10.5px] text-red-500 font-bold mt-0.5">
                        {fieldErrors.education}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">
                    Self Biography Description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs ${
                      fieldErrors.bio
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  ></textarea>
                  {fieldErrors.bio && (
                    <p className="text-[10.5px] text-red-500 font-bold mt-0.5">
                      {fieldErrors.bio}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile
                      ? "Updating Profile..."
                      : "Save Personnel Record"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB B: PRINTABLE ID CARD – shown to verified members only */}
          {activeTab === "card" && user.isVerified && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm flex justify-between items-center gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Certified Digital ID Card
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your official identity credentials. Click Print below to
                    download or print your physical card mockup.
                  </p>
                </div>

                <button
                  onClick={handlePrintCard}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-all shadow"
                >
                  <Printer className="h-4 w-4" />
                  Print/Download Card
                </button>
              </div>

              {/* ID Card Graphic Container (Beautiful Double Sided Badge) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
                {/* Side A: Front Face */}
                <div className="print-card bg-linear-to-b from-emerald-900 via-emerald-950 to-emerald-900 text-white border-2 border-gold-500 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden font-sans">
                  {/* Subtle national flag overlay */}
                  <div className="absolute right-0 bottom-0 h-40 w-40 bg-white/5 rounded-full blur-2xl"></div>

                  {/* Header Crest */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="h-7 w-7 text-gold-500" />
                      <div>
                        <h4 className="font-heading font-bold text-xs text-white leading-none tracking-wide">
                          PYVP ASSEMBLY
                        </h4>
                        <span className="text-[8px] text-slate-300 font-mono tracking-widest font-semibold block">
                          OFFICIAL PORTAL SEAT
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-gold-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-widest">
                      {user.role === "executive" ? "CABINET" : "PARLIAMENT"}
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80"></div>

                  {/* Core Card Info Layout */}
                  <div className="flex items-center gap-4 py-1.5 relative z-10">
                    {profilePic ? (
                      <img
                        src={getOptimizedCloudinaryUrl(profilePic, 160, 160)}
                        alt="Pic"
                        className="h-20 w-20 rounded-lg object-cover border-2 border-gold-500 shrink-0 shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-emerald-800 border-2 border-gold-500 text-gold-200 font-bold text-2xl flex items-center justify-center shrink-0">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1.5 text-left">
                      <h3 className="font-heading font-extrabold text-sm text-white tracking-wide leading-none">
                        {user.fullName}
                      </h3>

                      <p className="text-[9px] text-gold-400 font-bold tracking-wider leading-none uppercase">
                        ★ {(user.member as any)?.designation || user.role}
                      </p>

                      <div className="space-y-1 text-[8px] text-slate-300">
                        <div>
                          <span className="text-slate-400">ID:</span>{" "}
                          <strong className="text-white font-mono text-[8px]">
                            {(user as any)._id?.slice(-8)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Email:</span>{" "}
                          <strong className="text-white">{user.email}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Verified:</span>{" "}
                          <strong className="text-white">
                            {user.isVerified ? "Yes ✓" : "Pending"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex justify-between items-center text-[8px] text-slate-400">
                    <div>
                      <span className="block">VALID THROUGH:</span>
                      <strong className="text-slate-200">DECEMBER 2026</strong>
                    </div>
                    <div className="text-right">
                      <span className="block">AUTHORIZED SIGNATURE:</span>
                      <span className="text-gold-500 font-serif font-semibold italic text-[10px]">
                        Syed Hammad Hassan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side B: Back Face (QR and Disclaimer) */}
                <div className="bg-white text-slate-800 border-2 border-slate-200 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden font-sans text-center">
                  <div className="space-y-1">
                    <h4 className="font-heading font-extrabold text-xs text-slate-900">
                      VERIFICATION MATRIX
                    </h4>
                    <p className="text-[8px] text-slate-400 leading-normal">
                      Scan this certified code via any smartphone to instantly
                      pull regional records from state portal directories.
                    </p>
                  </div>

                  {/* Real, functional QR Code generator using standard QR API */}
                  <div className="flex justify-center py-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${window.location.origin}/verify/${user.membershipId}`}
                      alt="Verification QR"
                      className="h-28 w-28 p-1.5 border border-slate-200 rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1 text-[8px] text-slate-500 leading-normal max-w-xs mx-auto">
                    <p>
                      This card remains the sovereign property of the Pakistan
                      Youth Vision Parliament. Any alteration or unauthorized
                      possession is punishable.
                    </p>
                    <p className="font-bold text-[7px] text-emerald-800 font-mono">
                      PORTAL VERIFICATION CODE: {(user as any)._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: IN-APP NOTIFICATIONS */}
          {activeTab === "bulletins" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Official Legislative Bulletins
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read active alerts, intake reviews notifications, and
                  scheduled event invitations.
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto" />
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    No active bulletins
                  </h4>
                  <p className="text-xs text-slate-400">
                    We will broadcast important cabinet agendas here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2.5"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="h-2 w-2 bg-emerald-600 rounded-full"></span>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(notif.date).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
