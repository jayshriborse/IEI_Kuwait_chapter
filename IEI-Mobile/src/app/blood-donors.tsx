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

interface BloodDonor {
  id: string;
  name: string;
  location: string;
  group: string;
  phone?: string;
}

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'B+', 'AB+', 'A-', 'B-', 'AB-'];

const DONORS: BloodDonor[] = [
  {
    id: '1',
    name: 'Engr. Karthikeyan Manickam',
    location: 'Salmiya · Hawalli',
    group: 'O+',
  },
  {
    id: '2',
    name: 'Engr. Kumaran Paramadayalan',
    location: 'Abbassiya · Hawalli',
    group: 'O+',
  },
  {
    id: '3',
    name: 'Engr. Upendra Kumar Behura',
    location: 'Fahaheel · Ahmadi',
    group: 'O+',
  },
  {
    id: '4',
    name: 'Engr. Sekar B',
    location: 'Farwaniya',
    group: 'O+',
  },
  {
    id: '5',
    name: 'Engr. Valentine Borges',
    location: 'Salmiya · Hawalli',
    group: 'O+',
  },
  {
    id: '6',
    name: 'Engr. Ramesh Rajendran',
    location: 'Mangaf · Ahmadi',
    group: 'O+',
  },
];

import { getVerifiedMember, getAuthLevel } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function BloodDonorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedGroup, setSelectedGroup] = useState<string>('O+');
  const verifiedMember = getVerifiedMember();

  if (!verifiedMember || getAuthLevel() === 'GUEST') {
    return (
      <AccessDeniedView
        title="Blood Donor Registry"
        featureName="The chapter blood donor registry and member contact details"
      />
    );
  }

  const filteredDonors = DONORS.filter(
    (donor) => selectedGroup === 'All' || donor.group === selectedGroup
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
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Blood donors</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            96 members have volunteered. Urgent requests notify everyone in the matching group.
          </Text>

          {/* Blood Group Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}>
            {BLOOD_GROUPS.map((group) => {
              const isSelected = selectedGroup === group;
              return (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.groupChip,
                    isSelected && styles.groupChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedGroup(group)}>
                  <Text
                    style={[
                      styles.groupChipText,
                      isSelected && styles.groupChipTextSelected,
                    ]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Donors List */}
          <View style={styles.donorsList}>
            {filteredDonors.map((donor, index) => (
              <View
                key={donor.id}
                style={[
                  styles.donorRow,
                  index === filteredDonors.length - 1 && styles.donorRowLast,
                ]}>
                {/* Group Badge */}
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{donor.group}</Text>
                </View>

                {/* Donor Details */}
                <View style={styles.donorInfo}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorLocation}>{donor.location}</Text>
                </View>

                {/* Call Button */}
                <TouchableOpacity style={styles.callButton} activeOpacity={0.75}>
                  <Text style={styles.callButtonText}>Call</Text>
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
            style={styles.urgentButton}
            activeOpacity={0.85}
            onPress={() => {}}>
            <Text style={styles.urgentButtonText}>Post an urgent request</Text>
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

  // Blood Group Filters
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C67139',
    backgroundColor: 'transparent',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupChipSelected: {
    backgroundColor: '#FFE1D0',
    borderColor: '#C67139',
  },
  groupChipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: '#C67139',
  },
  groupChipTextSelected: {
    color: '#201E1D',
    fontFamily: fonts.sansBold,
  },

  // Donors List
  donorsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  donorRowLast: {
    borderBottomWidth: 1,
  },
  groupBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE1D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  groupBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: '#201E1D',
  },
  donorInfo: {
    flex: 1,
    paddingRight: 8,
  },
  donorName: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 3,
  },
  donorLocation: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
  },
  callButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FAF4EA',
    borderWidth: 1,
    borderColor: '#DCCBB0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 13.5,
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
  urgentButton: {
    height: 52,
    backgroundColor: '#C67139',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#F9F4ED',
  },
});
