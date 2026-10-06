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
import { TECHNICAL_SEMINARS } from '@/data/events';

export default function TechnicalSeminarsScreen() {
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
            { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>Technical seminars</Text>
              <Text style={styles.headerSubtitle}>
                Regular technical sessions for the engineering fraternity
              </Text>
            </View>
          </View>

          {/* Seminars List */}
          <View style={styles.seminarsList}>
            {TECHNICAL_SEMINARS.map((seminar, index) => (
              <View
                key={seminar.id}
                style={[
                  styles.seminarRow,
                  index === TECHNICAL_SEMINARS.length - 1 && styles.seminarRowLast,
                ]}>
                {/* Date Badge */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{seminar.date}</Text>
                </View>

                {/* Title */}
                <Text style={styles.seminarTitle}>{seminar.title}</Text>

                {/* Subtitle / Speaker / Description */}
                <Text style={styles.seminarSubtitle}>{seminar.subtitle}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 2,
    marginRight: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#605C55',
    lineHeight: 18,
  },

  // Seminars List
  seminarsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  seminarRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  seminarRowLast: {
    borderBottomWidth: 1,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF4EA',
    borderWidth: 1,
    borderColor: '#DCCBB0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  dateBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: '#201E1D',
  },
  seminarTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: '#201E1D',
    lineHeight: 20,
    marginBottom: 6,
  },
  seminarSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
    lineHeight: 18,
  },
});
