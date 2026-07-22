import React from "react";
import { Link } from "react-router-dom";
import { Landmark, Mail, Phone, MapPin, Shield, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8">
        {/* Core Info & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Organization & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow">
                <Landmark className="h-5 w-5 text-gold-200" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-slate-100">
                  PYVP
                </h4>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest leading-none font-bold">
                  Youth Assembly
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering the next generation of Pakistani leaders through policy
              training, simulated parliamentary sessions, and civic governance
              frameworks.
            </p>

            <div className="pt-2 flex gap-3 text-slate-400">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Mission:
              </span>
              <span className="text-xs italic text-slate-300">
                Inspiring Leadership and Serving the Nation
              </span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              State Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 hover:underline transition-all flex items-center gap-1.5"
                >
                  • Chiarman Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-emerald-400 hover:underline transition-all flex items-center gap-1.5"
                >
                  • Constitution & Charter
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-emerald-400 hover:underline transition-all flex items-center gap-1.5"
                >
                  • Apply Online
                </Link>
              </li>
              <li>
                <Link
                  to="/verify"
                  className="hover:text-emerald-400 hover:underline transition-all flex items-center gap-1.5"
                >
                  • Document & ID Verification
                </Link>
              </li>
              <li>
                <Link
                  to="/executives"
                  className="hover:text-emerald-400 hover:underline transition-all flex items-center gap-1.5"
                >
                  • Cabinet Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Channels */}
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              National Secretariat
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Sector F-5/1, Constitution Avenue, Islamabad, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500" />
                <a
                  href="mailto:info@pyvp.gov.pk"
                  className="hover:text-emerald-400 transition-colors"
                >
                  info@pyvp.gov.pk
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500" />
                <a
                  href="tel:+9251111998"
                  className="hover:text-emerald-400 transition-colors"
                >
                  +92 51 111-7987
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: System Safeguard */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Secure State Portal
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              This digital portal uses standard 256-bit encryption for the
              transmission of candidate dossiers, academic certificates, and
              biometric CNIC verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-500 bg-slate-950 p-2.5 rounded border border-slate-800">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="font-medium">
                EasyPaisa Verification Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Informative Disclaimer */}
        <div className="border-t border-slate-800 pt-8 pb-4 text-[11px] text-slate-500 leading-relaxed text-center md:text-left">
          <p className="mb-2">
            <strong>Disclaimer:</strong> The Pakistan Youth Vision Parliament
            (PYVP) is an independent public-advocacy and simulated legislative
            workshop model designed exclusively for leadership training, policy
            reviews, and strategic governance mockups for young citizens aged 18
            to 32. It operates as an educational initiative and does not claim
            representation as a direct sovereign department of the Federal
            National Assembly of Pakistan.
          </p>
          <p>
            All membership files, EasyPaisa receipts, and identification
            certificates are subject to background checks by the PYVP
            Secretariat.
          </p>
        </div>

        {/* Absolute Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Pakistan Youth Vision Parliament. All legislative
            records protected.
          </p>

          <div className="flex items-center gap-1.5">
            <span>Designed for Youth Policy and Leadership</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>in Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
