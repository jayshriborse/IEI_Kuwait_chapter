import React from 'react';
import { Shield, Award, GraduationCap, Building2, Globe, Users } from 'lucide-react';
import sealLogo from '../assets/logo/iei-seal.png';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      icon: Award,
      title: 'Royal Charter 1935',
      desc: 'The Institution of Engineers (India) was established in 1920 and granted the Royal Charter (UK) in 1935, headquartered at Kolkata, India.',
    },
    {
      icon: Building2,
      title: 'Kuwait Chapter (Est. 1995)',
      desc: 'Established in November 1995 for professional engineers residing and practicing in Kuwait, operating in coordination with Kuwait Society of Engineers (KSE).',
    },
    {
      icon: Globe,
      title: 'Indian Embassy Affiliation',
      desc: 'Affiliated with the Embassy of India in Kuwait since 1996, collaborating with bilateral professional bodies to advance science and technology.',
    },
    {
      icon: GraduationCap,
      title: 'AMIE Examinations',
      desc: 'Conducts official AMIE examinations for diploma and non-diploma engineering students under Kolkata guidelines, supervised by the Indian Embassy.',
    },
    {
      icon: Shield,
      title: "Engineers' Day Celebrations",
      desc: 'Celebrated every year on 15th September in honour of Bharat Ratna Sir M. Visvesvaraya, uniting engineers across all nationalities.',
    },
    {
      icon: Users,
      title: 'Ladies Wing & Science Club',
      desc: 'Active community programs fostering creative, scientific, and family fraternity while preserving cultural values and preparing budding young scientists.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Section Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-3">
          <Shield size={14} className="text-[#C67139]" />
          <span>ABOUT IEI KUWAIT CHAPTER · ESTABLISHED 1995</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#201E1D] tracking-tight">
          About IEI, Kuwait Chapter
        </h2>
        <div className="w-20 h-1 bg-[#C67139] mx-auto mt-4 rounded-full" />
      </div>

      {/* Main Authentic Information Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        {/* Left Column: Official History & Mission from iei-kuwait.org */}
        <div className="lg:col-span-8 bg-[#EBDDC5]/60 border border-[#DCCBB0] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-5 text-[#38332C] leading-relaxed text-sm sm:text-base">
          <p className="font-serif text-base sm:text-lg text-[#201E1D] font-semibold leading-snug">
            The Institution of Engineers (India) was established in 1920 and the Royal Charter (UK) was granted to it in 1935. Its headquarter is located at Kolkata, India.
          </p>

          <p>
            The Institution of Engineers (India), Kuwait Chapter was established in November 1995 for its members residing and practicing engineering profession in Kuwait. IEI Kuwait Chapter has entered into a Memorandum of Understanding with Kuwait Society of Engineers to promote and enhance engineering and science knowledge among its members.
          </p>

          <p>
            It has a bilateral agreement with many local professional bodies to share the technical, scientific, and professional knowledge among the professionals for the advancement of Science & Technology.
          </p>

          <p>
            IEI Kuwait Chapter conducts <span className="font-semibold text-[#201E1D]">AMIE EXAMINATION</span> for the benefit of diploma and non-diploma students under the guidelines of Headquarters Calcutta and supervised by the Indian Embassy.
          </p>

          <p>
            Engineers' Day is being celebrated every year in the honour of Sir Visvesvaraya, an outstanding Engineer, Statesman, and Bharat Ratna Awardee on his birthday of 15th September.
          </p>

          <p>
            The Kuwait Chapter has been affiliated with the Indian Embassy in Kuwait since 1996. IEI Kuwait Chapter conducts free seminars and workshops on topics related to Engineering and Technology for improving and enhancing the knowledge of its members and other members of the engineering community irrespective of their affiliation to any nationality.
          </p>

          <p>
            Furthermore, IEI Kuwait Chapter also organizes programs for its Ladies Wing members and Science Club members for the benefit of IEI Kuwait Chapter engineers' families to keep them involved in creativity, scientific activities, and to share talents and prepare budding scientists to establish fraternity, to keep alive human values and traditions.
          </p>
        </div>

        {/* Right Column: Institutional Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#402310] text-[#F9F4ED] rounded-3xl p-6 sm:p-8 border border-[#5D3011] shadow-md flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#FFFFFF] p-2 flex items-center justify-center shadow-lg mb-5">
              <img
                src={sealLogo}
                alt="IEI Kuwait Chapter Seal"
                className="w-full h-full object-contain"
              />
            </div>
            <h3
              className="text-xl text-[#F9F4ED] tracking-normal"
              style={{ fontFamily: 'var(--font-blackletter)' }}
            >
              The Institution of Engineers (India)
            </h3>
            <div className="text-xs uppercase tracking-widest text-[#FFC6A5] font-semibold mt-1">
              Kuwait Chapter · Overseas Chapter
            </div>
            <div className="w-full border-t border-[#5D3011] my-4" />
            <div className="space-y-3 text-left w-full text-xs sm:text-[13px] text-[#D8CEC3]">
              <div className="flex justify-between py-1 border-b border-[#5D3011]/60">
                <span className="text-[#8B634A]">Established:</span>
                <span className="font-semibold text-[#F9F4ED]">November 1995</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#5D3011]/60">
                <span className="text-[#8B634A]">Parent Body:</span>
                <span className="font-semibold text-[#F9F4ED]">IEI India (Est. 1920)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#5D3011]/60">
                <span className="text-[#8B634A]">Royal Charter:</span>
                <span className="font-semibold text-[#F9F4ED]">1935 (UK)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#5D3011]/60">
                <span className="text-[#8B634A]">Affiliation:</span>
                <span className="font-semibold text-[#F9F4ED]">Embassy of India (1996)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8B634A]">Coordination:</span>
                <span className="font-semibold text-[#F9F4ED]">Kuwait Society of Engineers</span>
              </div>
            </div>
          </div>

          {/* Official Secretariat Coordinates */}
          <div className="bg-[#EBDDC5]/80 border border-[#DCCBB0] rounded-2xl p-5 text-xs text-[#474238] space-y-2">
            <div className="font-bold uppercase tracking-wider text-[#402310] text-[11px]">
              Chapter Secretariat
            </div>
            <p className="leading-relaxed">
              Kuwait Society of Engineers, Soor St, Bneid Al Qar, Kuwait
            </p>
            <div className="pt-2 border-t border-[#DCCBB0] flex flex-col gap-1 text-[#201E1D]">
              <div><span className="text-[#605C55]">Tel / WhatsApp:</span> +965 90098667</div>
              <div><span className="text-[#605C55]">Email:</span> <a href="mailto:ieikwt@hotmail.com" className="text-[#C67139] underline font-medium">ieikwt@hotmail.com</a></div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Chapter Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <div
              key={i}
              className="bg-[#EBDDC5]/60 hover:bg-[#EBDDC5] border border-[#DCCBB0] hover:border-[#C67139] rounded-2xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F9F4ED] border border-[#DCCBB0] flex items-center justify-center text-[#C67139] mb-3.5 shadow-xs">
                <Icon size={20} />
              </div>
              <h4 className="font-serif font-bold text-base text-[#201E1D] mb-1.5">
                {h.title}
              </h4>
              <p className="text-xs sm:text-[13px] text-[#474238] leading-relaxed">
                {h.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
