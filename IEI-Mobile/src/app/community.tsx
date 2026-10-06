import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import {
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
  HeartIcon,
  GraduationCapIcon,
  ChevronRightIcon,
} from '@/components/icons/dashboard-icons';
import { JobIcon } from '@/components/icons/job-icon';
import {
  SearchIcon,
  SpeakersIcon,
  StarBadgeIcon,
  MapPinBadgeIcon,
  LadiesWingIcon,
  ChapterSealIcon,
  ScienceClubIcon,
} from '@/components/icons/community-icons';

import { getVerifiedMember, getAuthLevel } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const verifiedMember = getVerifiedMember();

  if (!verifiedMember || getAuthLevel() === 'GUEST') {
    return (
      <AccessDeniedView
        title="Chapter Community & Directory"
        featureName="The chapter member directory, mentor network, and blood donor registry"
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
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
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>
              240 engineers. Find the one you need.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <SearchIcon size={18} color="#7C6E5E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search all members"
              placeholderTextColor="#7C6E5E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* 2x3 Grid of Highlight Cards */}
          <View style={styles.gridContainer}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              {/* Blood Donors Card (Peach) */}
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: '#FFE1D0' }]}
                activeOpacity={0.85}
                onPress={() => router.push('/blood-donors')}>
                <View style={styles.gridCardIconContainer}>
                  <HeartIcon size={20} color="#C67139" />
                </View>
                <Text style={styles.gridCardTitle}>Blood donors</Text>
                <Text style={[styles.gridCardSubtitle, { color: '#6E503E' }]}>
                  96 willing · 8 groups
                </Text>
              </TouchableOpacity>

              {/* Mentors Card (Sage Green) */}
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: '#E1EECC' }]}
                activeOpacity={0.85}
                onPress={() => router.push('/mentors')}>
                <View style={styles.gridCardIconContainer}>
                  <GraduationCapIcon size={20} color="#272E1B" />
                </View>
                <Text style={styles.gridCardTitle}>Mentors</Text>
                <Text style={[styles.gridCardSubtitle, { color: '#4D5C35' }]}>
                  31 open to mentoring
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              {/* Speakers Card (Tan) */}
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: '#EBDDC5' }]}
                activeOpacity={0.85}>
                <View style={styles.gridCardIconContainer}>
                  <SpeakersIcon size={20} color="#C67139" />
                </View>
                <Text style={styles.gridCardTitle}>Speakers</Text>
                <Text style={styles.gridCardSubtitle}>24 topics offered</Text>
              </TouchableOpacity>

              {/* Job Referrals Card (Tan) */}
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: '#EBDDC5' }]}
                activeOpacity={0.85}>
                <View style={styles.gridCardIconContainer}>
                  <JobIcon size={18} color="#201E1D" />
                </View>
                <Text style={styles.gridCardTitle}>Job referrals</Text>
                <Text style={styles.gridCardSubtitle}>42 can refer</Text>
              </TouchableOpacity>
            </View>

            {/* Row 3 */}
            <View style={styles.gridRow}>
              {/* Carpool Card (Off-white / Soft Cream) */}
              <TouchableOpacity
                style={[styles.gridCard, styles.gridCardLight]}
                activeOpacity={0.85}>
                <Text style={[styles.gridCardTitle, { marginTop: 0 }]}>Carpool</Text>
                <Text style={styles.gridCardSubtitle}>9 zone leads</Text>
              </TouchableOpacity>

              {/* Sponsors Card (Off-white / Soft Cream) */}
              <TouchableOpacity
                style={[styles.gridCard, styles.gridCardLight]}
                activeOpacity={0.85}>
                <Text style={[styles.gridCardTitle, { marginTop: 0 }]}>Sponsors</Text>
                <Text style={styles.gridCardSubtitle}>6 introductions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION: THE CHAPTER */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>THE CHAPTER</Text>

            {/* About the Kuwait Chapter */}
            <TouchableOpacity style={styles.chapterCard} activeOpacity={0.8}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#F9F4ED' }]}>
                <ChapterSealIcon size={26} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>About the Kuwait Chapter</Text>
                <Text style={styles.cardSubtitle}>
                  Since 1995 · by-laws, code of ethics
                </Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>

            {/* Membership grades & benefits */}
            <TouchableOpacity style={styles.chapterCard} activeOpacity={0.8}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#FFE1D0' }]}>
                <StarBadgeIcon size={18} color="#C67139" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Membership grades & benefits</Text>
                <Text style={styles.cardSubtitle}>FIE · MIE · AMIE · TIE · SMIE</Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>

            {/* Chapter office & links */}
            <TouchableOpacity style={styles.chapterCard} activeOpacity={0.8}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#CCDBB2' }]}>
                <MapPinBadgeIcon size={18} color="#272E1B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Chapter office & links</Text>
                <Text style={styles.cardSubtitle}>
                  KSE, Bneid Al Qar · +965 90098667
                </Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>
          </View>

          {/* SECTION: CHAPTER SPACES */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>CHAPTER SPACES</Text>

            {/* Ladies Wing */}
            <TouchableOpacity
              style={styles.chapterCard}
              activeOpacity={0.8}
              onPress={() => router.push('/wing-feed?slug=ladies-wing')}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#FFE1D0' }]}>
                <LadiesWingIcon size={18} color="#C67139" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Ladies Wing</Text>
                <Text style={styles.cardSubtitle}>
                  Executive & community initiatives
                </Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>

            {/* Science Club */}
            <TouchableOpacity
              style={styles.chapterCard}
              activeOpacity={0.8}
              onPress={() => router.push('/wing-feed?slug=science-club')}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#E1EECC' }]}>
                <ScienceClubIcon size={18} color="#272E1B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Science Club</Text>
                <Text style={styles.cardSubtitle}>
                  For the children of the IEI family
                </Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>

            {/* Young Engineers Forum */}
            <TouchableOpacity style={styles.chapterCard} activeOpacity={0.8}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#CCDBB2' }]}>
                <GraduationCapIcon size={18} color="#272E1B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Young Engineers Forum</Text>
                <Text style={styles.cardSubtitle}>
                  Under 35 · workshops & networking
                </Text>
              </View>
              <ChevronRightIcon size={14} color="#8D7B68" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Tab Bar with 'Community' active */}
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

          {/* Community Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabCommunityIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Community</Text>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#605C55',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBDDC5',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#201E1D',
  },

  // Grid
  gridContainer: {
    gap: 12,
    marginBottom: 26,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  gridCardLight: {
    backgroundColor: '#FAF4EA',
  },
  gridCardIconContainer: {
    marginBottom: 8,
  },
  gridCardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
    marginBottom: 3,
  },
  gridCardSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBDDC5',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  cardIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: '#201E1D',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
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
});
