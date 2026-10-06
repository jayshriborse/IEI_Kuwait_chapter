import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { brand } from '../theme/brand';
import { publicContent } from '../api/content';

export function PillHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { nameLine1, nameLine2, menuLinks, applyButtonText } = publicContent.header;

  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6 md:px-8 w-full">
      <div className="max-w-[1200px] mx-auto">
        {/* Floating Pill Container with soft blur */}
        <div className="bg-[#402310]/90 backdrop-blur-md border border-[#BE7F54]/30 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-xl flex items-center justify-between gap-4 transition-all duration-200">
          {/* Logo + Two-line Name */}
          <a
            href="#hero"
            className="flex items-center gap-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] rounded-full p-0.5"
          >
            <img
              src={brand.sealSrc}
              alt={brand.sealAlt}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 filter drop-shadow"
            />
            <div className="text-left">
              <span className="block font-display font-black text-xs sm:text-sm text-[#F9F4ED] leading-tight">
                {nameLine1}
              </span>
              <span className="block font-sans font-semibold text-[11px] sm:text-xs text-[#FFC6A5] leading-tight">
                {nameLine2}
              </span>
            </div>
          </a>

          {/* Desktop/Tablet Centered Menu Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 font-sans text-xs lg:text-sm font-semibold text-[#D8CEC3]">
            {menuLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 rounded-full hover:text-[#FFC6A5] hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <a
              href="#hero"
              className="hidden sm:inline-flex items-center justify-center bg-[#C67139] hover:bg-[#b5632e] text-[#F9F4ED] font-display font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5]"
            >
              {applyButtonText}
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-[#D8CEC3] hover:text-[#FFC6A5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] rounded-full"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-[#402310]/95 backdrop-blur-md border border-[#BE7F54]/30 rounded-3xl p-4 shadow-2xl space-y-2 animate-fade-in-rise">
            <nav className="flex flex-col space-y-1 font-sans text-sm font-semibold text-[#D8CEC3]">
              {menuLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl hover:text-[#FFC6A5] hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 border-t border-[#BE7F54]/20">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center bg-[#C67139] hover:bg-[#b5632e] text-[#F9F4ED] font-display font-black text-sm px-5 py-3 rounded-full shadow-md transition-all text-center"
              >
                {applyButtonText}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default PillHeader;
