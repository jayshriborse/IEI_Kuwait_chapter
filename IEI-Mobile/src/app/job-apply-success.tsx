import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { CheckIcon } from '../components/icons/check-icon';
import { getJobById, JOB_POSTINGS } from '@/data/jobs';

export default function JobApplySuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  // Retrieve the job data based on passed id, fallback to Senior Process Engineer
  const job = (params.id ? getJobById(params.id) : undefined) || JOB_POSTINGS[0];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 24) + 16, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Success Check Icon Badge */}
          <View style={styles.checkBadge}>
            <CheckIcon size={24} color="#201E1D" />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Application sent</Text>

          {/* Description */}
          <Text style={styles.description}>
            {job.title} at {job.company} — a sample posting. The employer has your profile and your membership standing, verified by the chapter.
          </Text>

          {/* Sent With Your Application Card */}
          <View style={styles.appDataCard}>
            <Text style={styles.cardHeaderLabel}>SENT WITH YOUR APPLICATION</Text>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Name & grade</Text>
              <Text style={styles.dataValue}>Karthikeyan Manickam · MIE</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Member ID</Text>
              <Text style={styles.dataValue}>IEI0005</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Standing</Text>
              <Text style={[styles.dataValue, styles.standingGreen]}>Subscription current</Text>
            </View>

            <View style={[styles.dataRow, styles.dataRowLast]}>
              <Text style={styles.dataLabel}>Discipline</Text>
              <Text style={styles.dataValue}>Civil · 11 years</Text>
            </View>
          </View>

          {/* What Happens Next Card */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What happens next</Text>
            <Text style={styles.nextStepsBody}>
              The employer replies through the portal. You will get a notification, and the chapter office follows up on postings with no reply after two weeks.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Fixed Buttons */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          ]}>
          <TouchableOpacity
            style={styles.backPortalButton}
            activeOpacity={0.85}
            onPress={() => router.navigate('/jobs')}>
            <Text style={styles.backPortalButtonText}>Back to the portal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.myAppsButton}
            activeOpacity={0.7}
            onPress={() => router.navigate('/jobs')}>
            <Text style={styles.myAppsButtonText}>My applications</Text>
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
    paddingHorizontal: 22,
  },

  // Check Badge
  checkBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#CCDBB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  // Title & Description
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: '#201E1D',
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#3E3832',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Sent with Application Card
  appDataCard: {
    backgroundColor: '#EBDDC5',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  cardHeaderLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    letterSpacing: 1.1,
    marginBottom: 14,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  dataRowLast: {
    paddingBottom: 2,
  },
  dataLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#6B6358',
  },
  dataValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#201E1D',
  },
  standingGreen: {
    color: '#335C28',
  },

  // What happens next card
  nextStepsCard: {
    backgroundColor: '#FFE1D0',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  nextStepsTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 6,
  },
  nextStepsBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#4A423A',
    lineHeight: 19,
  },

  // Bottom Actions Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5EAD8',
    paddingTop: 12,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  backPortalButton: {
    flex: 1.3,
    height: 52,
    backgroundColor: '#C67139',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPortalButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#F9F4ED',
  },
  myAppsButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myAppsButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#C67139',
  },
});
