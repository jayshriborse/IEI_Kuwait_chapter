import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import {
  BellIcon,
  ClockIcon,
  ChevronRightIcon,
  HeartIcon,
  GraduationCapIcon,
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
} from '@/components/icons/dashboard-icons';

import {
  getVerifiedMember,
  updateMemberProfileField,
  subscribeMemberSession,
  initMemberSessionStore,
  calculateProfileProgress,
  getAuthLevel,
  getAuthToken,
  fetchPublicEvents,
  MemberRecord,
} from '@/data/member-session';
import { ProgrammeEvent } from '@/data/events';
import { AccessDeniedView } from '@/components/access-denied-view';
import { getApiBaseUrl } from '@/utils/api';

interface SubscriptionData {
  status: 'DUE' | 'AWAITING_CONFIRMATION' | 'PAID';
  period: {
    label: string;
    startsOn: string;
    endsOn: string;
  };
  amountKd: string;
  currency: string;
  paidUpTo: string | null;
  showDuesBand: boolean;
  treasurerName: string | null;
}

export interface ProfileFieldDef {
  key: keyof MemberRecord;
  label: string;
  shortLabel: string;
  icon: string;
  placeholder: string;
  options?: (string | number)[];
}

export const PRIMARY_FIELDS: ProfileFieldDef[] = [
  {
    key: 'company',
    label: 'Company / Employer',
    shortLabel: 'Company',
    icon: '🏢',
    placeholder: 'e.g. KEO International Consultants',
  },
  {
    key: 'designation',
    label: 'Designation / Job Title',
    shortLabel: 'Designation',
    icon: '💼',
    placeholder: 'e.g. Senior Civil Engineer',
  },
  {
    key: 'governorate',
    label: 'Governorate',
    shortLabel: 'Governorate',
    icon: '📍',
    placeholder: 'Select governorate',
    options: [
      'Hawalli',
      'Capital (Al Asimah)',
      'Farwaniya',
      'Ahmadi',
      'Jahra',
      'Mubarak Al-Kabeer',
    ],
  },
];

