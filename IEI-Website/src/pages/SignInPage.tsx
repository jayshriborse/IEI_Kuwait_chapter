import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { brand } from '../theme/brand';
import { publicContent } from '../api/content';
import { matchMember, type MatchedMember } from '../api/auth';
import { Footer } from '../components/Footer';

export function SignInPage() {
  const navigate = useNavigate();
  const memberIdInputId = useId();
  const mobileInputId = useId();

  const [memberId, setMemberId] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('id') || '';
    }
    return '';
  });
  const [mobile, setMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('mobile') || '';
    }
    return '';
  });

  // Sourced dev content
  const content = publicContent.signin;
  const { card } = content;

  // Real-time member matching logic
  const matchedRecord: MatchedMember | null = matchMember(memberId, mobile);

  return (
    <div className="min-h-screen w-full bg-[#402310] text-[#F9F4ED] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#BE7F54] selection:text-[#F9F4ED]">
      {/* Fixed Background Image with lightened, subtle dark brown overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src="/signin-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center scale-105 opacity-80"
        />
        {/* Subtle Brand Overlay ensuring image visibility and text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#241206]/85 via-[#2D160A]/65 to-[#241206]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#200E04]/90 via-transparent to-[#200E04]/60" />
      </div>

      {/* Subtle decorative ambient circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-80 sm:w-96 md:w-[520px] h-80 sm:h-96 md:h-[520px] rounded-full bg-[#5D3011]/25 blur-3xl z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-32 -translate-y-1/2 w-96 sm:w-[480px] md:w-[600px] h-96 sm:h-[480px] md:h-[600px] rounded-full bg-[#2E2A18]/30 blur-3xl z-0"
      />

      {/* Top Heritage Notification Strip - Exact mobile dark chocolate palette */}
      <div className="relative z-20 bg-[#2D160A] text-[#D8CEC3] border-b border-[#5D3011]/50 py-1.5 px-4 text-center text-[11px] sm:text-xs font-sans tracking-wide flex items-center justify-center gap-2">
        <span className="font-bold text-[#FFC6A5]">ROYAL CHARTER 1935</span>
        <span className="text-[#8B634A]">·</span>
        <span>The Institution of Engineers (India) · Kuwait Chapter (Est. 1995)</span>
        <span className="text-[#8B634A] hidden md:inline">·</span>
        <span className="text-[#D8CEC3]/90 hidden md:inline">In Coordination with Kuwait Society of Engineers</span>
      </div>

      {/* Top Header - Mobile theme: bg #402310, border #5D3011, text #F9F4ED & #FFC6A5 */}
      <header className="relative z-20 w-full border-b border-[#5D3011] bg-[#402310] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FFFFFF] p-1 flex items-center justify-center shadow-md shrink-0">
              <img
                src={brand.sealSrc}
                alt={brand.sealAlt}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span
                className="text-lg sm:text-xl md:text-2xl text-[#F9F4ED] tracking-normal leading-tight"
                style={{ fontFamily: 'var(--font-blackletter)' }}
              >
                {brand.fullName}
              </span>
              <span className="font-sans font-semibold text-xs sm:text-sm text-[#FFC6A5] tracking-wider uppercase">
                {brand.chapter} · Overseas Chapter
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full-Height Split Hero */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12 lg:pb-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: EST badge, heading, description, stats */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in-rise text-left pr-0 lg:pr-4">
            {/* EST Badge */}
            <div className="inline-flex items-center gap-2 font-sans font-bold text-xs sm:text-sm tracking-[0.15em] text-[#FFC6A5] uppercase">
              {content.badge}
            </div>

            {/* Heading */}
            <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.12] tracking-tight text-[#F9F4ED]">
              Engineering,<br />
              professionally
            </h1>

            {/* Paragraph */}
            <p className="font-sans text-sm sm:text-base lg:text-lg text-[#D8CEC3] leading-relaxed max-w-lg">
              {content.paragraph}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-start gap-6 sm:gap-9 pt-3 sm:pt-4 border-t border-[#BE7F54]/20">
              {content.stats.map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#FFC6A5] leading-none">
                    {stat.number}
                  </div>
                  <div className="font-sans font-bold text-[10px] sm:text-xs tracking-wider text-[#8B634A] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Frosted-glass rounded login card */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end animate-fade-in-rise">
            <div className="w-full max-w-[330px] sm:max-w-[350px] bg-[#402310]/50 backdrop-blur-xl border border-[#BE7F54]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/50 ring-1 ring-white/10 space-y-3">
              
              {/* Card Header: Seal + Title + Subtitle */}
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 mx-auto">
                  <img
                    src={brand.sealSrc}
                    alt={brand.sealAlt}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <h2 className="font-display font-black text-lg sm:text-xl text-[#F9F4ED] tracking-tight">
                  {card.heading}
                </h2>
                <p className="font-sans text-[11.5px] text-[#D8CEC3] leading-snug">
                  {card.text}
                </p>
              </div>

              {/* Card Form */}
              <div className="space-y-2.5 pt-0.5">
                {/* Field: Member ID */}
                <div className="space-y-1 text-left">
                  <label
                    htmlFor={memberIdInputId}
                    className="block font-sans font-bold text-[10.5px] uppercase tracking-wider text-[#FFC6A5]"
                  >
                    {card.memberIdLabel}
                  </label>
                  <input
                    id={memberIdInputId}
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder={card.memberIdPlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 text-[#F9F4ED] font-sans text-xs sm:text-sm font-medium placeholder-[#D8CEC3]/50 border border-white/15 focus:border-[#BE7F54] focus:outline-none focus:ring-2 focus:ring-[#C67139]/50 shadow-inner backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {/* Field: Registered mobile */}
                <div className="space-y-1 text-left">
                  <label
                    htmlFor={mobileInputId}
                    className="block font-sans font-bold text-[10.5px] uppercase tracking-wider text-[#FFC6A5]"
                  >
                    {card.mobileLabel}
                  </label>
                  <input
                    id={mobileInputId}
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder={card.mobilePlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 text-[#F9F4ED] font-sans text-xs sm:text-sm font-medium placeholder-[#D8CEC3]/50 border border-white/15 focus:border-[#BE7F54] focus:outline-none focus:ring-2 focus:ring-[#C67139]/50 shadow-inner backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {/* Matched Member Green Box */}
                {matchedRecord && (
                  <div
                    role="status"
                    className="p-2.5 rounded-xl bg-[#E1EECC] border border-[#D0E2B4] text-[#272E1B] flex items-start gap-2 animate-fade-in-rise shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#272E1B] shrink-0 mt-0.5" />
                    <div className="font-sans text-[11px] leading-snug">
                      <span>Matched: </span>
                      <strong className="font-bold">{matchedRecord.name}</strong>
                      <span>
                        {' '}· {matchedRecord.grade} · {matchedRecord.branch} · member since {matchedRecord.memberSince}
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Action Button: Continue to the app */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="w-full py-2 px-4 rounded-full bg-[#C67139] hover:bg-[#b5632e] active:scale-[0.98] text-[#F9F4ED] font-display font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#402310]"
                  >
                    {card.continueButton}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-1.5">
                  <div className="flex-1 h-px bg-[#FFC6A5]/25" />
                  <span className="font-sans font-semibold text-[10px] text-[#D8CEC3] uppercase tracking-widest">
                    {card.orDivider}
                  </span>
                  <div className="flex-1 h-px bg-[#FFC6A5]/25" />
                </div>

                {/* Secondary Pill Button: Browse as a guest */}
                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/public')}
                    className="w-full py-2 px-4 rounded-full border-2 border-[#BE7F54] hover:border-[#FFC6A5] bg-[#BE7F54]/10 hover:bg-[#BE7F54]/20 active:scale-[0.98] text-[#FFC6A5] hover:text-[#ffd6be] font-display font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5]"
                  >
                    {card.guestButton}
                  </button>
                </div>

                {/* Small Line Footer */}
                <div className="pt-0.5 text-center font-sans text-[11px] text-[#D8CEC3]">
                  {card.notMemberPrompt}{' '}
                  <a
                    href="#apply"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="font-bold text-[#FFC6A5] underline hover:text-[#ffd6be] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC6A5] transition-colors"
                  >
                    {card.applyLink}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SignInPage;
