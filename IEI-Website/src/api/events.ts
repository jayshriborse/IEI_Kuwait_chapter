/**
 * DEV DATA - Events API
 * Will later connect to NestJS REST API / events.scraped.json
 */

export interface EventItem {
  id: string;
  category: string;
  title: string;
  date: string;
  venue: string | null;
  speaker: string | null;
  source_url?: string | null;
  rsvpCount?: number;
  status?: string;
  badge?: string;
  badgeColor?: string;
}

export async function getEvents(): Promise<{
  programme: EventItem[];
  activities: EventItem[];
  seminars: EventItem[];
}> {
  // DEV DATA
  return {
    programme: [
      {
        id: '1',
        category: 'Engineers\' Day',
        title: '58th Engineers\' Day Celebration',
        date: '17 Nov 2025 · 18:30',
        venue: 'Park Inn, Mahboula',
        speaker: 'Chief Guest: Ambassador of India to Kuwait',
        badge: 'ANNUAL EVENT',
        rsvpCount: 142,
      },
      {
        id: '2',
        category: 'Technical Seminar',
        title: 'Integrated Design of Wellhead Control Panels',
        date: '27 Oct 2025 · 19:00',
        venue: 'KSE Hall, Kuwait City',
        speaker: 'Mr. S. K. Selvan, CEO, Habu Technology FZCO',
        badge: 'TECHNICAL',
        rsvpCount: 88,
      },
      {
        id: '3',
        category: 'Health Event',
        title: 'Movember — Men\'s Health Awareness',
        date: '10 Nov 2025 · 17:30',
        venue: 'KSE, Soor St',
        speaker: 'Specialist Medical Panel',
        badge: 'COMMUNITY',
        rsvpCount: 65,
      },
    ],
    activities: [
      {
        id: '4',
        category: 'AGMs',
        title: 'Annual General Body Meeting 2024-2025',
        date: '15 May 2025 · 19:00',
        venue: 'KSE Auditorium',
        speaker: null,
      },
      {
        id: '5',
        category: 'Family Day',
        title: 'IEI Family Fun Day 2025',
        date: '1 Mar 2025 · All Day',
        venue: 'Egalia Beach Camp',
        speaker: null,
      },
    ],
    seminars: [
      {
        id: '6',
        category: 'Technical Seminar',
        title: 'AI Based Facilities Management & Building Commissioning',
        date: '16 Sep 2024 · 19:00',
        venue: 'Millennium Hotel, Salmiya',
        speaker: 'Eng. Ershad Mohammed & Eng. V. Arulselvan',
      },
    ],
  };
}
