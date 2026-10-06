import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  BookOpen,
  Sparkles,
  Briefcase,
  Layers,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/RoleBadge';
import { apiClient } from '../services/api-client';
import sealLogo from '../assets/iei-seal.png';

interface NavGroupItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: string[]; // If undefined, available to all EC officers
  badge?: string;
  children?: { label: string; path: string }[];
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await apiClient<{ unreadCount?: number }>('/me/notifications/unread-count');
        if (typeof res?.unreadCount === 'number') {
          setUnreadNotifications(res.unreadCount);
        }
      } catch {
        // Fallback or unauthenticated
      }
    }
    fetchUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      navigate(`/admin/members?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  const userPositions = user?.positions || [];
  const isChairman = userPositions.includes('CHAIRMAN');
  const isSecretary = userPositions.includes('GENERAL_SECRETARY');
  const isTreasurer = userPositions.includes('TREASURER');
  const isVolunteer = userPositions.includes('EC_VOLUNTEER');
  const isAdmin = user?.memberCode === 'IEI9000' || user?.memberCode === 'ADMIN' || isChairman;

  // Determine role-based access for nav items
  const canAccessMembers = isAdmin || isChairman || isSecretary || isTreasurer;
  const canAccessApplications = isAdmin || isChairman || isSecretary;
  const canAccessSubscriptions = isAdmin || isTreasurer;
  const canAccessRegisters = isAdmin || isChairman || isSecretary || isTreasurer;
  const canAccessJobs = isAdmin || isChairman || isSecretary;
  const canAccessContent = isAdmin || isChairman || isSecretary;
  const canAccessCommunication = isAdmin || isChairman || isSecretary;
  const canAccessReports = isAdmin || isChairman || isSecretary || isTreasurer;
  const canAccessSettings = isAdmin || isChairman || isSecretary || isTreasurer;

  const navGroups: NavGroupItem[] = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    ...(canAccessMembers
      ? [
          {
            label: 'Members',
            path: '/admin/members',
            icon: <Users size={18} />,
          },
        ]
      : []),
    ...(canAccessApplications
      ? [
          {
            label: 'Membership Applications',
            path: '/admin/membership-applications',
            icon: <FileCheck size={18} />,
            badge: isSecretary ? 'Review' : isChairman ? 'Approval' : undefined,
          },
        ]
      : []),
    ...(canAccessSubscriptions
      ? [
          {
            label: 'Subscriptions',
            path: '/admin/subscriptions',
            icon: <CreditCard size={18} />,
            badge: isTreasurer ? 'Treasurer' : undefined,
          },
        ]
      : []),
    {
      label: 'Events & Programmes',
      path: '/admin/events',
      icon: <Calendar size={18} />,
      badge: isVolunteer ? 'Door Desk' : undefined,
    },
    ...(canAccessRegisters
      ? [
          {
            label: 'Registers',
            path: '/admin/registers',
            icon: <BookOpen size={18} />,
          },
        ]
      : []),
    {
      label: 'Wings',
      path: '/admin/wings',
      icon: <Sparkles size={18} />,
    },
    ...(canAccessJobs
      ? [
          {
            label: 'Jobs & Vacancies',
            path: '/admin/jobs',
            icon: <Briefcase size={18} />,
          },
        ]
      : []),
    ...(canAccessContent
      ? [
          {
            label: 'Content',
            path: '/admin/content',
            icon: <Layers size={18} />,
          },
        ]
      : []),
    ...(canAccessCommunication
      ? [
          {
            label: 'Communication',
            path: '/admin/communication/notifications',
            icon: <Send size={18} />,
          },
        ]
      : []),
    ...(canAccessReports
      ? [
          {
            label: 'Reports',
            path: '/admin/reports',
            icon: <BarChart3 size={18} />,
          },
        ]
      : []),
    ...(canAccessSettings
      ? [
          {
            label: 'Settings',
            path: '/admin/settings',
            icon: <Settings size={18} />,
          },
        ]
      : []),
  ];

  // Generate breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`;
    const formatted = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { name: formatted, url, isLast: index === pathParts.length - 1 };
  });

  return (
    <div className="flex h-screen bg-[#F5EAD8] overflow-hidden text-[#201E1D]">
      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#212A14] text-[#F9F4ED] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#384723] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={sealLogo}
              alt="IEI Seal"
              className="w-10 h-10 object-contain drop-shadow shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-sm tracking-wide text-[#F9F4ED] leading-tight truncate">
                  IEI KUWAIT
                </h1>
                <p className="text-[10px] uppercase tracking-wider text-[#A9B890] font-sans font-medium">
                  Chapter Admin Portal
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 text-[#A9B890] hover:text-white rounded-lg hover:bg-[#2A3619] transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse to icons'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-[#A9B890] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Current Officer Info Strip */}
        {user && !sidebarCollapsed && (
          <div className="px-4 py-3.5 border-b border-[#384723]/70 bg-[#1A2210]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#384723] flex items-center justify-center font-serif font-bold text-[#F9F4ED] text-xs shrink-0 border border-[#4C6030]">
                {user.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F9F4ED] truncate">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-[#A9B890] truncate font-mono">
                  {user.memberCode} · {user.grade}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1">
              {user.positions && user.positions.length > 0 ? (
                user.positions.map((pos) => (
                  <RoleBadge key={pos} position={pos} size="sm" />
                ))
              ) : (
                <span className="text-[9.5px] uppercase tracking-wider text-[#A9B890] bg-[#2E3B1C] px-2 py-0.5 rounded border border-[#384723]">
                  {user.role || 'Member'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-[#7E8F66] font-bold">
              Chapter Administration
            </div>
          )}

          {navGroups.map((item) => {
            const isCurrent =
              item.path === '/admin/dashboard'
                ? location.pathname === '/admin/dashboard' || location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[#2E3B1C] text-[#F9F4ED] font-semibold shadow-inner border border-[#44582A]'
                    : 'text-[#C5D1B5] hover:bg-[#2A3619] hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isCurrent ? 'text-[#C67139]' : 'text-current'}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                      isCurrent
                        ? 'bg-[#1D2612] text-[#F9F4ED]'
                        : 'bg-[#1A2210] text-[#A9B890]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-3 border-t border-[#384723] bg-[#1B2310]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#FFC6A5] bg-[#3B2519] hover:bg-[#4D3020] transition-colors border border-[#5C3925] cursor-pointer"
            title="Sign out session"
          >
            <LogOut size={14} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main App Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-[#FFFDF9] border-b border-[#E2D5C0] px-4 lg:px-8 flex items-center justify-between shrink-0 shadow-xs z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#201E1D] hover:bg-[#EFE4D0] rounded-lg cursor-pointer"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-[#686055]">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.url}>
                  {index > 0 && <span>/</span>}
                  {item.isLast ? (
                    <span className="font-semibold text-[#201E1D]">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      to={item.url}
                      className="hover:text-[#273318] transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-3">
            {/* Global Search Input */}
            <form onSubmit={handleGlobalSearch} className="hidden md:block w-56 lg:w-72">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[#8A7F73] pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search members, IDs, phone..."
                  className="w-full bg-[#F5EAD8]/50 border border-[#E2D5C0] text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#273318]"
                />
              </div>
            </form>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/admin/communication/notifications')}
              className="relative p-2 text-[#686055] hover:text-[#201E1D] hover:bg-[#EFE4D0] rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C62828] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-[#EFE4D0] rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#273318] text-[#F9F4ED] flex items-center justify-center font-serif text-xs font-bold shrink-0">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-[#201E1D] leading-tight">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-[#686055] font-mono">
                      {user.positions[0] || 'Member'}
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#8A7F73] hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl shadow-xl py-2 z-50 divide-y divide-[#EFE4D0]">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-[#201E1D]">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-[#8A7F73] font-mono">
                        {user.memberCode}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#201E1D] hover:bg-[#F5EAD8] transition-colors"
                      >
                        <User size={14} className="text-[#686055]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#201E1D] hover:bg-[#F5EAD8] transition-colors"
                      >
                        <Settings size={14} className="text-[#686055]" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#C62828] hover:bg-[#FFEBEE] transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F5EAD8]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
