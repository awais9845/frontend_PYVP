import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Landmark, Search, ShieldCheck, AlertCircle, ScanLine, Camera, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Verification() {
  const { triggerToast } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"search" | "scanner">("search");

  // Search States
  const [query, setQuery] = useState("");
  const [matchedRecord, setMatchedRecord] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Scanner Simulator States
  const [scanActive, setScanActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Trigger search on mount if 'id' parameter is provided
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setQuery(idParam);
      performSearch(idParam);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setMatchedRecord(null);

    try {
      const res = await fetch(`/api/public/verify/${searchQuery.trim()}`);
      const data = await res.json();

      if (res.ok && data.verified) {
        setMatchedRecord(data.member);
        triggerToast("Credential Match Found", "Official personnel dossier matched and certified.", "success");
      } else {
        setSearchError(data.error || "No active membership file or certificate aligns with those credentials.");
        triggerToast("Verification Failed", "Credentials do not align with any registered files.", "error");
      }
    } catch (err) {
      setSearchError("Failed to reach verification registry servers.");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(query);
  };

  // Run mock QR scanning laser animation
  const handleSimulateScan = () => {
    setScanActive(true);
    setScannedResult(null);
    setMatchedRecord(null);
    setSearchError(null);

    triggerToast("Scanner Active", "Simulating QR scanning laser...", "info");

    setTimeout(() => {
      setScanActive(false);
      // Auto-fill and search Waqar Ahmad Khattak's official seat ID!
      const mockQuery = "PYVP-2025-0002";
      setQuery(mockQuery);
      
      // Perform direct search logic
      fetch(`/api/public/verify/${mockQuery}`)
        .then(res => res.json())
        .then(data => {
          if (data.verified) {
            setMatchedRecord(data.member);
            setScannedResult("PYVP-2025-0002");
            triggerToast("Scan Successful", "QR matrix validated. Displaying Waqar Ahmad Khattak's dossier.", "success");
          }
        });
    }, 2500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-20">
      
      {/* Hero Header */}
      <section className="bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 px-4 border-b border-emerald-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
            Sovereign Ledger
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight">
            National Credentials Verification
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
            Search our digital personnel ledger or scan an official identity card QR matrix to instantly authenticate memberships.
          </p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="max-w-3xl mx-auto px-4 mt-10">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-2">
          <button
            onClick={() => setActiveTab("search")}
            className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "search"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Search className="h-4.5 w-4.5" />
            Query Direct Records
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "scanner"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Camera className="h-4.5 w-4.5" />
            Scan QR Matrix Card
          </button>
        </div>
      </div>

      {/* ACTIVE PORTAL MODULES */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* VIEW A: DIRECT RECORDS SEARCH */}
        {activeTab === "search" && (
          <div className="space-y-6">
            
            {/* Query Form Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Credentials Verification Terminal</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Input a certified Member ID (e.g. <code>PYVP-2025-0002</code>), Certificate Number, or full CNIC.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. PYVP-2025-0002"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:border-emerald-600 outline-none text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="h-4 w-4" />
                    {searching ? "Verifying..." : "Verify Record"}
                  </button>
                </div>
              </form>

              {/* Demo Hint */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-2 items-center">
                <span>Try Demo Credentials:</span>
                <button onClick={() => setQuery("PYVP-2025-0002")} className="font-mono bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850 hover:border-emerald-600 hover:text-emerald-700">PYVP-2025-0002</button>
                <button onClick={() => setQuery("PYVP-2025-0001")} className="font-mono bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850 hover:border-emerald-600 hover:text-emerald-700">PYVP-2025-0001</button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW B: MOCK CAMERA SCANNER */}
        {activeTab === "scanner" && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm text-center space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Smart QR Matrix Scanner</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hold your printed PYVP Card QR matrix directly in front of your camera frame or run a full laser scan simulation below.
                </p>
              </div>

              {/* Scan Stage box */}
              <div className="relative max-w-sm mx-auto h-64 border-4 border-slate-900 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center text-white">
                {scanActive ? (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-4">
                    <ScanLine className="h-10 w-10 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 animate-pulse uppercase">Reading matrix...</span>
                    {/* Mock Laser Line */}
                    <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-md shadow-emerald-500 top-1/2 -translate-y-1/2 animate-bounce"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-16 w-16 border-2 border-dashed border-emerald-500/50 rounded-lg flex items-center justify-center text-emerald-500 mx-auto">
                      <Camera className="h-8 w-8 text-slate-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Feed: OFFLINE</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSimulateScan}
                  disabled={scanActive}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 mx-auto"
                >
                  <ScanLine className="h-4.5 w-4.5" />
                  {scanActive ? "Calibrating..." : "Scan Sample ID Card"}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* OUTPUT PORTAL: CERTIFIED DATA DOSSIER */}
        {matchedRecord && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600 p-6 md:p-8 shadow-xl mt-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Watermark Crest */}
            <div className="absolute right-0 bottom-0 p-8 opacity-5">
              <Landmark className="h-48 w-48 text-emerald-950" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  VERIFIED CIVIL RECORD
                </span>
                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Pakistan National Assembly Directory</h4>
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400">Timestamp: {new Date().toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
              
              {/* Member profile portrait */}
              <div className="md:col-span-3 text-center sm:text-left shrink-0">
                {matchedRecord.profilePic ? (
                  <img 
                    src={matchedRecord.profilePic} 
                    alt="Pic" 
                    className="h-28 w-28 rounded-xl object-cover border-4 border-slate-100 dark:border-slate-800 mx-auto shadow-md"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-xl bg-emerald-800 border-4 border-slate-100 dark:border-slate-800 text-gold-200 font-bold text-3xl flex items-center justify-center mx-auto shadow-md">
                    {matchedRecord.fullName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Details table */}
              <div className="md:col-span-9 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b pb-1.5">
                  <div>
                    <span className="text-slate-400 block font-medium">Full Name:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{matchedRecord.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Certified ID Seat:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{matchedRecord.membershipId}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-1.5">
                  <div>
                    <span className="text-slate-400 block font-medium">Regional Province Representation:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{matchedRecord.province}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Assembly Constituency:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{matchedRecord.constituency}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-1.5">
                  <div>
                    <span className="text-slate-400 block font-medium">Credentials Class/Role:</span>
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] inline-block mt-0.5">
                      {matchedRecord.role}
                    </span>
                    {matchedRecord.executivePosition && (
                      <span className="text-[10px] text-gold-600 font-bold block mt-1 uppercase">★ {matchedRecord.executivePosition}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Certificate Ref Code:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{matchedRecord.certificateNumber}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Official Stamps / Authorization Block */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400">
              <p className="text-center sm:text-left leading-relaxed">
                The credentials listed align with the legal records submitted on {new Date(matchedRecord.approvedAt).toLocaleDateString()}.
              </p>

              {/* Digital Seal stamp graphic */}
              <div className="flex items-center gap-2 bg-gold-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-gold-300/30 font-semibold shrink-0 text-gold-700 dark:text-gold-400">
                <div className="h-6 w-6 rounded-full bg-gold-500 text-slate-950 flex items-center justify-center font-bold text-[8px]">SEAL</div>
                <span>SECRETARIAT CERTIFIED</span>
              </div>
            </div>

          </div>
        )}

        {/* REJECTION PANEL BOX */}
        {searchError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 p-6 rounded-2xl flex items-start gap-3 mt-6 text-xs">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-red-700 dark:text-red-400 font-bold">Verification Error</strong>
              <p className="text-slate-500">{searchError}</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
