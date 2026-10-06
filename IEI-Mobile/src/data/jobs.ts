export interface JobPosting {
  id: string;
  iconBg: string;
  title: string;
  company: string;
  timeAgo: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  visaStatus: string;
  requirements: string[];
  referralNote?: string;
  referralDesc?: string;
}

export const JOB_POSTINGS: JobPosting[] = [
  {
    id: '1',
    iconBg: '#FFC6A5',
    title: 'Senior Process Engineer',
    company: 'Kuwait Oil Company',
    timeAgo: '2 days ago',
    location: 'Ahmadi',
    type: 'Full-time',
    category: 'Oil & gas',
    salary: '[KD 1,400–1,900]',
    visaStatus: 'Transferable visa (Article 18) or direct KOC hire',
    requirements: [
      'B.E./B.Tech Chemical or Process, AMIE accepted',
      '10+ years upstream, of which 3 in Kuwait',
      'MOHE degree equivalency and KSE registration',
      'Aspen HYSYS and PFD/P&ID review experience',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '2',
    iconBg: '#CCDBB2',
    title: 'Structural Engineer',
    company: 'KEO International Consultants',
    timeAgo: '4 days ago',
    location: 'Sharq, Kuwait City',
    type: 'Full-time',
    category: 'Consultancy',
    salary: '[KD 900–1,200]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E./B.Tech Civil or Structural Engineering',
      '6+ years in high-rise building structural design',
      'Proficiency in ETABS, SAFE, and STAAD.Pro',
      'Valid KSE membership & Municipality approval license',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '3',
    iconBg: '#DCD3C4',
    title: 'MEP QC Engineer',
    company: 'Ahmadiah Contracting & Trading',
    timeAgo: '5 days ago',
    location: 'Shuwaikh',
    type: 'Contract · 2 years',
    category: 'Construction',
    salary: '[KD 750–950]',
    visaStatus: 'Transferable visa (Article 18) with valid Kuwait driving license',
    requirements: [
      'B.E./B.Tech Mechanical or Electrical Engineering',
      '5+ years QC/QA experience on major commercial projects',
      'Familiar with Ashghal/MEW specifications & testing procedures',
      'ISO 9001 internal auditor certification preferred',
    ],
    referralNote: '',
    referralDesc: '',
  },
  {
    id: '4',
    iconBg: '#FFC6A5',
    title: 'Instrumentation & Control Engineer',
    company: 'KNPC — Mina Al-Ahmadi Refinery',
    timeAgo: '1 week ago',
    location: 'Mina Al-Ahmadi',
    type: 'Contract via manpower supplier',
    category: 'Oil & gas',
    salary: '[KD 1,100–1,350]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E./B.Tech Instrumentation & Control or Electronics',
      '8+ years in refinery or petrochemical plant maintenance',
      'Hands-on experience with Honeywell DCS & Triconex ESD systems',
      'KSE membership and refinery safety clearance required',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '5',
    iconBg: '#CCDBB2',
    title: 'Substation Protection Engineer',
    company: 'Alghanim International / MEW',
    timeAgo: '1 week ago',
    location: 'Shuaiba Industrial',
    type: 'Full-time',
    category: 'Power & water',
    salary: '[KD 1,000–1,300]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E./B.Tech Electrical Engineering',
      '7+ years testing & commissioning 132/11kV substations',
      'Proficiency in relay coordination and Omicron testing kits',
      'MEW clearance & KSE accreditation',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '6',
    iconBg: '#FFC6A5',
    title: 'Systems & Cloud Infrastructure Engineer',
    company: 'Zain Digital Partner',
    timeAgo: '2 weeks ago',
    location: 'Kuwait City',
    type: 'Full-time',
    category: 'IT',
    salary: '[KD 1,200–1,500]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.Tech/B.E. Computer Science or Information Technology',
      '5+ years managing Linux, Kubernetes, and AWS/Azure cloud estates',
      'Strong scripting in Python, Bash, and Terraform',
      'Telecom infrastructure experience is a plus',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '7',
    iconBg: '#DCD3C4',
    title: 'Senior Facilities & BMS Engineer',
    company: 'M.H. Alshaya Group',
    timeAgo: '2 weeks ago',
    location: 'Al Rai',
    type: 'Full-time',
    category: 'Facilities',
    salary: '[KD 950–1,250]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E. Mechanical or Electrical Engineering',
      '6+ years in commercial facility management and central BMS',
      'Energy auditing and preventive maintenance scheduling',
      'Valid Kuwait driving license',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
  {
    id: '8',
    iconBg: '#CCDBB2',
    title: 'Site Civil Engineer (Infrastructure)',
    company: 'Combined Group Contracting (CGC)',
    timeAgo: '3 weeks ago',
    location: 'Sabah Al Ahmad',
    type: 'Full-time',
    category: 'Construction',
    salary: '[KD 800–1,100]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E./B.Tech Civil Engineering with valid KSE registration',
      '5+ years site supervision on highway or deep sewer projects',
      'Quantity surveying and sub-contractor coordination',
      'Kuwait driving license mandatory',
    ],
    referralNote: '',
    referralDesc: '',
  },
  {
    id: '9',
    iconBg: '#DCD3C4',
    title: 'Senior Highway Design Engineer',
    company: 'SSH International',
    timeAgo: '3 weeks ago',
    location: 'Sharq, Kuwait City',
    type: 'Full-time',
    category: 'Consultancy',
    salary: '[KD 1,300–1,650]',
    visaStatus: 'Transferable visa (Article 18)',
    requirements: [
      'B.E./B.Tech Civil with specialization in Transportation',
      '8+ years in highway alignment, intersection design, and Civil 3D',
      'Kuwait MPW / Part design guideline compliance',
      'KSE member with grade MIE or higher',
    ],
    referralNote: '[Sample referral — Engr. name, company]',
    referralDesc:
      'Your application is flagged to the referring member, who can speak for you inside the company. Referral names are illustrative in this prototype.',
  },
];

export const CATEGORIES = [
  'All',
  'Oil & gas',
  'Construction',
  'Consultancy',
  'Power & water',
  'IT',
  'Facilities',
];

export function getJobById(id: string): JobPosting | undefined {
  return JOB_POSTINGS.find((job) => job.id === id);
}
