import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV_TABS } from '../config/nav';
import { brand } from '../theme/brand';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F5EAD8] text-[#201E1D] flex flex-col md:flex-row overflow-x-hidden">
      {/* 
        DESKTOP / LAPTOP (from lg: 1024px) & TABLET (md: 768px - 1023px) 
        Fixed Left Sidebar 
      */}
      <aside
        className="hidden md:flex flex-col md:w-20 lg:w-72 bg-[#402310] text-[#F9F4ED] border-r border-[#5D3011] fixed top-0 left-0 bottom-0 z-30 select-none overflow-y-auto"
        aria-label="Main Navigation"
      >
        {/* Seal + Name Block from src/theme/brand.ts */}
        <NavLink
          to="/"
          className="p-4 lg:p-6 border-b border-[#5D3011] flex flex-col lg:flex-row items-center lg:items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5]"
          title="Return to Public Home"
        >
          <img
            src={brand.sealSrc}
            alt={brand.sealAlt}
            className="w-11 h-11 lg:w-12 lg:h-12 object-contain shrink-0 filter drop-shadow"
          />
          <div className="hidden lg:block">
            <span className="block font-sans font-bold text-[10px] tracking-widest text-[#FFC6A5] uppercase">
              {brand.established}
            </span>
            <span className="block font-display font-black text-base text-[#F9F4ED] leading-tight">
              {brand.shortName}
            </span>
          </div>
        </NavLink>

        {/* The 7 Navigation Tabs as vertical list */}
        <nav className="flex-1 p-2.5 lg:p-4 space-y-1.5" aria-label="Sidebar Tabs">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                aria-current={isActive ? 'page' : undefined}
                className={({ isActive: active }) =>
                  `flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-1 lg:gap-3.5 px-2 lg:px-4 py-3 rounded-2xl font-sans text-xs lg:text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC6A5] ${
                    active
                      ? 'bg-[#5D3011] text-[#FFC6A5] shadow-sm font-bold'
                      : 'text-[#D8CEC3] hover:text-[#FFC6A5] hover:bg-[#5D3011]/40'
                  }`
                }
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className={isActive ? 'text-[#FFC6A5]' : 'text-[#D8CEC3]'}
                />
                <span className="truncate">{tab.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* 
        MAIN CONTENT AREA
        Offset by sidebar width on md/lg, full width with scroll
      */}
      <div className="flex-1 flex flex-col md:ml-20 lg:ml-72 min-w-0 min-h-screen">
        <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* 
          PHONE BOTTOM TAB BAR (fixed, cream background, 7 tabs, matching screenshot)
        */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EEE7DB] border-t border-[#E4DBD0] px-1 py-1.5 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
          aria-label="Mobile Navigation"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#C67139] transition-colors duration-150 ${
                  isActive ? 'text-[#C67139]' : 'text-[#8A8075]'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={isActive ? 'text-[#C67139]' : 'text-[#8A8075]'}
                />
                <span
                  className={`text-[10px] mt-1 tracking-tight font-sans ${
                    isActive ? 'font-bold text-[#C67139]' : 'font-medium text-[#8A8075]'
                  }`}
                >
                  {tab.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default AppLayout;
