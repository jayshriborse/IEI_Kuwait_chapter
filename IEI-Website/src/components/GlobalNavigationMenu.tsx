import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  action?: () => void;
  badge?: number;
  isNotification?: boolean;
}

interface GlobalNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalNavigationMenu: React.FC<GlobalNavigationMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll on very small screens when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Engineer!';
    if (hour < 17) return 'Good Afternoon, Engineer!';
    return 'Good Evening, Engineer!';
  };

  const handleNavigate = (href?: string, action?: () => void) => {
    onClose();
    if (action) {
      action();
    } else if (href) {
      if (href.startsWith('#')) {
        if (location.pathname !== '/' && location.pathname !== '/public') {
          navigate('/' + href);
        } else {
          const el = document.querySelector(href);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } else {
        navigate(href);
      }
    }
  };

  // Chapter navigation items (using actual IEI routes & pages without artificial boxes)
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '#top',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      badge: 7,
      isNotification: true,
      action: () => navigate('/signin'),
    },
    {
      id: 'card',
      label: 'Digital Member Card',
      action: () => navigate('/signin'),
    },
    {
      id: 'renew',
      label: 'Annual Dues Renewal',
      action: () => navigate('/signin'),
    },
    {
      id: 'profile',
      label: 'Member Profile',
      action: () => navigate('/signin'),
    },
    {
      id: 'contact',
      label: 'Contact Us',
      href: '#contact',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100]"
      aria-modal="true"
      role="dialog"
      aria-label="Navigation Menu"
    >
      {/* Backdrop for outside click */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Styled Dropdown Panel matching reference layout - Fits entirely without scroll */}
      <div
        ref={panelRef}
        className="fixed top-16 sm:top-18 right-3 sm:right-6 lg:right-10 z-[101] w-[calc(100vw-24px)] max-w-[275px] sm:max-w-[295px] rounded-[24px] sm:rounded-[26px] bg-[#221107]/95 backdrop-blur-2xl border border-white/10 ring-1 ring-black/40 shadow-2xl shadow-black/90 p-3 sm:p-3.5 flex flex-col overflow-hidden animate-menu-enter"
      >
        {/* Top Header Row: Greeting */}
        <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-white/10">
          <span className="font-semibold text-sm sm:text-[14.5px] text-[#F9F4ED] tracking-tight">
            {getGreeting()}
          </span>
        </div>

        {/* Clean Menu Items List - Fits all items without scroll */}
        <div className="py-1 flex flex-col space-y-0.5">
          {menuItems.map((item) => {
            const isActive =
              (item.href && item.href.startsWith('/') && location.pathname === item.href) ||
              (item.id === 'home' && (location.pathname === '/' || location.pathname === '/public'));

            if (item.isNotification) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.href, item.action)}
                  className="w-full text-left py-1.5 px-2.5 rounded-lg flex items-center justify-between text-[#D8CEC3] hover:text-[#F9F4ED] hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-medium text-[13px] sm:text-[13.5px]">
                    <Bell size={15} className="text-[#D8CEC3] group-hover:text-[#F9F4ED] transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="w-4.5 h-4.5 rounded-full bg-[#E04F36] text-[#FFFFFF] font-bold text-[10.5px] flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.href, item.action)}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] sm:text-[13.5px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#FFC6A5] font-semibold bg-white/5'
                    : 'text-[#D8CEC3] hover:text-[#F9F4ED] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Bottom Divider & Sign Out Button Only */}
        <div className="pt-1.5 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              navigate('/signin');
            }}
            className="w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] sm:text-[13.5px] font-bold text-[#FF5A5A] hover:text-[#FF7A7A] hover:bg-white/5 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
