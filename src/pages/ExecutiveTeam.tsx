import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Landmark, Mail, Users, MapPin, Award, Loader2 } from "lucide-react";
import { fetchMembers } from "../store/slices/membersSlice";
import { RootState, AppDispatch } from "../store";
import { getOptimizedCloudinaryUrl } from "../services/imageUtils";

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const MemberSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md animate-pulse">
    <div className="h-28 bg-slate-200 dark:bg-slate-700" />
    <div className="px-6 pb-6 pt-10 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
    </div>
  </div>
);

// Colour palette cycling for cards
const COLORS = [
  "from-emerald-800 to-emerald-950",
  "from-slate-800 to-slate-950",
  "from-amber-700 to-amber-950",
  "from-emerald-700 to-emerald-900",
  "from-slate-700 to-slate-900",
  "from-blue-800 to-blue-950",
];

export default function ExecutiveTeam() {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error } = useSelector((state: RootState) => state.members);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  // Filter to show only appointed executive officers and cabinet ministers
  const executiveMembers = members.filter(
    (member: any) => member.designation && member.designation !== "Member"
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">

      {/* ── Hero ── */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Supreme Council
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            The Executive Assembly &amp; Cabinet
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            Meet the primary organizers, legislative chairs, and youth cabinet ministers responsible for the PYVP session curriculum.
          </p>
        </div>
      </section>

      {/* ── Members Grid ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <MemberSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => dispatch(fetchMembers())}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && executiveMembers.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <Users className="h-16 w-16 text-slate-300 mx-auto animate-pulse" />
            <p className="text-slate-500 text-sm font-semibold">No active executive cabinet assignments registered.</p>
          </div>
        )}

        {/* Member Cards */}
        {!loading && !error && executiveMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executiveMembers.map((member: any, idx: number) => {
              const initials = member.fullName
                ?.split(" ")
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "M";
              const color   = COLORS[idx % COLORS.length];
              const email   = member.email || (typeof member.user === "object" ? member.user?.email : "");
              const avatarRaw  = member.profileImage || member.user?.profileImage?.secure_url || null;
              const avatar = avatarRaw ? getOptimizedCloudinaryUrl(avatarRaw, 150, 150) : null;

              return (
                <div
                  key={member._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 group"
                >
                  {/* Banner */}
                  <div className={`h-28 bg-gradient-to-r ${color} p-6 flex items-end relative`}>
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {member.membershipStatus || "Active"}
                    </div>
                    <Landmark className="absolute right-6 bottom-2 h-20 w-20 text-white/5" />
                  </div>

                  {/* Body */}
                  <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="absolute top-0 left-6 -translate-y-1/2 h-16 w-16 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden shadow-md bg-slate-900 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt={member.fullName} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="font-bold text-xl text-white">{initials}</span>
                      )}
                    </div>

                    <div className="pt-10 space-y-3">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {member.fullName}
                        </h3>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                          {member.designation || "Member"}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
                        {member.membershipId && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" /> Member ID:
                            </span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{member.membershipId}</span>
                          </div>
                        )}
                        {(member.province || member.district) && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Region:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {[member.district, member.province].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Type:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{member.membershipType || "General"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4 shrink-0" />
                        Contact Representative
                      </a>
                    ) : (
                      <span className="text-slate-400">PYVP Member</span>
                    )}
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">PYVP CERTIFIED</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
