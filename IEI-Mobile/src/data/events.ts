export interface ProgrammeEvent {
  id: string;
  day: string;
  month: string;
  year?: string;
  category?: string;
  title: string;
  location: string;
  venue?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  startsAt?: string;
  endsAt?: string;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  isRsvpd?: boolean;
  userRsvp?: any;
  badge: 'Open' | 'Members' | 'Family' | 'Students';
  isOpenForGuest?: boolean;
  isAcceptingRsvp?: boolean;
  description?: string;
}

export interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  bg: '#FFE1D0' | '#E1EECC' | '#EBDDC5';
  route?: string;
}

export interface TechnicalSeminar {
  id: string;
  date: string;
  title: string;
  subtitle: string;
}

export const PROGRAMME_EVENTS: ProgrammeEvent[] = [
  {
    id: '1',
    day: '15',
    month: 'OCT',
    year: '2026',
    category: "ENGINEERS' DAY",
    title: "59th Engineers' Day Celebration",
    location: 'Kuwait Society of Engineers · 18:30',
    venue: 'Kuwait Society of Engineers, Bneid Al Qar',
    time: '18:30',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    startTime: '18:30',
    endTime: '22:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-10-15T18:30:00+03:00',
    endsAt: '2026-10-15T22:00:00+03:00',
    badge: 'Open',
    isOpenForGuest: true,
    isAcceptingRsvp: true,
  },
  {
    id: '2',
    day: '20',
    month: 'OCT',
    year: '2026',
    category: 'TECHNICAL SEMINAR',
    title: 'Technical Seminar — AI-Based Facilities Management',
    location: 'Copthorne Hotel · Engr. Ershad Mohammed',
    venue: 'Copthorne Hotel, Kuwait City',
    time: '18:30',
    startDate: '2026-10-20',
    endDate: '2026-10-20',
    startTime: '18:30',
    endTime: '21:30',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-10-20T18:30:00+03:00',
    endsAt: '2026-10-20T21:30:00+03:00',
    badge: 'Members',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
  },
  {
    id: '3',
    day: '06',
    month: 'NOV',
    year: '2026',
    category: 'LADIES WING',
    title: 'Ladies Wing — "Let\'s Act" acting workshop',
    location: 'IGNOU Centre, Salmiya · Engr. Shemej Kumar',
    venue: 'IGNOU Centre, Salmiya',
    time: '17:00',
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    startTime: '17:00',
    endTime: '20:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-11-06T17:00:00+03:00',
    endsAt: '2026-11-06T20:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
  },
  {
    id: '4',
    day: '20',
    month: 'NOV',
    year: '2026',
    category: 'CULTURAL NIGHT',
    title: 'UTSAV 2026 — cultural night',
    location: 'Rajdhani Palace Hotel · families welcome',
    venue: 'Rajdhani Palace Hotel, Khaitan',
    time: '18:00',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    startTime: '18:00',
    endTime: '22:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-11-20T18:00:00+03:00',
    endsAt: '2026-11-20T22:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
  },
  {
    id: '5',
    day: '11',
    month: 'DEC',
    year: '2026',
    category: 'STUDENT EXAMS',
    title: 'AMIE examination registration closes',
    location: 'Chapter office, KSE',
    venue: 'Chapter office, KSE',
    time: '20:00',
    startDate: '2026-12-11',
    endDate: '2026-12-11',
    startTime: '20:00',
    endTime: '23:59',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-12-11T20:00:00+03:00',
    endsAt: '2026-12-11T23:59:00+03:00',
    badge: 'Students',
    isOpenForGuest: false,
    isAcceptingRsvp: false,
  },
  {
    id: '6',
    day: '06',
    month: 'FEB',
    year: '2027',
    category: 'ANNUAL GENERAL MEETING',
    title: 'Annual General Meeting & Technical Seminar',
    location: 'Kuwait Society of Engineers · 18:00',
    venue: 'Kuwait Society of Engineers, Bneid Al Qar',
    time: '18:00',
    startDate: '2027-02-06',
    endDate: '2027-02-06',
    startTime: '18:00',
    endTime: '21:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2027-02-06T18:00:00+03:00',
    endsAt: '2027-02-06T21:00:00+03:00',
    badge: 'Members',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
  },
  {
    id: '7',
    day: '13',
    month: 'MAR',
    year: '2027',
    category: 'FAMILY DAY',
    title: 'Family Day',
    location: 'To be announced',
    venue: 'Outdoor venue, Kuwait',
    time: '10:00',
    startDate: '2027-03-13',
    endDate: '2027-03-13',
    startTime: '10:00',
    endTime: '16:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2027-03-13T10:00:00+03:00',
    endsAt: '2027-03-13T16:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
  },
];

