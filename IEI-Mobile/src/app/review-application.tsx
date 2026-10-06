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
import { ChevronBackIcon } from '../components/icons/chevron-back-icon';

export default function ReviewApplicationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Application</Text>
          </View>

          {/* Applicant Info Header Row */}
          <View style={styles.applicantRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>PN</Text>
            </View>

            <View style={styles.applicantInfo}>
              <Text style={styles.applicantName}>Eng. Prakash Nair</Text>
              <Text style={styles.applicantSub}>Applied 28 Aug 2026 · AMIE</Text>
            </View>
          </View>

          {/* Detailed Specs List */}
          <View style={styles.specsList}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Discipline</Text>
              <Text style={styles.specValue}>Mechanical</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Employer</Text>
              <Text style={styles.specValue}>HEISCO</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Designation</Text>
              <Text style={styles.specValue}>Project Engineer</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Experience</Text>
              <Text style={styles.specValue}>7 years</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Qualification</Text>
              <Text style={styles.specValue}>B.E. Mechanical, 2018</Text>
            </View>

            <View style={[styles.specRow, styles.specRowLast]}>
              <Text style={styles.specLabel}>Referred by</Text>
              <Text style={styles.specValue}>Engr. Tijo Thomas</Text>
            </View>
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>DOCUMENTS</Text>

            <View style={styles.docsGrid}>
              <View style={styles.docCard}>
                <Text style={styles.docTitle}>Degree certificate</Text>
                <Text style={styles.docStatus}>Verified</Text>
              </View>

              <View style={styles.docCard}>
                <Text style={styles.docTitle}>Passport</Text>
                <Text style={styles.docStatus}>Verified</Text>
              </View>

              <View style={styles.docCard}>
                <Text style={styles.docTitle}>Civil ID</Text>
                <Text style={[styles.docStatus, styles.civilIdExpiry]}>
                  Expires Nov 2026
                </Text>
              </View>

              <View style={styles.docCard}>
                <Text style={styles.docTitle}>Photograph</Text>
                <Text style={styles.docStatus}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Role Review Notice Banner */}
          <View style={styles.roleBanner}>
            <Text style={styles.roleBannerText}>
              You are reviewing as <Text style={styles.roleBannerBold}>General Secretary</Text>. Approving forwards this to the Chairman for final approval, then to IEI Kolkata.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          ]}>
          <TouchableOpacity
            style={styles.queryButton}
            activeOpacity={0.7}
            onPress={() => {}}>
            <Text style={styles.queryButtonText}>Query</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recommendButton}
            activeOpacity={0.85}
            onPress={() => router.back()}>
            <Text style={styles.recommendButtonText}>Recommend to Chairman</Text>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 6,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#201E1D',
  },

  // Applicant Header Row
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CCDBB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
    marginBottom: 2,
  },
  applicantSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
  },

  // Specs List
  specsList: {
    marginBottom: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  specRowLast: {
    paddingBottom: 2,
  },
  specLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#6B6358',
  },
  specValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#201E1D',
  },

  // Documents Section
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  docsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  docCard: {
    width: '48.5%',
    backgroundColor: '#FAF4EA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EBDDC5',
  },
  docTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#201E1D',
    marginBottom: 4,
  },
  docStatus: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
  },
  civilIdExpiry: {
    color: '#8A3818',
    fontFamily: fonts.sansMedium,
  },

  // Role Banner
  roleBanner: {
    backgroundColor: '#E1EECC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  roleBannerText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#384627',
    lineHeight: 17.5,
  },
  roleBannerBold: {
    fontFamily: fonts.sansBold,
    color: '#272E1B',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5EAD8',
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  queryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  queryButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#C67139',
  },
  recommendButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#C67139',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 14.5,
    color: '#F9F4ED',
  },
});
