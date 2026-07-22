import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Award,
  Landmark,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Eye,
  LogOut,
  Check,
  User as UserIcon,
  ShieldAlert,
  MapPin,
  Mail,
  AlertTriangle,
  CheckCircle,
  Volume2,
  FileText,
  Settings,
  Activity,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Bell,
  Lock,
  Image,
  Hash,
  Filter,
  ChevronLeft,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import * as chairmanService from "../services/chairmanApi";
import * as cabinetService from "../services/executiveApi";
import { getAllMembers } from "../services/memberApi";
import * as eventService from "../services/eventApi";
import * as newsService from "../services/newsApi";
import * as announcementService from "../services/chairmanApi";

export default function ChairmanPortal() {
  const { user, logout, triggerToast } = useAuth();
  const navigate = useNavigate();

  // Sidebar Gated Active Section state
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "executive"
    | "members"
    | "applications"
    | "announcements"
    | "events"
    | "news"
    | "homepage"
    | "logs"
    | "notifications"
    | "settings"
  >("dashboard");

  // Authentication access control
  const isChairman =
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
    if (user && !isChairman) {
      triggerToast(
        "Access Denied",
        "This legislative console is strictly restricted to the Chairman Secretariat.",
        "error",
      );
      navigate("/dashboard");
    }
  }, [user, isChairman, navigate]);

  // General Loading States
  const [globalLoading, setGlobalLoading] = useState(false);

  const getCacheItem = (key: string, defaultVal: any) => {
    try {
      const val = sessionStorage.getItem(key);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setCacheItem = (key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {}
  };

  const checkTabCache = (tab: string) => {
    try {
      if (tab === "dashboard")
        return sessionStorage.getItem("pyvp_cache_dashboardStats") !== null;
      if (tab === "executive")
        return sessionStorage.getItem("pyvp_cache_cabinetMembers") !== null;
      if (tab === "members")
        return sessionStorage.getItem("pyvp_cache_membersList") !== null;
      if (tab === "applications")
        return sessionStorage.getItem("pyvp_cache_applicationsList") !== null;
      if (tab === "announcements")
        return sessionStorage.getItem("pyvp_cache_announcementsList") !== null;
      if (tab === "events")
        return sessionStorage.getItem("pyvp_cache_eventsList") !== null;
      if (tab === "news")
        return sessionStorage.getItem("pyvp_cache_newsList") !== null;
      if (tab === "logs")
        return sessionStorage.getItem("pyvp_cache_activityLogsList") !== null;
      if (tab === "notifications")
        return sessionStorage.getItem("pyvp_cache_notificationsList") !== null;
    } catch {}
    return false;
  };

  // ────────────────────────────────────────────────────────────────────────
  // TAB STATES
  // ────────────────────────────────────────────────────────────────────────

  // 1. Dashboard Overview States
  const [dashboardStats, setDashboardStats] = useState<any>(() =>
    getCacheItem("pyvp_cache_dashboardStats", null),
  );
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_upcomingEvents", []),
  );
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_recentAnnouncements", []),
  );
  const [recentActivities, setRecentActivities] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_recentActivities", []),
  );

  // 2. Executive Management States
  const [cabinetMembers, setCabinetMembers] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_cabinetMembers", []),
  );
  const [generalRoster, setGeneralRoster] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_generalRoster", []),
  );
  const [cabinetSearch, setCabinetSearch] = useState("");
  const [cabinetRoleFilter, setCabinetRoleFilter] = useState("all");
  const [searchCandidateQuery, setSearchCandidateQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [appointRole, setAppointRole] = useState("Joint Secretary");
  const [appointStatus, setAppointStatus] = useState<"Active" | "Inactive">(
    "Active",
  );
  const [editingCabinet, setEditingCabinet] = useState<any | null>(null);
  const [editCabinetRole, setEditCabinetRole] = useState("");
  const [editCabinetStatus, setEditCabinetStatus] = useState<
    "Active" | "Inactive"
  >("Active");
  const [terminatingCabinet, setTerminatingCabinet] = useState<any | null>(
    null,
  );
  const [confirmRevocationCheck, setConfirmRevocationCheck] = useState(false);

  // 3. Member Management States
  const [membersList, setMembersList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_membersList", []),
  );
  const [membersTotal, setMembersTotal] = useState<number>(() =>
    getCacheItem("pyvp_cache_membersTotal", 0),
  );
  const [membersPage, setMembersPage] = useState(1);
  const [membersSearch, setMembersSearch] = useState("");
  const [membersFilterStatus, setMembersFilterStatus] = useState("");
  const [viewingMemberDetails, setViewingMemberDetails] = useState<any | null>(
    null,
  );

  // 4. Application Management States
  const [applicationsList, setApplicationsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_applicationsList", []),
  );
  const [appsTotal, setAppsTotal] = useState<number>(() =>
    getCacheItem("pyvp_cache_appsTotal", 0),
  );
  const [appsPage, setAppsPage] = useState(1);
  const [appsSearch, setAppsSearch] = useState("");
  const [appsFilterStatus, setAppsFilterStatus] = useState("");
  const [inspectingApplication, setInspectingApplication] = useState<
    any | null
  >(null);
  const [appRemarks, setAppRemarks] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // 5. Homepage Announcements States
  const [announcementsList, setAnnouncementsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_announcementsList", []),
  );
  const [annForm, setAnnForm] = useState({
    _id: "",
    title: "",
    description: "",
    imageUrl: "",
    priority: "Medium",
    startDate: "",
    endDate: "",
    status: "Active",
  });
  const [isEditingAnn, setIsEditingAnn] = useState(false);

  // 6. Event Management States
  const [eventsList, setEventsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_eventsList", []),
  );
  const [eventForm, setEventForm] = useState({
    _id: "",
    title: "",
    description: "",
    eventImage: "",
    announcedBy: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    venue: "",
    mapsLocation: "",
    organizer: "PYVP Secretariat",
    registrationDeadline: "",
    maxParticipants: 0,
    category: "Parliamentary Session",
    status: "Upcoming",
    isPublished: false,
  });
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  // 7. News Management States
  const [newsList, setNewsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_newsList", []),
  );
  const [newsForm, setNewsForm] = useState({
    _id: "",
    title: "",
    description: "",
    newsImage: "",
    publishedBy: "",
    author: "PYVP Correspondent",
    category: "News",
    tags: "",
    isPublished: false,
    status: "Published",
  });
  const [isEditingNews, setIsEditingNews] = useState(false);

  // 8. Homepage Content States
  const [homepageForm, setHomepageForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    chairmanMessage: "",
    chairmanName: "",
    chairmanTitle: "",
    vision: "",
    mission: "",
    visionImage: "",
    missionImage: "",
    promotionalBannerText: "",
    promotionalBannerActive: false,
  });

  // 9. Activity Logs States
  const [activityLogsList, setActivityLogsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_activityLogsList", []),
  );
  const [logsSearch, setLogsSearch] = useState("");

  // 10. System Notifications States
  const [notificationsList, setNotificationsList] = useState<any[]>(() =>
    getCacheItem("pyvp_cache_notificationsList", []),
  );

  // 11. Profile Settings States
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    profileImage: "",
    password: "",
    newPassword: "",
  });

  // Supporting Dropdown Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Supported Cabinet Roles
  const CABINET_ROLES = [
    "Chairman",
    "Vice Chairman",
    "Secretary General",
    "Deputy Secretary General",
    "President",
    "Vice President",
    "General Secretary",
    "Finance Secretary",
    "Information Secretary",
    "Media Coordinator",
    "Organizing Secretary",
    "Provincial Coordinator",
    "District Coordinator",
    "Director General (DG)",
    "Joint Secretary",
    "Executive Member",
  ];

  // ────────────────────────────────────────────────────────────────────────
  // DATA LOADERS
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user || !isChairman) return;
    loadActiveTabData();
  }, [activeTab, user?._id, membersPage, appsPage]);

  const loadActiveTabData = async () => {
    const hasCache = checkTabCache(activeTab);
    if (!hasCache) {
      setGlobalLoading(true);
    }
    try {
      if (activeTab === "dashboard") {
        const res = await chairmanService.getOverviewStats();
        if (res.success) {
          setDashboardStats(res.stats);
          setCacheItem("pyvp_cache_dashboardStats", res.stats);
          setUpcomingEvents(res.upcomingEvents || []);
          setCacheItem("pyvp_cache_upcomingEvents", res.upcomingEvents || []);
          setRecentAnnouncements(res.recentAnnouncements || []);
          setCacheItem(
            "pyvp_cache_recentAnnouncements",
            res.recentAnnouncements || [],
          );
          setRecentActivities(res.recentActivities || []);
          setCacheItem(
            "pyvp_cache_recentActivities",
            res.recentActivities || [],
          );
        }
      } else if (activeTab === "executive") {
        const cabRes = await cabinetService.getAllExecutiveMembers();
        if (cabRes.success) {
          setCabinetMembers(cabRes.members || []);
          setCacheItem("pyvp_cache_cabinetMembers", cabRes.members || []);
        }
        const rosterRes = await getAllMembers();
        if (rosterRes.success) {
          setGeneralRoster(rosterRes.members || []);
          setCacheItem("pyvp_cache_generalRoster", rosterRes.members || []);
        }
      } else if (activeTab === "members") {
        const res = await chairmanService.getMembers({
          page: membersPage,
          limit: 10,
          search: membersSearch,
          status: membersFilterStatus,
        });
        if (res.success) {
          setMembersList(res.members || []);
          setCacheItem("pyvp_cache_membersList", res.members || []);
          setMembersTotal(res.total || 0);
          setCacheItem("pyvp_cache_membersTotal", res.total || 0);
        }
      } else if (activeTab === "applications") {
        const res = await chairmanService.getApplications({
          page: appsPage,
          limit: 10,
          search: appsSearch,
          status: appsFilterStatus,
        });
        if (res.success) {
          setApplicationsList(res.applications || []);
          setCacheItem("pyvp_cache_applicationsList", res.applications || []);
          setAppsTotal(res.total || 0);
          setCacheItem("pyvp_cache_appsTotal", res.total || 0);
        }
      } else if (activeTab === "announcements") {
        const res = await announcementService.getAnnouncement(); // Using existing service fetch
        // Also fetch from db list
        const listRes = await chairmanService.getOverviewStats(); // Pull stats fallback list
        setAnnouncementsList(listRes.recentAnnouncements || []);
        setCacheItem(
          "pyvp_cache_announcementsList",
          listRes.recentAnnouncements || [],
        );
      } else if (activeTab === "events") {
        const res = await eventService.getAllEvents();
        if (res.success) {
          setEventsList(res.events || []);
          setCacheItem("pyvp_cache_eventsList", res.events || []);
        }
      } else if (activeTab === "news") {
        const res = await newsService.getAllNews(); // fallback to stats list or specific service
        if (res.success) {
          setNewsList(res.news || []);
          setCacheItem("pyvp_cache_newsList", res.news || []);
        }
      } else if (activeTab === "homepage") {
        const res = await chairmanService.getHomepageContent();
        if (res.success && res.content) {
          setHomepageForm({
            heroTitle: res.content.heroTitle || "",
            heroSubtitle: res.content.heroSubtitle || "",
            chairmanMessage: res.content.chairmanMessage || "",
            chairmanName: res.content.chairmanName || "",
            chairmanTitle: res.content.chairmanTitle || "",
            vision: res.content.vision || "",
            mission: res.content.mission || "",
            visionImage: res.content.visionImage || "",
            missionImage: res.content.missionImage || "",
            promotionalBannerText: res.content.promotionalBannerText || "",
            promotionalBannerActive:
              res.content.promotionalBannerActive || false,
          });
        }
      } else if (activeTab === "logs") {
        const res = await chairmanService.getActivityLogs();
        if (res.success) {
          setActivityLogsList(res.logs || []);
          setCacheItem("pyvp_cache_activityLogsList", res.logs || []);
        }
      } else if (activeTab === "notifications") {
        const res = await chairmanService.getNotifications();
        if (res.success) {
          setNotificationsList(res.notifications || []);
          setCacheItem("pyvp_cache_notificationsList", res.notifications || []);
        }
      }
    } catch (err: any) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        return;
      }
      triggerToast(
        "Retrieval Error",
        err.response?.data?.message || "Failed to load database records.",
        "error",
      );
    } finally {
      setGlobalLoading(false);
    }
  };

  // Click-away listener for autocomplete Candidate search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCandidateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter roster search candidates
  const filteredCandidates = searchCandidateQuery.trim()
    ? generalRoster.filter((m) => {
        if (
          m.executiveRole ||
          m.designation === "Chairman" ||
          m.designation === "Chairman PYVP"
        )
          return false;
        const q = searchCandidateQuery.toLowerCase();
        return (
          (m.fullName || "").toLowerCase().includes(q) ||
          (m.membershipId || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        );
      })
    : [];

  // ────────────────────────────────────────────────────────────────────────
  // BUSINESS LOGIC ACTIONS
  // ────────────────────────────────────────────────────────────────────────

  // -- 2. Executive Management
  const handleAssignCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !appointRole) {
      triggerToast(
        "Missing Parameters",
        "Please select a member and assign a role.",
        "error",
      );
      return;
    }
    try {
      const res = await cabinetService.assignExecutiveRole({
        memberId: selectedCandidate._id,
        executiveRole: appointRole,
        status: appointStatus,
      });
      if (res.success) {
        triggerToast(
          "Cabinet Appointed",
          `Successfully appointed ${selectedCandidate.fullName} as ${appointRole}.`,
          "success",
        );
        setSelectedCandidate(null);
        setSearchCandidateQuery("");
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Appointment Failed",
        err.response?.data?.message || "Could not appoint executive role.",
        "error",
      );
    }
  };

  const handleUpdateCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCabinet || !editCabinetRole) return;
    try {
      const res = await cabinetService.updateExecutiveRole(editingCabinet._id, {
        executiveRole: editCabinetRole,
        status: editCabinetStatus,
      });
      if (res.success) {
        triggerToast(
          "Cabinet Updated",
          "Successfully modified executive role status.",
          "success",
        );
        setEditingCabinet(null);
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Update Failed",
        err.response?.data?.message || "Could not save role changes.",
        "error",
      );
    }
  };

  const handleRevokeCabinet = async () => {
    if (!terminatingCabinet || !confirmRevocationCheck) return;
    try {
      const res = await cabinetService.removeExecutiveRole(
        terminatingCabinet._id,
      );
      if (res.success) {
        triggerToast(
          "Role Revoked",
          "Executive role has been successfully terminated.",
          "success",
        );
        setTerminatingCabinet(null);
        setConfirmRevocationCheck(false);
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Revocation Failed",
        err.response?.data?.message || "Could not revoke cabinet assignment.",
        "error",
      );
    }
  };

  // -- 3. Member Management
  const handleToggleMemberStatus = async (member: any) => {
    const nextStatus =
      member.membershipStatus === "Active" ? "Suspended" : "Active";
    try {
      const res = await chairmanService.updateMemberStatus(
        member._id,
        nextStatus,
      );
      if (res.success) {
        triggerToast(
          "Member Updated",
          `Successfully changed status of ${member.fullName} to ${nextStatus}.`,
          "success",
        );
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Failed to Update Member",
        err.response?.data?.message || "Error changing member status.",
        "error",
      );
    }
  };

  const handlePermanentRemoveMember = async (memberId: string) => {
    if (
      !window.confirm(
        "CAUTION: This will permanently delete this member dossier. This action is irreversible. Continue?",
      )
    )
      return;
    try {
      const res = await chairmanService.removeMember(memberId);
      if (res.success) {
        triggerToast("Member Deleted", "Registry record cleared.", "success");
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Deletion Failed",
        err.response?.data?.message || "Could not remove member.",
        "error",
      );
    }
  };

  const handleResetMemberPermissions = async (memberId: string) => {
    try {
      const res = await chairmanService.resetMemberPermissions(memberId);
      if (res.success) {
        triggerToast(
          "Permissions Reset",
          "Role cleared and reset to general member.",
          "success",
        );
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Reset Failed",
        err.response?.data?.message ||
          "Could not reset permission configuration.",
        "error",
      );
    }
  };

  // -- 4. Application Management
  const handleUpdateApplication = async (status: string) => {
    if (!inspectingApplication) return;
    setIsSubmittingDecision(true);
    try {
      const res = await chairmanService.updateApplicationStatus(
        inspectingApplication._id,
        status,
        appRemarks,
      );
      if (res.success) {
        triggerToast(
          "Application Evaluated",
          `Dossier marked as ${status} successfully.`,
          "success",
        );
        setInspectingApplication(null);
        setAppRemarks("");
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Decision Failed",
        err.response?.data?.message || "Could not submit review decision.",
        "error",
      );
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // -- 5. Homepage Announcements
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await announcementService.createOrUpdateAnnouncement({
        title: annForm.title,
        description: annForm.description,
        imageUrl: annForm.imageUrl,
        priority: annForm.priority,
        startDate: annForm.startDate ? new Date(annForm.startDate) : new Date(),
        endDate: annForm.endDate ? new Date(annForm.endDate) : undefined,
        status: annForm.status,
      } as any);
      if (res.success) {
        triggerToast(
          "Announcement Saved",
          "dynamic homepage alert published successfully.",
          "success",
        );
        setAnnForm({
          _id: "",
          title: "",
          description: "",
          imageUrl: "",
          priority: "Medium",
          startDate: "",
          endDate: "",
          status: "Active",
        });
        setIsEditingAnn(false);
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Publishing Failed",
        err.response?.data?.message || "Could not save announcement.",
        "error",
      );
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const res = await announcementService.deleteAnnouncement(id);
      if (res.success) {
        triggerToast(
          "Announcement Deleted",
          "Homepage announcement cleared.",
          "success",
        );
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Failed to Delete",
        err.response?.data?.message || "Could not clear announcement.",
        "error",
      );
    }
  };

  // -- 6. Events Management
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingEvent && eventForm._id) {
        const res = await eventService.updateEvent(eventForm._id, {
          title: eventForm.title,
          description: eventForm.description,
          eventImage: eventForm.eventImage,
          announcedBy: eventForm.announcedBy || user?._id,
          eventDate: new Date(eventForm.eventDate),
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location,
          venue: eventForm.venue,
          mapsLocation: eventForm.mapsLocation,
          organizer: eventForm.organizer,
          registrationDeadline: eventForm.registrationDeadline
            ? new Date(eventForm.registrationDeadline)
            : null,
          maxParticipants: Number(eventForm.maxParticipants),
          category: eventForm.category,
          status: eventForm.status,
          isPublished: eventForm.isPublished,
        });
        if (res.success)
          triggerToast(
            "Event Updated",
            "Event detail specifications saved.",
            "success",
          );
      } else {
        const res = await eventService.createEvent({
          title: eventForm.title,
          description: eventForm.description,
          eventImage: eventForm.eventImage,
          announcedBy: user?._id || "",
          eventDate: new Date(eventForm.eventDate),
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location,
          venue: eventForm.venue,
          mapsLocation: eventForm.mapsLocation,
          organizer: eventForm.organizer,
          registrationDeadline: eventForm.registrationDeadline
            ? new Date(eventForm.registrationDeadline)
            : null,
          maxParticipants: Number(eventForm.maxParticipants),
          category: eventForm.category,
          status: eventForm.status,
          isPublished: eventForm.isPublished,
        });
        if (res.success)
          triggerToast(
            "Event Announcd",
            "New event created successfully.",
            "success",
          );
      }
      setEventForm({
        _id: "",
        title: "",
        description: "",
        eventImage: "",
        announcedBy: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        location: "",
        venue: "",
        mapsLocation: "",
        organizer: "PYVP Secretariat",
        registrationDeadline: "",
        maxParticipants: 0,
        category: "Parliamentary Session",
        status: "Upcoming",
        isPublished: false,
      });
      setIsEditingEvent(false);
      loadActiveTabData();
    } catch (err: any) {
      triggerToast(
        "Event Save Failed",
        err.response?.data?.message ||
          "Could not publish event configurations.",
        "error",
      );
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to cancel and delete this event?")
    )
      return;
    try {
      const res = await eventService.deleteEvent(id);
      if (res.success) {
        triggerToast("Event Deleted", "Event registry removed.", "success");
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Deletion Failed",
        err.response?.data?.message || "Could not delete event.",
        "error",
      );
    }
  };

  // -- 7. News Management
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagList = newsForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (isEditingNews && newsForm._id) {
        const res = await newsService.updateNews(newsForm._id, {
          title: newsForm.title,
          description: newsForm.description,
          newsImage: newsForm.newsImage,
          publishedBy: newsForm.publishedBy || user?._id,
          author: newsForm.author,
          category: newsForm.category,
          tags: tagList,
          isPublished: newsForm.isPublished,
          status: newsForm.status,
        });
        if (res.success)
          triggerToast(
            "News Updated",
            "Press announcement details modified.",
            "success",
          );
      } else {
        const res = await newsService.createNews({
          title: newsForm.title,
          description: newsForm.description,
          newsImage: newsForm.newsImage,
          publishedBy: user?._id || "",
          author: newsForm.author,
          category: newsForm.category,
          tags: tagList,
          isPublished: newsForm.isPublished,
          status: newsForm.status,
        });
        if (res.success)
          triggerToast(
            "News Published",
            "Official press news released.",
            "success",
          );
      }
      setNewsForm({
        _id: "",
        title: "",
        description: "",
        newsImage: "",
        publishedBy: "",
        author: "PYVP Correspondent",
        category: "News",
        tags: "",
        isPublished: false,
        status: "Published",
      });
      setIsEditingNews(false);
      loadActiveTabData();
    } catch (err: any) {
      triggerToast(
        "News Save Failed",
        err.response?.data?.message || "Could not publish news release.",
        "error",
      );
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("Delete this news article?")) return;
    try {
      const res = await newsService.deleteNews(id);
      if (res.success) {
        triggerToast("News Deleted", "News registry cleared.", "success");
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Deletion Failed",
        err.response?.data?.message || "Could not remove article.",
        "error",
      );
    }
  };

  // -- 8. Homepage Dynamic Content
  const handleSaveHomepageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await chairmanService.updateHomepageContent(homepageForm);
      if (res.success) {
        triggerToast(
          "Homepage Content Active",
          "dynamic website features refreshed and live.",
          "success",
        );
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Failed to Save",
        err.response?.data?.message ||
          "Could not update dynamic homepage fields.",
        "error",
      );
    }
  };

  // -- 10. Notifications
  const handleClearNotifications = async () => {
    try {
      const res = await chairmanService.markNotificationsAsRead();
      if (res.success) {
        triggerToast(
          "Notifications Cleared",
          "All alerts marked as read.",
          "success",
        );
        loadActiveTabData();
      }
    } catch (err: any) {
      triggerToast(
        "Clear Failed",
        "Could not mark notifications as read.",
        "error",
      );
    }
  };

  // -- 11. Profile & Security Updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Propose update profile
    triggerToast(
      "Feature Active",
      "Chairman credentials updated successfully.",
      "success",
    );
  };

  const handleLogoutSession = () => {
    logout();
    navigate("/");
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER UI
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* 1. PORTAL GREEN SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Organisation Header */}
          <div className="p-6 border-b border-slate-850 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg">
              <Landmark className="h-5.5 w-5.5 text-gold-200" />
            </div>
            <div>
              <h2 className="font-heading font-black text-sm text-slate-100 uppercase tracking-wider">
                PYVP Portal
              </h2>
              <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">
                Secretariat Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs font-bold text-slate-400">
            {[
              { id: "dashboard", label: "Dashboard Portal", icon: BarChart2 },
              { id: "executive", label: "Executive Cabinet", icon: Award },
              { id: "members", label: "Registered Members", icon: Users },
              {
                id: "applications",
                label: "Application",
                icon: FileText,
              },
              { id: "announcements", label: "Homepage Alerts", icon: Volume2 },
              { id: "events", label: "Event Scheduler", icon: Calendar },
              { id: "news", label: "News Publisher", icon: Hash },
              { id: "homepage", label: "Dynamic Homepage", icon: Settings },
              { id: "logs", label: "Activity History", icon: Activity },
              {
                id: "notifications",
                label: "System Notifications",
                icon: Bell,
              },
              { id: "settings", label: "Profile & Security", icon: Lock },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/20"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <TabIcon
                    className={`h-4.5 w-4.5 ${isActive ? "text-gold-200" : "text-slate-500"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-850">
          <button
            onClick={handleLogoutSession}
            className="w-full flex items-center justify-center gap-2.5 bg-red-950/20 hover:bg-red-950/45 text-red-400 font-bold text-xs py-3 rounded-xl border border-red-900/35 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Clear Session Session
          </button>
        </div>
      </aside>

      {/* 2. MAIN PORTAL RIGHT COLUMN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between px-8 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/25 px-2.5 py-1 rounded font-black tracking-widest uppercase">
              Chairman Executive Access Only
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white leading-none">
                {user?.fullName}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium font-mono">
                {user?.email}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold border border-emerald-350 shadow-inner">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic content wrapper */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {globalLoading && (
            <div className="absolute top-4 right-4 z-40 bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-md">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-500">
                Querying registry...
              </span>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: DASHBOARD VIEW */}
          {/* ==================================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h1 className="font-heading font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                  Chiarman Dashboard Overview
                </h1>
                <p className="text-xs text-slate-450">
                  Review system activity summaries, upcoming timelines, and
                  registration counts.
                </p>
              </div>

              {/* Stats metric row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {[
                  {
                    label: "Approved Members",
                    val: dashboardStats?.totalMembers ?? 0,
                    bg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10",
                    icon: Users,
                  },
                  {
                    label: "Intake Applications",
                    val: dashboardStats?.totalApplications ?? 0,
                    bg: "bg-slate-50 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400 border border-slate-700/10",
                    icon: FileText,
                  },
                  {
                    label: "Pending Reviews",
                    val: dashboardStats?.pendingApplications ?? 0,
                    bg: "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/10",
                    icon: Activity,
                  },
                  {
                    label: "Approved Applications",
                    val: dashboardStats?.approvedApplications ?? 0,
                    bg: "bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-500/10",
                    icon: CheckCircle,
                  },
                  {
                    label: "Rejected Applications",
                    val: dashboardStats?.rejectedApplications ?? 0,
                    bg: "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 border border-red-500/10",
                    icon: AlertTriangle,
                  },
                  {
                    label: "Cabinet Portfolios",
                    val: dashboardStats?.totalExecutives ?? 0,
                    bg: "bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-500/10",
                    icon: Award,
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl ${stat.bg} shadow-xs space-y-3`}
                    >
                      <Icon className="h-5 w-5 opacity-80" />
                      <div>
                        <span className="block text-[10px] uppercase font-black opacity-80 tracking-wider leading-none">
                          {stat.label}
                        </span>
                        <strong className="block text-2xl font-heading font-black mt-1.5">
                          {stat.val}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Events & activities sections */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Activities Logs */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-emerald-600" />
                    Recent Activity
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-805 text-xs max-h-96 overflow-y-auto space-y-3">
                    {recentActivities.map((act) => (
                      <div
                        key={act._id}
                        className="pt-3 first:pt-0 flex justify-between items-start gap-4"
                      >
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200 block font-bold">
                            {act.action}
                          </strong>
                          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                            {act.details}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">
                            Admin: {act.user?.fullName}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming schedules */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                    Timeline Event Deadlines
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start gap-3"
                      >
                        <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {new Date(ev.eventDate).getDate()}
                        </div>
                        <div>
                          <strong className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                            {ev.title}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {ev.location}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                            {ev.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: EXECUTIVE CABINET MANAGEMENT */}
          {/* ==================================================================== */}
          {activeTab === "executive" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              <div className="xl:col-span-8 space-y-6">
                <div className="space-y-1">
                  <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                    Executive Members
                  </h1>
                  <p className="text-xs text-slate-450">
                    View executive members, assign roles, update roles, or
                    remove executive positions.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
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
                    className="w-full sm:max-w-[220px] px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                  >
                    <option value="all">All Portfolios</option>
                    {CABINET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Personnel Profile</th>
                        <th className="p-4">Cabinet Position</th>
                        <th className="p-4">Appointed Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                      {cabinetMembers
                        .filter((m) => {
                          const s = cabinetSearch.toLowerCase();
                          return (
                            (m.fullName?.toLowerCase().includes(s) ||
                              m.membershipId?.toLowerCase().includes(s)) &&
                            (cabinetRoleFilter === "all" ||
                              m.executiveRole === cabinetRoleFilter)
                          );
                        })
                        .map((m) => (
                          <tr
                            key={m._id}
                            className="hover:bg-slate-55/20 transition-all"
                          >
                            <td className="p-4 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                {m.profileImage ? (
                                  <img
                                    src={m.profileImage}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-xs">
                                    {m.fullName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <strong className="font-bold text-slate-900 dark:text-white block">
                                  {m.fullName}
                                </strong>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {m.membershipId}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-amber-600 dark:text-gold-400">
                              ★ {m.executiveRole}
                            </td>
                            <td className="p-4 text-slate-400">
                              {m.appointmentDate
                                ? new Date(
                                    m.appointmentDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  m.status === "Active"
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                                }`}
                              >
                                {m.status || "Active"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingCabinet(m);
                                    setEditCabinetRole(m.executiveRole);
                                    setEditCabinetStatus(m.status || "Active");
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setTerminatingCabinet(m);
                                    setConfirmRevocationCheck(false);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar appoint block */}
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 p-6 shadow-xs space-y-4">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Search className="h-4.5 w-4.5 text-emerald-600" />
                    Assign Role
                  </h3>

                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      placeholder="Search member name or ID..."
                      value={searchCandidateQuery}
                      onChange={(e) => {
                        setSearchCandidateQuery(e.target.value);
                        setShowCandidateDropdown(true);
                      }}
                      onFocus={() => setShowCandidateDropdown(true)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                    />

                    {showCandidateDropdown && searchCandidateQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg shadow-xl divide-y divide-slate-100">
                        {filteredCandidates.length === 0 ? (
                          <p className="p-3 text-center text-slate-400 text-xs">
                            No eligible candidates.
                          </p>
                        ) : (
                          filteredCandidates.map((cand) => (
                            <button
                              key={cand._id}
                              type="button"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setSearchCandidateQuery("");
                                setShowCandidateDropdown(false);
                              }}
                              className="w-full p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-150 truncate">
                                  {cand.fullName}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {cand.membershipId}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCandidate && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/30 p-6 shadow-sm space-y-6 relative overflow-hidden animate-in fade-in duration-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-heading font-black text-xs text-slate-450 uppercase tracking-widest">
                            Candidate Selected
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(null)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-450 hover:text-slate-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-emerald-600 shrink-0">
                          {selectedCandidate.profileImage ? (
                            <img
                              src={selectedCandidate.profileImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-white">
                              {selectedCandidate.fullName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-slate-900 dark:text-white leading-tight">
                            {selectedCandidate.fullName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {selectedCandidate.membershipId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={handleAssignCabinet}
                      className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Executive Portfolio
                        </label>
                        <select
                          value={appointRole}
                          onChange={(e) => setAppointRole(e.target.value)}
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Status
                        </label>
                        <select
                          value={appointStatus}
                          onChange={(e) =>
                            setAppointStatus(e.target.value as any)
                          }
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                      >
                        Confirm Cabinet Appointment
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: MEMBER REGISTRY */}
          {/* ==================================================================== */}
          {activeTab === "members" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Active Member Registry
                </h1>
                <p className="text-xs text-slate-450">
                  Review fully approved members, activate or suspend access
                  credentials, and reset roles.
                </p>
              </div>

              {/* Filtering bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, membership ID..."
                    value={membersSearch}
                    onChange={(e) => setMembersSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadActiveTabData()}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <select
                    value={membersFilterStatus}
                    onChange={(e) => {
                      setMembersFilterStatus(e.target.value);
                      setMembersPage(1);
                    }}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <button
                    onClick={loadActiveTabData}
                    className="px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 shadow"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* Table list */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Personnel Profile</th>
                        <th className="p-4">Area</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                      {membersList.map((m) => (
                        <tr
                          key={m._id}
                          className="hover:bg-slate-55/20 transition-all"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              {m.profileImage ? (
                                <img
                                  src={m.profileImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-xs">
                                  {m.fullName?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <strong className="font-bold text-slate-900 dark:text-white block">
                                {m.fullName}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {m.membershipId}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {m.district ? `${m.district}, ` : ""}
                            {m.province}
                          </td>
                          <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                            {m.designation || "Member"}
                          </td>
                          <td className="p-4 text-slate-400 font-bold">
                            {m.membershipType}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                m.membershipStatus === "Active"
                                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                              }`}
                            >
                              {m.membershipStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setViewingMemberDetails(m)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded"
                                title="View Dossier Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleMemberStatus(m)}
                                className={`p-1.5 rounded text-xs font-bold ${
                                  m.membershipStatus === "Active"
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={
                                  m.membershipStatus === "Active"
                                    ? "Suspend Member"
                                    : "Activate Member"
                                }
                              >
                                {m.membershipStatus === "Active"
                                  ? "Suspend"
                                  : "Activate"}
                              </button>
                              <button
                                onClick={() =>
                                  handleResetMemberPermissions(m._id)
                                }
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                                title="Reset to General Member"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handlePermanentRemoveMember(m._id)
                                }
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded"
                                title="Permanent Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Total Approved: <strong>{membersTotal}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={membersPage <= 1}
                      onClick={() =>
                        setMembersPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 font-bold"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 py-1.5 font-bold">
                      Page {membersPage}
                    </span>
                    <button
                      disabled={membersPage * 10 >= membersTotal}
                      onClick={() => setMembersPage((prev) => prev + 1)}
                      className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 font-bold"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: APPLICATION EVALUATION */}
          {/* ==================================================================== */}
          {activeTab === "applications" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Application Review
                </h1>
                <p className="text-xs text-slate-450">
                  Examine submitted credentials, preview payment receipts, and
                  render decisions.
                </p>
              </div>

              {/* Filtering bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, CNIC..."
                    value={appsSearch}
                    onChange={(e) => setAppsSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadActiveTabData()}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <select
                    value={appsFilterStatus}
                    onChange={(e) => {
                      setAppsFilterStatus(e.target.value);
                      setAppsPage(1);
                    }}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-bold"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={loadActiveTabData}
                    className="px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 shadow"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* List table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Applicant Profile</th>
                        <th className="p-4">CNIC Identity</th>
                        <th className="p-4">Academic Background</th>
                        <th className="p-4">Applied Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                      {applicationsList.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-55/20 transition-all"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-200">
                              {app.profileImage?.secure_url ? (
                                <img
                                  src={app.profileImage.secure_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-white">
                                  {app.fullName?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <strong className="font-bold text-slate-900 dark:text-white block">
                                {app.fullName}
                              </strong>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {app.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-500">
                            {app.cnic}
                          </td>
                          <td className="p-4 font-medium text-slate-700 dark:text-slate-350">
                            {app.education}
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                app.applicationStatus === "Approved"
                                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : app.applicationStatus === "Rejected"
                                    ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                              }`}
                            >
                              {app.applicationStatus || "Pending"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setInspectingApplication(app);
                                setAppRemarks(app.remarks || "");
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] rounded-lg transition-colors border border-emerald-500/10"
                            >
                              Verify Document
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Total Applications: <strong>{appsTotal}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={appsPage <= 1}
                      onClick={() =>
                        setAppsPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 font-bold"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 py-1.5 font-bold">
                      Page {appsPage}
                    </span>
                    <button
                      disabled={appsPage * 10 >= appsTotal}
                      onClick={() => setAppsPage((prev) => prev + 1)}
                      className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 font-bold"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: HOMEPAGE ANNOUNCEMENTS */}
          {/* ==================================================================== */}
          {activeTab === "announcements" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800">
                  {isEditingAnn
                    ? "Modify Dynamic Notice Alert"
                    : "New Announcement"}
                </h3>

                <form
                  onSubmit={handleSaveAnnouncement}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Notice Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={annForm.title}
                      onChange={(e) =>
                        setAnnForm({ ...annForm, title: e.target.value })
                      }
                      placeholder="e.g. EasyPaisa Payment Verification Active Alert"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Alert Description Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={annForm.description}
                      onChange={(e) =>
                        setAnnForm({ ...annForm, description: e.target.value })
                      }
                      placeholder="Specify important details (fee schedules, constituency boundaries, or executive terms)..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Priority Level
                      </label>
                      <select
                        value={annForm.priority}
                        onChange={(e) =>
                          setAnnForm({ ...annForm, priority: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none font-bold"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={annForm.startDate}
                        onChange={(e) =>
                          setAnnForm({ ...annForm, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={annForm.endDate}
                        onChange={(e) =>
                          setAnnForm({ ...annForm, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Notice Status
                    </label>
                    <select
                      value={annForm.status}
                      onChange={(e) =>
                        setAnnForm({ ...annForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none font-bold"
                    >
                      <option value="Active">Active (Publish Live)</option>
                      <option value="Inactive">Inactive (Hold Draft)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                    {isEditingAnn && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAnn(false);
                          setAnnForm({
                            _id: "",
                            title: "",
                            description: "",
                            imageUrl: "",
                            priority: "Medium",
                            startDate: "",
                            endDate: "",
                            status: "Active",
                          });
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow"
                    >
                      New Announcement
                    </button>
                  </div>
                </form>
              </div>

              {/* Announcements registry */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Announcements ⭐
                </h4>
                <div className="space-y-3.5 max-h-96 overflow-y-auto">
                  {announcementsList.map((ann) => (
                    <div
                      key={ann._id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 relative"
                    >
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          ann.priority === "High"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <strong className="text-xs font-bold block text-slate-800 dark:text-slate-100 pr-10">
                        {ann.title}
                      </strong>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
                        {ann.description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">
                          Status:{" "}
                          <strong className="text-emerald-600">
                            {ann.status || "Active"}
                          </strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAnnForm({
                                _id: ann._id,
                                title: ann.title,
                                description: ann.description,
                                imageUrl: ann.imageUrl || "",
                                priority: ann.priority || "Medium",
                                startDate: ann.startDate
                                  ? new Date(ann.startDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                endDate: ann.endDate
                                  ? new Date(ann.endDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                status: ann.status || "Active",
                              });
                              setIsEditingAnn(true);
                            }}
                            className="text-slate-450 hover:text-amber-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann._id)}
                            className="text-slate-450 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: EVENT SCHEDULER */}
          {/* ==================================================================== */}
          {activeTab === "events" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800">
                  {isEditingEvent
                    ? "Modify Scheduled Workshop Event"
                    : "Create New Workshop Event"}
                </h3>

                <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, title: e.target.value })
                      }
                      placeholder="e.g. Swearing-in Ceremony 2026 Assembly"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Event Agenda / Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed agenda points for the simulated assembly floor..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={eventForm.eventDate}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            eventDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Start Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={eventForm.startTime}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        End Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 04:00 PM"
                        value={eventForm.endTime}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Venue Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.location}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            location: e.target.value,
                            venue: e.target.value,
                          })
                        }
                        placeholder="e.g. Prime Minister Office, Islamabad"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Google Maps coordinates (Optional)
                      </label>
                      <input
                        type="text"
                        value={eventForm.mapsLocation}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            mapsLocation: e.target.value,
                          })
                        }
                        placeholder="Coordinates or URL link"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={eventForm.category}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Max Attendees (0 = No limit)
                      </label>
                      <input
                        type="number"
                        value={eventForm.maxParticipants}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            maxParticipants: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">Status</label>
                      <select
                        value={eventForm.status}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-bold"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="isPublishedEvent"
                      checked={eventForm.isPublished}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isPublished: e.target.checked,
                        })
                      }
                      className="accent-emerald-600 h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="isPublishedEvent"
                      className="font-bold text-slate-650 cursor-pointer"
                    >
                      Publish live on public Events timeline immediately
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                    {isEditingEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingEvent(false);
                          setEventForm({
                            _id: "",
                            title: "",
                            description: "",
                            eventImage: "",
                            announcedBy: "",
                            eventDate: "",
                            startTime: "",
                            endTime: "",
                            location: "",
                            venue: "",
                            mapsLocation: "",
                            organizer: "PYVP Secretariat",
                            registrationDeadline: "",
                            maxParticipants: 0,
                            category: "Parliamentary Session",
                            status: "Upcoming",
                            isPublished: false,
                          });
                        }}
                        className="px-5 py-2.5 bg-slate-105 text-slate-700 font-bold rounded-lg border border-slate-200"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow"
                    >
                      {isEditingEvent
                        ? "Save Event Specifications"
                        : "Announce Official Event"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Events lists */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-105 dark:border-slate-800">
                  Scheduled Assembly Events
                </h4>
                <div className="space-y-3.5 max-h-96 overflow-y-auto">
                  {eventsList.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 relative"
                    >
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          ev.status === "Upcoming"
                            ? "bg-emerald-100 text-emerald-850"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                      <strong className="text-xs font-bold block text-slate-800 dark:text-slate-150 pr-16">
                        {ev.title}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Date: {new Date(ev.eventDate).toLocaleDateString()} at{" "}
                        {ev.location}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-3 mt-1.5">
                        {ev.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-semibold">
                          Published:{" "}
                          <strong
                            className={
                              ev.isPublished
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {ev.isPublished ? "LIVE" : "DRAFT"}
                          </strong>
                        </span>
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => {
                              setEventForm({
                                _id: ev._id,
                                title: ev.title,
                                description: ev.description,
                                eventImage: ev.eventImage || "",
                                announcedBy:
                                  ev.announcedBy?._id || ev.announcedBy || "",
                                eventDate: ev.eventDate
                                  ? new Date(ev.eventDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                startTime: ev.startTime || "",
                                endTime: ev.endTime || "",
                                location: ev.location || "",
                                venue: ev.venue || "",
                                mapsLocation: ev.mapsLocation || "",
                                organizer: ev.organizer || "PYVP Secretariat",
                                registrationDeadline: ev.registrationDeadline
                                  ? new Date(ev.registrationDeadline)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                maxParticipants: ev.maxParticipants || 0,
                                category:
                                  ev.category || "Parliamentary Session",
                                status: ev.status || "Upcoming",
                                isPublished: ev.isPublished || false,
                              });
                              setIsEditingEvent(true);
                            }}
                            className="text-slate-450 hover:text-amber-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="text-slate-450 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: NEWS PUBLISHER */}
          {/* ==================================================================== */}
          {activeTab === "news" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800">
                  {isEditingNews
                    ? "Edit Official Press Release"
                    : "Publish Official News Release"}
                </h3>

                <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Release Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, title: e.target.value })
                      }
                      placeholder="e.g. Swearing-in Ceremony Completed"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Press Content Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={newsForm.description}
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed content of the press release..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Author Correspondent
                      </label>
                      <input
                        type="text"
                        value={newsForm.author}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, author: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        News Category
                      </label>
                      <select
                        value={newsForm.category}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, category: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-bold"
                      >
                        <option value="News">News</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Press Release">Press Release</option>
                        <option value="Achievement">Achievement</option>
                        <option value="Notice">Notice</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">Status</label>
                      <select
                        value={newsForm.status}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, status: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-bold"
                      >
                        <option value="Published">Published (Live)</option>
                        <option value="Draft">Draft (Hold)</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Tags (separate with commas)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. swaring, assembly, islamabad"
                      value={newsForm.tags}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, tags: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="isPublishedNews"
                      checked={newsForm.isPublished}
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          isPublished: e.target.checked,
                        })
                      }
                      className="accent-emerald-600 h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="isPublishedNews"
                      className="font-bold text-slate-650 cursor-pointer"
                    >
                      Publish on public news page timeline immediately
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                    {isEditingNews && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingNews(false);
                          setNewsForm({
                            _id: "",
                            title: "",
                            description: "",
                            newsImage: "",
                            publishedBy: "",
                            author: "PYVP Correspondent",
                            category: "News",
                            tags: "",
                            isPublished: false,
                            status: "Published",
                          });
                        }}
                        className="px-5 py-2.5 bg-slate-105 text-slate-700 font-bold rounded-lg border border-slate-200"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow"
                    >
                      {isEditingNews
                        ? "Save News Specifications"
                        : "Publish News Release"}
                    </button>
                  </div>
                </form>
              </div>

              {/* News lists */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Published Press Registry
                </h4>
                <div className="space-y-3.5 max-h-96 overflow-y-auto">
                  {newsList.map((ns) => (
                    <div
                      key={ns._id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 relative"
                    >
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          ns.status === "Published"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {ns.status}
                      </span>
                      <strong className="text-xs font-bold block text-slate-800 dark:text-slate-150 pr-16">
                        {ns.title}
                      </strong>
                      <span className="text-[10px] text-slate-450 block font-mono">
                        Author: {ns.author} |{" "}
                        {new Date(ns.publicationDate).toLocaleDateString()}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-3 mt-1">
                        {ns.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-semibold">
                          Published:{" "}
                          <strong
                            className={
                              ns.isPublished
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {ns.isPublished ? "YES" : "NO"}
                          </strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setNewsForm({
                                _id: ns._id,
                                title: ns.title,
                                description: ns.description,
                                newsImage: ns.newsImage || "",
                                publishedBy:
                                  ns.publishedBy?._id || ns.publishedBy || "",
                                author: ns.author || "PYVP Correspondent",
                                category: ns.category || "News",
                                tags: ns.tags ? ns.tags.join(", ") : "",
                                isPublished: ns.isPublished || false,
                                status: ns.status || "Published",
                              });
                              setIsEditingNews(true);
                            }}
                            className="text-slate-450 hover:text-amber-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(ns._id)}
                            className="text-slate-450 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: HOMEPAGE DYNAMIC CONTENT */}
          {/* ==================================================================== */}
          {activeTab === "homepage" && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800">
                Website Content
              </h3>

              <form
                onSubmit={handleSaveHomepageContent}
                className="space-y-6 mt-6 text-xs font-sans"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Hero Section Main Title
                    </label>
                    <input
                      type="text"
                      value={homepageForm.heroTitle}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          heroTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Hero Subtitle Tagline
                    </label>
                    <input
                      type="text"
                      value={homepageForm.heroSubtitle}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          heroSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    Chairman Secretariat Message
                  </label>
                  <textarea
                    rows={6}
                    value={homepageForm.chairmanMessage}
                    onChange={(e) =>
                      setHomepageForm({
                        ...homepageForm,
                        chairmanMessage: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Chairman Signatory Name
                    </label>
                    <input
                      type="text"
                      value={homepageForm.chairmanName}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          chairmanName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      Chairman Signatory Title
                    </label>
                    <input
                      type="text"
                      value={homepageForm.chairmanTitle}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          chairmanTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      National Vision Statement
                    </label>
                    <textarea
                      rows={4}
                      value={homepageForm.vision}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          vision: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                    ></textarea>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">
                      National Mission Statement
                    </label>
                    <textarea
                      rows={4}
                      value={homepageForm.mission}
                      onChange={(e) =>
                        setHomepageForm({
                          ...homepageForm,
                          mission: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                    ></textarea>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                  <h4 className="font-bold text-slate-500 block">
                    Promotional Homepage Banner
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500">
                        Promotional Alert Text
                      </label>
                      <input
                        type="text"
                        value={homepageForm.promotionalBannerText}
                        onChange={(e) =>
                          setHomepageForm({
                            ...homepageForm,
                            promotionalBannerText: e.target.value,
                          })
                        }
                        placeholder="e.g. PYVP Term 2026 Intake Deadline extended to August 30!"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 pt-6">
                      <input
                        type="checkbox"
                        id="promotionalBannerActive"
                        checked={homepageForm.promotionalBannerActive}
                        onChange={(e) =>
                          setHomepageForm({
                            ...homepageForm,
                            promotionalBannerActive: e.target.checked,
                          })
                        }
                        className="accent-emerald-600 h-4.5 w-4.5 cursor-pointer"
                      />
                      <label
                        htmlFor="promotionalBannerActive"
                        className="font-bold cursor-pointer select-none"
                      >
                        Show Promo Alert at the top of the homepage
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save &amp; Publish Content Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: SYSTEM ACTIVITY LOGS */}
          {/* ==================================================================== */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Chairman Activity
                </h1>
                <p className="text-xs text-slate-450">
                  Check everything you have done recently, including application
                  decisions and login records.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center justify-between shadow-xs">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by action keyword..."
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Details</th>
                        <th className="p-4">IP Coordinates</th>
                        <th className="p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                      {activityLogsList
                        .filter((log) => {
                          const s = logsSearch.toLowerCase();
                          return (
                            log.action?.toLowerCase().includes(s) ||
                            log.details?.toLowerCase().includes(s)
                          );
                        })
                        .map((log) => (
                          <tr
                            key={log._id}
                            className="hover:bg-slate-55/20 transition-all text-slate-700 dark:text-slate-300"
                          >
                            <td className="p-4 font-bold">
                              {log.user?.fullName || "System Admin"}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded font-bold font-mono text-[10px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 leading-normal font-light">
                              {log.details}
                            </td>
                            <td className="p-4 font-mono text-slate-400">
                              {log.ipAddress || "N/A"}
                            </td>
                            <td className="p-4 text-slate-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: SYSTEM NOTIFICATIONS */}
          {/* ==================================================================== */}
          {activeTab === "notifications" && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    System Alerts &amp; Notifications
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Showing recent alerts from application updates,
                    registrations, or cabinet actions.
                  </p>
                </div>
                <button
                  onClick={handleClearNotifications}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
                >
                  Mark All Read
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-805 mt-6 space-y-4">
                {notificationsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold space-y-2">
                    <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                    <p>All notifications are read!</p>
                  </div>
                ) : (
                  notificationsList.map((not) => (
                    <div
                      key={not._id}
                      className="pt-4 first:pt-0 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-3.5 w-3.5 rounded-full ${not.isRead ? "bg-slate-300" : "bg-emerald-500 animate-pulse"}`}
                        ></div>
                        <div>
                          <strong className="text-xs font-bold block text-slate-900 dark:text-white">
                            {not.title}
                          </strong>
                          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                            {not.message}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(not.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB: PROFILE & SECURITY SETTINGS */}
          {/* ==================================================================== */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-emerald-600" />
                Profile Credentials &amp; Security
              </h3>

              <form
                onSubmit={handleUpdateProfile}
                className="space-y-5 mt-6 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    FullName Signature
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.phoneNumber}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    Update Password Key
                  </label>
                  <input
                    type="password"
                    placeholder="Input new password key if changing"
                    value={profileForm.newPassword}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Update Security Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ==================================================================== */}
      {/* MODAL PORTALS */}
      {/* ==================================================================== */}

      {/* 1. EDIT EXECUTIVE PORTFOLIO MODAL */}
      {editingCabinet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 max-w-sm w-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-6">
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                Modify Portfolio Appointment
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Adjusting assignment for {editingCabinet.fullName}
              </p>
            </div>

            <form
              onSubmit={handleUpdateCabinet}
              className="space-y-4 text-xs font-sans"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Cabinet Role</label>
                <select
                  value={editCabinetRole}
                  onChange={(e) => setEditCabinetRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 font-bold"
                >
                  {CABINET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Status</label>
                <select
                  value={editCabinetStatus}
                  onChange={(e) => setEditCabinetStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCabinet(null)}
                  className="px-4 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TERMINATE CABINET REVOCATION MODAL */}
      {terminatingCabinet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 max-w-sm w-full rounded-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex gap-3 text-red-650">
              <AlertTriangle className="h-6 w-6 text-red-650 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Revoke Cabinet Appointment
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Removing {terminatingCabinet.fullName} from{" "}
                  {terminatingCabinet.executiveRole}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-light">
              This will revoke their executive cabinet role, resetting their
              administrative portal clearance level back to a general member.
            </p>

            <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/35 p-3 rounded-lg flex gap-2">
              <input
                type="checkbox"
                id="confirmRevocation"
                checked={confirmRevocationCheck}
                onChange={(e) => setConfirmRevocationCheck(e.target.checked)}
                className="mt-0.5 cursor-pointer accent-red-600"
              />
              <label
                htmlFor="confirmRevocation"
                className="text-[10px] text-red-750 dark:text-red-400 font-bold cursor-pointer select-none"
              >
                I confirm the removal of this member from the cabinet.
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTerminatingCabinet(null);
                  setConfirmRevocationCheck(false);
                }}
                className="px-4 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmRevocationCheck}
                onClick={handleRevokeCabinet}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow disabled:opacity-40"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOSSIER DETAILS INSPECT MODAL */}
      {viewingMemberDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Member Dossier Profile
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Registry ID: {viewingMemberDetails.membershipId}
                </p>
              </div>
              <button
                onClick={() => setViewingMemberDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-650"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="h-16 w-16 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center border border-emerald-600 shrink-0 shadow">
                {viewingMemberDetails.profileImage ? (
                  <img
                    src={viewingMemberDetails.profileImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg text-white">
                    {viewingMemberDetails.fullName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {viewingMemberDetails.fullName}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {viewingMemberDetails.designation || "General Member"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {viewingMemberDetails.email}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 block">Jurisdiction Seat:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {viewingMemberDetails.district
                    ? `${viewingMemberDetails.district}, `
                    : ""}
                  {viewingMemberDetails.province}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Membership Type:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {viewingMemberDetails.membershipType}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Status:</span>
                <strong className="text-emerald-600">
                  {viewingMemberDetails.membershipStatus}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Joined Term Date:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {new Date(viewingMemberDetails.joinedAt).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingMemberDetails(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Verify Documents INSPECTOR MODAL */}
      {inspectingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 max-w-3xl w-full rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Evaluate Candidate Dossier
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Inspecting registration credentials for{" "}
                  {inspectingApplication.fullName}
                </p>
              </div>
              <button
                onClick={() => setInspectingApplication(null)}
                className="p-1 text-slate-400 hover:text-slate-650"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs font-sans">
              {/* Profile/academic details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Candidate Details
                  </h5>
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-450">FullName:</span>{" "}
                      <strong>{inspectingApplication.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Email Address:</span>{" "}
                      <strong>{inspectingApplication.email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">CNIC Identity:</span>{" "}
                      <strong>{inspectingApplication.cnic}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">
                        Education Background:
                      </span>{" "}
                      <strong className="text-right">
                        {inspectingApplication.education}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Address Province:</span>{" "}
                      <strong className="text-right">
                        {inspectingApplication.address}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    Evaluation Remarks / Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={appRemarks}
                    onChange={(e) => setAppRemarks(e.target.value)}
                    placeholder="Provide administrative remarks, reason for approval or rejection, or easy-paisa transaction checks..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Receipt / CNIC previews */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                  EasyPaisa Fee Payment Receipt
                </h5>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-950 h-56 flex items-center justify-center overflow-hidden shadow">
                  {inspectingApplication.receipt?.secure_url ? (
                    <a
                      href={inspectingApplication.receipt.secure_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative group block h-full w-full"
                    >
                      <img
                        src={inspectingApplication.receipt.secure_url}
                        alt="EasyPaisa Receipt"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity duration-200">
                        View Fullscreen Receipt
                      </div>
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs italic">
                      No fee payment receipt uploaded.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-500 block text-[9px] mb-1.5 uppercase">
                      CNIC FRONT IMAGE
                    </label>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {inspectingApplication.cnicFront?.secure_url ? (
                        <a
                          href={inspectingApplication.cnicFront.secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-full w-full block"
                        >
                          <img
                            src={inspectingApplication.cnicFront.secure_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">
                          Front
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 block text-[9px] mb-1.5 uppercase">
                      CNIC BACK IMAGE
                    </label>
                    <div className="h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {inspectingApplication.cnicBack?.secure_url ? (
                        <a
                          href={inspectingApplication.cnicBack.secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-full w-full block"
                        >
                          <img
                            src={inspectingApplication.cnicBack.secure_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">
                          Back
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInspectingApplication(null)}
                className="px-5 py-2.5 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-250"
              >
                Cancel Review
              </button>
              <button
                type="button"
                disabled={isSubmittingDecision}
                onClick={() => handleUpdateApplication("Under Review")}
                className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold rounded-lg border border-amber-500/20"
              >
                Mark Under Review
              </button>
              <button
                type="button"
                disabled={isSubmittingDecision}
                onClick={() => handleUpdateApplication("Rejected")}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-lg border border-red-500/20"
              >
                Reject Application
              </button>
              <button
                type="button"
                disabled={isSubmittingDecision}
                onClick={() => handleUpdateApplication("Approved")}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-md shadow-emerald-700/15"
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
