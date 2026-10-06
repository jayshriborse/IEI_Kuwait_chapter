import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, Users, CreditCard, ArrowRight } from 'lucide-react';

export const MembershipBenefitsSection: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Shield size={24} className="text-[#C67139]" />,
      title: 'KSE & Professional Standing',
      description: 'Accreditation guidance for degree equivalency and Kuwait Society of Engineers (KSE) membership registration.',
    },
    {
      icon: <BookOpen size={24} className="text-[#FFC6A5]" />,
      title: 'Continuing Professional Seminars',
      description: 'Regular certified technical lectures, workshops, and symposiums presented by leading industry experts.',
    },
    {
      icon: <Users size={24} className="text-[#FFC6A5]" />,
      title: 'Exclusive Career Network',
      description: 'Peer job referrals, mentorship from senior Fellows, and mutual chapter support across Kuwait.',
    },
    {
      icon: <CreditCard size={24} className="text-[#C67139]" />,
      title: 'Digital Member Card & Wallet',
      description: 'Mobile card credentials with dynamic 24-hour QR token for fast-track door check-in at all chapter conventions.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#402310] text-[#F9F4ED] rounded-3xl max-w-7xl mx-auto my-12 border border-[#5D3011] shadow-2xl overflow-hidden relative">
      {/* Decorative ambient background circle from mobile sign-in theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#5D3011]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#2E2A18]/40 blur-3xl"
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-sans font-bold tracking-widest text-[#FFC6A5] bg-[#5D3011] px-3.5 py-1 rounded-full border border-[#BE7F54]/30">
            MEMBERSHIP VALUE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#F9F4ED] mt-3">
            Why Join the IEI Kuwait Chapter?
          </h2>
          <p className="text-sm text-[#D8CEC3] mt-2 leading-relaxed">
            Founded under the historic Royal Charter of 1935, The Institution of Engineers (India) is the world's largest multi-disciplinary engineering professional body.
          </p>
        </div>

        {/* 4 Benefits Cards - Mobile dark chocolate tokens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#2D160A]/85 border border-[#5D3011] rounded-2xl flex items-start gap-4 hover:border-[#C67139] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#5D3011]/60 flex items-center justify-center shrink-0 border border-[#5D3011]">
                {b.icon}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#F9F4ED] mb-1">
                  {b.title}
                </h3>
                <p className="text-xs text-[#D8CEC3] leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Annual Subscription Fee Policy Strip - Mobile theme */}
        <div className="bg-[#241206] border border-[#5D3011] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5D3011] border border-[#BE7F54]/40 flex items-center justify-center font-serif font-black text-xl text-[#FFC6A5] shrink-0 shadow">
              KD 20
            </div>
            <div>
              <div className="text-sm font-bold text-[#F9F4ED]">
                Annual Chapter Subscription Dues
              </div>
              <div className="text-xs text-[#D8CEC3]">
                Covers fiscal year (1 April – 31 March). Verified directly by Chapter Treasurer.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/signin')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#C67139] hover:bg-[#B5632E] text-[#F9F4ED] font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <span>Renew / Verify Dues</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
