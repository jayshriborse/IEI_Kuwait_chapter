import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { ShareIcon } from '@/components/icons/share-icon';
import {
  getAuthLevel,
  getVerifiedMember,
  isGuestSession,
  submitEventRsvp,
  fetchPublicEventById,
} from '@/data/member-session';

export default function RsvpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId: paramEventId } = useLocalSearchParams<{ eventId?: string }>();
  const activeEventId = paramEventId || '1';

  const verifiedMember = getVerifiedMember();
  const authLevel = getAuthLevel();
  const isGuest = isGuestSession() || authLevel === 'GUEST' || !verifiedMember;

  const [eventDetails, setEventDetails] = useState<any>(null);
  const [familyCount, setFamilyCount] = useState<string>('+1');
  const [guestName, setGuestName] = useState<string>('');
  const [guestMobile, setGuestMobile] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedData, setConfirmedData] = useState<any | null>(null);

  React.useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetchPublicEventById(activeEventId);
        if (res.success && res.data) {
          setEventDetails(res.data);
          if (res.data.isRsvpd && res.data.userRsvp) {
            setConfirmedData({
              rsvp: res.data.userRsvp,
              isAlreadyRsvpd: true,
            });
          }
        }
      } catch {}
    }
    loadEvent();
  }, [activeEventId]);

  const parseSeats = (option: string): { seats: number; familyCount: number } => {
    switch (option) {
      case 'Just me':
        return { seats: 1, familyCount: 0 };
      case '+1':
        return { seats: 2, familyCount: 1 };
      case '+2':
        return { seats: 3, familyCount: 2 };
      case '+3':
        return { seats: 4, familyCount: 3 };
      default:
        return { seats: 2, familyCount: 1 };
    }
  };

  const handleRsvpSubmit = async () => {
    if (isGuest) {
      if (!guestName.trim()) {
        Alert.alert('Missing Field', 'Please enter your Full Name to RSVP as a Guest.');
        return;
      }
      if (!guestMobile.trim()) {
        Alert.alert('Missing Field', 'Please enter your Mobile Number.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { seats, familyCount: famCount } = parseSeats(familyCount);
      const payload: any = {
        seats,
        familyCount: typeof famCount === 'number' && famCount > 0 ? `+${famCount}` : '0',
      };

      if (isGuest) {
        payload.guestName = guestName.trim();
        payload.guestMobile = guestMobile.trim();
        if (guestEmail.trim()) {
          payload.guestEmail = guestEmail.trim();
        }
      }

      const res = await submitEventRsvp(activeEventId, payload);
      if (res.success && res.data) {
        setConfirmedData(res.data);
      } else {
        Alert.alert('RSVP Status', res.error || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
        <StatusBar style="dark" />
        <View style={styles.confirmationCard}>
          <View style={styles.confirmBadgeIcon}>
            <Text style={styles.confirmCheckmark}>✓</Text>
          </View>
          <Text style={styles.confirmKicker}>RSVP CONFIRMED</Text>
          <Text style={styles.confirmTitle}>{eventDetails?.title || "59th Engineers' Day"}</Text>
          <Text style={styles.confirmRef}>Registration #{confirmedData.rsvp?.id || 'CONF-88'}</Text>

          <View style={styles.confirmDetailsBox}>
            <Text style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Attendee: </Text>
              {isGuest ? guestName : verifiedMember?.fullName}
            </Text>
            <Text style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Type: </Text>
              {isGuest ? 'Guest Pass' : 'IEI Member'}
            </Text>
            <Text style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Seats reserved: </Text>
              {confirmedData.rsvp?.seats || 2} ({familyCount})
            </Text>
            <Text style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Venue: </Text>
              {eventDetails?.venue || eventDetails?.location || 'Kuwait Society of Engineers'}
            </Text>
            <Text style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Time: </Text>
              {eventDetails
                ? `${eventDetails.day} ${eventDetails.month} ${eventDetails.year || '2026'} at ${eventDetails.time || '18:30'}`
                : '15 Oct 2026 at 18:30'}
            </Text>
          </View>

          <Text style={styles.confirmNote}>
            {isGuest
              ? 'Please mention your name and mobile number at the reception desk for check-in.'
              : 'Bring your digital membership card with QR code for quick check-in at the door.'}
          </Text>

          <TouchableOpacity
            style={styles.doneRsvpButton}
            activeOpacity={0.85}
            onPress={() => (isGuest ? router.replace('/guest') : router.replace('/dashboard'))}>
            <Text style={styles.doneRsvpButtonText}>
              {isGuest ? 'Back to Guest Home' : 'Back to Member Dashboard'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content View */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Event Header Card */}
          <View style={[styles.headerCard, { paddingTop: insets.top + 8 }]}>
            {/* Decorative soft peach circle at right */}
            <View pointerEvents="none" style={styles.decorativePeachCircle} />

            {/* Top Navigation Row */}
            <View style={styles.topNavRow}>
              <TouchableOpacity
                style={styles.navCircleButton}
                activeOpacity={0.75}
                onPress={() => router.back()}>
                <ChevronBackIcon size={16} color="#201E1D" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.navCircleButton} activeOpacity={0.75}>
                <ShareIcon size={16} color="#201E1D" />
              </TouchableOpacity>
            </View>

            {/* Date & Location Tag */}
            <Text style={styles.eventDateTag}>
              {eventDetails
                ? `${eventDetails.day} ${eventDetails.month} ${eventDetails.year || '2026'} · ${eventDetails.venue || eventDetails.location}`.toUpperCase()
                : '15 OCT 2026 · KSE, BNEID AL QAR'}
            </Text>

            {/* Event Heading */}
            <Text style={styles.eventTitle}>
              {eventDetails?.title || "59th Engineers'\nDay Celebration"}
            </Text>

            {/* Tags / Pills */}
            <View style={styles.tagsRow}>
              <View style={styles.openPill}>
                <Text style={styles.openPillText}>Open to all</Text>
              </View>

              <View style={styles.familiesPill}>
                <Text style={styles.familiesPillText}>Families welcome</Text>
              </View>

              {isGuest && (
                <View style={styles.guestPassPill}>
                  <Text style={styles.guestPassPillText}>Guest RSVP</Text>
                </View>
              )}
            </View>
          </View>

          {/* Timeline & Evening Program */}
          <View style={styles.bodyContent}>
            <Text style={styles.sectionHeading}>THE EVENING</Text>

            {/* Timeline Container */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineVerticalLine} />

              {/* Step 1: 18:30 Registration */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#C67139' }]} />
                <View style={styles.timelineDetails}>
                  <Text style={[styles.timelineTime, { color: '#C67139' }]}>18:30</Text>
                  <Text style={styles.timelineTitle}>Registration & refreshments</Text>
                  <Text style={styles.timelineSubtitle}>
                    {isGuest ? 'Reception desk check-in for guests' : 'Bring your card — the QR gets you in'}
                  </Text>
                </View>
              </View>

              {/* Step 2: 19:00 Chairman's Address */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#8FA073' }]} />
                <View style={styles.timelineDetails}>
                  <Text style={styles.timelineTime}>19:00</Text>
                  <Text style={styles.timelineTitle}>Chairman's address</Text>
                  <View style={styles.speakerRow}>
                    <View style={[styles.speakerAvatar, { backgroundColor: '#CCDBB2' }]} />
                    <View style={styles.speakerInfo}>
                      <Text style={styles.speakerName}>Engr. Karthikeyan Elangovan</Text>
                      <Text style={styles.speakerRole}>Chairman, Kuwait Chapter</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Step 3: 19:30 Keynote Talk */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#8FA073' }]} />
                <View style={styles.timelineDetails}>
                  <Text style={styles.timelineTime}>19:30</Text>
                  <Text style={styles.timelineTitle}>Importance of Building Commissioning</Text>
                  <View style={styles.speakerRow}>
                    <View style={[styles.speakerAvatar, { backgroundColor: '#FFC6A5' }]} />
                    <View style={styles.speakerInfo}>
                      <Text style={styles.speakerName}>Engr. V. Arubalvan, B.E., CoA</Text>
                      <Text style={styles.speakerRole}>Invited speaker</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Step 4: 20:15 Awards & Dinner */}
              <View style={[styles.timelineItem, styles.lastTimelineItem]}>
                <View style={[styles.timelineDot, { backgroundColor: '#C0B6A5' }]} />
                <View style={styles.timelineDetails}>
                  <Text style={styles.timelineTime}>20:15</Text>
                  <Text style={styles.timelineTitle}>Awards, cultural items & dinner</Text>
                </View>
              </View>
            </View>

            {/* Guest Details Form when browsing as a Guest */}
            {isGuest && (
              <View style={styles.guestFormCard}>
                <Text style={styles.guestFormHeading}>GUEST RSVP DETAILS</Text>
                <Text style={styles.guestFormSub}>
                  No member account required. Enter your details to reserve your seat:
                </Text>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Anand Sharma"
                  placeholderTextColor="#A89F91"
                  value={guestName}
                  onChangeText={setGuestName}
                />

                <Text style={styles.inputLabel}>Kuwait Mobile Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 96598765432"
                  placeholderTextColor="#A89F91"
                  keyboardType="phone-pad"
                  value={guestMobile}
                  onChangeText={setGuestMobile}
                />

                <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. anand@example.com"
                  placeholderTextColor="#A89F91"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                />
              </View>
            )}

            {/* Attendees Banner */}
            <View style={styles.attendeesBanner}>
              <View style={styles.avatarStack}>
                <View style={[styles.stackedAvatar, { backgroundColor: '#8FA073', zIndex: 3 }]} />
                <View style={[styles.stackedAvatar, { backgroundColor: '#FFC6A5', marginLeft: -6, zIndex: 2 }]} />
                <View style={[styles.stackedAvatar, { backgroundColor: '#D5CBBF', marginLeft: -6, zIndex: 1 }]} />
              </View>
              <Text style={styles.attendeesText}>
                <Text style={styles.attendeesBold}>88 attendees</Text> registered for this event
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Panel */}
        <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          {/* Family Count Segmented Control */}
          <View style={styles.familySelectorRow}>
            <Text style={styles.familyPrompt}>Bringing family?</Text>

            <View style={styles.segmentedControl}>
              {['Just me', '+1', '+2', '+3'].map((option, index) => {
                const isSelected = familyCount === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.segmentItem,
                      isSelected && styles.segmentItemSelected,
                      index > 0 && !isSelected && styles.segmentItemBorderLeft,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => setFamilyCount(option)}>
                    <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom RSVP CTA Button */}
          <TouchableOpacity
            style={styles.rsvpButton}
            activeOpacity={0.88}
            disabled={isSubmitting}
            onPress={handleRsvpSubmit}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.rsvpButtonText}>
                {isGuest ? "RSVP as Guest — Engineers' Day" : "RSVP to Engineers' Day"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: colors.eventCardBg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativePeachCircle: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F6DDCB',
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EAD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateTag: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.primaryTerracotta,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  eventTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.3,
    color: colors.textDark,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openPill: {
    backgroundColor: '#FFF2EB',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
  },
  openPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#675F53',
  },
  familiesPill: {
    borderWidth: 1,
    borderColor: colors.profileChipBorder,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  familiesPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.profileChipText,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionHeading: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: '#756C60',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 4,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 8.5,
    top: 6,
    bottom: 24,
    width: 1.5,
    backgroundColor: '#DCD3C4',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    marginRight: 14,
    zIndex: 2,
  },
  timelineDetails: {
    flex: 1,
  },
  timelineTime: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: '#675F53',
    marginBottom: 2,
  },
  timelineTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 15,
    lineHeight: 19,
    color: colors.textDark,
  },
  timelineSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
    marginTop: 3,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  speakerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: colors.textDark,
  },
  speakerRole: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#675F53',
  },
  attendeesBanner: {
    backgroundColor: colors.profileCardBg,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  stackedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.profileCardBg,
  },
  attendeesText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.matchedBannerText,
  },
  attendeesBold: {
    fontFamily: fonts.sansBold,
    color: colors.matchedBannerText,
  },
  bottomPanel: {
    backgroundColor: '#F9F4ED',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  familySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  familyPrompt: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: '#60584E',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F9F4ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D4C8B8',
    overflow: 'hidden',
  },
  segmentItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemSelected: {
    backgroundColor: colors.primaryTerracotta,
  },
  segmentItemBorderLeft: {
    borderLeftWidth: 1,
    borderColor: '#D4C8B8',
  },
  segmentText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: colors.textDark,
  },
  segmentTextSelected: {
    fontFamily: fonts.sansBold,
    color: '#FFFFFF',
  },
  rsvpButton: {
    backgroundColor: colors.primaryTerracotta,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rsvpButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 15.5,
    color: colors.buttonTextLight,
    letterSpacing: -0.2,
  },
  guestPassPill: {
    backgroundColor: '#E8F2E2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginLeft: 8,
  },
  guestPassPillText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#3B6828',
  },
  lastTimelineItem: {
    marginBottom: 0,
    minHeight: 44,
  },
  guestFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginTop: 16,
    marginBottom: 20,
  },
  guestFormHeading: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: '#C67139',
    marginBottom: 4,
  },
  guestFormSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    marginBottom: 14,
    lineHeight: 16,
  },
  inputLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: '#201E1D',
    marginBottom: 5,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E8DCCB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#201E1D',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginHorizontal: 18,
  },
  confirmBadgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmCheckmark: {
    fontSize: 28,
    color: '#3B6828',
    fontWeight: 'bold',
  },
  confirmKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#3B6828',
    marginBottom: 4,
  },
  confirmTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#201E1D',
    marginBottom: 6,
  },
  confirmRef: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#C67139',
    marginBottom: 16,
  },
  confirmDetailsBox: {
    width: '100%',
    backgroundColor: '#FAF4EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    gap: 6,
  },
  confirmDetailRow: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#201E1D',
  },
  confirmLabel: {
    fontFamily: fonts.sansBold,
    color: '#605C55',
  },
  confirmNote: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  doneRsvpButton: {
    width: '100%',
    backgroundColor: '#C67139',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneRsvpButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});
