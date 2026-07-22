import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Landmark,
  Upload,
  ClipboardCheck,
  Search,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  FileText,
} from "lucide-react";
import { verifyRecord } from "../services/memberApi";

export default function Registration() {
  const { registerUser, triggerToast, logout, user } = useAuth();

  useEffect(() => {
    if (user && logout) {
      logout();
    }
  }, [user, logout]);

  // Tab control
  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");

  // Registration Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [constituency, setConstituency] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");

  // Base64 file uploads
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [documentBase64, setDocumentBase64] = useState<string>("");
  const [profilePicBase64, setProfilePicBase64] = useState<string>("");

  // Submission control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(
    null,
  );

  // Tracking State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Provinces List
  const provinces = [
    "Punjab",
    "Khyber Pakhtunkhwa",
    "Sindh",
    "Balochistan",
    "Gilgit-Baltistan",
    "Azad Jammu & Kashmir (AJK)",
    "Islamabad Capital Territory",
  ];

  // Helper to convert files to Base64
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast(
          "File Too Large",
          "Maximum file upload size is 2MB.",
          "error",
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !cnic || !password) {
      triggerToast(
        "Missing Fields",
        "Please complete all mandatory fields.",
        "error",
      );
      return;
    }
    if (!receiptBase64) {
      triggerToast(
        "Receipt Required",
        "Please upload your EasyPaisa fee payment receipt.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);
    const payload = {
      fullName,
      email,
      phone,
      cnic,
      province,
      constituency: constituency || "NA-Constituency",
      gender,
      dob,
      education,
      bio,
      password,
      paymentReceipt: receiptBase64,
      documentUrl: documentBase64,
      profilePic: profilePicBase64,
    };

    const success = await registerUser(payload);
    setIsSubmitting(false);

    if (success) {
      setSubmissionSuccess(email);
      triggerToast(
        "Success!",
        "Application packet successfully routed to the executive reviews team.",
        "success",
      );
      // Reset form states
      setFullName("");
      setEmail("");
      setPhone("");
      setCnic("");
      setConstituency("");
      setBio("");
      setPassword("");
      setReceiptBase64("");
      setDocumentBase64("");
      setProfilePicBase64("");
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const data = await verifyRecord(trackQuery.trim());
      if (data.success && data.verified) {
        setTrackResult(data.member);
      } else {
        setTrackError(
          data.message ||
            "No application or personnel record matching those credentials was found.",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "No application or personnel record matching those credentials was found.";
      setTrackError(msg);
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      {/* Hero Header */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
            Intake Registry
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            PYVP National Intake 2026
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            Register your official dossier, submit payment verification, and
            track your application status live.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-2">
          <button
            onClick={() => setActiveTab("apply")}
            className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "apply"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <ClipboardCheck className="h-4.5 w-4.5" />
            Apply Online (Form)
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "track"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Search className="h-4.5 w-4.5" />
            Track Status
          </button>
        </div>
      </div>

      {/* ACTIVE VIEW WRAPPERS */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* TAB 1: APPLY ONLINE */}
        {activeTab === "apply" && (
          <div className="space-y-6">
            {/* Payment Guide Disclaimer Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Important Fee Notice
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Intake 2026 Processing Fee & EasyPaisa Deposit Instructions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All public applicants are required to deposit a processing fee
                  of <strong>PKR 3500</strong> to support digital ID card
                  design, administrative logistics, and certificate prints.
                </p>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      EasyPaisa Account Title:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      Muhammad Waqar
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      EasyPaisa Account Number:
                    </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                      +92 334 9876543
                    </strong>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center space-y-3">
                <CreditCard className="h-10 w-10 text-emerald-700 dark:text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                    Intake Fee
                  </span>
                  <span className="block text-2xl font-black font-heading text-slate-900 dark:text-white">
                    PKR 3500
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Save your transfer screenshot, it is required below!
                </p>
              </div>
            </div>

            {/* Main Application Form Container */}
            {submissionSuccess ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm text-center space-y-6">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2 max-w-xl mx-auto">
                  <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                    Application Received Successfully!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    We have successfully registered your dossier for{" "}
                    <strong>{submissionSuccess}</strong>. Our legal review team
                    will verify your EasyPaisa transfer transaction ID and
                    document uploads.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 max-w-sm mx-auto text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Tracking Email:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {submissionSuccess}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Review Window:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      48 to 72 Hours
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setTrackQuery(submissionSuccess);
                      setActiveTab("track");
                      setSubmissionSuccess(null);
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all text-xs"
                  >
                    Track Live Review Status
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleRegisterSubmit}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm space-y-8"
              >
                {/* 1. Core Credentials */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Create Your Profile
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Full Legal Name (as on CNIC/B-Form){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Waqar Ahmad Khattak"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Personal Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. candidate@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Contact Number (WhatsApp Active){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +92 334 9876543"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Choose Secure Account Password{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password for dashboard sign in"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. State & Territorial Representation */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Choose Your Constituency
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Identity CNIC or B-Form Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                        placeholder="e.g. 11101-1234567-3"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Province of Seat <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-semibold"
                      >
                        {provinces.map((p, idx) => (
                          <option key={idx} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Assembly Constituency{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        placeholder="e.g. NA-28 or PK-12"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Personal Bio & Qualifications */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Personal and Academic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Select Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        Highest Academic Qualification{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. BS Software Engineering"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">
                      Tell Us About Yourself & Motivation{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Write 2-3 sentences about your political/legal ambitions and why you wish to join the PYVP Youth Assembly."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs"
                    ></textarea>
                  </div>
                </div>

                {/* 4. Secure File Dropzones (Receipts, Docs, Profile Photo) */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Upload Documents & Payment Proof
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* EasyPaisa Receipt */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        EasyPaisa Receipt Image{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-950 hover:border-emerald-500 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) =>
                            handleFileChange(e, setReceiptBase64)
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {receiptBase64 ? (
                          <div className="space-y-2">
                            <img
                              src={receiptBase64}
                              alt="receipt"
                              className="h-16 mx-auto object-contain rounded"
                            />
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              Receipt Selected ✓
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                            <span className="text-[10px] text-slate-500 block font-bold">
                              Upload screenshot
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CNIC/B-Form Copy */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">
                        Identity Doc Copy (CNIC/B-Form)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-950 hover:border-emerald-500 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, setDocumentBase64)
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {documentBase64 ? (
                          <div className="space-y-2">
                            <img
                              src={documentBase64}
                              alt="doc"
                              className="h-16 mx-auto object-contain rounded"
                            />
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              Document Selected ✓
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <FileText className="h-6 w-6 text-slate-400 mx-auto" />
                            <span className="text-[10px] text-slate-500 block font-bold">
                              Upload picture copy
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">
                        Official Profile Photo
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-950 hover:border-emerald-500 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, setProfilePicBase64)
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {profilePicBase64 ? (
                          <div className="space-y-2">
                            <img
                              src={profilePicBase64}
                              alt="pic"
                              className="h-16 w-16 mx-auto object-cover rounded-full border border-emerald-500"
                            />
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              Photo Selected ✓
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                            <span className="text-[10px] text-slate-500 block font-bold">
                              Upload portrait
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-all text-sm shadow-md disabled:bg-slate-400"
                  >
                    {isSubmitting
                      ? "Transmitting Candidate Packet..."
                      : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === "track" && (
          <div className="space-y-6">
            {/* Tracking Search Input Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <form onSubmit={handleTrackSearch} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                    Track Your Personnel Status
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your registered email address, temporary Tracking ID
                    (e.g. PEND-XXXX), or full CNIC number.
                  </p>
                </div>

                <div className="flex gap-2 max-w-xl">
                  <input
                    type="text"
                    required
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="e.g. admin@pyvp.gov.pk or PEND-XXXX"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="h-4 w-4" />
                    {trackLoading ? "Searching..." : "Track"}
                  </button>
                </div>
              </form>
            </div>

            {/* Tracking Output Result Panel */}
            {trackResult && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                      Dossier Tracking Profile
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      Candidate ID: {trackResult.id}
                    </span>
                  </div>

                  {/* Dynamic Status Badges */}
                  {trackResult.status === "pending" && (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      Review Pending
                    </span>
                  )}
                  {trackResult.status === "approved" && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved
                    </span>
                  )}
                  {trackResult.status === "rejected" && (
                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      Rejected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                      <span className="text-slate-400 font-medium">
                        Applicant Name:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {trackResult.fullName}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                      <span className="text-slate-400 font-medium">
                        Registered CNIC:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {trackResult.cnic}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                      <span className="text-slate-400 font-medium">
                        Chosen Province:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {trackResult.province}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                      <span className="text-slate-400 font-medium">
                        Applied Date:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {new Date(trackResult.appliedAt).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <h5 className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Secretariat Action Notes:
                    </h5>

                    {trackResult.status === "pending" && (
                      <p className="text-slate-500 leading-relaxed">
                        We are currently reviewing your EasyPaisa fee receipts.
                        Standard reviews can take up to 72 hours during peak
                        intake weeks. Please ensure you keep your registered
                        email active.
                      </p>
                    )}
                    {trackResult.status === "approved" && (
                      <div className="space-y-2.5">
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Congratulations! Your dossier has been approved by the
                          National Secretariat.
                        </p>
                        <div className="text-[11px] space-y-1 text-slate-500">
                          <div>
                            • Your Permanent ID:{" "}
                            <strong>{trackResult.membershipId}</strong>
                          </div>
                          <div>
                            • Your Certificate Ref:{" "}
                            <strong>{trackResult.certificateNumber}</strong>
                          </div>
                        </div>
                        <div className="pt-1.5">
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded">
                            Approved and Certified
                          </span>
                        </div>
                      </div>
                    )}
                    {trackResult.status === "rejected" && (
                      <p className="text-red-600 font-medium">
                        Your application was rejected due to an unverified
                        transaction screenshot. Please contact our support line
                        immediately to update your receipt details.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {trackError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl flex items-start gap-3 text-xs">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-red-700 dark:text-red-400 font-bold">
                    Personnel Record Not Found
                  </strong>
                  <p className="text-slate-500">{trackError}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
