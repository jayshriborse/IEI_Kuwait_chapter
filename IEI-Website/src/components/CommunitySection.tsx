import React, { useState } from 'react';
import { MENTORS, BLOOD_DONORS } from '../api/chapter-data';
import { GraduationCap, HeartPulse, Building2, MapPin } from 'lucide-react';

export const CommunitySection: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');

  const disciplines = ['All', 'Civil', 'Electrical', 'Mechanical', 'Oil & Gas'];
  const bloodGroups = ['All', 'O+', 'A+', 'B+', 'AB+'];

  const filteredMentors =
    selectedDiscipline === 'All'
      ? MENTORS
      : MENTORS.filter((m) => m.discipline === selectedDiscipline);

  const filteredDonors =
    selectedBloodGroup === 'All'
      ? BLOOD_DONORS
      : BLOOD_DONORS.filter((d) => d.group === selectedBloodGroup);

  return (
    <section id="community" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F5EAD8] border-t border-[#DCCBB0]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-3">
            <span>MUTUAL CHAPTER REGISTRIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D]">
            Mentorship & Community Registries
          </h2>
          <p className="text-sm text-[#605C55] mt-2">
            Active directories powered by IEI Kuwait Chapter engineers supporting career development and community humanitarian response.
          </p>
        </div>

        {/* Two-Column Grid: Left Mentors, Right Blood Donors - Exact mobile eventCardBg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Column 1: Senior Mentorship Register */}
          <div className="bg-[#EBDDC5]/60 border border-[#DCCBB0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#DCCBB0]">
              <div className="w-11 h-11 rounded-xl bg-[#FFE1D0] border border-[#DCCBB0] flex items-center justify-center text-[#C67139]">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#201E1D]">
                  Senior Mentorship Register
                </h3>
                <p className="text-xs text-[#605C55]">
                  Technical advice from distinguished Fellows (FIE) & Members (MIE)
                </p>
              </div>
            </div>

            {/* Discipline Filter Pills matching mobile filterChip */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {disciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiscipline(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedDiscipline === d
                      ? 'bg-[#C67139] text-[#F9F4ED] font-semibold shadow-xs'
                      : 'bg-[#F5EAD8] text-[#474238] border border-[#DCCBB0] hover:bg-[#EBDDC5]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Mentors List */}
            <div className="space-y-3.5">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-4 bg-[#F5EAD8] border border-[#DCCBB0] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#201E1D]">
                        {mentor.name}
                      </span>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#FFE1D0] border border-[#C67139] text-[#8C5A34] font-bold">
                        {mentor.grade}
                      </span>
                    </div>
                    <div className="text-xs text-[#605C55] mt-0.5 flex items-center gap-1.5">
                      <Building2 size={13} className="text-[#C67139]" />
                      <span>{mentor.company} · {mentor.discipline}</span>
                    </div>
                    <div className="text-xs text-[#474238] mt-1 font-medium">
                      ★ {mentor.specialty}
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBDDC5] text-[#402310] border border-[#DCCBB0] shrink-0 font-sans">
                    {mentor.yearsExp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Emergency Blood Donors Register */}
          <div className="bg-[#EBDDC5]/60 border border-[#DCCBB0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#DCCBB0]">
              <div className="w-11 h-11 rounded-xl bg-[#FFE1D0] border border-[#DCCBB0] flex items-center justify-center text-[#C67139]">
                <HeartPulse size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#201E1D]">
                  Emergency Blood Donors Register
                </h3>
                <p className="text-xs text-[#605C55]">
                  Voluntary engineering community directory for emergency medical needs
                </p>
              </div>
            </div>

            {/* Blood Group Filter Pills matching mobile */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedBloodGroup === bg
                      ? 'bg-[#C67139] text-[#F9F4ED] font-semibold shadow-xs'
                      : 'bg-[#F5EAD8] text-[#474238] border border-[#DCCBB0] hover:bg-[#EBDDC5]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Donors List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="p-3.5 bg-[#F5EAD8] border border-[#DCCBB0] rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-xs text-[#201E1D] truncate">
                      {donor.name}
                    </div>
                    <div className="text-[11px] text-[#605C55] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={12} className="text-[#C67139] shrink-0" />
                      <span className="truncate">{donor.location}</span>
                    </div>
                  </div>

                  <span className="w-9 h-9 rounded-full bg-[#FFE1D0] text-[#8C5A34] border border-[#C67139] flex items-center justify-center font-bold text-xs shrink-0 font-sans">
                    {donor.group}
                  </span>
                </div>
              ))}
            </div>

            {/* Notice matching mobile card styling */}
            <div className="mt-6 p-4 bg-[#F9F4ED] border border-[#DCCBB0] rounded-2xl text-xs text-[#402310] flex items-center justify-between">
              <div>
                <strong className="text-[#201E1D]">Urgent Donation Need?</strong>
                <p className="text-[11px] text-[#605C55]">Contact Chapter Welfare Coordinator at KSE</p>
              </div>
              <span className="font-sans font-bold text-xs text-[#C67139]">+965 90098667</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
