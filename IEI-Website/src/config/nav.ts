import type { LucideIcon } from 'lucide-react';
import {
  House,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  IdCard,
  Users,
  User,
} from 'lucide-react';

export interface NavTabItem {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTabItem[] = [
  {
    id: 'home',
    name: 'Home',
    path: '/home',
    icon: House,
  },
  {
    id: 'events',
    name: 'Events',
    path: '/events',
    icon: Calendar,
  },
  {
    id: 'jobs',
    name: 'Jobs',
    path: '/jobs',
    icon: Briefcase,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    path: '/gallery',
    icon: ImageIcon,
  },
  {
    id: 'card',
    name: 'Card',
    path: '/card',
    icon: IdCard,
  },
  {
    id: 'community',
    name: 'Community',
    path: '/community',
    icon: Users,
  },
  {
    id: 'me',
    name: 'Me',
    path: '/me',
    icon: User,
  },
];
