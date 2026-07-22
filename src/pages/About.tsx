import React from "react";
import {
  Landmark,
  Compass,
  Award,
  ShieldAlert,
  CheckCircle,
  Scale,
  Users,
  Cpu,
} from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* Hero Header */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
            Constitutional Framework
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            Pakistan Youth Vision Parliament
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            An independent mock legislative platform preparing Pakistan's
            dynamic young citizens to command statecraft, legal writing, and
            constitutional design.
          </p>
        </div>
      </section>

      {/* Main Narrative Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Narrative Left */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            <Compass className="h-4.5 w-4.5" />
            Empowerment Charter
          </div>

          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-snug">
            Establishing the Pillars of Youth Civic Responsibility
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Founded with the distinct vision of creating a structured, simulated
            environment for public service training, the Pakistan Youth Vision
            Parliament (PYVP) bridges the gap between state government and
            ambitious youth.
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            By running full simulated debates, legislative draft sessions, and
            committee hearings, the PYVP guides candidates through public policy
            development and teaches the mechanics of constitutional bills. Our
            focus areas include digital inclusion, green infrastructure,
            educational reforms, and federal resource allocations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                title: "National Coverage",
                desc: "Open to members in all provinces, Gilgit-Baltistan, AJK, and Islamabad.",
              },
              {
                title: "Sovereign Framework",
                desc: "Simulates the exact bi-cameral procedures of Pakistan's National Assembly.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative Right: Stately Badge */}
        <div className="lg:col-span-5 bg-linear-to-tr from-emerald-900 to-emerald-950 p-8 rounded-2xl border border-emerald-800 text-white shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-800 rounded-lg text-gold-500 shadow">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-100">
                National Charter
              </h3>
              <p className="text-[10px] text-slate-400">
                ISLAMIC REPUBLIC OF PAKISTAN
              </p>
            </div>
          </div>

          <div className="border-t border-emerald-800/80 my-4"></div>

          <p className="text-xs text-slate-300 leading-relaxed italic">
            "To educate, prepare, and certify young Pakistanis as skilled policy
            practitioners. We strive to instill democratic values, public
            empathy, and technical capability in candidates representing all
            constituencies."
          </p>

          <ul className="space-y-2 text-xs text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-gold-500 rounded-full shrink-0"></span>
              <span>Constitutional Integrity and Legislative Discipline</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-gold-500 rounded-full shrink-0"></span>
              <span>Provincial Cooperation and Cohesion</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-gold-500 rounded-full shrink-0"></span>
              <span>Data-Driven Policies and National Service</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. CORE VALUES BENTO GRID */}
      <section className="bg-slate-100 dark:bg-slate-900 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
              Pillars of Excellence
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-3">
              The Principles That Drive PYVP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Scale,
                title: "Legislative Justice",
                desc: "Understanding constitutional law, drafting bills, and mastering assembly procedures. We ensure parliamentary rules are observed with pristine discipline.",
              },
              {
                icon: Users,
                title: "Representative Inclusion",
                desc: "Giving equal voice to women, minorities, and rural constituencies. PYVP is a direct reflection of Pakistan's diverse territorial landscape.",
              },
              {
                icon: Cpu,
                title: "Modern State Tech",
                desc: "Leveraging digital systems, data dashboards, online verification keys, and technology-driven policies to create efficient state operations.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow duration-200 space-y-4"
              >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg w-fit">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PYVP ORGANIZATIONAL STRUCTURE */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
            Structure & Hierarchy
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-3">
            Organizational Architecture of Youth Assembly
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The Pakistan Youth Vision Parliament runs under a structured
            hierarchy modeled after real-world governmental institutions.
          </p>
        </div>

        {/* Structural Flowchart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Level 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-3">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full">
              Senate Level
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white pt-2">
              Senate of Youth Advisors
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consists of policy experts, veteran organizers, and the Chairman.
              Advises the Cabinet on strategic, national guidelines and provides
              final oversight.
            </p>
          </div>

          {/* Level 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-3">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-600 text-slate-950 font-bold text-xs px-3 py-1 rounded-full">
              Cabinet Level
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white pt-2">
              Supreme Executive Cabinet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Led by the Youth Prime Minister, coordinating specific cabinet
              divisions (Education, IT, Foreign Policy, Green Energy) to manage
              session briefs.
            </p>
          </div>

          {/* Level 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-3">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full">
              Assembly Level
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white pt-2">
              Youth Assembly Chambers
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consists of approved Parliamentarians from regional
              constituencies. Proposes and debates bills representing their
              regional citizens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
