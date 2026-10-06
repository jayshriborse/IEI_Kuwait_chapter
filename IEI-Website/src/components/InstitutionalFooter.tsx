import React from 'react';
import { Link } from 'react-router-dom';
import sealLogo from '../assets/logo/iei-seal.png';

export const InstitutionalFooter: React.FC = () => {
  return (
    <footer className="bg-[#402310] text-[#F9F4ED] border-t border-[#5D3011] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#5D3011]">
          {/* Col 1: Seal & Chapter Identity matching mobile theme */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] p-1 flex items-center justify-center shadow-md shrink-0">
                <img
                  src={sealLogo}
                  alt="IEI Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3
                  className="text-lg text-[#F9F4ED] tracking-normal"
                  style={{ fontFamily: 'var(--font-blackletter)' }}
                >
                  The Institution of Engineers (India)
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#FFC6A5] font-semibold">
                  Kuwait Chapter · Established 1995
                </p>
              </div>
            </div>

            <p className="text-xs text-[#D8CEC3] leading-relaxed max-w-sm">
              Incorporated by Royal Charter in 1935. The premier multi-disciplinary professional body representing engineers globally. Serving the professional engineering community in Kuwait for over three decades.
            </p>

            <div className="text-[11px] font-sans font-semibold text-[#FFC6A5]">
              Parent Body HQ: 8 Gokhale Road, Kolkata 700020, India
            </div>
          </div>

          {/* Col 2: Chapter Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#FFC6A5] mb-2 font-sans">
              Chapter Portals
            </h4>
            <ul className="space-y-2 text-xs text-[#D8CEC3]">
              <li>
                <a href="#about" className="hover:text-[#FFC6A5] transition-colors">
                  About Kuwait Chapter
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-[#FFC6A5] transition-colors">
                  Programmes & Technical Seminars
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-[#FFC6A5] transition-colors">
                  Engineering Careers & Referrals
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#FFC6A5] transition-colors">
                  Senior Mentorship Directory
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#FFC6A5] transition-colors">
                  Emergency Blood Donors Register
                </a>
              </li>
              <li>
                <a href="#committee" className="hover:text-[#FFC6A5] transition-colors">
                  Executive Committee (2026–27)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Member Services */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#FFC6A5] mb-2 font-sans">
              Member Services & Administration
            </h4>
            <p className="text-xs text-[#D8CEC3] leading-relaxed">
              Active members can access the digital membership card, submit annual dues renewal declarations, and manage RSVP seat reservations.
            </p>

            <div className="pt-2">
              <Link
                to="/signin"
                className="inline-block px-5 py-2.5 bg-[#C67139] hover:bg-[#B5632E] text-[#F9F4ED] font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Sign In to Member Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B634A]">
          <p>
            © {new Date().getFullYear()} The Institution of Engineers (India), Kuwait Chapter. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[#D8CEC3]">
            <Link to="/signin" className="hover:text-[#FFC6A5] transition-colors">Member Sign In</Link>
            <span>·</span>
            <a href="#contact" className="hover:text-[#FFC6A5] transition-colors">Kuwait Society of Engineers</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
