import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Landmark,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  MapPin,
  Award,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { verifyRecord } from "../services/memberApi";

interface VerifyFormValues {
  query: string;
}

interface VerifiedMember {
  fullName: string;
  membershipId: string;
  email?: string;
  designation: string;
  province?: string;
  district?: string;
  membershipType: string;
  membershipStatus: string;
  joinedAt: string;
  expiryDate?: string;
  isVerified: boolean;
  profileImage?: string | null;
  role: string;
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
const ResultSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm animate-pulse mt-6">
    <div className="flex gap-6 items-center">
      <div className="h-28 w-28 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      </div>
    </div>
  </div>
);

export default function Verification() {
  const { triggerToast } = useAuth();
  const [searchParams] = useSearchParams();

  const [matchedRecord, setMatchedRecord] = useState<VerifiedMember | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyFormValues>();

  // Auto-search if ?id= param is present
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setValue("query", idParam);
      performSearch(idParam);
    }
  }, [searchParams]);

  const performSearch = async (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) return;

    setSearching(true);
    setSearchError(null);
    setMatchedRecord(null);

    try {
      const data = await verifyRecord(q);

      if (data.success && data.verified) {
        setMatchedRecord(data.member);
        triggerToast(
          "Record Verified",
          "Official membership record found and certified.",
          "success",
        );
      } else {
        setSearchError(
          data.message || "No verified record matches this credential.",
        );
        triggerToast(
          "Verification Failed",
          "No matching active membership found.",
          "error",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "No verified record matches this credential.";
      setSearchError(msg);
      triggerToast("Verification Failed", msg, "error");
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (values: VerifyFormValues) => performSearch(values.query);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      {/* ── Hero ── */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Application Records
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            Verify Your Identity
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            Search our digital personnel ledger to instantly authenticate PYVP
            memberships by Member ID, Registration Number, or Certificate
            Number.
          </p>
        </div>
      </section>

      {/* ── Search Form ── */}
      <div className="max-w-3xl mx-auto px-4 mt-10 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Verify Your Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter a certified Member ID (e.g.{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  PYVP-2025-0001
                </code>
                ), Registration Number, or Certificate Number.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  {...register("query", {
                    required:
                      "Please enter a Member ID, Registration Number, or Certificate Number.",
                    minLength: {
                      value: 3,
                      message: "Query must be at least 3 characters.",
                    },
                  })}
                  type="text"
                  placeholder="e.g. PYVP-2025-0001"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-mono"
                />
                {errors.query && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.query.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-6 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search className="h-4 w-4" />
                {searching ? "Verifying..." : "Verify Record"}
              </button>
            </div>
          </form>

          {/* Helper hint */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            <p>
              Verify members using their official Membership ID, Registration
              Number, or Certificate Number.
            </p>
          </div>
        </div>

        {/* ── Skeleton while searching ── */}
        {searching && <ResultSkeleton />}

        {/* ── Verified Result ── */}
        {!searching && matchedRecord && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600 p-6 md:p-8 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Watermark */}
            <div className="absolute right-0 bottom-0 p-8 opacity-5">
              <Landmark className="h-48 w-48 text-emerald-950" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  VERIFIED CIVIL RECORD
                </span>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Pakistan Youth Vision Parliament — Official Directory
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Verified: {new Date().toLocaleString()}
              </span>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6">
              {/* Portrait */}
              <div className="md:col-span-3 text-center shrink-0">
                {matchedRecord.profileImage ? (
                  <img
                    src={matchedRecord.profileImage}
                    alt={matchedRecord.fullName}
                    className="h-28 w-28 rounded-xl object-cover border-4 border-slate-100 dark:border-slate-800 mx-auto shadow-md"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-xl bg-emerald-800 border-4 border-slate-100 dark:border-slate-800 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-md">
                    {matchedRecord.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Status Badge */}
                <span
                  className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    matchedRecord.membershipStatus === "Active"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {matchedRecord.membershipStatus}
                </span>
              </div>

              {/* Details */}
              <div className="md:col-span-9 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                      <UserIcon className="h-3 w-3" /> Full Name
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">
                      {matchedRecord.fullName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                      <Award className="h-3 w-3" /> Membership ID
                    </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                      {matchedRecord.membershipId}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                      <Shield className="h-3 w-3" /> Designation
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {matchedRecord.designation || "Member"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                      <Shield className="h-3 w-3" /> Role
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] inline-block">
                      {matchedRecord.role}
                    </span>
                  </div>
                </div>

                {(matchedRecord.province || matchedRecord.district) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    {matchedRecord.province && (
                      <div>
                        <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                          <MapPin className="h-3 w-3" /> Province
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {matchedRecord.province}
                        </strong>
                      </div>
                    )}
                    {matchedRecord.district && (
                      <div>
                        <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                          <MapPin className="h-3 w-3" /> District
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {matchedRecord.district}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                      <Calendar className="h-3 w-3" /> Member Since
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {new Date(matchedRecord.joinedAt).toLocaleDateString(
                        "en-PK",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </strong>
                  </div>
                  {matchedRecord.membershipType && (
                    <div>
                      <span className="text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                        <Award className="h-3 w-3" /> Membership Type
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {matchedRecord.membershipType}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400">
              <p className="text-center sm:text-left leading-relaxed">
                This credential is certified against the PYVP official
                membership register.
                {matchedRecord.isVerified && " ✓ Identity verified."}
              </p>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-amber-200/40 font-semibold shrink-0 text-amber-700 dark:text-amber-400">
                <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[8px]">
                  SEAL
                </div>
                <span>SECRETARIAT CERTIFIED</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Error Panel ── */}
        {!searching && searchError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 p-6 rounded-2xl flex items-start gap-3 mt-6 text-xs">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-red-700 dark:text-red-400 font-bold">
                Verification Error
              </strong>
              <p className="text-slate-500 dark:text-slate-400">
                {searchError}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
