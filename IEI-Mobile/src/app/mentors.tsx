import React, { useState } from 'react';
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
import { GraduationCapIcon } from '../components/icons/dashboard-icons';

interface Mentor {
  id: string;
  name: string;
  discipline: string;
  company: string;
  grade: string;
  specialty: string;
  yearsExp: string;
}

const DISCIPLINES = ['All', 'Civil', 'Electrical', 'Mechanical', 'Oil & Gas', 'IT & CS'];

const MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Engr. Ershad Mohammed',
    discipline: 'Electrical',
    company: 'Facilities & Smart Tech',
    grade: 'FIE',
    specialty: 'AI Facilities Mgmt · Smart Buildings',
    yearsExp: '24 yrs',
  },
  {
    id: '2',
    name: 'Engr. S. K. Selvan',
    discipline: 'Mechanical',
    company: 'Habu Technology FZCO',
    grade: 'FIE',
    specialty: 'Wellhead Systems · Chemical Skids',
    yearsExp: '26 yrs',
  },
  {
    id: '3',
    name: 'Engr. V. Arulselvan',
    discipline: 'Civil',
    company: 'CXA Consultants',
    grade: 'MIE',
    specialty: 'Building Commissioning · QA/QC',
    yearsExp: '18 yrs',
  },
  {
    id: '4',
    name: 'Engr. Kumaran Paramadayalan',
    discipline: 'Oil & Gas',
    company: 'Kuwait Oil Company (KOC)',
    grade: 'FIE',
    specialty: 'Upstream Engineering · Integrity',
    yearsExp: '22 yrs',
  },
  {
    id: '5',
    name: 'Engr. Karthikeyan Manickam',
    discipline: 'Civil',
    company: 'Infrastructure Development',
    grade: 'MIE',
    specialty: 'Structural Analysis · PMP Guidance',
    yearsExp: '15 yrs',
  },
  {
    id: '6',
    name: 'Engr. Upendra Kumar Behura',
    discipline: 'Electrical',
    company: 'Power & Distribution',
    grade: 'MIE',
    specialty: 'Substation Automation · SCADA',
    yearsExp: '16 yrs',
  },
  {
    id: '7',
    name: 'Engr. Ramesh Rajendran',
    discipline: 'IT & CS',
    company: 'Enterprise Digital Solutions',
    grade: 'MIE',
    specialty: 'Cloud Architecture · DevOps',
    yearsExp: '14 yrs',
  },
];

import { getVerifiedMember, getAuthLevel } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function MentorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const verifiedMember = getVerifiedMember();

  if (!verifiedMember || getAuthLevel() === 'GUEST') {
    return (
      <AccessDeniedView
        title="Chapter Mentors Network"
        featureName="The chapter mentor directory and engineering guidance network"
      />
    );
  }

  const filteredMentors = MENTORS.filter(
    (mentor) => selectedDiscipline === 'All' || mentor.discipline === selectedDiscipline
  );

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

          {/* Header with Back Button and Title */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#272E1B" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Mentors</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            31 senior engineers open to mentoring students, graduates, and junior engineers in Kuwait.
          </Text>

          {/* Discipline Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}>
            {DISCIPLINES.map((discipline) => {
              const isSelected = selectedDiscipline === discipline;
              return (
                <TouchableOpacity
                  key={discipline}
                  style={[
                    styles.disciplineChip,
                    isSelected && styles.disciplineChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDiscipline(discipline)}>
                  <Text
                    style={[
                      styles.disciplineChipText,
                      isSelected && styles.disciplineChipTextSelected,
                    ]}>
                    {discipline}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Mentors List */}
          <View style={styles.mentorsList}>
            {filteredMentors.map((mentor, index) => (
              <View
                key={mentor.id}
                style={[
                  styles.mentorRow,
                  index === filteredMentors.length - 1 && styles.mentorRowLast,
                ]}>
                {/* Grade Badge */}
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{mentor.grade}</Text>
                </View>

                {/* Mentor Info */}
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorName}>{mentor.name}</Text>
                  <Text style={styles.mentorSpecialty}>{mentor.specialty}</Text>
                  <Text style={styles.mentorDetails}>
                    {mentor.company} · {mentor.yearsExp}
                  </Text>
                </View>

                {/* Connect Button */}
                <TouchableOpacity style={styles.connectButton} activeOpacity={0.75}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          ]}>
          <TouchableOpacity
            style={styles.volunteerButton}
            activeOpacity={0.85}
            onPress={() => {}}>
            <Text style={styles.volunteerButtonText}>Volunteer as a mentor</Text>
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
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 4,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#605C55',
    lineHeight: 19,
    marginBottom: 18,
  },

  // Discipline Filters
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  disciplineChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4D5C35',
    backgroundColor: 'transparent',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disciplineChipSelected: {
    backgroundColor: '#E1EECC',
    borderColor: '#272E1B',
  },
  disciplineChipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: '#4D5C35',
  },
  disciplineChipTextSelected: {
    color: '#272E1B',
    fontFamily: fonts.sansBold,
  },

  // Mentors List
  mentorsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  mentorRowLast: {
    borderBottomWidth: 1,
  },
  gradeBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E1EECC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gradeBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: '#272E1B',
  },
  mentorInfo: {
    flex: 1,
    paddingRight: 8,
  },
  mentorName: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 2,
  },
  mentorSpecialty: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#4D5C35',
    marginBottom: 2,
  },
  mentorDetails: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FAF4EA',
    borderWidth: 1,
    borderColor: '#DCCBB0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: '#201E1D',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5EAD8',
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E4D9C8',
  },
  volunteerButton: {
    height: 52,
    backgroundColor: '#272E1B',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#F9F4ED',
  },
});
