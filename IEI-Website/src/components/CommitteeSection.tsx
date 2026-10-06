import React from 'react';
import { ShieldCheck, Award, Building } from 'lucide-react';

interface Officer {
  name: string;
  position: string;
  grade: string;
  discipline: string;
  company: string;
  badgeColor: string;
}

export const CommitteeSection: React.FC = () => {
  const leadership: Officer[] = [
    {
      name: 'Engr. Sudhir Shyam Menghani',
      position: 'Chapter Treasurer',
      grade: 'MIE',
      discipline: 'Electrical Engineering',
      company: 'Alghanim Industries',
      badgeColor: 'bg-[#FFE1D0] text-[#8C5A34] border-[#C67139]',
    },
    {
      name: 'Engr. Upendra Kumar Behura',
      position: 'Executive Committee Officer',
      grade: 'FIE',
      discipline: 'Electrical Engineering',
      company: 'Equate Petrochemical',
      badgeColor: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
    },
    {
      name: 'Engr. Subbiah Somasundaram',
      position: 'Senior Life Member & Advisor',
      grade: 'FIE',
      discipline: 'Civil Engineering',
      company: 'Ministry of Public Works',
      badgeColor: 'bg-[#F9F4ED] text-[#402310] border-[#DCCBB0]',
    },
    {
      name: 'Eng. Karthikeyan Manickam',
      position: 'Civil Division Committee Member',
      grade: 'MIE',
      discipline: 'Civil Engineering',
      company: 'KEO International Consultants',
      badgeColor: 'bg-[#FFE1D0] text-[#8C5A34] border-[#C67139]',
    },
  ];

  return (
    <section id="committee" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-3">
          <ShieldCheck size={14} className="text-[#C67139]" />
          <span>CHAPTER LEADERSHIP · 2026–27</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D]">
          Executive Committee & Office Bearers
        </h2>
        <p className="text-sm text-[#605C55] mt-2">
          Governing the activities, professional delegations, and member services of The Institution of Engineers (India) Kuwait Chapter.
        </p>
      </div>

      {/* 4-Card Leadership Grid - Exact mobile tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leadership.map((officer, idx) => (
          <div
            key={idx}
            className="bg-[#EBDDC5]/60 hover:bg-[#EBDDC5] border border-[#DCCBB0] hover:border-[#C67139] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Avatar Initial Circle matching mobile ticket avatar #402310 */}
              <div className="w-14 h-14 rounded-2xl bg-[#402310] text-[#FFC6A5] font-serif font-bold text-lg flex items-center justify-center mb-4 border border-[#5D3011] shadow-sm">
                {officer.name.replace(/^Engr?\.\s*/i, '').charAt(0)}
              </div>

              {/* Position Badge */}
              <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-2.5 inline-block ${officer.badgeColor}`}>
                {officer.position}
              </span>

              {/* Name */}
              <h3 className="font-serif font-bold text-lg text-[#201E1D] leading-snug mb-1">
                {officer.name}
              </h3>

              {/* Grade & Discipline */}
              <div className="text-xs font-semibold text-[#C67139] mb-3 flex items-center gap-1.5">
                <Award size={13} />
                <span>{officer.grade} · {officer.discipline}</span>
              </div>

              {/* Company */}
              <div className="text-xs text-[#605C55] flex items-center gap-1.5 border-t border-[#DCCBB0] pt-3">
                <Building size={13} className="text-[#C67139] shrink-0" />
                <span className="truncate">{officer.company}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