export const ACTIVITIES_LIST: ActivityCard[] = [
  {
    id: '1',
    title: 'AGMs',
    subtitle: 'Accounts, EC elections and the general body',
    date: '29 MAY 2024',
    bg: '#FFE1D0',
  },
  {
    id: '2',
    title: 'Meetings',
    subtitle: "General body notices and members' meetings",
    date: '[DATE]',
    bg: '#E1EECC',
  },
  {
    id: '3',
    title: 'Seminars',
    subtitle: 'Regular technical sessions for the engineering fraternity',
    date: '27 OCT 2025',
    bg: '#EBDDC5',
    route: '/technical-seminars',
  },
  {
    id: '4',
    title: "Engineers' Day",
    subtitle: '15 September, in memory of Sir M. Visvesvaraya',
    date: '17 NOV 2025',
    bg: '#FFE1D0',
  },
  {
    id: '5',
    title: 'Family Day',
    subtitle: 'A day out for members and their families',
    date: '13 MAR 2027',
    bg: '#E1EECC',
  },
  {
    id: '6',
    title: 'Events',
    subtitle: 'Conferences, campaigns and observances',
    date: '01–30 NOV 2025',
    bg: '#EBDDC5',
  },
  {
    id: '7',
    title: 'AMIE Exams',
    subtitle: 'Sit the IEI examination here in Kuwait',
    date: '11 DEC 2026',
    bg: '#FFE1D0',
  },
  {
    id: '8',
    title: 'EC Meetings',
    subtitle: 'Minutes and notices for the committee',
    date: '[DATE]',
    bg: '#E1EECC',
  },
  {
    id: '9',
    title: 'Science Club',
    subtitle: 'For the children of the IEI family',
    date: '20 NOV 2026',
    bg: '#EBDDC5',
    route: '/wing-feed?slug=science-club',
  },
  {
    id: '10',
    title: 'Ladies Wing',
    subtitle: 'Activities for members and their families',
    date: '06 NOV 2026',
    bg: '#FFE1D0',
    route: '/wing-feed?slug=ladies-wing',
  },
  {
    id: '11',
    title: 'Archives',
    subtitle: 'Beyond the regular seminars and workshops',
    date: '',
    bg: '#E1EECC',
  },
];

export const TECHNICAL_SEMINARS: TechnicalSeminar[] = [
  {
    id: '1',
    date: '27 Oct 2025',
    title: 'Integrated design & operation of wellhead control panels and chemical injection skids',
    subtitle: 'Speaker: Mr. S. K. Selvan, CEO, Habu Technology FZCO.',
  },
  {
    id: '2',
    date: '22 Sep 2025',
    title: 'Technical Seminar — September 2025',
    subtitle: "Millennium Hotel, Salmiya. Engineering reliability solutions and Kuwait's energy supply chain.",
  },
  {
    id: '3',
    date: '16 Sep 2024',
    title: 'AI-based facilities management · Building commissioning · Financial engineering',
    subtitle: 'Engr. Ershad Mohammed · Engr. V. Arulselvan, CXA · Mr. V. R. Aiyappan, CFA, FRM.',
  },
  {
    id: '4',
    date: '27 Dec 2023',
    title: 'Sustainable power · Mental well-being & counselling',
    subtitle: 'Dr. Andrew Panicker, Consultant Psychiatrist, Chinmaya Mission Hospital, Bangalore.',
  },
  {
    id: '5',
    date: '28 Mar 2022',
    title: 'Planning for the future — financial planning and investment avenues',
    subtitle: 'Webinar, 18:30 Kuwait time.',
  },
  {
    id: '6',
    date: '03 Jul 2020',
    title: 'Challenges of energy for sustainable development',
    subtitle: 'Dr. S. M. Ali, FIE — Director (Membership), IEI Kolkata; Vice President, Solar Energy Society of India.',
  },
  {
    id: '7',
    date: '26 Jun 2020',
    title: 'Webinar on financial independence',
    subtitle: 'Online, 18:30–19:30.',
  },
];
