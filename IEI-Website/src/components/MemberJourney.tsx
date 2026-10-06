import { useState } from 'react';
import { ScreenImage } from './ScreenImage';
import { publicContent } from '../api/content';

export function MemberJourney() {
  const { heading, steps } = publicContent.journey;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  return (
    <section
      aria-label="The Member Journey"
      className="w-full bg-[#402310] text-[#F9F4ED] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-[#5D3011]"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#F9F4ED] tracking-tight mb-12 sm:mb-16 text-center md:text-left">
          {heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          {/* Left: 5 Numbered Steps joined by a line */}
          <div className="md:col-span-6 relative">
            {/* Vertical Line joining circles */}
            <div
              aria-hidden="true"
              className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#BE7F54]/30 -z-0 hidden sm:block"
            />

            <div className="space-y-4 sm:space-y-6 relative z-10">
              {steps.map((step, idx) => {
                const isActive = activeStepIndex === idx;

                return (
                  <div
                    key={step.number}
                    onClick={() => setActiveStepIndex(idx)}
                    tabIndex={0}
                    role="button"
                    aria-selected={isActive}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveStepIndex(idx);
                      }
                    }}
                    className={`flex items-center gap-4 sm:gap-5 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] ${
                      isActive
                        ? 'bg-[#5D3011] border border-[#BE7F54]/40 shadow-md translate-x-1 sm:translate-x-2'
                        : 'hover:bg-white/5 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* Numbered Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#C67139] text-[#F9F4ED] shadow-sm'
                          : 'bg-[#2E2A18] text-[#D8CEC3] border border-[#BE7F54]/30'
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`font-display font-black text-lg sm:text-xl tracking-tight transition-colors ${
                        isActive ? 'text-[#FFC6A5]' : 'text-[#F9F4ED]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Matching Screenshot Preview */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-[260px] sm:w-[290px] md:w-[320px] rounded-[38px] p-3.5 bg-[#201E1D] border-4 border-[#5D3011]/80 shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-fade-in-rise">
              <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#402310]">
                <ScreenImage
                  key={activeStep.screenshotKey}
                  screenKey={activeStep.screenshotKey}
                  fallbackText={activeStep.label}
                  alt={`${activeStep.label} Screen`}
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

export default MemberJourney;
