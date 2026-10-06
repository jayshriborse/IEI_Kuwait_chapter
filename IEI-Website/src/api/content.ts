/**
 * DEV DATA - Public Front Page Content
 * Strictly sourced from IEI mobile screenshots and instructions
 */

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface HeroCardItem {
  id: string;
  title: string;
  text: string;
  iconName: 'calendar' | 'id-card' | 'briefcase' | 'users';
  variant: 'peach' | 'green' | 'parchment' | 'cream';
  route: string;
}

export interface FeatureCardItem {
  id: string;
  title: string;
  text: string;
  screenshotKey?: string;
  variant: 'peach' | 'green' | 'parchment' | 'cream';
  route: string;
}

export interface JourneyStepItem {
  number: number;
  label: string;
  screenshotKey: string;
  route: string;
}

export interface ScopeCardItem {
  id: string;
  title: string;
  text: string;
  variant: 'peach' | 'green' | 'parchment';
}

export const publicContent = {
  topStrip: {
    mailText: 'Mail Us: ieikwt@hotmail.com',
    callText: 'Call Us: +965 90098667',
    email: 'ieikwt@hotmail.com',
    phone: '+965 90098667',
  },
  header: {
    nameLine1: 'The Institution of Engineers (India)',
    nameLine2: 'Kuwait Chapter',
    menuLinks: [
      { label: 'Events & Activities', href: '#features' },
      { label: 'Membership', href: '#features' },
      { label: 'Contact', href: '#footer' },
    ] as NavLinkItem[],
    applyButtonText: 'Apply for membership',
  },
  signin: {
    badge: 'EST. 1995 · KUWAIT CHAPTER',
    heading: 'Engineering,\nprofessionally',
    paragraph:
      'The Institution of Engineers (India) in Kuwait — your membership, the programme and the chapter directory in one place.',
    stats: [
      { number: '240', label: 'MEMBERS' },
      { number: '31', label: 'YEARS' },
      { number: '12', label: 'EVENTS A YEAR' },
    ],
    card: {
      heading: 'Find your member record',
      text: 'Enter your Member ID and the mobile number the chapter has on file and we\'ll match you automatically.',
      memberIdLabel: 'Member ID',
      memberIdPlaceholder: 'e.g. IEI0005',
      mobileLabel: 'Registered mobile',
      mobilePlaceholder: 'e.g. 99840191',
      continueButton: 'Continue to the app',
      orDivider: 'or',
      guestButton: 'Browse as a guest',
      notMemberPrompt: 'Not a member yet?',
      applyLink: 'Apply for membership',
    },
  },
  hero: {
    pillLabel: 'EST. 1995 · KUWAIT CHAPTER',
    heading: 'Engineering,\nprofessionally',
    paragraph:
      'The Institution of Engineers (India) in Kuwait — your membership, the programme and the chapter directory in one place.',
    stats: [
      { number: '240', label: 'MEMBERS' },
      { number: '31', label: 'YEARS' },
      { number: '12', label: 'EVENTS A YEAR' },
    ],
    googleButtonText: 'Continue with Google',
    appleButtonText: 'Continue with Apple',
    guestButtonText: 'Browse as a guest',
  },
  heroCards: [
    {
      id: 'events',
      title: 'Events',
      text: 'AGMs · Meetings · Seminars · Engineers\' Day',
      iconName: 'calendar',
      variant: 'green',
      route: '/events',
    },
    {
      id: 'card',
      title: 'Card',
      text: 'KD 20 A year',
      iconName: 'id-card',
      variant: 'peach',
      route: '/card',
    },
    {
      id: 'jobs',
      title: 'Jobs',
      text: 'Sorted by sector',
      iconName: 'briefcase',
      variant: 'parchment',
      route: '/jobs',
    },
    {
      id: 'community',
      title: 'Community',
      text: 'Blood donors · mentoring · carpool leads',
      iconName: 'users',
      variant: 'cream',
      route: '/community',
    },
  ] as HeroCardItem[],
  tickerText:
    'AGMs · Meetings · Seminars · Engineers\' Day · Family Day · Events · AMIE Exams · EC Meetings · Science Club · Ladies Wing · Archives',
  features: {
    cards: [
      {
        id: 'events',
        title: 'Events & activities',
        text: 'Every listing the chapter keeps, from 1995 onwards',
        screenshotKey: 'events',
        variant: 'green',
        route: '/events',
      },
      {
        id: 'gallery',
        title: 'Photo gallery',
        text: 'Albums per event, filtered by All · 2025 · 2024 · Earlier.',
        screenshotKey: 'gallery',
        variant: 'cream',
        route: '/gallery',
      },
      {
        id: 'jobs',
        title: 'IEI job portal',
        text: 'Sorted by sector: oil & gas, construction, consultancy, power & water, IT and facilities.',
        screenshotKey: 'jobs',
        variant: 'parchment',
        route: '/jobs',
      },
      {
        id: 'community',
        title: 'Community & registers',
        text: 'Blood donors · speakers and topics · mentoring · job referrals · carpool leads · skills · sponsors · members referred',
        screenshotKey: 'community',
        variant: 'peach',
        route: '/community',
      },
    ] as FeatureCardItem[],
  },
  journey: {
    heading: 'The member journey',
    steps: [
      {
        number: 1,
        label: '1 · Sign in',
        screenshotKey: 'signin',
        route: '/home',
      },
      {
        number: 2,
        label: '2 · Home',
        screenshotKey: 'home',
        route: '/home',
      },
      {
        number: 3,
        label: '3 · RSVP',
        screenshotKey: 'rsvp',
        route: '/events',
      },
      {
        number: 4,
        label: '4 · Card',
        screenshotKey: 'card',
        route: '/card',
      },
      {
        number: 5,
        label: '5 · Renew',
        screenshotKey: 'renew',
        route: '/card',
      },
    ] as JourneyStepItem[],
  },
  scope: {
    heading: 'Scope & decisions',
    cards: [
      {
        id: '1',
        title: 'Google or Apple, then link',
        text: 'Sign in, then match the member record by Member ID and registered mobile.',
        variant: 'peach',
      },
      {
        id: '2',
        title: 'KD 20 a year',
        text: 'Member declares payment and uploads a receipt; the treasurer confirms and types the receipt book number.',
        variant: 'green',
      },
      {
        id: '3',
        title: 'No payment gateway',
        text: 'Bank transfer with a receipt, or cash at the KSE office. Nothing is collected in the app.',
        variant: 'parchment',
      },
      {
        id: '4',
        title: 'QR at the door',
        text: 'An EC volunteer scans the member\'s card. Works offline as well as on.',
        variant: 'peach',
      },
      {
        id: '5',
        title: 'Registers, not a chat room',
        text: 'Blood donors, speakers, mentors, referrals, carpools, skills, sponsors. WhatsApp stays for conversation.',
        variant: 'green',
      },
      {
        id: '6',
        title: 'Wings get their own space',
        text: 'Ladies Wing and Science Club each have a feed their convenor can post to.',
        variant: 'parchment',
      },
    ] as ScopeCardItem[],
  },
  privacy: {
    heading: 'Privacy & consent',
    text: 'Where a member has not answered a consent question, the answer is visible to the EC only — never to the directory.',
    screenshotKey: 'privacy',
  },
  footer: {
    chapterOfficeHeading: 'Chapter Office',
    chapterOfficeText: 'Kuwait Society of Engineers, Soor St, Bneid Al Qar',
    contactHeading: 'Contact',
    contactLine: 'Call: +965 90098667 · Mail: ieikwt@hotmail.com',
    getTheAppHeading: 'Get the App',
    storeLinks: {
      googlePlay: null as string | null,
      appStore: null as string | null,
    },
  },
} as const;

export default publicContent;
