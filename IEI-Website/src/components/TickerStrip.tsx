import { publicContent } from '../api/content';

export function TickerStrip() {
  const { tickerText } = publicContent;
  const items = tickerText.split(' · ');

  return (
    <div
      aria-label="Events and activities ticker"
      className="w-full bg-[#5D3011] text-[#F9F4ED] py-3 sm:py-4 overflow-hidden border-y border-[#BE7F54]/30 select-none"
    >
      <div className="animate-ticker flex items-center">
        {/* First repetition */}
        <div className="flex items-center gap-6 sm:gap-8 px-4 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase">
          {items.map((item, idx) => (
            <span key={`t1-${idx}`} className="flex items-center gap-6 sm:gap-8 shrink-0">
              <span className="text-[#F9F4ED] hover:text-[#FFC6A5] transition-colors">{item}</span>
              <span className="text-[#FFC6A5]/50">·</span>
            </span>
          ))}
        </div>

        {/* Second repetition for continuous seamless scroll */}
        <div className="flex items-center gap-6 sm:gap-8 px-4 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase" aria-hidden="true">
          {items.map((item, idx) => (
            <span key={`t2-${idx}`} className="flex items-center gap-6 sm:gap-8 shrink-0">
              <span className="text-[#F9F4ED] hover:text-[#FFC6A5] transition-colors">{item}</span>
              <span className="text-[#FFC6A5]/50">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TickerStrip;
