import { publicContent } from '../api/content';
import { AppleIcon } from './icons';

function GooglePlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
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
  );
}

export function Footer() {
  const {
    chapterOfficeHeading,
    chapterOfficeText,
    contactHeading,
    contactLine,
    getTheAppHeading,
    storeLinks,
  } = publicContent.footer;

  const renderBadge = (
    type: 'google-play' | 'app-store',
    url: string | null
  ) => {
    const isGoogle = type === 'google-play';
    const altText = isGoogle ? 'Get it on Google Play' : 'Download on the App Store';

    const badgeContent = (
      <div className="bg-black/95 hover:bg-black border border-white/20 hover:border-white/40 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-2.5 shadow-md select-none transition-all duration-200">
        {isGoogle ? (
          <GooglePlayIcon size={22} />
        ) : (
          <AppleIcon size={22} color="#FFFFFF" className="shrink-0" />
        )}
        <div className="text-left leading-none">
          <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-300 font-sans font-medium mb-0.5">
            {isGoogle ? 'GET IT ON' : 'Download on the'}
          </span>
          <span className="block text-xs sm:text-sm font-sans font-bold text-white tracking-tight">
            {isGoogle ? 'Google Play' : 'App Store'}
          </span>
        </div>
      </div>
    );

    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={altText}
          className="inline-block transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] rounded-lg"
        >
          {badgeContent}
        </a>
      );
    }

    return (
      <div
        tabIndex={-1}
        className="inline-block transition-transform duration-200 hover:-translate-y-0.5 cursor-default"
      >
        {badgeContent}
      </div>
    );
  };

  return (
    <footer
      id="footer"
      className="relative z-20 w-full bg-[#341B0B] text-[#F9F4ED] pt-10 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Two Columns: Tablet & Desktop 2 cols, Phone 1 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-left">
          
          {/* Column 1: Chapter Office */}
          <div>
            <h3 className="font-sans font-bold text-sm sm:text-base text-[#FFC6A5] uppercase tracking-wider mb-2">
              {chapterOfficeHeading}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#F9F4ED] leading-relaxed">
              {chapterOfficeText}
            </p>
          </div>

          {/* Column 2: Contact & Get the App */}
          <div className="space-y-5">
            <div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-[#FFC6A5] uppercase tracking-wider mb-2">
                {contactHeading}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#F9F4ED] leading-relaxed">
                {contactLine}
              </p>
            </div>

            {/* Inside same column: Get the App */}
            <div className="pt-1">
              <h4 className="font-sans font-bold text-sm sm:text-base text-[#F9F4ED] mb-3">
                {getTheAppHeading}
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                {renderBadge('google-play', storeLinks.googlePlay)}
                {renderBadge('app-store', storeLinks.appStore)}
              </div>
            </div>
          </div>

        </div>

        {/* Thin divider line at the bottom */}
        <div className="border-b border-[#BE7F54]/20 mt-10 sm:mt-12 w-full" />
      </div>
    </footer>
  );
}

export default Footer;
