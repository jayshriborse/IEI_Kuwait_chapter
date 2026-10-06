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
import { PhotoFrameIcon } from '@/components/icons/photo-frame-icon';
import {
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
} from '@/components/icons/dashboard-icons';

interface AlbumItem {
  id: string;
  title: string;
  subtitle: string;
}

const ALBUMS: AlbumItem[] = [
  {
    id: '1',
    title: "Movember — men's health event",
    subtitle: 'Nov 2025 · Events',
  },
  {
    id: '2',
    title: 'Technical Seminar — wellhead control panels',
    subtitle: '27 Oct 2025 · Seminars',
  },
  {
    id: '3',
    title: 'Technical Seminar — September 2025',
    subtitle: '22 Sep 2025 · Seminars',
  },
  {
    id: '4',
    title: '4th International Conference',
    subtitle: '13 Feb 2025 · Events',
  },
  {
    id: '5',
    title: 'Annual General Meeting 2025',
    subtitle: '10 Jan 2025 · Meetings',
  },
  {
    id: '6',
    title: 'Family Day Outing 2024',
    subtitle: '15 Dec 2024 · Social',
  },
];

export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedYear, setSelectedYear] = useState<string>('All');

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
          <Text style={styles.screenTitle}>Gallery</Text>
          <Text style={styles.screenSubtitle}>
            Photographs from chapter events
          </Text>

          {/* Year Filter Pills */}
          <View style={styles.filterRow}>
            {['All', '2025', '2024', 'Earlier'].map((year) => {
              const isSelected = selectedYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedYear(year)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Featured Large Upload Dropzone */}
          <TouchableOpacity
            style={styles.featuredDropzone}
            activeOpacity={0.8}
            onPress={() => router.push('/album-detail')}>
            <PhotoFrameIcon size={34} color="#8A8075" />
            <Text style={styles.featuredDropzoneTitle}>
              Drop the 58th Engineers' Day photographs
            </Text>
            <Text style={styles.featuredDropzoneLink}>
              or <Text style={styles.underlineText}>browse files</Text>
            </Text>
          </TouchableOpacity>

          {/* Featured Event Info */}
          <TouchableOpacity
            style={styles.featuredInfoRow}
            activeOpacity={0.75}
            onPress={() => router.push('/album-detail')}>
            <View style={styles.featuredInfoLeft}>
              <Text style={styles.featuredEventTitle}>
                58th Engineers' Day Celebration
              </Text>
              <Text style={styles.featuredEventSubtitle}>
                17 Nov 2025 · Park Inn, Mahboula
              </Text>
            </View>

            <View style={styles.latestBadge}>
              <Text style={styles.latestBadgeText}>Latest</Text>
            </View>
          </TouchableOpacity>

          {/* ALBUMS Section Heading */}
          <Text style={styles.albumsSectionHeading}>ALBUMS</Text>

          {/* 2-Column Albums Grid */}
          <View style={styles.albumsGrid}>
            {ALBUMS.map((album) => (
              <View key={album.id} style={styles.albumCardWrapper}>
                {/* Mini Dropzone Box */}
                <TouchableOpacity
                  style={styles.albumDropzone}
                  activeOpacity={0.8}>
                  <PhotoFrameIcon size={24} color="#8A8075" />
                  <Text style={styles.albumDropzoneTitle}>Add photos</Text>
                  <Text style={styles.albumDropzoneLink}>
                    or <Text style={styles.underlineText}>browse files</Text>
                  </Text>
                </TouchableOpacity>

                {/* Album Title & Metadata */}
                <Text style={styles.albumTitle} numberOfLines={2}>
                  {album.title}
                </Text>
                <Text style={styles.albumSubtitle}>{album.subtitle}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar with 'Gallery' active */}
        <View
          style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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

          {/* Gallery Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabGalleryIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Gallery</Text>
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
    fontSize: 28,
    color: colors.textDark,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#675F53',
    marginTop: 4,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#BCB4A6',
    borderRadius: 14,
    paddingVertical: 4,
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
  featuredDropzone: {
    backgroundColor: colors.eventCardBg,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C0B6A5',
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDropzoneTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#473F35',
    marginTop: 10,
    textAlign: 'center',
  },
  featuredDropzoneLink: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#675F53',
    marginTop: 2,
  },
  underlineText: {
    textDecorationLine: 'underline',
    fontFamily: fonts.sansMedium,
    color: '#473F35',
  },
  featuredInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 4,
  },
  featuredInfoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  featuredEventTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 16.5,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  featuredEventSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
    marginTop: 3,
  },
  latestBadge: {
    backgroundColor: '#FFE1D0',
    borderRadius: 12,
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestBadgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#8C5A34',
  },
  albumsSectionHeading: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#756C60',
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 14,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  albumCardWrapper: {
    width: '48%',
  },
  albumDropzone: {
    backgroundColor: colors.eventCardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C0B6A5',
    borderStyle: 'dashed',
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  albumDropzoneTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#473F35',
    marginTop: 4,
  },
  albumDropzoneLink: {
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    color: '#675F53',
    marginTop: 1,
  },
  albumTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textDark,
    marginTop: 8,
  },
  albumSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
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
