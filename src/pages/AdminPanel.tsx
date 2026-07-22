import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Users, Award, Calendar, Volume2, ShieldAlert, CheckCircle2,
  AlertCircle, Download, Trash2, Edit2, Plus, X, Eye, ArrowRight
} from "lucide-react";
import { User, Event, News } from "../types";
import { AppDispatch, RootState } from "../store";
import {
  fetchAdminApplications,
  approveApplicationThunk,
  rejectApplicationThunk,
  deleteUserThunk,
  assignRoleThunk,
} from "../store/slices/adminSlice";
import { createEventThunk } from "../store/slices/eventsSlice";
import { createNewsThunk }  from "../store/slices/newsSlice";


export default function AdminPanel() {
  const { user, stats, fetchStats, triggerToast } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.admin);

  // Use applications from Redux (field name is applicationStatus not status)
  const applicants = applications;

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superAdmin") {
      triggerToast("Access Denied", "This secure console is reserved for portal administrators.", "error");
      navigate("/dashboard");
    }
  }, [user]);



  // Form states for creating Event
  const [evtTitle, setEvtTitle]   = useState("");
  const [evtDesc, setEvtDesc]     = useState("");
  const [evtDate, setEvtDate]     = useState("");
  const [evtLoc, setEvtLoc]       = useState("");

  // Form states for creating News
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSum, setNewsSum]     = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCat, setNewsCat]     = useState<"Announcement" | "Press Release" | "Legislative Update">("Announcement");

  // Selection states for review modal
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);

  // Roster role edits
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole]               = useState<"member" | "executive">("member");
  const [editPortfolio, setEditPortfolio]     = useState("");

  // Sub-tab control
  const [adminTab, setAdminTab] = useState<"applications" | "roster" | "events" | "news" | "analytics">("applications");


  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superAdmin")) {
      fetchAdminData();
    }
  }, [user?._id]);

  const fetchAdminData = async () => {
    dispatch(fetchAdminApplications());
    fetchStats();
  };


  // Submit new Event using Redux thunk
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDesc || !evtDate || !evtLoc) return;

    try {
      const result = await dispatch(createEventThunk({
        title:       evtTitle,
        description: evtDesc,
        eventDate:   evtDate,
        location:    evtLoc,
        eventImage:  "",
        announcedBy: (user as any)._id || "",
        status:      "Upcoming",
        isPublished: true,
      }));
      if (createEventThunk.fulfilled.match(result)) {
        triggerToast("Event Scheduled", "Assembly calendar successfully updated and broadcasted.", "success");
        setEvtTitle(""); setEvtDesc(""); setEvtDate(""); setEvtLoc("");
        fetchStats();
      } else {
        triggerToast("Error", "Failed to create event.", "error");
      }
    } catch (err) {
      triggerToast("Error", "Failed to register event.", "error");
    }
  };


  // Submit new News using Redux thunk
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSum) return;

    try {
      const result = await dispatch(createNewsThunk({
        title:        newsTitle,
        description:  `${newsSum}\n\n${newsContent}`,
        newsImage:    "",
        publishedBy:  (user as any)._id || "",
        category:     newsCat as any,
        isPublished:  true,
      }));
      if (createNewsThunk.fulfilled.match(result)) {
        triggerToast("News Published", "Legislative bulletin successfully saved.", "success");
        setNewsTitle(""); setNewsSum(""); setNewsContent("");
      } else {
        triggerToast("Error", "Failed to publish news.", "error");
      }
    } catch (err) {
      triggerToast("Error", "Failed to publish news.", "error");
    }
  };


  // Review (Approve/Reject) application using Redux thunk
  const handleReview = async (id: string, action: "approved" | "rejected") => {
    try {
      const result = action === "approved"
        ? await dispatch(approveApplicationThunk(id))
        : await dispatch(rejectApplicationThunk({ id }));

      triggerToast(
        `Application ${action === "approved" ? "Approved" : "Rejected"}`,
        `Dossier status updated and notification triggered.`,
        action === "approved" ? "success" : "info"
      );
      setSelectedApplicant(null);
      fetchStats();
    } catch (err) {
      triggerToast("Error", "Application status update failed.", "error");
    }
  };


  // Delete user using Redux thunk
  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this applicant file from records?")) return;
    try {
      await dispatch(deleteUserThunk(id));
      triggerToast("File Removed", "Applicant file permanently deleted from registry.", "info");
      fetchStats();
    } catch (err) {
      triggerToast("Error", "File removal failed.", "error");
    }
  };


  // Edit role using Redux thunk
  const handleSaveRoleEdit = async (id: string) => {
    try {
      await dispatch(assignRoleThunk({ id, role: editRole, portfolio: editRole === "executive" ? editPortfolio : undefined }));
      triggerToast("Role Updated", "Member credentials successfully saved.", "success");
      setEditingMemberId(null);
      setEditPortfolio("");
      fetchStats();
    } catch (e) {
      triggerToast("Error", "Failed to update member role.", "error");
    }
  };


  // Export full application list to CSV (uses real backend field names)
  const handleExportCSV = () => {
    if (applicants.length === 0) {
      triggerToast("Export Failed", "There are currently no applications to export.", "error");
      return;
    }

    const headers = ["Application ID", "Full Name", "Email", "CNIC", "Education", "Status", "Date"];
    const rows = applicants.map((a: any) => [
      a._id || "",
      (a.fullName || "").replace(/,/g, " "),
      a.email || "",
      a.cnic || "",
      (a.education || "").replace(/,/g, " "),
      a.applicationStatus || "",
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PYVP_Applications_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Export Successful", "Applications list saved as CSV.", "success");
  };


  // Security guard check
  if (!user || !(["admin", "superAdmin"].includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
          <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">Security Violation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            This module represents the administrative reviews panel. Access requires secure root administrator level tokens.
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

  // Segment candidates using real backend field applicationStatus
  const pendingApps   = applicants.filter((u: any) => u.applicationStatus === "Pending" || u.applicationStatus === "Under Review");
  const approvedMembersArr = applicants.filter((u: any) => u.applicationStatus === "Approved");


  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      
      {/* Top Admin Header Bar */}
      <section className="bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-white py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded font-black tracking-widest uppercase">Secretariat</span>
              <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white">Supreme Control Console</h1>
            </div>
            <p className="text-xs text-slate-400">Evaluate registrations, update portfolios, post news alerts, and monitor legislative analytics.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              <Download className="h-4 w-4" />
              Export Roster (CSV)
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
            >
              Exit Console
            </button>
          </div>
        </div>
      </section>

      {/* Sub Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          {[
            { id: "applications", name: "Review Applications", count: pendingApps.length, icon: Users },
            { id: "roster", name: "Parliament Roster", count: approvedMembersArr.length, icon: Award },
            { id: "events", name: "Add Assembly Event", icon: Calendar },
            { id: "news", name: "Write Announcement", icon: Volume2 },
            { id: "analytics", name: "Provincial Statistics", icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 rounded-t-lg ${
                adminTab === tab.id
                  ? "text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-900/40"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab.id === "applications" && tab.count > 0 
                    ? "bg-red-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: REVIEW BOARD */}
        {adminTab === "applications" && (
          <div className="mt-8 space-y-6">
            
            {pendingApps.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 p-12 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">All dossiers evaluated!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">There are currently no pending membership application files requiring administrative checkouts.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Candidate Name</th>
                        <th className="p-4">Province & Constituency</th>
                        <th className="p-4">Identification CNIC</th>
                        <th className="p-4">Submission Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {pendingApps.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white">{cand.fullName}</div>
                            <span className="text-[10px] text-slate-400 font-mono block">{cand.email}</span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{cand.province}</div>
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">{cand.constituency}</span>
                          </td>
                          <td className="p-4 font-mono font-semibold">{cand.cnic}</td>
                          <td className="p-4 text-slate-400">{new Date(cand.appliedAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedApplicant(cand)}
                              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-md hover:bg-emerald-100 hover:text-emerald-800 transition-all text-[11px] flex items-center gap-1 ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Inspect File
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PARLIAMENT ROSTER */}
        {adminTab === "roster" && (
          <div className="mt-8 space-y-6">
            
            {approvedMembersArr.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 p-12 text-center rounded-2xl">
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-3">Roster is empty</h4>
                <p className="text-xs text-slate-400 mt-1">Verify and approve applications to populate the active roster catalog.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Member ID</th>
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Seat Location</th>
                        <th className="p-4">Legislative Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {approvedMembersArr.map((memb) => {
                        const isEditing = editingMemberId === memb.id;
                        return (
                          <tr key={memb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                            <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">{memb.membershipId}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900 dark:text-white">{memb.fullName}</div>
                              <span className="text-[10px] text-slate-400 block font-mono">{memb.email}</span>
                            </td>
                            <td className="p-4 font-medium">{memb.constituency} ({memb.province})</td>
                            <td className="p-4">
                              {isEditing ? (
                                <div className="space-y-1.5">
                                  <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as any)}
                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded font-bold"
                                  >
                                    <option value="member">Member</option>
                                    <option value="executive">Executive</option>
                                  </select>
                                  {editRole === "executive" && (
                                    <input
                                      type="text"
                                      value={editPortfolio}
                                      onChange={(e) => setEditPortfolio(e.target.value)}
                                      placeholder="e.g. Youth Prime Minister"
                                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-[10px] block w-full"
                                    />
                                  )}
                                  <button
                                    onClick={() => handleSaveRoleEdit(memb.id)}
                                    className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded hover:bg-emerald-800 block"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    memb.role === "executive" 
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  }`}>
                                    {memb.role}
                                  </span>
                                  {memb.executivePosition && (
                                    <p className="text-[10px] text-gold-600 font-bold mt-1 uppercase">
                                      ★ {memb.executivePosition}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingMemberId(memb.id);
                                    setEditRole(memb.role as any);
                                    setEditPortfolio(memb.executivePosition || "");
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="Edit role/portfolio"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(memb.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                  title="Delete Record"
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
        )}

        {/* TAB 3: ADD EVENTS */}
        {adminTab === "events" && (
          <div className="mt-8 max-w-xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Schedule Parliamentary Event
              </h3>

              <form onSubmit={evtTitle ? handleEventSubmit : (e) => e.preventDefault()} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Event Assembly Title</label>
                  <input
                    type="text"
                    required
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="e.g. Climate Action Simulation Session"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Assembly Location</label>
                    <input
                      type="text"
                      required
                      value={evtLoc}
                      onChange={(e) => setEvtLoc(e.target.value)}
                      placeholder="e.g. Assembly Hall, Lahore"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Event Curriculum Briefing</label>
                  <textarea
                    required
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    rows={4}
                    placeholder="Provide full description of assembly motions, rules of floor, and key agenda targets."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                >
                  Publish and broadcast Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: ADD ANNOUNCEMENTS */}
        {adminTab === "news" && (
          <div className="mt-8 max-w-xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-emerald-600" />
                Publish Public Press Release
              </h3>

              <form onSubmit={newsTitle ? handleNewsSubmit : (e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Document Title</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. National Youth Intake Launches Online Portal"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Category</label>
                    <select
                      value={newsCat}
                      onChange={(e) => setNewsCat(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Press Release">Press Release</option>
                      <option value="Legislative Update">Legislative Update</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Summary Bullet (Single Sentence)</label>
                  <input
                    type="text"
                    required
                    value={newsSum}
                    onChange={(e) => setNewsSum(e.target.value)}
                    placeholder="Brief highlight that fits ticker lines or preview columns."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Full Press Content</label>
                  <textarea
                    required
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    rows={5}
                    placeholder="Complete body of the official legislative press brief."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                >
                  Publish Briefing
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS PROGRESS CHARTS */}
        {adminTab === "analytics" && stats && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Provincial Roster representation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Provincial representation</h3>
                <div className="space-y-3.5">
                  {Object.entries(stats.provincesStats).length === 0 ? (
                    <p className="text-xs text-slate-400">Roster has no regional mappings active.</p>
                  ) : (
                    Object.entries(stats.provincesStats).map(([province, val]) => {
                      const percentage = Math.min(100, Math.round((Number(val) / (stats.approvedMembers || 1)) * 100));
                      return (
                        <div key={province} className="space-y-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span>{province}</span>
                            <span className="font-bold">{val} seats ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Roster ratios */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Application reviews ratio</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span>Approved Members count:</span>
                    <strong className="text-emerald-600">{stats.approvedMembers} dossiers</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Pending review queue:</span>
                    <strong className="text-amber-600">{stats.pendingReviews} dossiers</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Rejected applications:</span>
                    <strong className="text-red-500">{stats.rejectedApplications} dossiers</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Total applicants recorded:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{stats.totalApplicants} dossiers</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* INSPECTION DETAILED DIALOG MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Evaluate Candidate Dossier</h4>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Temporary File: {selectedApplicant.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

              {/* Grid of Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium block">Full Legal Name:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block text-sm">{selectedApplicant.fullName}</strong>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium block">Identity CNIC or B-Form:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block font-mono text-sm">{selectedApplicant.cnic}</strong>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium block">Territorial Constituency Mapping:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{selectedApplicant.constituency} ({selectedApplicant.province})</strong>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium block">Academic Degree:</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{selectedApplicant.education}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium block">Motivation essay:</span>
                <p className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded border border-slate-100 dark:border-slate-850 italic text-slate-600 dark:text-slate-300">
                  "{selectedApplicant.bio || "No motivation essay provided by candidate."}"
                </p>
              </div>

              {/* Uploaded Receipts/Files */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Upload Documents Packet</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* EasyPaisa receipt preview */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">Uploaded EasyPaisa Receipt</span>
                    {(selectedApplicant.receipt?.secure_url || selectedApplicant.paymentReceipt) ? (
                      <div className="border p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                        <img 
                          src={selectedApplicant.receipt?.secure_url || selectedApplicant.paymentReceipt} 
                          alt="Receipt Preview" 
                          className="h-32 mx-auto object-contain rounded hover:scale-105 transition-all cursor-pointer"
                          onClick={() => window.open(selectedApplicant.receipt?.secure_url || selectedApplicant.paymentReceipt, "_blank")}
                        />
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-red-500 font-bold text-xs">
                        Missing Receipt screenshot
                      </div>
                    )}
                  </div>

                  {/* CNIC preview */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">Uploaded Identity Copy</span>
                    {(selectedApplicant.cnicFront?.secure_url || selectedApplicant.documentUrl) ? (
                      <div className="border p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                        <img 
                          src={selectedApplicant.cnicFront?.secure_url || selectedApplicant.documentUrl} 
                          alt="Doc Preview" 
                          className="h-32 mx-auto object-contain rounded hover:scale-105 transition-all cursor-pointer"
                          onClick={() => window.open(selectedApplicant.cnicFront?.secure_url || selectedApplicant.documentUrl, "_blank")}
                        />
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">
                        No copy provided
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Decisions Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 justify-end">
                <button
                  onClick={() => handleReview(selectedApplicant.id, "rejected")}
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-800/30 font-bold text-xs rounded-lg transition-all"
                >
                  Reject & Notify
                </button>
                <button
                  onClick={() => handleReview(selectedApplicant.id, "approved")}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all shadow"
                >
                  Approve and Issue Member ID
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
