import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, Calendar, Briefcase, Users, Phone } from 'lucide-react';
import sealLogo from '../assets/logo/iei-seal.png';
import { GlobalNavigationMenu } from './GlobalNavigationMenu';

export const Navbar: React.FC = () => {
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  // Track scroll position and direction with requestAnimationFrame for smooth 60fps performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          // Only update direction if movement is meaningful (prevents jitter)
          if (Math.abs(diff) > 5) {
            setScrollDirection(diff > 0 ? 'down' : 'up');
            lastScrollY = Math.max(0, currentScrollY);
          }

          setScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAtTop = scrollY <= 25;
  const isScrolled = !isAtTop;
  const isScrollingDown = isScrolled && scrollDirection === 'down';

  const navLinks = [
    { label: 'About', href: '#about', icon: Shield },
    { label: 'Programmes & Events', href: '#events', icon: Calendar },
    { label: 'Engineering Careers', href: '#careers', icon: Briefcase },
    { label: 'Community', href: '#community', icon: Users },
    { label: 'Contact', href: '#contact', icon: Phone },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300 ease-out">
        {/* Outer Floating Wrapper: Spacing & constraints adapt smoothly between top & scrolled */}
        <div
          className={`w-full transition-all duration-300 ease-out ${
            isScrolled
              ? 'py-2 sm:py-3.5 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto'
              : 'p-0 max-w-full'
          }`}
        >
          {/* Inner Glass/Mirror Nav Shell */}
          <div
            className={`relative transition-all duration-300 ease-out flex items-center justify-between ${
              isScrolled
                ? isScrollingDown
                  ? 'h-14 sm:h-15 px-3.5 sm:px-6 rounded-2xl sm:rounded-full bg-[#402310]/85 backdrop-blur-xl backdrop-saturate-150 border border-[#BE7F54]/30 ring-1 ring-white/10 shadow-2xl shadow-black/45'
                  : 'h-15 sm:h-16 px-4 sm:px-7 rounded-2xl sm:rounded-full bg-[#402310]/95 backdrop-blur-2xl backdrop-saturate-150 border border-[#BE7F54]/40 ring-1 ring-[#FFC6A5]/25 shadow-2xl shadow-black/55 scale-[1.005]'
                : 'h-20 px-4 sm:px-6 lg:px-8 bg-[#402310] border-b border-[#5D3011] shadow-md rounded-none'
            }`}
          >
            {/* Specular Mirror Top Edge Reflection (visible in glass state) */}
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFC6A5]/35 to-transparent pointer-events-none transition-opacity duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Brand & Seal: Scales smoothly between prominent & compact */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
              <div
                className={`rounded-full bg-[#FFFFFF] p-1 flex items-center justify-center shadow-md shrink-0 transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-12 h-12'
                }`}
              >
                <img
                  src={sealLogo}
                  alt="IEI Kuwait Chapter Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div
                  className={`text-[#F9F4ED] tracking-normal leading-tight group-hover:text-[#FFC6A5] transition-all duration-300 ${
                    isScrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                  }`}
                  style={{ fontFamily: 'var(--font-blackletter)' }}
                >
                  The Institution of Engineers (India)
                </div>
                <div
                  className={`uppercase tracking-widest font-semibold text-[#FFC6A5] transition-all duration-300 ${
                    isScrolled
                      ? 'text-[10px] hidden sm:block'
                      : 'text-xs'
                  }`}
                >
                  Kuwait Chapter · Overseas Chapter
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Nav links with Notification Icon, Profile Button, & 3-Line Menu */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`font-semibold text-[#D8CEC3] hover:text-[#FFC6A5] hover:bg-[#5D3011]/60 rounded-xl transition-all flex items-center gap-1.5 ${
                    isScrolled ? 'text-xs px-2.5 py-1.5' : 'text-xs xl:text-sm px-3 py-2'
                  }`}
                >
                  <span>{link.label}</span>
                </a>
              ))}

              {/* 3-Line Hamburger Menu Button (Desktop Top-Right) */}
              <button
                onClick={() => setGlobalMenuOpen(!globalMenuOpen)}
                className={`p-2 rounded-xl text-[#F9F4ED] hover:text-[#FFC6A5] hover:bg-[#5D3011] transition-all cursor-pointer ml-1 border border-transparent hover:border-[#BE7F54]/30 ${
                  globalMenuOpen ? 'bg-[#5D3011] text-[#FFC6A5]' : ''
                }`}
                title="Complete Website Navigation Menu"
                aria-label="Open 3-Line Navigation Menu"
              >
                {globalMenuOpen ? <X size={20} /> : <Menu size={20} strokeWidth={2.2} />}
              </button>
            </nav>

            {/* Mobile 3-Line Hamburger Menu Button (Top-Right) */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setGlobalMenuOpen(!globalMenuOpen)}
                className="p-1.5 sm:p-2 text-[#F9F4ED] hover:bg-[#5D3011] rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle Complete Navigation Menu"
              >
                {globalMenuOpen ? <X size={22} /> : <Menu size={22} strokeWidth={2.2} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global 3-Line Navigation Overlay Menu */}
      <GlobalNavigationMenu
        isOpen={globalMenuOpen}
        onClose={() => setGlobalMenuOpen(false)}
      />
    </>
  );
};
