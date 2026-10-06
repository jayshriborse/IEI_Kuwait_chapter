/**
 * IEI Kuwait Chapter Production Data Models
 * Exactly synchronized with IEI-Mobile (events.ts, jobs.ts, blood-donors.tsx, mentors.tsx)
 */

export interface ProgrammeEvent {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  location: string;
  badge: 'Open' | 'Members' | 'Family' | 'Students';
  speaker?: string;
  time?: string;
  description: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  visaStatus: string;
  requirements: string[];
  referralNote?: string;
}

export interface Mentor {
  id: string;
  name: string;
  discipline: string;
  company: string;
  grade: string;
  specialty: string;
  yearsExp: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  location: string;
  group: string;
}

export const PROGRAMME_EVENTS: ProgrammeEvent[] = [
  {
    id: '1',
    day: '15',
    month: 'SEP',
    year: '2026',
    title: "59th Engineers' Day Celebration",
    location: 'Kuwait Society of Engineers (KSE) · Bneid Al Qar',
    time: '18:30 KWT',
    badge: 'Open',
    speaker: 'Chief Guest: Ambassador of India & KSE Board',
    description:
      'Annual flagship convention commemorating Bharat Ratna Sir M. Visvesvaraya, celebrating technical achievements and engineering leadership across Kuwait.',
  },
  {
    id: '2',
    day: '09',
    month: 'OCT',
    year: '2026',
    title: 'Technical Seminar — AI-Based Facilities Management',
    location: 'Copthorne Hotel, Kuwait City',
    time: '19:00 KWT',
    badge: 'Members',
    speaker: 'Engr. Ershad Mohammed (FIE, Smart Technologies)',
    description:
      'An in-depth session exploring modern machine learning models and IoT sensors in industrial HVAC, energy optimization, and predictive maintenance.',
  },
  {
    id: '3',
    day: '06',
    month: 'NOV',
    year: '2026',
    title: 'Ladies Wing — "Let\'s Act" Workshop',
    location: 'IGNOU Centre, Salmiya',
    time: '17:00 KWT',
    badge: 'Family',
    speaker: 'Engr. Shemej Kumar',
    description:
      'Community interactive workshop organized by the IEI Kuwait Ladies Wing focusing on creative communication, public speaking, and leadership.',
  },
  {
    id: '4',
    day: '20',
    month: 'NOV',
    year: '2026',
    title: 'UTSAV 2026 — Annual Cultural Gala',
    location: 'Rajdhani Palace Hotel · Families Welcome',
    time: '18:00 KWT',
    badge: 'Family',
    speaker: 'Executive Committee & Cultural Secretary',
    description:
      'The premier family night bringing together engineers from all disciplines with cultural performances, awards for student achievers, and fellowship dinner.',
  },
];

export const JOB_POSTINGS: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Process Engineer',
    company: 'Kuwait Oil Company (KOC)',
    location: 'Ahmadi, Kuwait',
    type: 'Full-time',
    category: 'Oil & Gas',
    salary: 'KD 1,400 – 1,900',
    visaStatus: 'Transferable visa (Article 18) or direct KOC hire',
    requirements: [
      'B.E. / B.Tech Chemical or Process Engineering (AMIE accepted)',
      '10+ years upstream experience, of which 3 years in Kuwait',
      'MOHE degree equivalency and active KSE registration',
      'Proficiency in Aspen HYSYS, PFD & P&ID safety reviews',
    ],
    referralNote: 'Member referral available through Chapter Industrial Liaison',
  },
  {
    id: '2',
    title: 'Senior Structural Engineer',
    company: 'KEO International Consultants',
    location: 'Sharq, Kuwait City',
    type: 'Full-time',
    category: 'Consultancy',
    salary: 'KD 900 – 1,200',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E. / B.Tech Civil or Structural Engineering',
      '6+ years in high-rise building structural analysis',
      'Advanced experience in ETABS, SAFE, and STAAD.Pro',
      'Valid KSE membership & Kuwait Municipality approval',
    ],
    referralNote: 'Member referral available via Civil Engineering Division',
  },
  {
    id: '3',
    title: 'Lead Electrical Project Engineer',
    company: 'Combined Group Contracting',
    location: 'Shuaiba Industrial, Kuwait',
    type: 'Full-time',
    category: 'EPC & Infrastructure',
    salary: 'KD 1,100 – 1,450',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E. Electrical Engineering with MEW/MEW approval',
      '8+ years in substation 11kV/33kV commissioning & cable routing',
      'Valid Kuwait driving license and KSE membership',
    ],
    referralNote: 'Member referral available via Electrical Division',
  },
];

export const MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Engr. Ershad Mohammed',
    discipline: 'Electrical',
    company: 'Facilities & Smart Tech',
    grade: 'FIE',
    specialty: 'AI Facilities Mgmt · Smart Buildings',
    yearsExp: '24 yrs',
  },
  {
    id: '2',
    name: 'Engr. S. K. Selvan',
    discipline: 'Mechanical',
    company: 'Habu Technology FZCO',
    grade: 'FIE',
    specialty: 'Wellhead Systems · Chemical Skids',
    yearsExp: '26 yrs',
  },
  {
    id: '3',
    name: 'Engr. V. Arulselvan',
    discipline: 'Civil',
    company: 'CXA Consultants',
    grade: 'MIE',
    specialty: 'Building Commissioning · QA/QC',
    yearsExp: '18 yrs',
  },
  {
    id: '4',
    name: 'Engr. Kumaran Paramadayalan',
    discipline: 'Oil & Gas',
    company: 'Petrofac Kuwait',
    grade: 'FIE',
    specialty: 'Downstream Operations & EPC',
    yearsExp: '22 yrs',
  },
];

export const BLOOD_DONORS: BloodDonor[] = [
  { id: '1', name: 'Eng. Karthikeyan Manickam', location: 'Salmiya · Hawalli', group: 'O+' },
  { id: '2', name: 'Engr. Kumaran Paramadayalan', location: 'Abbassiya · Farwaniya', group: 'O+' },
  { id: '3', name: 'Engr. Upendra Kumar Behura', location: 'Fahaheel · Ahmadi', group: 'O+' },
  { id: '4', name: 'Engr. Anu Kurian', location: 'Abbassiya · Farwaniya', group: 'A+' },
  { id: '5', name: 'Eng. Rajesh Sharma', location: 'Salmiya · Hawalli', group: 'B+' },
  { id: '6', name: 'Eng. Priya Sundaram', location: 'Salmiya · Hawalli', group: 'O+' },
  { id: '7', name: 'Engr. Subbiah Somasundaram', location: 'Kuwait City', group: 'AB+' },
  { id: '8', name: 'Engr. Sudhir Shyam Menghani', location: 'Kuwait City', group: 'B+' },
];
