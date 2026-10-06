import { useNavigate } from 'react-router-dom';
import { GoogleIcon, AppleIcon } from './icons';
import { Button } from './Button';
import { ScreenImage } from './ScreenImage';
import { StoreButtons } from './StoreButtons';
import { publicContent } from '../api/content';

export function Hero() {
  const navigate = useNavigate();
  const {
    pillLabel,
    heading,
    paragraph,
    stats,
    googleButtonText,
    appleButtonText,
    guestButtonText,
  } = publicContent.hero;

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative w-full pt-8 sm:pt-12 md:pt-14 pb-20 sm:pb-28 px-4 sm:px-6 md:px-8 overflow-hidden"
    >
      {/* Full-width rounded hero block */}
      <div className="relative max-w-[1200px] mx-auto bg-[#402310] border border-[#5D3011] rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl">
        {/* Soft decorative background circles from mobile Sign in screenshot */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-[300px] sm:w-[450px] md:w-[550px] h-[300px] sm:h-[450px] md:h-[550px] rounded-full bg-[#5D3011]/85 blur-[70px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 w-[300px] sm:w-[450px] md:w-[550px] h-[300px] sm:h-[450px] md:h-[550px] rounded-full bg-[#2E2A18]/90 blur-[80px]"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Pill label, Heading, Paragraph, Stats, Buttons */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 animate-fade-in-rise">
            {/* Small pill label */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#5D3011]/80 border border-[#BE7F54]/40 font-sans font-bold text-xs tracking-[0.14em] text-[#FFC6A5] uppercase">
              {pillLabel}
            </div>

            {/* Heading */}
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight text-[#F9F4ED] whitespace-pre-line">
              {heading}
            </h1>

            {/* Paragraph */}
            <p className="font-sans text-base sm:text-lg text-[#D8CEC3] leading-relaxed max-w-xl">
              {paragraph}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-start gap-8 sm:gap-12 pt-2 border-t border-[#5D3011]/60">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display font-black text-3xl sm:text-4xl text-[#FFC6A5] leading-none mb-1">
                    {stat.number}
                  </div>
                  <div className="font-sans font-bold text-[10.5px] sm:text-xs tracking-wider text-[#8B634A] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 max-w-md">
              <Button
                variant="google"
                size="md"
                onClick={() => navigate('/home')}
                aria-label={googleButtonText}
                className="w-full sm:w-auto"
              >
                <GoogleIcon size={20} />
                <span>{googleButtonText}</span>
              </Button>

              <Button
                variant="apple"
                size="md"
                onClick={() => navigate('/home')}
                aria-label={appleButtonText}
                className="w-full sm:w-auto"
              >
                <AppleIcon size={20} color="#F9F4ED" />
                <span>{appleButtonText}</span>
              </Button>
            </div>

            {/* Browse as a guest & Upcoming Store Badges */}
            <div className="pt-2 space-y-4">
              <div>
                <button
                  onClick={() => navigate('/home')}
                  className="font-display font-black text-sm sm:text-base text-[#FFC6A5] hover:text-[#ffd6be] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] rounded-lg px-2 py-1 transition-colors cursor-pointer"
                >
                  {guestButtonText}
                </button>
              </div>

              {/* Upcoming App Store & Google Play Download Buttons */}
              <div className="pt-1">
                <StoreButtons />
              </div>
            </div>
          </div>

          {/* Right Column: Phone Mockup showing IEI Home screenshot */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-[260px] sm:w-[280px] md:w-[300px] rounded-[38px] p-3 bg-[#201E1D] border-4 border-[#5D3011]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-300">
              <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#402310]">
                <ScreenImage
                  screenKey="home"
                  fallbackText="IEI Home Screen"
                  alt="IEI Mobile Home Screen"
                  className="w-full h-auto object-cover rounded-[28px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
