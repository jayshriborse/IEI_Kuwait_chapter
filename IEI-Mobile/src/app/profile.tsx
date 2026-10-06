import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
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
import { ShieldHexIcon } from '../components/icons/profile-icons';

interface MenuItem {
  id: string;
  title: string;
  value?: string;
  route?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', title: 'My RSVPs', value: '2 upcoming', route: '/rsvp' },
  { id: '2', title: 'My receipts', value: 'Awaiting 1', route: '/my-receipts' },
  { id: '3', title: 'Subscription & renewal', value: 'KD 20 due', route: '/renew' },
  { id: '4', title: 'Family members', value: '3 in Kuwait' },
  { id: '5', title: 'Registers I appear in', value: 'Donors, mentors', route: '/blood-donors' },
  { id: '6', title: 'Privacy & consent', value: 'Shared' },
  { id: '7', title: 'Notifications', route: '/notifications' },
  { id: '8', title: 'Contact the chapter office' },
];

import { Image } from 'react-native';
import {
  getVerifiedMember,
  logoutMemberSession,
  calculateProfileProgress,
  subscribeMemberSession,
} from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [verifiedMember, setVerifiedMember] = React.useState(getVerifiedMember());

  React.useEffect(() => {
    return subscribeMemberSession(() => {
      setVerifiedMember(getVerifiedMember());
    });
  }, []);

  const progress = calculateProfileProgress(verifiedMember);

  const handleSignOut = () => {
    logoutMemberSession();
    router.replace('/');
  };

  if (!verifiedMember) {
    return (
      <AccessDeniedView
        title="Personal Profile"
        featureName="Member profile management and receipts"
      />
    );
  }

  const initials = verifiedMember.fullName
    .replace(/^Engr?\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const locationShort = verifiedMember.location.split('·')[0].trim();
  const disciplineShort = verifiedMember.discipline.split(' ')[0];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Top Profile Header */}
          <View style={styles.headerRow}>
            <View style={styles.avatarCircle}>
              {verifiedMember.photoUri ? (
                <Image source={{ uri: verifiedMember.photoUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{verifiedMember.fullName}</Text>
              <Text style={styles.userSubtitle}>
                {verifiedMember.memberCode} · {verifiedMember.grade} · {disciplineShort} · {locationShort}
              </Text>
            </View>
          </View>

          {/* Profile Completion Card */}
          <View style={styles.completionCard}>
            <View style={styles.completionTopRow}>
              <Text style={styles.completionTitle}>Profile {progress.percentage}% complete</Text>
              <Text style={styles.completionAction}>Finish Round 1</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
            </View>
          </View>

          {/* Menu Items Card */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItemRow,
                  index === MENU_ITEMS.length - 1 && styles.menuItemRowLast,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any);
                  }
                }}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>

                <View style={styles.menuItemRight}>
                  {item.value ? (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  ) : null}
                  <ChevronRightIcon size={14} color="#8D7B68" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Switch to EC tools Banner (Visible ONLY if member is an EC Officer) */}
          {verifiedMember.role === 'EC_OFFICER' ? (
            <TouchableOpacity
              style={styles.ecToolsBanner}
              activeOpacity={0.85}
              onPress={() => router.push('/ec-tools')}>
              <View style={styles.ecIconContainer}>
                <ShieldHexIcon size={22} color="#F9F4ED" />
              </View>

              <View style={styles.ecTextContainer}>
                <Text style={styles.ecTitle}>Switch to EC tools</Text>
                <Text style={styles.ecSubtitle}>Treasurer & secretary workflows</Text>
              </View>

              <ChevronRightIcon size={15} color="#F9F4ED" />
            </TouchableOpacity>
          ) : null}

          {/* Sign out CTA */}
          <TouchableOpacity
            style={styles.signOutButton}
            activeOpacity={0.8}
            onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Tab Bar with 'Me' active */}
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {/* Home Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/dashboard')}>
            <TabHomeIcon size={20} color={colors.tabInactive} />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>

          {/* Events Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/events')}>
            <TabEventsIcon size={20} color={colors.tabInactive} />
            <Text style={styles.tabLabel}>Events</Text>
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

          {/* Me Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabMeIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Me</Text>
          </TouchableOpacity>
        </View>
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

  // Top Profile Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CCDBB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#201E1D',
    marginBottom: 3,
  },
  userSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
  },

  // Profile Completion Card
  completionCard: {
    backgroundColor: '#E1EECC',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  completionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
  },
  completionAction: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: '#272E1B',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#D0E2B4',
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5B6F40',
    borderRadius: 9999,
  },

  // Menu Card
  menuCard: {
    backgroundColor: '#FAF4EA',
    borderRadius: 22,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBDDC5',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE0CE',
  },
  menuItemRowLast: {
    borderBottomWidth: 0,
  },
  menuItemTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14.5,
    color: '#201E1D',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#6E665C',
  },

  // EC Tools Banner
  ecToolsBanner: {
    backgroundColor: '#643312',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ecIconContainer: {
    marginRight: 12,
  },
  ecTextContainer: {
    flex: 1,
  },
  ecTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#F9F4ED',
    marginBottom: 2,
  },
  ecSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#D8CEC3',
  },

  // Sign out Button
  signOutButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  signOutText: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#C67139',
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
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  lockCard: {
    backgroundColor: '#FAF4EA',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4D8C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE1D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  lockIconText: {
    fontSize: 26,
  },
  lockTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#201E1D',
    marginBottom: 10,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#605C55',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#C67139',
    height: 52,
    borderRadius: 26,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});
