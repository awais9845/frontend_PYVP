import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import {
  Users,
  Award,
  Calendar,
  Landmark,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Quote,
  Volume2,
  ShieldCheck,
  MapPin,
  Building,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { getPublishedNews } from "../services/newsApi";
import { getPublicEvents } from "../services/eventApi";
import { getAnnouncement } from "../services/chairmanApi";
import { News, Event } from "../types";

export default function Home() {
  const { stats, fetchStats, logout } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [announcement, setAnnouncement] = useState<any | null>(null);

  useEffect(() => {
    fetchStats();
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const [newsData, eventsData, annData] = await Promise.all([
        getPublishedNews(),
        getPublicEvents(),
        getAnnouncement(),
      ]);
      if (newsData?.news) {
        setNews(newsData.news);
      }
      if (eventsData?.events) {
        setEvents(eventsData.events);
      }
      if (annData?.success && annData?.announcement) {
        setAnnouncement(annData.announcement);
      }
    } catch (e) {
      console.error("Error fetching homepage records:", e);
    } finally {
      setLoadingNews(false);
    }
  };

  // Get active upcoming events (case-insensitive status check to match "Upcoming" or "upcoming")
  const upcomingEvents = events
    .filter((e: Event) => e.status?.toLowerCase() === "upcoming")
    .slice(0, 2);

  // Stats placeholders in case server returns empty
  const totalRegs = stats?.totalApplicants || 3820;
  const approvedMembers = stats?.approvedMembers || 480;
  const provincesRep = Object.keys(stats?.provincesStats || {}).length || 7;
  const sessionsCount = 4;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* 1. ANNOUNCEMENT TICKER */}
      <div className="bg-emerald-900 text-white overflow-hidden py-2 border-b border-emerald-800 text-xs font-semibold select-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <span className="bg-gold-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Volume2 className="h-3 w-3 animate-bounce" /> Announcement
          </span>
          <div className="w-full overflow-hidden relative">
            <div className="whitespace-nowrap inline-block animate-marquee announcement-ticker hover:[animation-play-state:paused] cursor-pointer">
              {announcement ? (
                <span className="mx-8 text-slate-100 hover:text-gold-300">
                  📢 {announcement.title}: {announcement.description} •
                </span>
              ) : news.length > 0 ? (
                news.map((item, idx) => (
                  <span
                    key={item._id}
                    className="mx-8 text-slate-100 hover:text-gold-300"
                  >
                    📢 {item.title} (
                    {new Date(item.publicationDate).toLocaleDateString()}) •
                  </span>
                ))
              ) : (
                <span className="mx-8">
                  📢 PYVP Intake 2026 Public Membership Registration is now
                  actively open online. Candidates must upload genuine EasyPaisa
                  fee receipt. •
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Bento Card 1: Main Hero & Brand Statement (8 cols on desktop) */}
          <div className="lg:col-span-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-8 lg:p-10 relative overflow-hidden shadow-xl border border-emerald-800/40 flex flex-col justify-between group min-h-[420px] transition-all hover:shadow-2xl">
            {/* Background glowing gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.15),transparent_50%)]"></div>
            <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl group-hover:bg-gold-600/15 transition-all duration-500"></div>

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                <Landmark className="h-4 w-4 text-gold-500 animate-pulse" />
                Empowering Pakistan's Youth Since 2026
              </div>

              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                Building the Future Leaders of{" "}
                <span className="text-gold-500 text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-emerald-400">
                  Pakistan
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-2xl">
                Welcome to the official portal of the **Pakistan Youth Vision
                Parliament**. A modern platform designed to educate, train, and
                engage young citizens in model legislation, statecraft,
                constitutional debates, and administrative strategy.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3.5 pt-8">
              <Link
                to="/register"
                onClick={() => logout()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-700/25 flex items-center gap-2 group text-xs"
              >
                Apply Online (Intake 2026)
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 border border-emerald-800 hover:border-emerald-600 text-slate-200 font-bold rounded-xl transition-all text-xs"
              >
                Learn About Goal
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Quick Credentials Registry Search (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/40">
                  Sovereign Ledger
                </span>
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Quick Credentials Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Verify a certified Member ID instantly or access our secure QR
                  matrix scanner.
                </p>
              </div>

              {/* Form Input directly on Home Screen */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (homeSearchQuery.trim()) {
                    navigate(
                      `/verify?id=${encodeURIComponent(homeSearchQuery.trim())}`,
                    );
                  }
                }}
                className="space-y-2 pt-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                    placeholder="Enter ID (e.g. PYVP-2025-0002)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 outline-none text-xs font-mono"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Query Ledger <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Suggestions buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-2 items-center">
              <span>Try Demo ID:</span>
              <button
                onClick={() => setHomeSearchQuery("PYVP-2025-0002")}
                className="font-mono bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850 hover:border-indigo-600 hover:text-indigo-700 text-[10px] cursor-pointer"
              >
                PYVP-2025-0002
              </button>
            </div>
          </div>

          {/* Bento Card 3: Circular Progress Stat Card (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  National Seats Status
                </span>
                <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-1 mt-4">
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Parliament Seats Occupied
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  District representation is allotted dynamically based on
                  academic and advisory merit lists.
                </p>
              </div>
            </div>

            {/* Beautiful SVG Progress Gauge */}
            <div className="flex items-center gap-6 my-4">
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg
                  className="absolute transform -rotate-90"
                  width="80"
                  height="80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={
                      2 * Math.PI * 34 * (1 - approvedMembers / 500)
                    }
                    className="text-emerald-600 dark:text-emerald-400 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {Math.min(100, Math.round((approvedMembers / 500) * 100))}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
                  <span>
                    <strong>{approvedMembers}</strong> Approved Members
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <span>
                    <strong>500</strong> Allocated Districts
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Total Applicants: {totalRegs}</span>
              <span>Provinces Rep: {provincesRep}</span>
            </div>
          </div>

          {/* Bento Card 4: Chairman Syed Hammad Hassan message (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.04]">
              <Quote className="h-32 w-32 text-emerald-950 dark:text-white" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 w-fit">
                <Building className="h-3.5 w-3.5" />
                Chairman Secretariat
              </div>

              <p className="font-serif italic text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                "Our core mission is to establish transparency in youth
                governance and prepare candidates for real-time legislative
                challenges in Pakistan. Our digital ID cards and custom portals
                represent our commitment to technological inclusion for the next
                generation of civil diplomats."
              </p>
            </div>

            <div className="flex items-center gap-3.5 pt-6 border-t border-slate-100 dark:border-slate-800 mt-4 relative z-10">
              <div className="h-10 w-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm border border-emerald-500 shadow-sm">
                HS
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-xs">
                  Huzaifa Shah
                </h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Chairman, PYVP
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 5: Youth PM Waqar Ahmad Khattak message (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.04]">
              <Quote className="h-32 w-32 text-emerald-950 dark:text-white" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 w-fit">
                <Landmark className="h-3.5 w-3.5" />
                Youth PM Cabinet
              </div>

              <p className="font-serif italic text-[11px] leading-relaxed text-gray-900">
                "We need to improve the traditional law-making process by using
                modern technology. As Youth PM, I am committed to creating
                digital platforms for public feedback and online training
                programs. PYVP welcomes young and active minds to help build a
                technology-driven Pakistan."
              </p>
            </div>

            <div className="flex items-center gap-3.5 pt-6 border-t border-slate-100 dark:border-slate-800 mt-4 relative z-10">
              <div className="h-10 w-10 rounded-full bg-gold-600 text-slate-950 flex items-center justify-center font-bold text-sm border border-gold-500 shadow-sm">
                WK
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-xs">
                  Waqar Ahmad Khattak
                </h4>
                <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold uppercase tracking-wider">
                  Youth Prime Minister
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 6: Legislative News & Bulletins (6 cols on desktop) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  Media Hub
                </span>
                <Link
                  to="/register"
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Join active term
                </Link>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  News & Legislative Announcements
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Click on any briefing document to read full federal
                  resolutions and circulars.
                </p>
              </div>

              {loadingNews ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse space-y-2"
                    >
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-450">
                    No federal news bulletins published yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {news.slice(0, 5).map((item) => {
                    const dateObj = new Date(item.publicationDate);
                    const month = dateObj
                      .toLocaleString("en-US", { month: "short" })
                      .toUpperCase();
                    const day = dateObj.getDate();
                    const summary =
                      item.description?.length > 80
                        ? `${item.description.slice(0, 80)}...`
                        : item.description;

                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedNews(item)}
                        className="p-4 border border-slate-100 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 rounded-2xl cursor-pointer group transition-all flex gap-4 items-center"
                      >
                        {/* Sub-date component */}
                        <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-900 shrink-0 text-center font-bold">
                          <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-mono">
                            {month}
                          </span>
                          <span className="text-sm text-slate-900 dark:text-white leading-none font-mono">
                            {day}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                            News: {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                            {summary}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Total reports: {news.length}</span>
              <span>PYVP Information Bureau</span>
            </div>
          </div>

          {/* Bento Card 7: Events Timetable / Calendar (6 cols on desktop) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  Upcoming Event
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  Term 2026
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Legislative Workshops & Events
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Check upcoming mock state assembly debate, policy draft, and
                  executive floor representation.
                </p>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-450">
                    No upcoming assembly events scheduled.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {upcomingEvents.map((evt) => {
                    const formattedDate = new Date(
                      evt.eventDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <div
                        key={evt._id}
                        className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Active Term
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gold-500" />{" "}
                              {formattedDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Event: {evt.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {evt.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                          <MapPin className="h-3 w-3 text-gold-500 shrink-0" />
                          <span className="max-w-[120px] truncate">
                            {evt.location}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>National Coordination Secretariat</span>
              <Link
                to="/register"
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Apply for Active Membership
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TIMELINE: STEPS TO JOIN PARLIAMENT */}
      <section className="bg-slate-100 dark:bg-slate-900 py-16 border-t border-slate-200 dark:border-slate-800 mt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
              Application Flow
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-slate-900 dark:text-white mt-3">
              Member Registration Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Follow our simple, secure five-step process to apply, verify, and
              receive your credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 items-stretch">
            {[
              {
                step: "01",
                title: "Fill Profile",
                desc: "Access the Online Application Form and fill your academic details, CNIC/B-Form number, preferred legislative province and assembly constituency.",
              },
              {
                step: "02",
                title: "Submit Fee",
                desc: "Submit the registration intake processing fee via EasyPaisa and save a screenshot receipt of the completed transaction.",
              },
              {
                step: "03",
                title: "Upload Receipt",
                desc: "Upload your transaction receipt screenshot and academic files/identification card directly onto your secure candidate dossier.",
              },
              {
                step: "04",
                title: "Admin Review",
                desc: "The PYVP Administration checks details and EasyPaisa transaction IDs. Upon successful checking, membership is approved.",
              },
              {
                step: "05",
                title: "Print Member ID",
                desc: "Log into your personal Member Dashboard to generate and print your official certified ID Card containing your secure QR verification key.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200 relative group"
              >
                <div className="space-y-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center font-bold text-xs">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-extrabold font-heading text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-900 mt-4 text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors uppercase font-bold tracking-widest font-mono">
                  Phase {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPANDED NEWS DIALOG */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex justify-between items-start">
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  {selectedNews.category}
                </span>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {new Date(selectedNews.publicationDate).toLocaleDateString()}
                </span>
                <h3 className="font-heading font-bold text-xl md:text-2xl text-slate-900 dark:text-white">
                  {selectedNews.title}
                </h3>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-line pr-2">
                {selectedNews.description}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// X Icon definition helper
function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
