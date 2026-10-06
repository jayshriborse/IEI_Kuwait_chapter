import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  CreditCard,
  Users,
  User,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Gallery', path: '/gallery', icon: ImageIcon },
  { name: 'Card', path: '/card', icon: CreditCard },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Me', path: '/profile', icon: User },
];

export function ResponsiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // If user is on Sign In (/) or Find Record (/find-record), render full-page without the 7-item navigation shell
  const isAuthPage = location.pathname === '/' || location.pathname === '/find-record';

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-[#402310] text-[#F9F4ED]">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EAD8] text-[#201E1D] flex flex-col md:flex-row">
      {/* Desktop/Laptop Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#643312] text-[#F9F4ED] shrink-0 border-r border-[#50280D] min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Sidebar Header with Seal & Title */}
        <div
          className="p-6 border-b border-[#50280D] flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <img
            src="/iei-seal.png"
            alt="IEI Seal"
            className="w-12 h-12 rounded-full bg-white/10 p-0.5 object-contain shrink-0"
          />
          <div>
            <span className="block font-sans font-bold text-[10px] uppercase tracking-widest text-[#FFC6A5]">
              EST. 1995 · KUWAIT
            </span>
            <span className="block font-display font-black text-base text-[#F9F4ED] leading-tight">
              IEI Kuwait
            </span>
          </div>
        </div>

        {/* 7 Sidebar Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive: active }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-sans text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[#C67139] text-[#F9F4ED] shadow-sm font-bold translate-x-1'
                      : 'text-[#D8CEC3] hover:bg-white/5 hover:text-[#FFC6A5]'
                  }`
                }
              >
                <Icon size={20} className={isActive ? 'text-[#F9F4ED]' : 'text-[#D8CEC3]'} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile / Institution Tag */}
        <div className="p-5 border-t border-[#50280D] bg-[#53280B]">
          <p className="font-sans text-xs text-[#D8CEC3] leading-relaxed">
            The Institution of Engineers (India) · Kuwait Chapter
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Centered Page Content Container (max-width ~1200px) */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Phone / Mobile Bottom Tab Bar (Fixed at Bottom) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EEE7DB] border-t border-[#E4DBD0] px-2 py-1.5 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
          aria-label="Mobile Bottom Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                  isActive ? 'text-[#C67139]' : 'text-[#8A8075] hover:text-[#5D3011]'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#C67139]' : 'text-[#8A8075]'} />
                <span
                  className={`text-[10.5px] mt-1 font-sans ${
                    isActive ? 'font-bold text-[#C67139]' : 'font-medium text-[#8A8075]'
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
