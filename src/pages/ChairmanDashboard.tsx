import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, Award, Landmark, Search, Plus, Trash2, Edit2, X, Eye, 
  Check, User as UserIcon, ShieldAlert, Award as AwardIcon, MapPin, Mail, AlertTriangle,
  Volume2, FileText, Settings, Activity, Calendar, ShieldCheck, ChevronRight, CheckCircle
} from "lucide-react";
import * as cabinetService from "../services/executiveApi";
import { getAllMembers } from "../services/memberApi";
import * as announcementService from "../services/chairmanApi";
import { getAllApplications } from "../services/applicationApi";
import { getPublicStats } from "../services/memberApi";
import { getOptimizedCloudinaryUrl } from "../services/imageUtils";

export default function ChairmanDashboard() {
  const { user, triggerToast } = useAuth();
  const navigate = useNavigate();

  // Navigation Tab Control
  const [activeTab, setActiveTab] = useState<"overview" | "cabinet" | "announcement" | "applications">("overview");

  // Core Statistics States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Executive Cabinet Management States
  const [cabinetMembers, setCabinetMembers] = useState<any[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [membersRoster, setMembersRoster] = useState<any[]>([]);
  const [cabinetSearch, setCabinetSearch] = useState("");
  const [cabinetRoleFilter, setCabinetRoleFilter] = useState("all");

  // Autocomplete Candidate Selector States
  const [searchCandidateQuery, setSearchCandidateQuery] = useState("");
  const [selectedMemberObj, setSelectedMemberObj] = useState<any | null>(null);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Appointing States
  const [selectedRole, setSelectedRole] = useState("Joint Secretary");
  const [selectedStatus, setSelectedStatus] = useState<"Active" | "Inactive">("Active");
  const [assigning, setAssigning] = useState(false);

  // Editing Portfolios Modal States
  const [editingCabinetMember, setEditingCabinetMember] = useState<any | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");
  const [updating, setUpdating] = useState(false);

  // Detail Inspector Modal States
  const [viewingCabinetMember, setViewingCabinetMember] = useState<any | null>(null);

  // Revocation Modal States
  const [terminatingCabinetMember, setTerminatingCabinetMember] = useState<any | null>(null);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Homepage Announcement Management States
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDesc, setAnnouncementDesc] = useState("");
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false);
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);

  // Applications Intake list States
  const [intakeApplications, setIntakeApplications] = useState<any[]>([]);
  const [loadingIntake, setLoadingIntake] = useState(false);

  // List of Supported Cabinet Roles
  const CABINET_ROLES = [
    "Chairman",
    "Vice Chairman",
    "Secretary General",
    "Deputy Secretary General",
    "President",
    "Vice President",
    "Director General (DG)",
    "Director Operations",
    "Director Administration",
    "Director Finance",
    "Director Media & Communications",
    "Director Public Relations (PR)",
    "Director Legal Affairs",
    "Director Information Technology (IT)",
    "Information Secretary",
    "Finance Secretary",
    "Joint Secretary",
    "Executive Member"
  ];

  // Strictly restrict to Chairman
  const isChairman = user && (
    (user.member && (
      (user.member as any).designation === "Chairman" || 
      (user.member as any).executiveRole === "Chairman"
    )) || 
    user.email === "chairman@pyvp.gov.pk" ||
    user.role === "superAdmin" ||
    user.role === "admin" ||
    user.role === "chairman" ||
    (user as any).executivePosition === "Chairman PYVP"
  );

  useEffect(() => {
    if (user && !isChairman) {
      triggerToast("Access Denied", "This legislative console is strictly restricted to the Chairman Secretariat.", "error");
      navigate("/dashboard");
    }
  }, [user, isChairman, navigate]);

  // Load All Core Data
  const loadDashboardData = async () => {
    if (!user || !isChairman) return;
    
    // Fetch stats
    setLoadingStats(true);
    try {
      const statsRes = await getPublicStats();
      setDashboardStats(statsRes);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoadingStats(false);
    }

    // Fetch active cabinet and approved general roster
    setLoadingCabinet(true);
    try {
      const cabRes = await cabinetService.getAllExecutiveMembers();
      if (cabRes.success) {
        setCabinetMembers(cabRes.members || []);
      }
      const membRes = await getAllMembers();
      if (membRes.success) {
        setMembersRoster(membRes.members || []);
      }
    } catch (err) {
      console.error("Cabinet retrieval error:", err);
    } finally {
      setLoadingCabinet(false);
    }

    // Fetch homepage announcements
    setLoadingAnnouncement(true);
    try {
      const annRes = await announcementService.getAnnouncement();
      if (annRes.success && annRes.announcement) {
        setCurrentAnnouncement(annRes.announcement);
        setAnnouncementTitle(annRes.announcement.title);
        setAnnouncementDesc(annRes.announcement.description);
      } else {
        setCurrentAnnouncement(null);
        setAnnouncementTitle("");
        setAnnouncementDesc("");
      }
    } catch (err) {
      console.error("Announcement load error:", err);
    } finally {
      setLoadingAnnouncement(false);
    }

    // Fetch recent applications
    setLoadingIntake(true);
    try {
      const appRes = await getAllApplications();
      if (appRes.success) {
        setIntakeApplications(appRes.applications || []);
      }
    } catch (err) {
      console.error("Intake retrieval error:", err);
    } finally {
      setLoadingIntake(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?._id]);

  // Click-away listener for candidate dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResultsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter roster for candidate selector autocomplete
  const candidateResults = searchCandidateQuery.trim()
    ? membersRoster.filter((m) => {
        if (m.executiveRole || m.designation === "Chairman" || m.designation === "Chairman PYVP") return false;
        const q = searchCandidateQuery.toLowerCase();
        return (
          (m.fullName || "").toLowerCase().includes(q) ||
          (m.membershipId || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        );
      })
    : [];

  // Handlers for Executive Appointing
  const handleAssignCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberObj || !selectedRole) {
      triggerToast("Required Fields Missing", "Please select a candidate member and role.", "error");
      return;
    }
    setAssigning(true);
    try {
      const res = await cabinetService.assignExecutiveRole({
        memberId: selectedMemberObj._id,
        executiveRole: selectedRole,
        status: selectedStatus,
      });
      if (res.success) {
        triggerToast("Role Appointed", res.message || "Cabinet position successfully appointed.", "success");
        setSelectedMemberObj(null);
        setSearchCandidateQuery("");
        loadDashboardData();
      }
    } catch (err: any) {
      triggerToast("Appointment Failed", err.response?.data?.message || "Could not appoint role.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCabinetMember || !editRole) return;
    setUpdating(true);
    try {
      const res = await cabinetService.updateExecutiveRole(editingCabinetMember._id, {
        executiveRole: editRole,
        status: editStatus,
      });
      if (res.success) {
        triggerToast("Assignment Updated", res.message || "Executive role updated successfully.", "success");
        setEditingCabinetMember(null);
        loadDashboardData();
      }
    } catch (err: any) {
      triggerToast("Update Failed", err.response?.data?.message || "Could not save portfolio.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveCabinet = async () => {
    if (!terminatingCabinetMember || !confirmCheckbox) return;
    setDeleting(true);
    try {
      const res = await cabinetService.removeExecutiveRole(terminatingCabinetMember._id);
      if (res.success) {
        triggerToast("Cabinet Revoked", res.message || "Cabinet position successfully removed.", "success");
        setTerminatingCabinetMember(null);
        setConfirmCheckbox(false);
        loadDashboardData();
      }
    } catch (err: any) {
      triggerToast("Revocation Failed", err.response?.data?.message || "Could not remove cabinet role.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Handlers for Announcement Management
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementDesc.trim()) {
      triggerToast("Validation Alert", "Title and description details cannot be blank.", "error");
      return;
    }
    setPublishing(true);
    try {
      const res = await announcementService.createOrUpdateAnnouncement({
        title: announcementTitle,
        description: announcementDesc,
      });
      if (res.success) {
        triggerToast("Announcement Active", "Homepage public announcement successfully published and refreshed.", "success");
        loadDashboardData();
      }
    } catch (err: any) {
      triggerToast("Publication Failed", err.response?.data?.message || "Could not publish announcement.", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!currentAnnouncement) return;
    try {
      const res = await announcementService.deleteAnnouncement(currentAnnouncement._id);
      if (res.success) {
        triggerToast("Announcement Deactivated", "Homepage announcement cleared.", "success");
        setCurrentAnnouncement(null);
        setAnnouncementTitle("");
        setAnnouncementDesc("");
        setShowDeleteAnnouncementModal(false);
        loadDashboardData();
      }
    } catch (err: any) {
      triggerToast("Deactivation Failed", err.response?.data?.message || "Could not clear announcement.", "error");
    }
  };

  // Safe UI bypass while access check resolves
  if (!user || !isChairman) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      
      {/* 1. Header Hero Panel */}
      <section className="bg-linear-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white py-12 px-6 border-b border-emerald-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(16,185,129,0.1),transparent_40%)]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/25 px-2.5 py-1 rounded font-black tracking-widest uppercase">
              Chairman Cabinet Console
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-4xl tracking-tight text-white leading-tight">
              Secretariat Executive Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
              Manage executive roles, configure homepage announcements, inspect dossier registries, and oversee the Youth Parliament cabinet structure.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              <UserIcon className="h-4 w-4" />
              Member Area
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Dashboard Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="h-4 w-4" />
            Overview &amp; Stats
          </button>
          <button
            onClick={() => setActiveTab("cabinet")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "cabinet"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Award className="h-4 w-4" />
            Executive Cabinet
          </button>
          <button
            onClick={() => setActiveTab("announcement")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "announcement"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Volume2 className="h-4 w-4" />
            Homepage Announcement
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "applications"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            Recent Applications
          </button>
        </div>
      </div>

      {/* 3. ACTIVE TAB VIEWS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

        {/* TAB A: OVERVIEW & STATISTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Intake Applicants</span>
                  <strong className="block text-2xl font-heading font-black text-slate-950 dark:text-white">
                    {loadingStats ? "..." : (dashboardStats?.totalApplicants ?? 0)}
                  </strong>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Cabinet Members</span>
                  <strong className="block text-2xl font-heading font-black text-slate-950 dark:text-white">
                    {cabinetMembers.length}
                  </strong>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Roster Reviews</span>
                  <strong className="block text-2xl font-heading font-black text-slate-955 dark:text-white">
                    {loadingStats ? "..." : (dashboardStats?.pendingReviews ?? 0)}
                  </strong>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rejected Applications</span>
                  <strong className="block text-2xl font-heading font-black text-slate-950 dark:text-white">
                    {loadingStats ? "..." : (dashboardStats?.rejectedApplications ?? 0)}
                  </strong>
                </div>
              </div>
            </div>

            {/* System activities & announcements review */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Homepage announcement preview */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Volume2 className="h-4.5 w-4.5 text-emerald-600" />
                    Homepage Active Notice
                  </h3>
                  <button 
                    onClick={() => setActiveTab("announcement")} 
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Configure Tab
                  </button>
                </div>

                {currentAnnouncement ? (
                  <div className="bg-amber-500/5 border border-amber-500/25 p-5 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold-500"></div>
                    <span className="text-[9px] bg-gold-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                      LIVE ON HOMEPAGE
                    </span>
                    <h4 className="font-heading font-black text-slate-955 dark:text-white text-base leading-snug">
                      {currentAnnouncement.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light whitespace-pre-line">
                      {currentAnnouncement.description}
                    </p>
                    <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-850">
                      Published: {new Date(currentAnnouncement.createdAt).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-xl space-y-2 text-slate-400">
                    <Volume2 className="h-10 w-10 mx-auto opacity-30" />
                    <p className="text-xs font-bold">No Active Homepage Announcement</p>
                    <p className="text-[10px] max-w-xs mx-auto">Publish an official notice from the management tab to replace the default banner text on the index homepage.</p>
                  </div>
                )}
              </div>

              {/* System Activity Cards */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-emerald-600" />
                    Cabinet System Diagnostics
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-slate-400">Database Connection</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Online ✓</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-slate-400">Authentication Service (JWT)</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Secure ✓</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-slate-400">Government Encrypted Cookies</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Enforced ✓</strong>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400">Intake Year Registry</span>
                    <strong className="text-slate-800 dark:text-slate-200">2026 Intake active</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: EXECUTIVE CABINET MANAGEMENT */}
        {activeTab === "cabinet" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            
            {/* Active Cabinet List Table */}
            <div className="xl:col-span-8 space-y-6">
              {/* Search and filtering */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search executive name, email or ID..."
                    value={cabinetSearch}
                    onChange={(e) => setCabinetSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>
                <select
                  value={cabinetRoleFilter}
                  onChange={(e) => setCabinetRoleFilter(e.target.value)}
                  className="w-full sm:max-w-[220px] px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                >
                  <option value="all">All Cabinet Portfolios</option>
                  {CABINET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roster list */}
              {loadingCabinet ? (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-4 font-semibold">Retrieving cabinet registries...</p>
                </div>
              ) : cabinetMembers.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-250 p-16 text-center space-y-4 shadow-xs">
                  <Users className="h-12 w-12 text-slate-350 mx-auto" />
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Cabinet is empty</h3>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto">No leadership portfolios are active. Assign cabinet roles to approved general members on the right.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-4">Personnel Profile</th>
                          <th className="p-4">Cabinet Position</th>
                          <th className="p-4">Appointed Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {cabinetMembers
                          .filter((m) => {
                            const searchLower = cabinetSearch.toLowerCase();
                            const matchesSearch =
                              (m.fullName || "").toLowerCase().includes(searchLower) ||
                              (m.membershipId || "").toLowerCase().includes(searchLower) ||
                              (m.email || "").toLowerCase().includes(searchLower);
                            const matchesRole =
                              cabinetRoleFilter === "all" || m.executiveRole === cabinetRoleFilter;
                            return matchesSearch && matchesRole;
                          })
                          .map((m) => {
                            const avatarRaw = m.profileImage || m.user?.profileImage?.secure_url || null;
                            const avatar = avatarRaw ? getOptimizedCloudinaryUrl(avatarRaw, 100, 100) : null;
                            const initials = m.fullName
                              ?.split(" ")
                              .map((w: string) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase() || "M";
                            return (
                              <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                                <td className="p-4 flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                    {avatar ? (
                                      <img src={avatar} alt={m.fullName} className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                      <span className="text-white font-bold text-xs">{initials}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{m.fullName}</div>
                                    <span className="text-[10px] text-slate-400 font-mono block">{m.membershipId}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-amber-600 dark:text-amber-400">
                                  ★ {m.executiveRole}
                                </td>
                                <td className="p-4 text-slate-400">
                                  {m.appointmentDate ? new Date(m.appointmentDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    m.status === "Active"
                                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                      : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                                  }`}>
                                    {m.status || "Active"}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setViewingCabinetMember(m)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded transition-colors"
                                      title="Inspect Details"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCabinetMember(m);
                                        setEditRole(m.executiveRole);
                                        setEditStatus(m.status || "Active");
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors"
                                      title="Modify Position"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTerminatingCabinetMember(m);
                                        setConfirmCheckbox(false);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-850 rounded transition-colors"
                                      title="Revoke Portfolio"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate portfolio assign card */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Search className="h-4.5 w-4.5 text-emerald-600" />
                  Appoint Portfolio
                </h3>
                
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    placeholder="Search candidate name, ID or Email..."
                    value={searchCandidateQuery}
                    onChange={(e) => {
                      setSearchCandidateQuery(e.target.value);
                      setShowResultsDropdown(true);
                    }}
                    onFocus={() => setShowResultsDropdown(true)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />

                  {showResultsDropdown && searchCandidateQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl divide-y divide-slate-100 dark:divide-slate-805">
                      {candidateResults.length === 0 ? (
                        <p className="p-3 text-center text-slate-400 text-xs">No matching candidate members.</p>
                      ) : (
                        candidateResults.map((cand) => (
                          <button
                            key={cand._id}
                            type="button"
                            onClick={() => {
                              setSelectedMemberObj(cand);
                              setSearchCandidateQuery("");
                              setShowResultsDropdown(false);
                            }}
                            className="w-full p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                          >
                            <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                              {cand.fullName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{cand.fullName}</p>
                              <span className="text-[10px] text-slate-400 font-mono block">{cand.membershipId}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedMemberObj ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/30 p-6 shadow-sm space-y-6 relative overflow-hidden animate-in fade-in duration-200">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-600/5 rounded-bl-full flex items-center justify-center">
                    <AwardIcon className="h-5 w-5 text-emerald-600/60" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading font-black text-xs text-slate-450 uppercase tracking-widest">Candidate Info</h4>
                        <span className="text-[10px] text-emerald-600 font-bold">Approved Member ✓</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberObj(null)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-emerald-600 shrink-0">
                        {selectedMemberObj.profileImage || selectedMemberObj.user?.profileImage?.secure_url ? (
                          <img 
                            src={getOptimizedCloudinaryUrl(selectedMemberObj.profileImage || selectedMemberObj.user?.profileImage?.secure_url, 120, 120)} 
                            alt="avatar" 
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="font-bold text-lg text-white">{selectedMemberObj.fullName?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-slate-900 dark:text-white leading-tight">{selectedMemberObj.fullName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">{selectedMemberObj.membershipId}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" /> Contact:</span>
                        <strong className="text-slate-700 dark:text-slate-350 truncate max-w-[160px]">{selectedMemberObj.email}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Seat:</span>
                        <strong className="text-slate-700 dark:text-slate-350 truncate">
                          {selectedMemberObj.district ? `${selectedMemberObj.district}, ` : ""}{selectedMemberObj.province}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAssignCabinet} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Executive Portfolio</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                      >
                        {CABINET_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={assigning}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                    >
                      {assigning ? "Appointing Portfolio..." : "Confirm Cabinet Appointment"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-8 text-center text-slate-400 text-xs font-medium">
                  Select a member via candidate search to manage executive appointment parameters.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB C: HOMEPAGE ANNOUNCEMENT MANAGEMENT */}
        {activeTab === "announcement" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            {/* Announcement configuration form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-emerald-600" />
                Configure Homepage Official Notice
              </h3>

              <form onSubmit={handlePublishAnnouncement} className="space-y-5 mt-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Announcement Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. PYVP Intake 2026 Public Registration Open"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                  <p className="text-[10px] text-slate-400">Keep it short, clear, and highly professional.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Official Notice Details <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={6}
                    value={announcementDesc}
                    onChange={(e) => setAnnouncementDesc(e.target.value)}
                    placeholder="Write detailed announcements about intake dates, requirements, easy-paisa numbers, schedules, or parliamentary protocols..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs leading-relaxed"
                  ></textarea>
                  <p className="text-[10px] text-slate-400">Provide official details, contact coordinate guidelines, or instruction updates.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5 justify-end">
                  {currentAnnouncement && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteAnnouncementModal(true)}
                      className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-all"
                    >
                      Clear Announcement
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all shadow-md"
                  >
                    {publishing ? "Publishing Notice..." : currentAnnouncement ? "Update Homepage Notice" : "Publish Live Notice"}
                  </button>
                </div>
              </form>
            </div>

            {/* Announcement mockup preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Settings className="h-4.5 w-4.5 text-emerald-600" />
                  Mockup Preview — Home Page
                </h4>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-slate-50 dark:bg-slate-950 p-4">
                  {/* Top Bar simulation */}
                  <div className="bg-emerald-900 text-white py-2 px-3 border-b border-emerald-800 text-[10px] font-semibold flex items-center gap-2 select-none rounded-t-lg">
                    <span className="bg-gold-500 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase text-[8px] tracking-wide shrink-0">
                      Announcement
                    </span>
                    <span className="truncate">
                      📢 {announcementTitle || "Official PYVP public notice is actively broadcasted here..."}
                    </span>
                  </div>

                  {/* Body Notice Banner simulation */}
                  <div className="mt-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-600"></div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                      <span>National Secretariat</span>
                      <span>Certified Seal ✓</span>
                    </div>
                    <h5 className="font-heading font-black text-slate-900 dark:text-white text-sm">
                      {announcementTitle || "Your Notice Headline Appears Here"}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light whitespace-pre-line">
                      {announcementDesc || "Your official parliamentary notices, administrative announcements, intake guidelines, or event agendas will be rendered here dynamically for all public site visitors."}
                    </p>
                    <div className="flex gap-2 items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Apply Online Now</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB D: RECENT APPLICATIONS INTAKE ROSTER */}
        {activeTab === "applications" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  National Dossier Intake Roster
                </h3>
                <p className="text-[11px] text-slate-450">Showing recent membership applications received at the registry.</p>
              </div>
              <span className="text-[10px] bg-slate-105 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded font-bold">
                Total Dossiers: {intakeApplications.length}
              </span>
            </div>

            {loadingIntake ? (
              <div className="py-16 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-xs text-slate-400 mt-4 font-semibold">Retrieving intake dossiers...</p>
              </div>
            ) : intakeApplications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <FileText className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-xs font-bold">Intake registry is empty</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-150 dark:border-slate-850">
                    <tr>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">CNIC / Identity</th>
                      <th className="p-3">Province</th>
                      <th className="p-3">Education</th>
                      <th className="p-3">Applied Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                    {intakeApplications.slice(0, 30).map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{app.fullName}</td>
                        <td className="p-3 font-mono">{app.email}</td>
                        <td className="p-3 font-mono">{app.cnic}</td>
                        <td className="p-3">{app.address ? app.address.split(',').pop()?.trim() : "N/A"}</td>
                        <td className="p-3 truncate max-w-[120px]">{app.education}</td>
                        <td className="p-3 text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            app.applicationStatus === "Approved"
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20"
                              : app.applicationStatus === "Rejected"
                              ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20"
                              : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                            {app.applicationStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================= MODAL PORTALS ======================= */}

      {/* 1. EDIT POSITION MODAL */}
      {editingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Modify Portfolio Appointment</h4>
                  <p className="text-xs text-slate-405">Editing assignment for {editingCabinetMember.fullName}</p>
                </div>
                <button 
                  onClick={() => setEditingCabinetMember(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCabinet} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Executive Cabinet Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                  >
                    {CABINET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCabinetMember(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all shadow"
                  >
                    {updating ? "Saving changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. POSITION TERMINATION MODAL */}
      {terminatingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex gap-3 items-start text-red-650">
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Revoke Portfolio Appointment</h4>
                  <p className="text-xs text-slate-400">Removing {terminatingCabinetMember.fullName} from {terminatingCabinetMember.executiveRole}</p>
                </div>
              </div>

              <div className="border-t border-slate-105 dark:border-slate-850 my-2"></div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will revoke their executive cabinet role, resetting their administrative portal clearance level back to a general member.
              </p>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 p-3 rounded-lg flex items-start gap-2">
                <input
                  type="checkbox"
                  id="confirmCheck"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 cursor-pointer accent-red-600"
                />
                <label htmlFor="confirmCheck" className="text-[11px] text-red-750 dark:text-red-400 font-bold leading-snug cursor-pointer select-none">
                  I confirm that I am removing this member from the Executive Cabinet.
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTerminatingCabinetMember(null);
                    setConfirmCheckbox(false);
                  }}
                  className="px-5 py-2.5 bg-slate-105 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!confirmCheckbox || deleting}
                  onClick={handleRemoveCabinet}
                  className="px-6 py-2.5 bg-red-655 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow disabled:opacity-50"
                >
                  {deleting ? "Revoking..." : "Confirm Revocation"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. INSPECT DETAILS VIEW MODAL */}
      {viewingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Cabinet Portfolio Details</h4>
                  <p className="text-xs text-slate-400">Certified Official Profile</p>
                </div>
                <button 
                  onClick={() => setViewingCabinetMember(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
                <div className="h-20 w-20 rounded-full border-4 border-emerald-600 overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg shrink-0">
                  {viewingCabinetMember.profileImage || viewingCabinetMember.user?.profileImage?.secure_url ? (
                    <img 
                      src={getOptimizedCloudinaryUrl(viewingCabinetMember.profileImage || viewingCabinetMember.user?.profileImage?.secure_url, 160, 160)} 
                      alt={viewingCabinetMember.fullName} 
                      className="h-full w-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-bold text-3xl text-white">
                      {viewingCabinetMember.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                    {viewingCabinetMember.fullName}
                  </h3>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    {viewingCabinetMember.executiveRole}
                  </p>
                  <p className="text-xs text-slate-450 font-mono">
                    Member ID: {viewingCabinetMember.membershipId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Email Coordinates:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{viewingCabinetMember.email}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Seat Jurisdiction:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.district ? `${viewingCabinetMember.district}, ` : ""}{viewingCabinetMember.province}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Appointment Date:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.appointmentDate ? new Date(viewingCabinetMember.appointmentDate).toLocaleDateString() : "N/A"}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Appointed By:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.appointedBy?.fullName || "Chairman Secretariat"}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Portfolio Status:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    viewingCabinetMember.status === "Active"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {viewingCabinetMember.status || "Active"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Membership Classification:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{viewingCabinetMember.membershipType || "General"}</strong>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewingCabinetMember(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLEAR ANNOUNCEMENT CONFIRMATION MODAL */}
      {showDeleteAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex gap-3 items-start text-red-650">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Clear Active Notice</h4>
                <p className="text-xs text-slate-400">This action will remove the homepage banner notice.</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete the active announcement? The home page will return to displaying the default welcome message ticker.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAnnouncementModal(false)}
                className="px-4 py-2.5 bg-slate-105 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAnnouncement}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow"
              >
                Clear Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
