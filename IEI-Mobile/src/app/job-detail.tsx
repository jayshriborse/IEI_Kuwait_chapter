import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { ChevronBackIcon } from '../components/icons/chevron-back-icon';
import { VisaCardIcon, BookmarkIcon } from '../components/icons/job-detail-icons';
import { getJobById, JOB_POSTINGS } from '@/data/jobs';
import { getVerifiedMember } from '@/data/member-session';

export default function JobDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();

  // Fetch the specific vacancy by unique id (fallback to first job if not found)
  const selectedJob = (params.id ? getJobById(params.id) : undefined) || JOB_POSTINGS[0];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Header with Back Button and Job Title */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{selectedJob.title}</Text>
              <Text style={styles.headerSubtitle}>{selectedJob.company}</Text>
            </View>
          </View>

          {/* Salary Card (Peach Container) */}
          <View style={styles.salaryCard}>
            <Text style={styles.salaryAmount}>{selectedJob.salary}</Text>
            <Text style={styles.salaryMeta}>
              {selectedJob.type} · {selectedJob.location}
              {selectedJob.category ? ` · ${selectedJob.category}` : ''}
            </Text>
          </View>

          {/* Visa & Status Card (if available) */}
          {selectedJob.visaStatus ? (
            <View style={styles.visaCard}>
              <View style={styles.visaIconContainer}>
                <VisaCardIcon size={20} color="#201E1D" />
              </View>
              <Text style={styles.visaText}>
                <Text style={styles.visaTextBold}>Visa & status: </Text>
                {selectedJob.visaStatus}
              </Text>
            </View>
          ) : null}

          {/* What The Employer Asks For Section */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionHeading}>WHAT THE EMPLOYER ASKS FOR</Text>

              <View style={styles.requirementsList}>
                {selectedJob.requirements.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.requirementRow,
                      index === selectedJob.requirements.length - 1 && styles.requirementRowLast,
                    ]}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.requirementText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Member Referral Card (Sage Green Container, if available) */}
          {selectedJob.referralNote ? (
            <View style={styles.referralCard}>
              <Text style={styles.referralLabel}>MEMBER REFERRAL</Text>
              <Text style={styles.referralTitle}>{selectedJob.referralNote}</Text>
              {selectedJob.referralDesc ? (
                <Text style={styles.referralBody}>{selectedJob.referralDesc}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Disclaimer Text */}
          <Text style={styles.disclaimerText}>
            Sample posting — the employer, salary band and referral shown are illustrative pending the chapter's employer feed. The chapter does not charge members or employers for a posting, and never asks for payment on behalf of an employer.
          </Text>
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}>
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.85}
            onPress={() => {
              const verifiedMember = getVerifiedMember();
              if (!verifiedMember) {
                Alert.alert(
                  'Member Profile Required',
                  'Applying with an IEI Profile is reserved for verified chapter members. Sign in to your member account or apply for membership to submit applications.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => router.push('/') },
                    { text: 'Apply for Membership', onPress: () => router.push('/apply-membership') },
                  ]
                );
                return;
              }
              router.push({
                pathname: '/job-apply-success',
                params: { id: selectedJob.id },
              });
            }}>
            <Text style={styles.applyButtonText}>Apply with my IEI profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookmarkButton}
            activeOpacity={0.8}
            onPress={() => {}}>
            <BookmarkIcon size={20} color="#201E1D" />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 2,
    marginRight: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#201E1D',
    lineHeight: 28,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#6B6358',
  },

  // Salary Card
  salaryCard: {
    backgroundColor: '#FFE1D0',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  salaryAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
    marginBottom: 6,
  },
  salaryMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: '#595147',
  },

  // Visa & Status Card
  visaCard: {
    backgroundColor: '#EBDDC5',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  visaIconContainer: {
    marginRight: 10,
  },
  visaText: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#3A342D',
    lineHeight: 18,
  },
  visaTextBold: {
    fontFamily: fonts.sansBold,
    color: '#201E1D',
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: '#8D7B68',
    letterSpacing: 1.1,
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  requirementsList: {
    width: '100%',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  requirementRowLast: {
    borderBottomWidth: 1,
  },
  bulletDot: {
    fontSize: 16,
    color: '#C67139',
    marginRight: 10,
    lineHeight: 20,
  },
  requirementText: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#201E1D',
    lineHeight: 20,
  },

  // Member Referral Card
  referralCard: {
    backgroundColor: '#E1EECC',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  referralLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    color: '#5B6B40',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  referralTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: '#201E1D',
    marginBottom: 6,
  },
  referralBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#4A543D',
    lineHeight: 18,
  },

  // Disclaimer Text
  disclaimerText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#8C8275',
    lineHeight: 17,
    marginBottom: 20,
  },

  // Bottom Fixed Bar
  bottomBar: {
    backgroundColor: '#F5EAD8',
    borderTopWidth: 1,
    borderTopColor: '#E4D9C8',
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#C67139',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#F9F4ED',
  },
  bookmarkButton: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#FBF7F0',
    borderWidth: 1,
    borderColor: '#E5D9C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
