import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import {
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
  ChevronRightIcon,
} from '../components/icons/dashboard-icons';
import { PROGRAMME_EVENTS, ProgrammeEvent } from '@/data/events';
import {
  getAuthLevel,
  isGuestSession,
  subscribeMemberSession,
  getAuthToken,
  fetchPublicEvents,
} from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';

export default function ProgrammeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [authLevel, setAuthLevel] = useState(getAuthLevel());
  const [isGuest, setIsGuest] = useState(isGuestSession() || getAuthLevel() === 'GUEST');
  const [eventsList, setEventsList] = useState<ProgrammeEvent[]>(PROGRAMME_EVENTS);

  useEffect(() => {
    const unsub = subscribeMemberSession(() => {
      setAuthLevel(getAuthLevel());
      setIsGuest(isGuestSession() || getAuthLevel() === 'GUEST');
    });
    return unsub;
  }, []);

  // Fetch real upcoming events from backend
  useEffect(() => {
    async function loadBackendEvents() {
      try {
        const res = await fetchPublicEvents('upcoming');
        if (res.success && res.data && res.data.length > 0) {
          setEventsList(res.data);
        }
      } catch {}
    }
    loadBackendEvents();
  }, [authLevel]);

  // Fetch dynamic wing posts with eventDate and merge as Family-tagged items
  useEffect(() => {
    async function loadWingEvents() {
      const token = getAuthToken();
      if (!token) return;

      try {
        const wings = ['ladies-wing', 'science-club'];
        const wingEvents: ProgrammeEvent[] = [];

        for (const slug of wings) {
          const res = await fetch(`${getApiBaseUrl()}/wings/${slug}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const posts = data.posts || [];
            const wingName = data.wing?.name || (slug === 'ladies-wing' ? 'Ladies Wing' : 'Science Club');

            for (const p of posts) {
              if (p.eventDate) {
                const d = new Date(p.eventDate);
                const day = String(d.getDate()).padStart(2, '0');
                const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                wingEvents.push({
                  id: `wing-${p.id}`,
                  day,
                  month,
                  title: `${wingName} — ${p.title}`,
                  location: p.body.length > 50 ? `${p.body.slice(0, 50)}...` : p.body,
                  badge: 'Family',
                });
              }
            }
          }
        }

        if (wingEvents.length > 0) {
          setEventsList((prev) => {
            const merged = [...prev];
            for (const we of wingEvents) {
              // Avoid duplicates if title matches
              const exists = merged.some(
                (m) =>
                  m.id === we.id ||
                  (m.day === we.day && m.month === we.month && m.title.includes(we.title.split('—')[1]?.trim() || '___')),
              );
              if (!exists) {
                merged.push(we);
              }
            }
            return merged;
          });
        }
      } catch {
        // Fallback silently to static list
      }
    }

    loadWingEvents();
  }, [authLevel]);

  const handleEventPress = (event: ProgrammeEvent) => {
    if (event.badge === 'Open') {
      router.push(`/rsvp?eventId=${event.id}`);
    } else {
      if (isGuest) {
        Alert.alert(
          'Member Event',
          `"${event.title}" is reserved for verified IEI Kuwait members (${event.badge}).\n\nPlease sign in to your member account or apply for membership to register.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/') },
            { text: 'Apply', onPress: () => router.push('/apply-membership') },
          ]
        );
      } else {
        router.push(`/rsvp?eventId=${event.id}`);
      }
    }
  };

  const handleGalleryPress = () => {
    if (isGuest) {
      Alert.alert(
        'Member Gallery',
        'Event photo galleries and chapter archives are available to verified IEI members. Sign in or apply for membership to view.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/') },
          { text: 'Apply', onPress: () => router.push('/apply-membership') },
        ]
      );
    } else {
      router.push('/gallery');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 12, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Programme</Text>
            <Text style={styles.headerSubtitle}>2026–27 chapter calendar</Text>
          </View>

          {/* Segmented Category Filter Chips */}
          <View style={styles.filterChipsRow}>
            {/* Upcoming (Selected) */}
            <TouchableOpacity
              style={[styles.filterChip, styles.filterChipSelected]}
              activeOpacity={0.8}>
              <Text style={[styles.filterChipText, styles.filterChipTextSelected]}>
                Upcoming
              </Text>
            </TouchableOpacity>

            {/* Events & Activities */}
            <TouchableOpacity
              style={styles.filterChip}
              activeOpacity={0.8}
              onPress={() => router.push('/events-activities')}>
              <Text style={styles.filterChipText}>Events & Activities</Text>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              style={styles.filterChip}
              activeOpacity={0.8}
              onPress={handleGalleryPress}>
              <Text style={styles.filterChipText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Apply for Membership Banner */}
          <TouchableOpacity
            style={styles.membershipBanner}
            activeOpacity={0.85}
            onPress={() => router.push(isGuest ? '/apply-membership' : '/renew')}>
            <View style={styles.membershipBannerLeft}>
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.membershipBannerText}>
                Apply for membership — open to engineers in Kuwait
              </Text>
            </View>
            <ChevronRightIcon size={14} color="#8D7B68" />
          </TouchableOpacity>

          {/* Event List */}
          <View style={styles.eventsList}>
            {eventsList.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventRow,
                  index === eventsList.length - 1 && styles.eventRowLast,
                ]}
                activeOpacity={0.7}
                onPress={() => handleEventPress(event)}>
                {/* Date Column */}
                <View style={styles.dateCol}>
                  <Text style={styles.dateDay}>{event.day}</Text>
                  <Text style={styles.dateMonth}>{event.month}</Text>
                </View>

                {/* Event Details Column */}
                <View style={styles.eventInfoCol}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>

                {/* Category Badge Pill */}
                <View
                  style={[
                    styles.badgePill,
                    event.badge === 'Open' ? styles.badgePillOpen : undefined,
                  ]}>
                  <Text
                    style={[
                      styles.badgePillText,
                      event.badge === 'Open' ? styles.badgePillTextOpen : undefined,
                    ]}>
                    {event.badge}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        {isGuest ? (
          <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/guest')}>
              <TabHomeIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
              <TabEventsIcon size={20} color={colors.tabActive} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Programmes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/apply-membership')}>
              <View style={styles.tabApplyBadge}>
                <Text style={styles.tabApplyBadgeText}>+</Text>
              </View>
              <Text style={styles.tabLabel}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/')}>
              <View style={styles.tabUserCircle}>
                <Text style={styles.tabUserCircleText}>👤</Text>
              </View>
              <Text style={styles.tabLabel}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {/* Home Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/dashboard')}>
              <TabHomeIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>

            {/* Events Tab (ACTIVE) */}
            <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
              <TabEventsIcon size={20} color={colors.tabActive} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Events</Text>
            </TouchableOpacity>

            {/* Jobs Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/jobs')}>
              <TabJobsIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Jobs</Text>
            </TouchableOpacity>

            {/* Gallery Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/gallery')}>
              <TabGalleryIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Gallery</Text>
            </TouchableOpacity>

            {/* Card Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/card')}>
              <TabCardIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Card</Text>
            </TouchableOpacity>

            {/* Community Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/community')}>
              <TabCommunityIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Community</Text>
            </TouchableOpacity>

            {/* Me Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}>
              <TabMeIcon size={20} color={colors.tabInactive} />
              <Text style={styles.tabLabel}>Me</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EAD8',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: '#201E1D',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#605C55',
  },

  // Category Filter Chips
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4A373',
    backgroundColor: 'transparent',
  },
  filterChipSelected: {
    borderColor: '#C67139',
    backgroundColor: 'transparent',
  },
  filterChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: '#8D5A34',
  },
  filterChipTextSelected: {
    color: '#C67139',
    fontFamily: fonts.sansBold,
  },

  // Membership Banner
  membershipBanner: {
    backgroundColor: '#FFE1D0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  membershipBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  plusIcon: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: '#201E1D',
    marginRight: 10,
    lineHeight: 20,
  },
  membershipBannerText: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#201E1D',
    lineHeight: 18,
  },

  // Events List
  eventsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  eventRowLast: {
    borderBottomWidth: 1,
  },
  dateCol: {
    width: 44,
    alignItems: 'flex-start',
    marginRight: 10,
  },
  dateDay: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#201E1D',
    lineHeight: 24,
  },
  dateMonth: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: '#8D7B68',
    letterSpacing: 0.5,
  },
  eventInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  eventTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    lineHeight: 19,
    marginBottom: 2,
  },
  eventLocation: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    lineHeight: 16,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4A373',
    backgroundColor: '#FAF4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillOpen: {
    backgroundColor: '#E8F2E2',
    borderColor: '#7DAA60',
  },
  badgePillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#8D5A34',
  },
  badgePillTextOpen: {
    color: '#3B6828',
    fontFamily: fonts.sansBold,
  },

  // Bottom Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EEE7DB',
    borderTopWidth: 1,
    borderTopColor: '#E4DBD0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  tabLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    color: '#8A8075',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#C67139',
    fontFamily: fonts.sansBold,
  },
  tabApplyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#C67139',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabApplyBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#C67139',
    lineHeight: 16,
  },
  tabUserCircle: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabUserCircleText: {
    fontSize: 14,
  },
});