export const SECONDARY_FIELDS: ProfileFieldDef[] = [
  {
    key: 'sector',
    label: 'Sector / Industry',
    shortLabel: 'Sector',
    icon: '⚡',
    placeholder: 'Select or enter sector',
    options: [
      'Oil & Gas',
      'Construction',
      'Consultancy',
      'Power & Water',
      'IT & Telecom',
      'Banking & Finance',
      'Public Works',
    ],
  },
  {
    key: 'areaLocality',
    label: 'Area / Locality',
    shortLabel: 'Area / Locality',
    icon: '🏠',
    placeholder: 'e.g. Salmiya',
    options: [
      'Salmiya',
      'Abbassiya',
      'Fahaheel',
      'Kuwait City',
      'Mangaf',
      'Jabriya',
      'Mahboula',
    ],
  },
  {
    key: 'familyStatus',
    label: 'Family Status in Kuwait',
    shortLabel: 'Family Status',
    icon: '👨‍👩‍👧',
    placeholder: 'Select family status',
    options: ['Family here', 'Bachelor status'],
  },
  {
    key: 'familyMembersCount',
    label: 'Family Members in Kuwait',
    shortLabel: 'Family Members',
    icon: '👥',
    placeholder: 'Select count',
    options: [1, 2, 3, 4, 5],
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Home' | 'Events' | 'Jobs' | 'Gallery' | 'Card' | 'Community' | 'Me'>('Home');

  const [member, setMember] = useState<MemberRecord | null>(getVerifiedMember());
  const [expandedMore, setExpandedMore] = useState(false);
  const [editingField, setEditingField] = useState<ProfileFieldDef | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [isSavingField, setIsSavingField] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<ProgrammeEvent | null>(null);

  const fetchUpcomingEvent = async () => {
    try {
      const res = await fetchPublicEvents('upcoming');
      if (res.success && res.data && res.data.length > 0) {
        setUpcomingEvent(res.data[0]);
      } else {
        setUpcomingEvent(null);
      }
    } catch (err) {
      console.warn('Failed to load upcoming events:', err);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${getApiBaseUrl()}/me/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
      }
    } catch (err) {
      console.warn('Failed to load subscription:', err);
    }
  };

  useEffect(() => {
    initMemberSessionStore();
    fetchSubscription();
    fetchUpcomingEvent();
    const unsub = subscribeMemberSession(() => {
      setMember(getVerifiedMember());
      fetchSubscription();
      fetchUpcomingEvent();
    });
    return unsub;
  }, []);

  const progress = calculateProfileProgress(member);

  const openFieldEditor = (field: ProfileFieldDef) => {
    setEditingField(field);
    const existing = member ? member[field.key] : '';
    setFieldValue(existing !== null && existing !== undefined ? String(existing) : '');
  };

  const handleSaveField = async () => {
    if (!editingField) return;
    const memberCode = member ? member.memberCode : 'IEI0005';
    setIsSavingField(true);
    try {
      let finalVal: any = fieldValue.trim();
      if (editingField.key === 'familyMembersCount') {
        const num = parseInt(finalVal, 10);
        finalVal = isNaN(num) ? null : num;
      }
      await updateMemberProfileField(memberCode, editingField.key, finalVal);
      setEditingField(null);
      setFieldValue('');
    } catch (err) {
      console.warn('Error saving field:', err);
    } finally {
      setIsSavingField(false);
    }
  };

  const handleClearField = async () => {
    if (!editingField) return;
    const memberCode = member ? member.memberCode : 'IEI0005';
    setIsSavingField(true);
    try {
      await updateMemberProfileField(memberCode, editingField.key, null);
      setEditingField(null);
      setFieldValue('');
    } catch (err) {
      console.warn('Error clearing field:', err);
    } finally {
      setIsSavingField(false);
    }
  };

  // Remaining unadded secondary fields
  const unaddedSecondary = SECONDARY_FIELDS.filter((f) => {
    const val = member ? member[f.key] : null;
    return val === null || val === undefined || val === '';
  });

  if (!member || getAuthLevel() === 'GUEST') {
    return <AccessDeniedView title="Member Dashboard" featureName="The Member Dashboard" />;
  }

  // Member is verified
  const displayName = member.firstName || 'Member';
  const displayGrade = member.grade || 'MIE';
  const displayDiscipline = (member.discipline || 'CIVIL').split(' ')[0].toUpperCase();
  const yearsMember = Math.max(1, 2026 - (member.memberSinceYear || 2011));
  const duesTitle =
    subscriptionData?.status === 'AWAITING_CONFIRMATION'
      ? 'Awaiting confirmation'
      : 'Subscription due';
  const duesSub = subscriptionData
    ? subscriptionData.status === 'AWAITING_CONFIRMATION'
      ? `KD ${subscriptionData.amountKd} · with the treasurer`
      : subscriptionData.paidUpTo
        ? `KD ${subscriptionData.amountKd} · paid up to ${new Date(subscriptionData.paidUpTo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `KD ${subscriptionData.amountKd} · due for ${subscriptionData.period?.label || ''}`
    : '';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Column */}
      <View style={styles.mainWrapper}>
        {/* Scrollable Page Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Hero Section with Chocolate Brown Card */}
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
                <Text style={styles.chapterTag}>KUWAIT CHAPTER</Text>
                <Text style={styles.greetingText}>Good evening, {displayName}</Text>
              </View>

              <TouchableOpacity
                style={styles.bellButton}
                activeOpacity={0.75}
                onPress={() => router.push('/notifications')}>
                <BellIcon size={18} color="#F9F4ED" />
              </TouchableOpacity>
            </View>

            {/* 3 Stats Cards */}
            <View style={styles.statsRow}>
              {/* Card 1 */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{displayGrade}</Text>
                <Text style={styles.statLabel}>GRADE · {displayDiscipline}</Text>
              </View>

              {/* Card 2 */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{yearsMember}</Text>
                <Text style={styles.statLabel}>YEARS A{'\n'}MEMBER</Text>
              </View>

              {/* Card 3 */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>EVENTS '26</Text>
              </View>
            </View>
          </View>

          {/* Cards Body Section */}
          <View style={styles.cardsBody}>
            {/* Subscription Due Banner */}
            {subscriptionData?.showDuesBand ? (
              <View style={styles.subscriptionCard}>
                <View style={styles.clockIconCircle}>
                  <ClockIcon size={18} color="#FFFFFF" />
                </View>

                <View style={styles.subscriptionTextContainer}>
                  <Text style={styles.subscriptionTitle}>{duesTitle}</Text>
                  <Text style={styles.subscriptionSubtitle}>{duesSub}</Text>
                </View>

                <TouchableOpacity
                  style={styles.renewButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push(
                      subscriptionData.status === 'AWAITING_CONFIRMATION'
                        ? '/with-treasurer'
                        : '/renew',
                    )
                  }>
                  <Text style={styles.renewButtonText}>Renew</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Next Up Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>NEXT UP</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/events')}>
                <Text style={styles.sectionHeaderLink}>All events</Text>
              </TouchableOpacity>
            </View>

            {/* Next Up Event Card */}
            {upcomingEvent ? (
              <View style={styles.eventCard}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>{upcomingEvent.day}</Text>
                  <Text style={styles.eventDateMonth}>{upcomingEvent.month}</Text>
                </View>

                <View style={styles.eventDetails}>
                  <Text style={styles.eventCategory}>
                    {upcomingEvent.status === 'ONGOING'
                      ? 'ONGOING'
                      : (upcomingEvent.category || "ENGINEERS' DAY")}
                  </Text>
                  <Text style={styles.eventTitle}>{upcomingEvent.title}</Text>
                  <Text style={styles.eventVenue}>
                    {upcomingEvent.time
                      ? `${upcomingEvent.time} · ${upcomingEvent.venue || upcomingEvent.location}`
                      : upcomingEvent.location}
                  </Text>

                  <View style={styles.eventActionRow}>
                    <TouchableOpacity
                      style={styles.rsvpButton}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/rsvp?eventId=${upcomingEvent.id}`)}>
                      <Text style={styles.rsvpButtonText}>
                        {upcomingEvent.isRsvpd ? '✓ RSVP Confirmed' : 'RSVP'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      activeOpacity={0.75}
                      onPress={() => router.push('/events')}>
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Profile Progress Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Text style={styles.profileTitle}>Your profile is {progress.percentage}% complete</Text>
                <Text style={styles.profileRound}>Round 1</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
              </View>

              {/* Missing field pills & Saved chips */}
              <View style={styles.chipsRow}>
                {/* 1. Primary Fields: Company, Designation, Governorate */}
                {PRIMARY_FIELDS.map((f) => {
                  const val = member ? member[f.key] : null;
                  if (val !== null && val !== undefined && val !== '') {
                    return (
                      <TouchableOpacity
                        key={f.key}
                        style={styles.chipButtonSaved}
                        activeOpacity={0.8}
                        onPress={() => openFieldEditor(f)}>
                        <Text style={styles.chipTextSaved}>
                          {f.icon} {String(val)}
                        </Text>
                        <Text style={styles.chipEditBadge}>✎</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={f.key}
                      style={styles.chipButton}
                      activeOpacity={0.75}
                      onPress={() => openFieldEditor(f)}>
                      <Text style={styles.chipText}>+ {f.shortLabel}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* 2. Secondary Fields that are already saved */}
                {SECONDARY_FIELDS.filter((f) => {
                  const val = member ? member[f.key] : null;
                  return val !== null && val !== undefined && val !== '';
                }).map((f) => {
                  const val = member![f.key];
                  const displayStr =
                    f.key === 'familyMembersCount'
                      ? `${val} family member${Number(val) > 1 ? 's' : ''}`
                      : String(val);
                  return (
                    <TouchableOpacity
                      key={f.key}
                      style={styles.chipButtonSaved}
                      activeOpacity={0.8}
                      onPress={() => openFieldEditor(f)}>
                      <Text style={styles.chipTextSaved}>
                        {f.icon} {displayStr}
                      </Text>
                      <Text style={styles.chipEditBadge}>✎</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* 3. If expanded, show remaining unadded secondary fields */}
                {expandedMore &&
                  unaddedSecondary.map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={styles.chipButton}
                      activeOpacity={0.75}
                      onPress={() => openFieldEditor(f)}>
                      <Text style={styles.chipText}>+ {f.shortLabel}</Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Dynamic "+ X more" / "Show less" button */}
              {unaddedSecondary.length > 0 && (
                <TouchableOpacity
                  style={styles.moreChipButton}
                  activeOpacity={0.75}
                  onPress={() => setExpandedMore(!expandedMore)}>
                  <Text style={styles.moreChipText}>
                    {expandedMore
                      ? 'Show less ▲'
                      : `+ ${unaddedSecondary.length} more`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* UTSAV 2026 Alert Notice */}
            <TouchableOpacity style={styles.utsavCard} activeOpacity={0.85}>
              <View style={styles.orangeDot} />
              <Text style={styles.utsavText}>
                <Text style={styles.utsavBold}>UTSAV 2026</Text> headcount closes Friday — you haven't
                replied.
              </Text>
              <ChevronRightIcon size={14} color="#6E665C" />
            </TouchableOpacity>

            {/* Dual Cards: Blood Donors & Mentors */}
            <View style={styles.dualCardsRow}>
              {/* Blood Donors Card */}
              <TouchableOpacity
                style={styles.dualCard}
                activeOpacity={0.85}
                onPress={() => router.push('/blood-donors')}>
                <HeartIcon size={20} color="#C67139" />
                <Text style={styles.dualCardTitle}>Blood donors</Text>
                <Text style={styles.dualCardSubtitle}>96 willing</Text>
              </TouchableOpacity>

              {/* Mentors Card */}
              <TouchableOpacity
                style={styles.dualCard}
                activeOpacity={0.85}
                onPress={() => router.push('/mentors')}>
                <GraduationCapIcon size={20} color="#272E1B" />
                <Text style={styles.dualCardTitle}>Mentors</Text>
                <Text style={styles.dualCardSubtitle}>21 open to it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {/* Home Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Home')}>
            <TabHomeIcon size={20} color={activeTab === 'Home' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Home' && styles.tabLabelActive,
              ]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Events Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/events')}>
            <TabEventsIcon size={20} color={activeTab === 'Events' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Events' && styles.tabLabelActive,
              ]}>
              Events
            </Text>
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/jobs')}>
            <TabJobsIcon size={20} color={activeTab === 'Jobs' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Jobs' && styles.tabLabelActive,
              ]}>
              Jobs
            </Text>
          </TouchableOpacity>

          {/* Gallery Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/gallery')}>
            <TabGalleryIcon size={20} color={activeTab === 'Gallery' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Gallery' && styles.tabLabelActive,
              ]}>
              Gallery
            </Text>
          </TouchableOpacity>

          {/* Card Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/card')}>
            <TabCardIcon size={20} color={activeTab === 'Card' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Card' && styles.tabLabelActive,
              ]}>
              Card
            </Text>
          </TouchableOpacity>

          {/* Community Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/community')}>
            <TabCommunityIcon size={20} color={activeTab === 'Community' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Community' && styles.tabLabelActive,
              ]}>
              Community
            </Text>
          </TouchableOpacity>

          {/* Me Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/profile')}>
            <TabMeIcon size={20} color={activeTab === 'Me' ? colors.tabActive : colors.tabInactive} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'Me' && styles.tabLabelActive,
              ]}>
              Me
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Field Editor Modal */}
      <Modal
        visible={Boolean(editingField)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}>
        <View style={styles.fieldModalOverlay}>
          <View style={styles.fieldModalContent}>
            <View style={styles.fieldModalHeader}>
              <Text style={styles.fieldModalTitle}>
                {editingField?.icon}{' '}
                {editingField && member && member[editingField.key]
                  ? `Edit ${editingField.shortLabel}`
                  : `Add ${editingField?.shortLabel}`}
              </Text>
              <TouchableOpacity
                onPress={() => setEditingField(null)}
                style={styles.fieldModalCloseBtn}
                activeOpacity={0.7}>
                <Text style={styles.fieldModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldModalSubtitle}>
              {editingField?.label} — saves to your member profile
            </Text>

            {/* Quick Option Pills if defined */}
            {editingField?.options && (
              <View style={styles.modalOptionsContainer}>
                <Text style={styles.modalOptionsLabel}>Quick select:</Text>
                <View style={styles.modalOptionsGrid}>
                  {editingField.options.map((opt) => {
                    const isSelected = String(fieldValue) === String(opt);
                    return (
                      <TouchableOpacity
                        key={String(opt)}
                        style={[
                          styles.modalOptionPill,
                          isSelected && styles.modalOptionPillSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setFieldValue(String(opt))}>
                        <Text
                          style={[
                            styles.modalOptionText,
                            isSelected && styles.modalOptionTextSelected,
                          ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Direct Text Input */}
            <TextInput
              style={styles.fieldModalInput}
              placeholder={editingField?.placeholder || 'Enter value...'}
              placeholderTextColor="#8D7B68"
              value={fieldValue}
              onChangeText={setFieldValue}
              autoCapitalize={editingField?.key === 'familyMembersCount' ? 'none' : 'words'}
              keyboardType={editingField?.key === 'familyMembersCount' ? 'numeric' : 'default'}
            />

            {/* Action Buttons Row */}
            <View style={styles.fieldModalButtonsRow}>
              {Boolean(editingField && member && member[editingField.key]) && (
                <TouchableOpacity
                  style={styles.fieldModalClearButton}
                  activeOpacity={0.7}
                  disabled={isSavingField}
                  onPress={handleClearField}>
                  <Text style={styles.fieldModalClearText}>Clear</Text>
                </TouchableOpacity>
              )}

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                style={styles.fieldModalCancelButton}
                activeOpacity={0.7}
                disabled={isSavingField}
                onPress={() => setEditingField(null)}>
                <Text style={styles.fieldModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fieldModalSaveButton}
                activeOpacity={0.85}
                disabled={isSavingField}
                onPress={handleSaveField}>
                {isSavingField ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.fieldModalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 28,
  },
  headerHero: {
    backgroundColor: colors.dashboardHeaderBg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sealContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
    color: '#D8CEC3',
    textTransform: 'uppercase',
  },
  greetingText: {
    fontFamily: fonts.displayBold,
    fontSize: 17.5,
    color: colors.textHeading,
    marginTop: 1,
    letterSpacing: -0.2,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.dashboardBellCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dashboardStatCardBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 74,
    justifyContent: 'space-between',
  },
  statValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 18,
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: '#D8CEC3',
    textTransform: 'uppercase',
    lineHeight: 12,
  },
  cardsBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  subscriptionCard: {
    backgroundColor: colors.subscriptionCardBg,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clockIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryTerracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  subscriptionTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 14.5,
    color: colors.textDark,
  },
  subscriptionSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#554D43',
    marginTop: 2,
  },
  renewButton: {
    backgroundColor: colors.primaryTerracotta,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: '#756C60',
    textTransform: 'uppercase',
  },
  sectionHeaderLink: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#643312',
  },
  eventCard: {
    backgroundColor: colors.eventCardBg,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventDateBadge: {
    backgroundColor: colors.eventDateBadgeBg,
    width: 82,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  eventDateDay: {
    fontFamily: fonts.displayBlack,
    fontSize: 26,
    color: colors.eventDateBadgeText,
    lineHeight: 28,
  },
  eventDateMonth: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.eventDateBadgeText,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  eventDetails: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  eventCategory: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.primaryTerracotta,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 15.5,
    color: colors.textDark,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  eventVenue: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#60584E',
    marginTop: 3,
  },
  eventActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rsvpButton: {
    backgroundColor: colors.primaryTerracotta,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsvpButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  detailsButton: {
    marginLeft: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  detailsButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 13,
    color: colors.primaryTerracotta,
  },
  profileCard: {
    backgroundColor: colors.profileCardBg,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 14.5,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  profileRound: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#505A3E',
  },
  progressTrack: {
    backgroundColor: colors.profileProgressTrack,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 12,
  },
  progressFill: {
    backgroundColor: colors.profileProgressFill,
    height: 7,
    borderRadius: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    borderWidth: 1,
    borderColor: colors.profileChipBorder,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.profileChipText,
  },
  chipButtonSaved: {
    borderWidth: 1,
    borderColor: '#7A8C5E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(143, 160, 115, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipTextSaved: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#2C3A1A',
  },
  chipEditBadge: {
    fontSize: 9.5,
    color: '#506335',
    marginLeft: 2,
  },
  moreChipButton: {
    backgroundColor: colors.profileMoreChipBg,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  moreChipText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    color: colors.profileMoreChipText,
  },

  // Modal styles
  fieldModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fieldModalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F5EAD8',
    borderRadius: 22,
    padding: 22,
  },
  fieldModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldModalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
  },
  fieldModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBDDC5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldModalCloseText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#504B42',
  },
  fieldModalSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    marginBottom: 14,
    lineHeight: 16,
  },
  modalOptionsContainer: {
    marginBottom: 12,
  },
  modalOptionsLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalOptionPill: {
    backgroundColor: '#EBDDC5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD0B8',
  },
  modalOptionPillSelected: {
    backgroundColor: '#C67139',
    borderColor: '#C67139',
  },
  modalOptionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#40382E',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontFamily: fonts.sansBold,
  },
  fieldModalInput: {
    backgroundColor: '#EBDDC5',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 18,
  },
  fieldModalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldModalClearButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  fieldModalClearText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: '#B91C1C',
  },
  fieldModalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fieldModalCancelText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#8D7B68',
  },
  fieldModalSaveButton: {
    backgroundColor: '#C67139',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldModalSaveText: {
    fontFamily: fonts.displayBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  utsavCard: {
    backgroundColor: colors.utsavCardBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryTerracotta,
    marginRight: 10,
  },
  utsavText: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
    color: '#3E382F',
    marginRight: 6,
  },
  utsavBold: {
    fontFamily: fonts.sansBold,
    color: colors.textDark,
  },
  dualCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dualCard: {
    flex: 1,
    backgroundColor: colors.bottomCardBg,
    borderRadius: 22,
    padding: 16,
    height: 125,
    justifyContent: 'flex-start',
  },
  dualCardTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.textDark,
    marginTop: 12,
  },
  dualCardSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderColor: colors.tabBarBorder,
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
    fontSize: 9.5,
    color: colors.tabInactive,
    marginTop: 3,
  },
  tabLabelActive: {
    fontFamily: fonts.sansBold,
    color: colors.tabActive,
  },
});
