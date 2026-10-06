import { ScreenImage } from './ScreenImage';
import { publicContent } from '../api/content';

export function PrivacyBlock() {
  const { heading, text, screenshotKey } = publicContent.privacy;

  return (
    <section
      aria-label="Privacy and Consent"
      className="w-full bg-[#402310] text-[#F9F4ED] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-[#5D3011]"
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
        {/* Left Column: Heading and Text */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#F9F4ED] tracking-tight leading-tight">
            {heading}
          </h2>

          <p className="font-sans text-base sm:text-lg md:text-xl text-[#D8CEC3] leading-relaxed max-w-xl">
            {text}
          </p>
        </div>

        {/* Right Column: Screenshot of Community/Me screen */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="w-[240px] sm:w-[270px] md:w-[290px] rounded-[38px] p-3 bg-[#201E1D] border-4 border-[#5D3011]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#402310]">
              <ScreenImage
                screenKey={screenshotKey}
                fallbackText="Community / Me Screen"
                alt="Privacy & Consent Screen Preview"
                className="w-full h-auto object-cover rounded-[28px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacyBlock;
