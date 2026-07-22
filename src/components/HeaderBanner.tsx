import React, { useState, useEffect } from "react";
import { Phone, Mail, Clock, ShieldCheck, Languages } from "lucide-react";

export default function HeaderBanner() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full text-xs font-medium text-slate-200 bg-emerald-950 border-b border-emerald-800 selection:bg-emerald-700">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* National Crest / Portal Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <ShieldCheck className="h-4.5 w-4.5 text-gold-500 animate-pulse" />
            <span className="font-heading tracking-wide uppercase font-semibold">
              Welcome to the Youth Assembly
            </span>
          </div>
          <div className="hidden md:block h-3 w-[1px] bg-emerald-800"></div>
          <span className="hidden md:inline text-slate-400">
            ISLAMABAD, ISLAMIC REPUBLIC OF PAKISTAN
          </span>
        </div>

        {/* Dynamic Helpers */}
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono">
              {time.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              | {time.toLocaleTimeString()}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-emerald-800 hidden sm:block"></div>
          <a
            href="tel:+9251111998"
            className="flex items-center gap-1 hover:text-gold-500 transition-colors"
          >
            <Phone className="h-3 w-3 text-gold-500" />
            <span>+92 51 111-PYVP</span>
          </a>
          <div className="h-3 w-[1px] bg-emerald-800"></div>
          <div className="flex items-center gap-1.5 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-800 cursor-pointer hover:bg-emerald-800/50 transition-all text-emerald-300 hover:text-emerald-100">
            <Languages className="h-3 w-3" />
            <span>اردو</span>
          </div>
        </div>
      </div>
      {/* Dynamic Flag Ribbon Accent */}
      <div className="h-[3px] w-full bg-linear-to-r from-emerald-600 via-white to-emerald-600"></div>
    </div>
  );
}
