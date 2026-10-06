import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROGRAMME_EVENTS, type ProgrammeEvent } from '../api/chapter-data';
import { Calendar, MapPin, Clock, User, ArrowUpRight, X } from 'lucide-react';

export const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<ProgrammeEvent | null>(null);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Open':
        return 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]';
      case 'Members':
        return 'bg-[#FFE1D0] text-[#8C5A34] border-[#E9DCC4]';
      case 'Family':
        return 'bg-[#F9F4ED] text-[#402310] border-[#DCCBB0]';
      default:
        return 'bg-[#EBDDC5] text-[#402310] border-[#DCCBB0]';
    }
  };

  return (
    <section id="events" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F5EAD8] border-y border-[#DCCBB0]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBDDC5] border border-[#DCCBB0] text-xs font-semibold uppercase tracking-wider text-[#402310] mb-2.5">
              <Calendar size={14} className="text-[#C67139]" />
              <span>CHAPTER CALENDAR 2026–27</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#201E1D]">
              Upcoming Programmes & Seminars
            </h2>
          </div>

          <button
            onClick={() => navigate('/signin')}
            className="text-xs font-bold uppercase tracking-wider text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Member RSVP Access</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Events Grid - Exact mobile eventCardBg: #EBDDC5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROGRAMME_EVENTS.map((event) => (
            <div
              key={event.id}
              className="bg-[#EBDDC5]/60 hover:bg-[#EBDDC5] border border-[#DCCBB0] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Date Badge matching mobile eventDateBadgeBg #CCDBB2 */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#CCDBB2] border border-[#B8CCA0] text-[#272E1B] rounded-2xl px-3.5 py-2 text-center min-w-[62px] shadow-xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#55683C]">
                        {event.month}
                      </div>
                      <div className="text-xl font-serif font-black leading-none text-[#272E1B]">
                        {event.day}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-sans font-medium text-[#675F53]">
                        {event.year}
                      </span>
                      {event.time && (
                        <div className="text-xs font-semibold text-[#201E1D] flex items-center gap-1">
                          <Clock size={12} className="text-[#C67139]" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(event.badge)}`}>
                    {event.badge} Access
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-xl text-[#201E1D] mb-2 leading-snug">
                  {event.title}
                </h3>

                {/* Location */}
                <div className="flex items-start gap-2 text-xs text-[#605C55] mb-3">
                  <MapPin size={15} className="text-[#C67139] shrink-0 mt-0.5" />
                  <span>{event.location}</span>
                </div>

                {/* Speaker */}
                {event.speaker && (
                  <div className="flex items-start gap-2 text-xs text-[#474238] font-medium mb-4 bg-[#F9F4ED] p-2.5 rounded-xl border border-[#DCCBB0]">
                    <User size={15} className="text-[#C67139] shrink-0 mt-0.5" />
                    <span>{event.speaker}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#474238] line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-[#DCCBB0] flex items-center justify-between">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="text-xs font-bold text-[#201E1D] hover:text-[#C67139] transition-colors cursor-pointer"
                >
                  View Full Details →
                </button>

                <button
                  onClick={() => navigate('/signin')}
                  className="px-4 py-2 bg-[#C67139] hover:bg-[#B5632E] text-[#F9F4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  RSVP / Attend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF4EA] border border-[#DCCBB0] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-1 text-[#675F53] hover:text-[#201E1D] rounded-full hover:bg-[#EBDDC5]"
            >
              <X size={20} />
            </button>

            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border mb-3 inline-block ${getBadgeStyle(selectedEvent.badge)}`}>
              {selectedEvent.badge} Registration
            </span>

            <h3 className="font-serif font-black text-2xl text-[#201E1D] mb-3">
              {selectedEvent.title}
            </h3>

            <div className="space-y-2 text-xs text-[#474238] mb-5 bg-[#F5EAD8] p-4 rounded-2xl border border-[#DCCBB0]">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#C67139]" />
                <span className="font-semibold">{selectedEvent.day} {selectedEvent.month} {selectedEvent.year}</span>
                {selectedEvent.time && <span>· {selectedEvent.time}</span>}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#C67139]" />
                <span>{selectedEvent.location}</span>
              </div>
              {selectedEvent.speaker && (
                <div className="flex items-center gap-2">
                  <User size={15} className="text-[#C67139]" />
                  <span>{selectedEvent.speaker}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-[#474238] leading-relaxed mb-6">
              {selectedEvent.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-3 bg-[#EBDDC5] hover:bg-[#DCCBB0] text-[#201E1D] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate('/signin');
                }}
                className="flex-1 py-3 bg-[#C67139] hover:bg-[#B5632E] text-[#F9F4ED] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Sign In to RSVP
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
