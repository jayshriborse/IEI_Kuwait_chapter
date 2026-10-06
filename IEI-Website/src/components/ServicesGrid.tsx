import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CalendarDays,
  Briefcase,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
  href?: string;
  action?: () => void;
  accentBg: string;
}

export const ServicesGrid: React.FC = () => {
  const navigate = useNavigate();

  const services: ServiceItem[] = [
    {
      id: 'card',
      title: 'Digital Member Card',
      subtitle: 'Verified digital membership credentials with dynamic 24-hour QR token for instant event door check-in.',
      icon: <CreditCard size={24} className="text-[#C67139]" />,
      tag: 'Member Wallet',
      action: () => navigate('/signin'),
      accentBg: 'bg-[#FFE1D0]',
    },
    {
      id: 'events',
      title: 'Programmes & Seminars',
      subtitle: 'Annual convention, technical lectures, Ladies Wing workshops, and cultural galas scheduled throughout the year.',
      icon: <CalendarDays size={24} className="text-[#C67139]" />,
      tag: 'Events Hub',
      href: '#events',
      accentBg: 'bg-[#E1EECC]',
    },
    {
      id: 'jobs',
      title: 'Engineering Careers',
      subtitle: 'Exclusive vacancies with transferable visa openings at premier engineering firms in Kuwait with member referral notes.',
      icon: <Briefcase size={24} className="text-[#C67139]" />,
      tag: 'Career Board',
      href: '#careers',
      accentBg: 'bg-[#F9F4ED]',
    },
    {
      id: 'donors',
      title: 'Emergency Blood Donors',
      subtitle: 'Chapter humanitarian registry connecting voluntary blood donors categorized by group for urgent community requests.',
      icon: <HeartPulse size={24} className="text-[#C67139]" />,
      tag: 'Community Life',
      href: '#community',
      accentBg: 'bg-[#FFE1D0]',
    },
    {
      id: 'mentors',
      title: 'Senior Mentorship Register',
      subtitle: 'Direct guidance from distinguished Fellows (FIE) and Members (MIE) covering Civil, Electrical, Mechanical, and Oil & Gas.',
      icon: <GraduationCap size={24} className="text-[#C67139]" />,
      tag: 'Professional Guidance',
      href: '#community',
      accentBg: 'bg-[#E1EECC]',
    },
    {
      id: 'committee',
      title: 'Executive Administration',
      subtitle: 'Chapter office leadership, KSE coordination, and secure administrative workbenches for the Executive Committee.',
      icon: <ShieldCheck size={24} className="text-[#C67139]" />,
      tag: 'Chapter Office',
      href: '#committee',
      accentBg: 'bg-[#F9F4ED]',
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-3">
          <span>CHAPTER SERVICES & HUBS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D] tracking-tight">
          Everything You Need as an Engineer in Kuwait
        </h2>
        <p className="text-sm sm:text-base text-[#605C55] mt-3 leading-relaxed">
          Designed specifically for members of The Institution of Engineers (India) Kuwait Chapter, uniting professional growth, networking, and mutual community support.
        </p>
      </div>

      {/* 6-Card Responsive Grid - Exact mobile eventCardBg & inputBorder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => {
              if (service.action) service.action();
              else if (service.href) {
                const el = document.querySelector(service.href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group bg-[#EBDDC5]/60 hover:bg-[#EBDDC5] border border-[#DCCBB0] hover:border-[#C67139] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${service.accentBg} border border-[#DCCBB0] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                  {service.icon}
                </div>
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F9F4ED] text-[#605C55] border border-[#DCCBB0]">
                  {service.tag}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#201E1D] mb-2 group-hover:text-[#C67139] transition-colors">
                {service.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#474238] leading-relaxed">
                {service.subtitle}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCCBB0] flex items-center text-xs font-bold text-[#C67139] uppercase tracking-wider gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Explore Service</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
