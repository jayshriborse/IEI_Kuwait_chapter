import React from 'react';
import { MapPin, Phone, Mail, Clock, Building } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#EBDDC5]/60 border border-[#DCCBB0] rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Office Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310]">
              <MapPin size={13} className="text-[#C67139]" />
              <span>CHAPTER OFFICE LOCATION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D]">
              Get in Touch with IEI Kuwait
            </h2>

            <p className="text-sm text-[#605C55] leading-relaxed">
              The IEI Kuwait Chapter functions from the Kuwait Society of Engineers premises. For membership inquiries, event registrations, or technical collaboration, reach out through the official coordinates below.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 text-xs sm:text-sm text-[#474238]">
                <Building className="text-[#C67139] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="text-[#201E1D] block">Physical Office:</strong>
                  Kuwait Society of Engineers (KSE), Soor Street, Bneid Al Qar, State of Kuwait
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs sm:text-sm text-[#474238]">
                <Phone className="text-[#C67139] shrink-0" size={18} />
                <div>
                  <strong className="text-[#201E1D]">Chapter Helpline:</strong>{' '}
                  <span className="font-mono font-semibold">+965 90098667</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs sm:text-sm text-[#474238]">
                <Mail className="text-[#C67139] shrink-0" size={18} />
                <div>
                  <strong className="text-[#201E1D]">Official Email:</strong>{' '}
                  <a href="mailto:ieikwt@hotmail.com" className="hover:text-[#C67139] underline font-semibold">
                    ieikwt@hotmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs sm:text-sm text-[#474238]">
                <Clock className="text-[#C67139] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="text-[#201E1D] block">Office Timings:</strong>
                  Sundays to Thursdays · 17:30 to 20:30 (KWT)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Office Card & Map Note */}
          <div className="lg:col-span-6 bg-[#F5EAD8] border border-[#DCCBB0] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#201E1D] mb-2">
                Kuwait Society of Engineers Collaboration
              </h3>
              <p className="text-xs text-[#605C55] leading-relaxed mb-6">
                Under the bilateral protocol, all accredited technical seminars and engineering symposiums are hosted at the KSE Auditorium and Conference Halls.
              </p>

              <div className="bg-[#F9F4ED] border border-[#DCCBB0] rounded-xl p-4 space-y-2 text-xs">
                <div className="font-semibold text-[#402310] flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#C67139]" />
                  <span>KSE Auditorium Coordinates</span>
                </div>
                <p className="text-[#605C55]">
                  Arabian Gulf Street intersection with Soor St, opposite Dasman Complex, Kuwait City.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCCBB0] text-xs text-[#8C5A34]">
              ★ Registered members enjoy complimentary access to KSE technical library resources during seminars.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
