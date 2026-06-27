import React from "react";
import { Landmark, Mail, ShieldAlert, Award, Compass, Globe, ExternalLink } from "lucide-react";

export default function ExecutiveTeam() {
  const executives = [
    {
      name: "Syed Hammad Hassan",
      position: "Chairman, PYVP",
      email: "chairman@pyvp.gov.pk",
      avatarInitials: "SH",
      color: "from-emerald-800 to-emerald-950",
      border: "border-emerald-600",
      bio: "Founding Chairman of the Pakistan Youth Vision Parliament. An advocate for youth empowerment and policy coordination at federal levels.",
      constituency: "Federal Council, Islamabad",
      degree: "M.Phil Political Science"
    },
    {
      name: "Dr. Muhammad Almas",
      position: "Chief Advisor & Patron-In-Chief",
      email: "advisor@pyvp.gov.pk",
      avatarInitials: "MA",
      color: "from-slate-800 to-slate-950",
      border: "border-slate-600",
      bio: "Leading academic and public policy strategist. Mentors the executive cabinet on parliamentary discipline and constitutional processes.",
      constituency: "Advisory Council, Lahore",
      degree: "Ph.D. Public Policy"
    },
    {
      name: "Waqar Ahmad Khattak",
      position: "Youth Prime Minister",
      email: "waqarkhattak844@gmail.com",
      avatarInitials: "WK",
      color: "from-amber-700 to-amber-950",
      border: "border-amber-600 animate-pulse",
      bio: "Chief Executive of the Youth Cabinet. Focused on digital legislative integrations, online civic registries, and nationwide regional councils.",
      constituency: "NA-28, Peshawar",
      degree: "B.Sc. Software Engineering"
    },
    {
      name: "Ayesha Malik",
      position: "Speaker of the Youth Assembly",
      email: "ayeshamalik@pyvp.gov.pk",
      avatarInitials: "AM",
      color: "from-emerald-700 to-emerald-900",
      border: "border-emerald-500",
      bio: "Manages assembly sessions, debates, and voting protocols. Highly committed to female political integration and constitutional debate.",
      constituency: "NA-244, Karachi",
      degree: "LL.B. Honours"
    },
    {
      name: "Zainab Lodhi",
      position: "Youth Minister for IT & Digital Governance",
      email: "zainablodhi@pyvp.gov.pk",
      avatarInitials: "ZL",
      color: "from-slate-700 to-slate-900",
      border: "border-slate-500",
      bio: "Spearheading the digitization of parliamentary records and the deployment of open-source feedback platforms for regional representatives.",
      constituency: "NA-120, Lahore",
      degree: "M.Sc. Computer Science"
    },
    {
      name: "Faisal Shah",
      position: "Youth Minister for External Affairs",
      email: "faisalshah@pyvp.gov.pk",
      avatarInitials: "FS",
      color: "from-blue-800 to-blue-950",
      border: "border-blue-600",
      bio: "Coordinates youth-delegate exchange programs and briefs foreign diplomatic missions on Pakistan's youth-centric policies and goals.",
      constituency: "NA-10, Gilgit-Baltistan",
      degree: "Master of International Relations"
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      {/* Hero Header */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
            Supreme Council
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            The Executive Assembly & Cabinet
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            Meet the primary organizers, legislative chairs, and youth cabinet ministers responsible for the PYVP session curriculum.
          </p>
        </div>
      </section>

      {/* Grid of Executives */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {executives.map((exe, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 group"
            >
              
              {/* Header Visual Banner */}
              <div className={`h-28 bg-linear-to-r ${exe.color} p-6 flex items-end relative`}>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  Cabinet Active
                </div>
                {/* Emblem Overlay */}
                <Landmark className="absolute right-6 bottom-2 h-20 w-20 text-white/5" />
              </div>

              {/* Avatar & Core Detail Block */}
              <div className="px-6 pb-6 relative">
                {/* Float Avatar Initials */}
                <div className={`absolute top-0 left-6 -translate-y-1/2 h-16 w-16 rounded-full bg-slate-900 border-4 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xl text-white shadow-md ${exe.border}`}>
                  {exe.avatarInitials}
                </div>

                <div className="pt-10 space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {exe.name}
                    </h3>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                      {exe.position}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[72px]">
                    {exe.bio}
                  </p>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Constituency Seat:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{exe.constituency}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Academic Background:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{exe.degree}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <a 
                  href={`mailto:${exe.email}`} 
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  Contact Representative
                </a>
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">PYVP CERTIFIED</span>
              </div>

            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
