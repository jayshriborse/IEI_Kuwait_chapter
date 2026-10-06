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
import { ACTIVITIES_LIST } from '@/data/events';

export default function EventsActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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
            <Text style={styles.headerTitle}>Events & Activities</Text>
            <Text style={styles.headerSubtitle}>
              Every listing the chapter keeps, from 1995 onwards
            </Text>
          </View>

          {/* 2-Column Grid of 11 Cards */}
          <View style={styles.gridContainer}>
            {/* Pair cards into rows */}
            {Array.from({ length: Math.ceil(ACTIVITIES_LIST.length / 2) }).map((_, rowIndex) => {
              const item1 = ACTIVITIES_LIST[rowIndex * 2];
              const item2 = ACTIVITIES_LIST[rowIndex * 2 + 1];

              return (
                <View key={rowIndex} style={styles.gridRow}>
                  {/* Card 1 */}
                  {item1 ? (
                    <TouchableOpacity
                      style={[
                        styles.activityCard,
                        { backgroundColor: item1.bg },
                        !item2 && styles.activityCardSingle,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (item1.route) {
                          router.push(item1.route as any);
                        }
                      }}>
                      <View style={styles.cardTop}>
                        <Text style={styles.cardTitle}>{item1.title}</Text>
                        <Text style={styles.cardSubtitle}>{item1.subtitle}</Text>
                      </View>

                      {item1.date ? (
                        <View style={styles.cardBottomRow}>
                          <Text style={styles.cardDateText}>{item1.date}</Text>
                          <ChevronRightIcon size={13} color="#605C55" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ) : null}

                  {/* Card 2 */}
                  {item2 ? (
                    <TouchableOpacity
                      style={[styles.activityCard, { backgroundColor: item2.bg }]}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (item2.route) {
                          router.push(item2.route as any);
                        }
                      }}>
                      <View style={styles.cardTop}>
                        <Text style={styles.cardTitle}>{item2.title}</Text>
                        <Text style={styles.cardSubtitle}>{item2.subtitle}</Text>
                      </View>

                      {item2.date ? (
                        <View style={styles.cardBottomRow}>
                          <Text style={styles.cardDateText}>{item2.date}</Text>
                          <ChevronRightIcon size={13} color="#605C55" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ) : item1 && rowIndex === Math.floor(ACTIVITIES_LIST.length / 2) ? (
                    <View style={styles.emptySlot} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar with 'Events' active */}
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
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push('/events')}>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: '#201E1D',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#605C55',
  },

  // Grid
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 112,
    justifyContent: 'space-between',
  },
  activityCardSingle: {
    flex: 0.485,
  },
  emptySlot: {
    flex: 1,
  },
  cardTop: {
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#201E1D',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#554E44',
    lineHeight: 15.5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDateText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    color: '#6E503E',
    letterSpacing: 0.5,
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
