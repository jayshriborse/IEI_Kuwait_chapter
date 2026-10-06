import { AppleIcon } from './icons';

export function StoreButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* App Store Button - Upcoming */}
      <div
        className="relative group bg-black/90 hover:bg-black border border-white/20 hover:border-[#FFC6A5]/50 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 select-none cursor-default"
        title="App Store - Upcoming"
      >
        <AppleIcon size={24} color="#FFFFFF" className="shrink-0" />
        <div className="text-left">
          <span className="block text-[9px] uppercase tracking-wider text-gray-300 font-sans leading-none">
            Upcoming on
          </span>
          <span className="block text-sm font-sans font-bold text-white leading-tight">
            App Store
          </span>
        </div>
        <span className="absolute -top-2 -right-2 bg-[#C67139] text-[#F9F4ED] text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full border border-black shadow">
          Upcoming
        </span>
      </div>

      {/* Google Play Button - Upcoming */}
      <div
        className="relative group bg-black/90 hover:bg-black border border-white/20 hover:border-[#FFC6A5]/50 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 select-none cursor-default"
        title="Google Play - Upcoming"
      >
        <div className="shrink-0">
          <svg width={22} height={22} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M3.6 1.4c-.2.2-.4.6-.4 1.1v19c0 .5.2.9.4 1.1l10.3-10.6L3.6 1.4z"
            />
            <path
              fill="#FBBC05"
              d="M17.4 8.7L13.9 12l3.5 3.3 4.1-2.3c1.2-.7 1.2-1.8 0-2.5l-4.1-1.8z"
            />
            <path
              fill="#EA4335"
              d="M13.9 12L3.6 22.6c.4.4 1 .4 1.7 0l12.1-6.9-3.5-3.7z"
            />
            <path
              fill="#34A853"
              d="M13.9 12l3.5-3.3L5.3 1.8c-.7-.4-1.3-.4-1.7 0L13.9 12z"
            />
          </svg>
        </div>
        <div className="text-left">
          <span className="block text-[9px] uppercase tracking-wider text-gray-300 font-sans leading-none">
            Upcoming on
          </span>
          <span className="block text-sm font-sans font-bold text-white leading-tight">
            Google Play
          </span>
        </div>
        <span className="absolute -top-2 -right-2 bg-[#C67139] text-[#F9F4ED] text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full border border-black shadow">
          Upcoming
        </span>
      </div>
    </div>
  );
}

export default StoreButtons;
