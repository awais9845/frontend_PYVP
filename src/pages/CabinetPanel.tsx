import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, Award, Landmark, Search, Plus, Trash2, Edit2, X, Eye, 
  Check, User as UserIcon, ShieldAlert, Award as AwardIcon, MapPin, Mail, AlertTriangle
} from "lucide-react";
import * as cabinetService from "../services/executiveApi";
import { getAllMembers } from "../services/memberApi";
import { getOptimizedCloudinaryUrl } from "../services/imageUtils";

export default function CabinetPanel() {
  const { user, triggerToast } = useAuth();
  const navigate = useNavigate();

  // State Variables
  const [cabinetMembers, setCabinetMembers] = useState<any[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [membersRoster, setMembersRoster] = useState<any[]>([]);
  
  // Search & Filters for Roster
  const [cabinetSearch, setCabinetSearch] = useState("");
  const [cabinetRoleFilter, setCabinetRoleFilter] = useState("all");

  // Autocomplete & Pre-selection Dossier States
  const [searchCandidateQuery, setSearchCandidateQuery] = useState("");
  const [selectedMemberObj, setSelectedMemberObj] = useState<any | null>(null);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Assignment states
  const [selectedRole, setSelectedRole] = useState("Joint Secretary");
  const [selectedStatus, setSelectedStatus] = useState<"Active" | "Inactive">("Active");
  const [assigning, setAssigning] = useState(false);

  // Edit modal states
  const [editingCabinetMember, setEditingCabinetMember] = useState<any | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");
  const [updating, setUpdating] = useState(false);

  // View Modal states
  const [viewingCabinetMember, setViewingCabinetMember] = useState<any | null>(null);

  // Delete double-confirmation modal states
  const [terminatingCabinetMember, setTerminatingCabinetMember] = useState<any | null>(null);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 17 Cabinet Roles
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
    "Joint Secretary"
  ];

  // RBAC Access Guard (Only Chairman can access Cabinet Panel page)
  const isChairman = user && (
    (user.member && (
      (user.member as any).designation === "Chairman" || 
      (user.member as any).executiveRole === "Chairman"
    )) || 
    user.email === "chairman@pyvp.gov.pk" ||
    (user as any).role === "superAdmin" ||
    (user as any).role === "admin" ||
    (user as any).executivePosition === "Chairman PYVP"
  );

  useEffect(() => {
    if (user && !isChairman) {
      triggerToast("Access Denied", "This cabinet console is reserved for the Secretariat Chairman.", "error");
      navigate("/dashboard");
    }
  }, [user, isChairman, navigate]);

  // Load Cabinet & approved member roster data
  const fetchCabinetData = async () => {
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
    } catch (err: any) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        return;
      }
      console.error(err);
      triggerToast("Error Loading Cabinet", err.response?.data?.message || "Could not retrieve cabinet data.", "error");
    } finally {
      setLoadingCabinet(false);
    }
  };

  useEffect(() => {
    if (user && isChairman) {
      fetchCabinetData();
    }
  }, [user?._id, isChairman]);

  // Handle dropdown click-away logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResultsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter General Approved Members for Autocomplete Lookup
  const candidateResults = searchCandidateQuery.trim()
    ? membersRoster.filter((m) => {
        // Exclude active cabinet and Chairman from selection roster
        if (m.executiveRole || m.designation === "Chairman" || m.designation === "Chairman PYVP") return false;
        
        const q = searchCandidateQuery.toLowerCase();
        return (
          (m.fullName || "").toLowerCase().includes(q) ||
          (m.membershipId || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        );
      })
    : [];

  // Handlers
  const handleAssignCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberObj || !selectedRole) {
      triggerToast("Missing Fields", "Please select a candidate member and role.", "error");
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
        triggerToast("Cabinet Appointed", res.message || "Cabinet position successfully appointed.", "success");
        setSelectedMemberObj(null);
        setSearchCandidateQuery("");
        fetchCabinetData();
      } else {
        triggerToast("Appointment Failed", res.message || "Failed to appoint member.", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Error", err.response?.data?.message || "An error occurred during appointment.", "error");
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
        triggerToast("Appointment Updated", res.message || "Executive role updated successfully.", "success");
        setEditingCabinetMember(null);
        fetchCabinetData();
      } else {
        triggerToast("Update Failed", res.message || "Failed to update role.", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Error", err.response?.data?.message || "An error occurred during update.", "error");
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
        triggerToast("Appointment Terminated", res.message || "Cabinet position successfully removed.", "success");
        setTerminatingCabinetMember(null);
        setConfirmCheckbox(false);
        fetchCabinetData();
      } else {
        triggerToast("Termination Failed", res.message || "Failed to remove role.", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Error", err.response?.data?.message || "An error occurred during removal.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (!user || !isChairman) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
          <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">Access Violation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            This secure console is strictly restricted to the Chairman Secretariat. Secure credentials and JWT tokens are verified.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all"
            >
              Return to Member Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      
      {/* Page Crest Header */}
      <section className="bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded font-black tracking-widest uppercase">Secretariat</span>
              <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white">Cabinet Management Console</h1>
            </div>
            <p className="text-xs text-slate-400">Appoint registered members, configure ministerial portfolios, and manage active executive cabinets.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Active Cabinets Table & Registry list */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search executive name, email or ID..."
                  value={cabinetSearch}
                  onChange={(e) => setCabinetSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                />
              </div>
              <select
                value={cabinetRoleFilter}
                onChange={(e) => setCabinetRoleFilter(e.target.value)}
                className="w-full sm:max-w-[220px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
              >
                <option value="all">All Cabinet Roles</option>
                {CABINET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Roster Container */}
            {loadingCabinet ? (
              <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-xs text-slate-400 mt-4 font-semibold">Loading Cabinet registries...</p>
              </div>
            ) : cabinetMembers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850 p-16 text-center space-y-4">
                <Users className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Cabinet Assembly is empty</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No leadership portfolios are active. Search approved general members to make cabinet appointments.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Personnel Profile</th>
                        <th className="p-4">Cabinet Position</th>
                        <th className="p-4">Appointed At</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Assigned By</th>
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
                              <td className="p-4 font-bold text-amber-600 dark:text-amber-400 tracking-wide">
                                ★ {m.executiveRole}
                              </td>
                              <td className="p-4 text-slate-400">
                                {m.appointmentDate ? new Date(m.appointmentDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                }) : "N/A"}
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
                              <td className="p-4 text-slate-500 font-medium">
                                {m.appointedBy?.fullName || "Chairman"}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setViewingCabinetMember(m)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Inspect details"
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
                                    title="Edit assignment"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTerminatingCabinetMember(m);
                                      setConfirmCheckbox(false);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="Remove from Cabinet"
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

          {/* RIGHT COLUMN: Candidate Lookup Bar & Dossier Preview Card */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Lookup Input with Autocomplete Results */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-emerald-600" />
                Find Candidate Member
              </h3>
              
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Enter Name, Member ID, or Email..."
                  value={searchCandidateQuery}
                  onChange={(e) => {
                    setSearchCandidateQuery(e.target.value);
                    setShowResultsDropdown(true);
                  }}
                  onFocus={() => setShowResultsDropdown(true)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                />

                {/* Autocomplete Results list */}
                {showResultsDropdown && searchCandidateQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                    {candidateResults.length === 0 ? (
                      <p className="p-3 text-center text-slate-400 text-xs font-medium">No approved candidates match.</p>
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

            {/* Verification Dossier Card (Pre-Assignment preview) */}
            {selectedMemberObj ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/30 dark:border-emerald-500/20 p-6 shadow-md space-y-6 relative overflow-hidden animate-in fade-in duration-200">
                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-600/5 rounded-bl-full flex items-center justify-center">
                  <AwardIcon className="h-5 w-5 text-emerald-600/60" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-heading font-black text-xs text-slate-400 uppercase tracking-widest">Candidate Dossier</h4>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">Approved &amp; Certified ✓</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberObj(null)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-emerald-600 shrink-0">
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
                      <span className="text-[10px] text-slate-400 font-mono block">Seat Code: {selectedMemberObj.membershipId}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" /> Contact:</span>
                      <strong className="text-slate-700 dark:text-slate-300 max-w-[150px] truncate">{selectedMemberObj.email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Representation:</span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {selectedMemberObj.district ? `${selectedMemberObj.district}, ` : ""}{selectedMemberObj.province}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Class Type:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{selectedMemberObj.membershipType || "General"}</strong>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAssignCabinet} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Executive Cabinet Role</label>
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
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Status</label>
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
                    {assigning ? "Confirming Appointment..." : "Appoint to Cabinet"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs font-medium">
                Please search and select a candidate in the autocomplete field above to pull their personnel dossier details.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* EDIT POSITION MODAL */}
      {editingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Modify Appointment</h4>
                  <p className="text-xs text-slate-400">Editing role for {editingCabinetMember.fullName}</p>
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
                    {updating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECURE TERMINATION DOUBLE-CONFIRMATION MODAL */}
      {terminatingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex gap-3 items-start text-red-600">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Terminate Cabinet Role</h4>
                  <p className="text-xs text-slate-400">Removing {terminatingCabinetMember.fullName} from {terminatingCabinetMember.executiveRole}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                This will revoke their executive credentials, reset their access role back to a general member, and mark their cabinet status as Inactive.
              </p>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 p-3 rounded-lg flex items-start gap-2">
                <input
                  type="checkbox"
                  id="confirmCheck"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 cursor-pointer accent-red-600"
                />
                <label htmlFor="confirmCheck" className="text-[11px] text-red-700 dark:text-red-400 font-bold leading-snug cursor-pointer select-none">
                  I confirm that I am removing this member from the Executive Cabinet and resetting their portal access back to general member.
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTerminatingCabinetMember(null);
                    setConfirmCheckbox(false);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!confirmCheckbox || deleting}
                  onClick={handleRemoveCabinet}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Removing..." : "Confirm Termination"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* INSPECT DETAILS VIEW MODAL */}
      {viewingCabinetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Cabinet Member Details</h4>
                  <p className="text-xs text-slate-400">Certified Official Profile</p>
                </div>
                <button 
                  onClick={() => setViewingCabinetMember(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-t border-slate-150 dark:border-slate-850 my-2"></div>

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
                  <p className="text-xs text-slate-400 font-mono">
                    Member ID: {viewingCabinetMember.membershipId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Email Address:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{viewingCabinetMember.email}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Region/Seat Mapping:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.district ? `${viewingCabinetMember.district}, ` : ""}{viewingCabinetMember.province}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Appointment Date:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.appointmentDate ? new Date(viewingCabinetMember.appointmentDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Appointed By:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {viewingCabinetMember.appointedBy?.fullName || "Chairman Secretariat"}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Status:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    viewingCabinetMember.status === "Active"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {viewingCabinetMember.status || "Active"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Membership Type:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{viewingCabinetMember.membershipType || "General"}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingCabinetMember(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all shadow"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
