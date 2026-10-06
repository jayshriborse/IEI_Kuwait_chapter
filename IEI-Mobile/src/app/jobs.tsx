import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import { JobIcon } from '@/components/icons/job-icon';
import {
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
} from '@/components/icons/dashboard-icons';
import { JOB_POSTINGS, CATEGORIES } from '@/data/jobs';

export default function JobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredJobs = JOB_POSTINGS.filter(
    (job) =>
      selectedCategory === 'All' ||
      job.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Header Title & Subtitle */}
          <Text style={styles.screenTitle}>IEI Job Portal</Text>
          <Text style={styles.screenSubtitle}>
            Engineering vacancies in Kuwait, posted by members and employers
          </Text>

          {/* Sample disclaimer row */}
          <View style={styles.disclaimerRow}>
            <View style={styles.disclaimerPill}>
              <Text style={styles.disclaimerPillText}>Sample postings</Text>
            </View>
            <Text style={styles.disclaimerNote}>
              Employers, salaries and referrals are illustrative
            </Text>
          </View>

          {/* Stats Banner & Post Vacancy CTA */}
          <View style={styles.statsCtaRow}>
            <View style={styles.statsBanner}>
              <Text style={styles.statsBannerTitle}>
                {selectedCategory === 'All'
                  ? `${JOB_POSTINGS.length} sample postings`
                  : `${filteredJobs.length} posting${filteredJobs.length === 1 ? '' : 's'}`}
              </Text>
              <Text style={styles.statsBannerSubtitle}>
                {selectedCategory === 'All'
                  ? 'Illustrative until the employer feed is live'
                  : `Filtered by ${selectedCategory}`}
              </Text>
            </View>

            <TouchableOpacity style={styles.postVacancyButton} activeOpacity={0.8}>
              <Text style={styles.postVacancyText}>Post a vacancy</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCategory(category)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Job Postings List */}
          <View style={styles.jobsList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/job-detail',
                      params: { id: job.id },
                    })
                  }>
                  {/* Top Row: Icon + Titles + TimeAgo */}
                  <View style={styles.jobCardTopRow}>
                    <View style={[styles.jobIconCircle, { backgroundColor: job.iconBg }]}>
                      <JobIcon size={16} color="#201E1D" />
                    </View>

                    <View style={styles.jobTitleCol}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobCompany}>{job.company}</Text>
                    </View>

                    <Text style={styles.jobTimeAgo}>{job.timeAgo}</Text>
                  </View>

                  {/* Tags Row */}
                  <View style={styles.tagsRow}>
                    <View style={styles.locationPill}>
                      <Text style={styles.locationPillText}>{job.location}</Text>
                    </View>

                    <View style={styles.typePill}>
                      <Text style={styles.typePillText}>{job.type}</Text>
                    </View>

                    <View style={styles.salaryPill}>
                      <Text style={styles.salaryPillText}>{job.salary}</Text>
                    </View>
                  </View>

                  {/* Referral Note if available */}
                  {job.referralNote ? (
                    <Text style={styles.referralText}>{job.referralNote}</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No postings in {selectedCategory}</Text>
                <Text style={styles.emptySubtitle}>
                  Select "All" to browse all available vacancies.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar with 'Jobs' active */}
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

          {/* Jobs Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabJobsIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Jobs</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  screenTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 26,
    color: colors.textDark,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#675F53',
    marginTop: 4,
    marginBottom: 12,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  disclaimerPill: {
    backgroundColor: '#F9F4ED',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  disclaimerPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textDark,
  },
  disclaimerNote: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#675F53',
    flex: 1,
  },
  statsCtaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 16,
  },
  statsBanner: {
    flex: 1,
    backgroundColor: '#E1EECC',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  statsBannerTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  statsBannerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
    color: '#505A3E',
    marginTop: 2,
  },
  postVacancyButton: {
    backgroundColor: '#F9F4ED',
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postVacancyText: {
    fontFamily: fonts.displayBlack,
    fontSize: 13,
    color: colors.textDark,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#BCB4A6',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: colors.primaryTerracotta,
    borderColor: colors.primaryTerracotta,
  },
  filterChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#675F53',
  },
  filterChipTextSelected: {
    fontFamily: fonts.sansBold,
    color: '#FFFFFF',
  },
  jobsList: {
    gap: 14,
  },
  jobCard: {
    backgroundColor: colors.eventCardBg,
    borderRadius: 20,
    padding: 16,
  },
  jobCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  jobIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  jobTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: colors.textDark,
  },
  jobCompany: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#675F53',
    marginTop: 2,
  },
  jobTimeAgo: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#8B8378',
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  locationPill: {
    backgroundColor: '#F9F4ED',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  locationPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#40382E',
  },
  typePill: {
    borderWidth: 1,
    borderColor: colors.primaryTerracotta,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  typePillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#8C5A34',
  },
  salaryPill: {
    backgroundColor: '#F9F4ED',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  salaryPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#40382E',
  },
  referralText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#675F53',
    marginTop: 10,
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
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#605C55',
    textAlign: 'center',
  },
});
