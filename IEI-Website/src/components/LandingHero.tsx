import React from 'react';
import { Calendar, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative w-full pt-10 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5EAD8] via-[#FAF4EA] to-[#F5EAD8] overflow-hidden">
      {/* Decorative Subtle Circles from Mobile Sign-in Screen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-0 w-[450px] h-[450px] rounded-full bg-[#E1EECC]/40 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-10 w-[400px] h-[400px] rounded-full bg-[#FFE1D0]/40 blur-[90px]"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-4xl space-y-6 sm:space-y-7">
          {/* Pill tag matching mobile chapterBadge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310]">
            <span className="w-2 h-2 rounded-full bg-[#C67139]" />
            <span>OVERSEAS CHAPTER · ESTABLISHED 1995</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#201E1D] leading-[1.08] tracking-tight">
            Empowering Engineers.{' '}
            <span className="text-[#C67139] block sm:inline">
              Advancing Kuwait's Future.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-lg text-[#474238] leading-relaxed max-w-3xl">
            The premier institution uniting Indian engineering professionals across the State of Kuwait.
            Operating in active coordination with the <strong className="text-[#201E1D]">Kuwait Society of Engineers (KSE)</strong> to deliver accredited technical seminars, professional development, and mutual community support.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#events"
              className="px-6 py-3.5 bg-[#F9F4ED] hover:bg-[#EBDDC5] text-[#201E1D] border border-[#DCCBB0] font-sans font-semibold text-sm rounded-full transition-all flex items-center gap-2 active:scale-95 shadow-xs"
            >
              <Calendar size={16} className="text-[#C67139]" />
              <span>Explore Events & Seminars</span>
            </a>
          </div>

          {/* Trust and Credentials Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#DCCBB0] max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs text-[#474238]">
              <CheckCircle2 size={18} className="text-[#C67139] shrink-0" />
              <span>KSE Coordination</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#474238]">
              <ShieldCheck size={18} className="text-[#C67139] shrink-0" />
              <span>Royal Charter 1935</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#474238]">
              <Award size={18} className="text-[#C67139] shrink-0" />
              <span>15 Engineering Disciplines</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
