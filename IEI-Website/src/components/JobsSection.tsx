import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JOB_POSTINGS } from '../api/chapter-data';
import { Briefcase, Building, MapPin, CheckCircle, ArrowUpRight } from 'lucide-react';

export const JobsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="careers" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-2.5">
            <Briefcase size={14} className="text-[#C67139]" />
            <span>ENGINEERING CAREER OPPORTUNITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D]">
            Vacancies in Kuwait & Member Referrals
          </h2>
          <p className="text-sm text-[#605C55] mt-2 max-w-2xl">
            Verified opportunities at premier engineering, consultancy, and EPC contracting organizations in Kuwait, with peer support from chapter members.
          </p>
        </div>

        <button
          onClick={() => navigate('/signin')}
          className="text-xs font-bold uppercase tracking-wider text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Submit Referral via Portal</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Jobs 3-Card Grid - Exact mobile eventCardBg: #EBDDC5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {JOB_POSTINGS.map((job) => (
          <div
            key={job.id}
            className="bg-[#EBDDC5]/60 hover:bg-[#EBDDC5] border border-[#DCCBB0] hover:border-[#C67139] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category & Type */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F9F4ED] text-[#402310] border border-[#DCCBB0] font-semibold">
                  {job.category}
                </span>
                <span className="text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full border border-[#C67139] text-[#8C5A34] bg-[#FFE1D0]">
                  {job.type}
                </span>
              </div>

              {/* Job Title */}
              <h3 className="font-serif font-bold text-xl text-[#201E1D] mb-1 leading-snug">
                {job.title}
              </h3>

              {/* Company & Location */}
              <div className="flex items-center gap-3 text-xs text-[#605C55] mb-4">
                <div className="flex items-center gap-1">
                  <Building size={14} className="text-[#C67139]" />
                  <span className="font-semibold text-[#201E1D]">{job.company}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-[#605C55]" />
                  <span>{job.location}</span>
                </div>
              </div>

              {/* Salary & Visa Tag */}
              <div className="p-3 bg-[#F5EAD8] rounded-2xl border border-[#DCCBB0] space-y-1.5 mb-5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#605C55]">Compensation:</span>
                  <span className="font-bold font-serif text-[#C67139]">{job.salary}</span>
                </div>
                <div className="text-[11px] text-[#474238] border-t border-[#DCCBB0] pt-1">
                  <strong>Visa:</strong> {job.visaStatus}
                </div>
              </div>

              {/* Key Requirements Checklist */}
              <div className="space-y-2 mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#201E1D]">
                  Qualifications:
                </div>
                {job.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#474238] leading-tight">
                    <CheckCircle size={14} className="text-[#C67139] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Referral Note & Apply Action */}
            <div className="pt-4 border-t border-[#DCCBB0]">
              {job.referralNote && (
                <p className="text-[11px] text-[#8C5A34] italic mb-3">
                  ★ {job.referralNote}
                </p>
              )}

              <button
                onClick={() => navigate('/signin')}
                className="w-full py-2.5 bg-[#C67139] hover:bg-[#B5632E] text-[#F9F4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Apply / Member Referral</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
