/**
 * DEV DATA - Home Dashboard API
 * Will later connect to NestJS REST API
 */

export interface HomeDashboardData {
  stats: {
    membersCount: number;
    yearsEstablished: number;
    eventsPerYear: number;
  };
  subscriptionDue: {
    amountKD: number;
    period: string;
    memberId: string;
  };
  featuredEvent: {
    title: string;
    date: string;
    venue: string;
    rsvpStatus: string;
  };
  profileCompletion: {
    percentage: number;
    missingFields: string[];
  };
}

export async function getHome(): Promise<HomeDashboardData> {
  // DEV DATA
  return {
    stats: {
      membersCount: 240,
      yearsEstablished: 31,
      eventsPerYear: 12,
    },
    subscriptionDue: {
      amountKD: 20,
      period: '1 Apr 2026 – 31 Mar 2027',
      memberId: 'IEI0005',
    },
    featuredEvent: {
      title: '58th Engineers\' Day Celebration',
      date: '17 Nov 2025 · 18:30',
      venue: 'Park Inn, Mahboula',
      rsvpStatus: 'Attending (2)',
    },
    profileCompletion: {
      percentage: 85,
      missingFields: ['Blood donor consent', 'Emergency contact'],
    },
  };
}
