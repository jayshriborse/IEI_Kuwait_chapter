import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import {
  TabHomeIcon,
  TabEventsIcon,
  ChevronRightIcon,
} from '@/components/icons/dashboard-icons';
import { PROGRAMME_EVENTS, ProgrammeEvent } from '@/data/events';
import { setGuestSession, fetchPublicEvents } from '@/data/member-session';

export default function GuestLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [featuredEvent, setFeaturedEvent] = useState<ProgrammeEvent | null>(null);

  useEffect(() => {
    // Ensure guest session is marked active
    setGuestSession(true);

    async function loadEvents() {
      try {
        const res = await fetchPublicEvents('upcoming');
        if (res.success && res.data && res.data.length > 0) {
          const openEvt =
            res.data.find((e) => e.isOpenForGuest && e.status !== 'COMPLETED') || res.data[0];
          setFeaturedEvent(openEvt);
        }
      } catch (err) {
        console.warn('Failed to load guest events:', err);
      }
    }

    loadEvents();
  }, []);

  const handleOpenEvent = (event: (typeof PROGRAMME_EVENTS)[0]) => {
    if (event.badge === 'Open') {
      router.push('/rsvp');
    } else {
      Alert.alert(
        'Member Event',
        `"${event.title}" is reserved for verified IEI Kuwait members and their families.\n\nSign in to your member account or apply for membership to participate.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/') },
          { text: 'Apply', onPress: () => router.push('/apply-membership') },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Hero Section (Chocolate Brown Card) */}
          <View style={[styles.headerHero, { paddingTop: insets.top + 10 }]}>
            {/* Top User Bar */}
            <View style={styles.headerTopBar}>
              <View style={styles.sealContainer}>
                <Image
                  source={require('@/assets/images/iei-seal.png')}
                  style={styles.sealLogo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.headerTitles}>
                <Text style={styles.chapterTag}>EST. 1995 · KUWAIT CHAPTER</Text>
                <Text style={styles.greetingText}>Welcome to IEI Kuwait</Text>
              </View>

              <TouchableOpacity
                style={styles.signInPill}
                activeOpacity={0.8}
                onPress={() => router.push('/')}>
                <Text style={styles.signInPillText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Public Chapter Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>240+</Text>
                <Text style={styles.statLabel}>MEMBERS IN{'\n'}KUWAIT</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>31</Text>
                <Text style={styles.statLabel}>YEARS OF{'\n'}EXCELLENCE</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>PROGRAMMES{'\n'}'26–'27</Text>
              </View>
            </View>
          </View>

          {/* Cards Body Section */}
          <View style={styles.cardsBody}>
            {/* Guest Mode Indicator Banner */}
            <View style={styles.guestBanner}>
              <View style={styles.guestBannerLeft}>
                <View style={styles.guestBadgeDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestBannerTitle}>Browsing as a Guest</Text>
                  <Text style={styles.guestBannerSubtitle}>
                    Explore chapter activities, RSVP to open events, or start your membership application.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.guestBannerAction}
                activeOpacity={0.8}
                onPress={() => router.push('/')}>
                <Text style={styles.guestBannerActionText}>Sign In →</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Next Open Event */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>FEATURED OPEN EVENT</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/events')}>
                <Text style={styles.sectionHeaderLink}>All events</Text>
              </TouchableOpacity>
            </View>

            {featuredEvent ? (
              <View style={styles.eventCard}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>{featuredEvent.day}</Text>
                  <Text style={styles.eventDateMonth}>{featuredEvent.month}</Text>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.openPillRow}>
                    <View style={styles.openTag}>
                      <Text style={styles.openTagText}>
                        {featuredEvent.status === 'ONGOING' ? 'ONGOING' : 'OPEN TO ALL'}
                      </Text>
                    </View>
                    <Text style={styles.eventCategory}>
                      {featuredEvent.category || "ENGINEERS' DAY"}
                    </Text>
                  </View>
                  <Text style={styles.eventTitle}>{featuredEvent.title}</Text>
                  <Text style={styles.eventVenue}>
                    {featuredEvent.time
                      ? `${featuredEvent.time} · ${featuredEvent.venue || featuredEvent.location}`
                      : featuredEvent.location}
                  </Text>

                  <View style={styles.eventActionRow}>
                    <TouchableOpacity
                      style={styles.rsvpButton}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/rsvp?eventId=${featuredEvent.id}`)}>
                      <Text style={styles.rsvpButtonText}>
                        {featuredEvent.isRsvpd ? '✓ RSVP Confirmed' : 'RSVP as Guest'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Apply for Membership Banner */}
            <View style={styles.membershipCard}>
              <Text style={styles.membershipCardKicker}>BECOME A MEMBER</Text>
              <Text style={styles.membershipCardTitle}>
                Are you an engineer in Kuwait?
              </Text>
              <Text style={styles.membershipCardBody}>
                Join the largest multi-disciplinary professional body of engineers in the region. Enjoy voting rights, chapter seminars, directory access, and global recognition.
              </Text>

              <View style={styles.membershipPillsRow}>
                <View style={styles.membershipInfoPill}>
                  <Text style={styles.membershipInfoPillText}>FIE · MIE · AMIE</Text>
                </View>
                <View style={styles.membershipInfoPill}>
                  <Text style={styles.membershipInfoPillText}>KD 20 / year</Text>
                </View>
                <View style={styles.membershipInfoPill}>
                  <Text style={styles.membershipInfoPillText}>KSE Accreditation</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyNowButton}
                activeOpacity={0.88}
                onPress={() => router.push('/apply-membership')}>
                <Text style={styles.applyNowButtonText}>Apply for Membership</Text>
              </TouchableOpacity>
            </View>

            {/* Upcoming Calendar Preview */}
            <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
              <Text style={styles.sectionHeaderTitle}>2026–27 PROGRAMME PREVIEW</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/events')}>
                <Text style={styles.sectionHeaderLink}>Full calendar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarList}>
              {PROGRAMME_EVENTS.slice(0, 4).map((evt, idx) => (
                <TouchableOpacity
                  key={evt.id}
                  style={[
                    styles.calendarItem,
                    idx === 3 && styles.calendarItemLast,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleOpenEvent(evt)}>
                  <View style={styles.calendarDateBox}>
                    <Text style={styles.calendarDateDay}>{evt.day}</Text>
                    <Text style={styles.calendarDateMonth}>{evt.month}</Text>
                  </View>

                  <View style={styles.calendarItemDetails}>
                    <Text style={styles.calendarItemTitle}>{evt.title}</Text>
                    <Text style={styles.calendarItemLocation}>{evt.location}</Text>
                  </View>

                  <View
                    style={[
                      styles.calendarBadge,
                      evt.badge === 'Open'
                        ? styles.calendarBadgeOpen
                        : styles.calendarBadgeRestricted,
                    ]}>
                    <Text
                      style={[
                        styles.calendarBadgeText,
                        evt.badge === 'Open'
                          ? styles.calendarBadgeTextOpen
                          : styles.calendarBadgeTextRestricted,
                      ]}>
                      {evt.badge}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Member Benefits Prompt Card */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsCardTitle}>Already an IEI Member?</Text>
              <Text style={styles.benefitsCardText}>
                Sign in with your Google or Apple account and link your IEI Member ID to view your digital Membership Card, dues status, and member directory.
              </Text>
              <TouchableOpacity
                style={styles.benefitsSignInButton}
                activeOpacity={0.85}
                onPress={() => router.push('/')}>
                <Text style={styles.benefitsSignInButtonText}>Sign In to Chapter Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Guest Bottom Navigation Bar */}
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {/* Home Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabHomeIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          {/* Events Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/events')}>
            <TabEventsIcon size={20} color={colors.tabInactive} />
            <Text style={styles.tabLabel}>Programmes</Text>
          </TouchableOpacity>

          {/* Apply Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/apply-membership')}>
            <View style={styles.tabApplyBadge}>
              <Text style={styles.tabApplyBadgeText}>+</Text>
            </View>
            <Text style={styles.tabLabel}>Apply</Text>
          </TouchableOpacity>

          {/* Sign In Tab */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#402310',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#F5EAD8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerHero: {
    backgroundColor: '#402310',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sealContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sealLogo: {
    width: 38,
    height: 38,
  },
  headerTitles: {
    flex: 1,
  },
  chapterTag: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#FFC6A5',
    marginBottom: 2,
  },
  greetingText: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  signInPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#C67139',
  },
  signInPillText: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9.5,
    color: '#D5CBBF',
    textAlign: 'center',
    lineHeight: 12,
  },
  cardsBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF4EB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  guestBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C67139',
    marginRight: 10,
  },
  guestBannerTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#201E1D',
  },
  guestBannerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
    lineHeight: 16,
    marginTop: 2,
  },
  guestBannerAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  guestBannerActionText: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: '#C67139',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 1.1,
    color: '#8D7B68',
  },
  sectionHeaderLink: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: '#C67139',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  eventDateBadge: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E0D0BE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventDateDay: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#C67139',
    lineHeight: 22,
  },
  eventDateMonth: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#605C55',
  },
  eventDetails: {
    flex: 1,
  },
  openPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  openTag: {
    backgroundColor: '#E8F2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openTagText: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    color: '#3B6828',
    letterSpacing: 0.5,
  },
  eventCategory: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: '#8D7B68',
  },
  eventTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#201E1D',
    marginBottom: 4,
  },
  eventVenue: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
    marginBottom: 12,
  },
  eventActionRow: {
    flexDirection: 'row',
  },
  rsvpButton: {
    backgroundColor: '#C67139',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rsvpButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  membershipCard: {
    backgroundColor: '#402310',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  membershipCardKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#FFC6A5',
    marginBottom: 4,
  },
  membershipCardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 19,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  membershipCardBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#D5CBBF',
    lineHeight: 18,
    marginBottom: 14,
  },
  membershipPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  membershipInfoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  membershipInfoPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  applyNowButton: {
    backgroundColor: '#C67139',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyNowButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  calendarList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D8',
  },
  calendarItemLast: {
    borderBottomWidth: 0,
  },
  calendarDateBox: {
    width: 44,
    alignItems: 'center',
    marginRight: 12,
  },
  calendarDateDay: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#201E1D',
    lineHeight: 18,
  },
  calendarDateMonth: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: '#8D7B68',
  },
  calendarItemDetails: {
    flex: 1,
    marginRight: 8,
  },
  calendarItemTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#201E1D',
    marginBottom: 2,
  },
  calendarItemLocation: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
  },
  calendarBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  calendarBadgeOpen: {
    backgroundColor: '#E8F2E2',
  },
  calendarBadgeRestricted: {
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  calendarBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
  },
  calendarBadgeTextOpen: {
    color: '#3B6828',
  },
  calendarBadgeTextRestricted: {
    color: '#8D7B68',
  },
  benefitsCard: {
    backgroundColor: '#FAF4EB',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginBottom: 16,
  },
  benefitsCardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
    marginBottom: 4,
  },
  benefitsCardText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
    lineHeight: 18,
    marginBottom: 14,
  },
  benefitsSignInButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C67139',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  benefitsSignInButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#C67139',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DCCB',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.tabInactive,
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.tabActive,
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
    fontSize: 15,
  },
});
