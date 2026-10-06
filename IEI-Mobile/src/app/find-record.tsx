import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts, borderRadius } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { CheckIcon } from '@/components/icons/check-icon';
import {
  verifyMemberCredentials,
  setVerifiedMemberRecord,
  matchesMobile,
  getAuthUser,
  getAuthToken,
  linkMemberWithBackend,
  MemberRecord,
} from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';

export default function FindRecordScreen() {
  const router = useRouter();

  // Inputs start empty before typing
  const [memberId, setMemberId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Matched member state: null until valid match is typed
  const [matchedMember, setMatchedMember] = useState<MemberRecord | null>(null);

  // Debounced matching (300 ms) after Member ID (4+ chars) and Mobile (4+ digits) are typed
  useEffect(() => {
    // Hide green box immediately when either input changes
    setMatchedMember(null);

    const cleanId = memberId.trim().toUpperCase();
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');

    if (cleanId.length < 4 || cleanMobile.length < 4) {
      return;
    }

    let isMounted = true;

    const timer = setTimeout(async () => {
      // 1. Check local canonical members first (instant, works offline)
      const localResult = verifyMemberCredentials(cleanId, cleanMobile);
      if (localResult.success && localResult.member) {
        if (isMounted) setMatchedMember(localResult.member);
        return;
      }

      // 2. Fallback to live backend API if not in local list
      try {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 2500);

        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${getApiBaseUrl()}/members/${cleanId}`, {
          headers,
          signal: controller.signal,
        });
        clearTimeout(fetchTimeout);

        if (res.ok) {
          const remote = await res.json();
          if (remote && remote.memberCode && matchesMobile(cleanMobile, remote.mobile)) {
            const newMember: MemberRecord = {
              id: remote.memberCode,
              memberCode: remote.memberCode,
              ieiIndiaNo: remote.ieiIndiaNo || `M-${remote.memberCode}`,
              fullName: remote.fullName || remote.displayName || 'IEI Member',
              firstName: remote.displayName || (remote.fullName ? remote.fullName.split(' ')[0] : 'Member'),
              mobile: remote.mobile,
              email: `${remote.memberCode.toLowerCase()}@iei-kuwait.org`,
              grade: remote.grade || 'MIE',
              discipline: remote.discipline || 'Engineering',
              bloodGroup: remote.bloodGroup || 'O+',
              memberSinceYear: remote.memberSinceYear || new Date().getFullYear(),
              location: 'Kuwait City',
              duesStatus: 'Active',
              duesDetail: 'Member record verified',
              photoUri: null,
              role: (remote.positions && remote.positions.length > 0) ? 'EC_OFFICER' : 'MEMBER',
              company: remote.company || null,
              designation: remote.designation || null,
              governorate: remote.governorate || null,
              sector: remote.sector || null,
              areaLocality: remote.areaLocality || null,
              familyStatus: remote.familyStatus || null,
              familyMembersCount: remote.familyMembersCount || null,
            };

            setVerifiedMemberRecord(newMember);
            if (isMounted) setMatchedMember(newMember);
            return;
          }
        }
      } catch (err) {
        // Backend offline or unreachable
      }

      if (isMounted) setMatchedMember(null);
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [memberId, mobileNumber]);

  // Member ID: letters and digits only, auto-uppercase, max 12 chars
  const handleMemberIdChange = (text: string) => {
    const sanitized = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
    setMemberId(sanitized);
  };

  // Registered Mobile: digits only, max 15 digits
  const handleMobileChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 15);
    setMobileNumber(digitsOnly);
  };

  const handleContinue = async () => {
    const cleanId = memberId.trim().toUpperCase();
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');

    if (matchedMember) {
      linkMemberWithBackend(matchedMember.memberCode, matchedMember.mobile).catch(() => {});
      router.push('/dashboard');
      return;
    }

    // Attempt immediate verification on press in case debounce is pending
    const localResult = verifyMemberCredentials(cleanId, cleanMobile);
    if (localResult.success && localResult.member) {
      setMatchedMember(localResult.member);
      linkMemberWithBackend(localResult.member.memberCode, localResult.member.mobile).catch(() => {});
      router.push('/dashboard');
      return;
    }

    // Try backend check
    try {
      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/members/${cleanId}`, { headers });
      if (res.ok) {
        const remote = await res.json();
        if (remote && remote.memberCode && matchesMobile(cleanMobile, remote.mobile)) {
          const newMember: MemberRecord = {
            id: remote.memberCode,
            memberCode: remote.memberCode,
            ieiIndiaNo: remote.ieiIndiaNo || `M-${remote.memberCode}`,
            fullName: remote.fullName || remote.displayName || 'IEI Member',
            firstName: remote.displayName || (remote.fullName ? remote.fullName.split(' ')[0] : 'Member'),
            mobile: remote.mobile,
            email: `${remote.memberCode.toLowerCase()}@iei-kuwait.org`,
            grade: remote.grade || 'MIE',
            discipline: remote.discipline || 'Engineering',
            bloodGroup: remote.bloodGroup || 'O+',
            memberSinceYear: remote.memberSinceYear || new Date().getFullYear(),
            location: 'Kuwait City',
            duesStatus: 'Active',
            duesDetail: 'Member record verified',
            photoUri: null,
            role: (remote.positions && remote.positions.length > 0) ? 'EC_OFFICER' : 'MEMBER',
            company: remote.company || null,
            designation: remote.designation || null,
            governorate: remote.governorate || null,
            sector: remote.sector || null,
            areaLocality: remote.areaLocality || null,
            familyStatus: remote.familyStatus || null,
            familyMembersCount: remote.familyMembersCount || null,
          };
          setVerifiedMemberRecord(newMember);
          setMatchedMember(newMember);
          router.push('/dashboard');
        }
      }
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            {/* Top Bar with Back Arrow and Step Indicator */}
            <View style={styles.headerBar}>
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => router.back()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <ChevronBackIcon size={18} color={colors.primaryTerracotta} />
              </TouchableOpacity>
              <Text style={styles.stepBadge}>STEP 2 OF 2</Text>
            </View>

            {/* Main Title */}
            <Text style={styles.title}>
              Find your{'\n'}member record
            </Text>

            {/* Subtitle / Explanation */}
            <Text style={styles.subtitle}>
              Signed in as <Text style={styles.signedInEmail}>{getAuthUser()?.email || matchedMember?.email || 'karthi4civil@gmail.com'}.</Text> Enter
              your Member ID and the mobile number the chapter has on file and we'll match you
              automatically.
            </Text>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Member ID Field */}
              <View style={styles.inputGroup}>
                <Text nativeID="memberIdLabel" style={styles.inputLabel}>
                  Member ID
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={memberId}
                    onChangeText={handleMemberIdChange}
                    placeholder="IEI0005"
                    placeholderTextColor="#8D7B68"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                    keyboardType="default"
                    maxLength={12}
                    accessibilityLabel="Member ID"
                    accessibilityLabelledBy="memberIdLabel"
                  />
                </View>
              </View>

              {/* Registered Mobile Field */}
              <View style={styles.inputGroup}>
                <Text nativeID="mobileNumberLabel" style={styles.inputLabel}>
                  Registered mobile
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={handleMobileChange}
                    placeholder="99840191"
                    placeholderTextColor="#8D7B68"
                    keyboardType="number-pad"
                    autoCorrect={false}
                    autoComplete="off"
                    maxLength={15}
                    accessibilityLabel="Registered mobile"
                    accessibilityLabelledBy="mobileNumberLabel"
                  />
                </View>
              </View>
            </View>

            {/* Matched State Green Box - Visible ONLY after typing if credentials match */}
            {matchedMember ? (
              <View style={styles.matchedBanner}>
                <View style={styles.checkIconWrapper}>
                  <CheckIcon size={18} color={colors.matchedBannerText} />
                </View>
                <View style={styles.matchedTextContainer}>
                  <Text style={styles.matchedText}>
                    Matched: <Text style={styles.matchedName}>{matchedMember.fullName}</Text> · {matchedMember.grade} · {matchedMember.discipline} ·{'\n'}member since {matchedMember.memberSinceYear}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Help and Fallback Links */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Not on the list?{' '}
                <Text style={styles.helpLink}>Contact the General Secretary</Text> or{' '}
                <Text style={styles.helpLink}>apply for membership</Text>.
              </Text>
            </View>

            {/* Flexible Spacer */}
            <View style={styles.spacer} />

            {/* Bottom Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                activeOpacity={0.88}
                onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue to the app</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 4,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.stepBadge,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.textDark,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
    lineHeight: 21.5,
    color: colors.textSubDark,
    marginBottom: 28,
  },
  signedInEmail: {
    fontFamily: fonts.sansBold,
    color: colors.textDark,
  },
  formContainer: {
    gap: 18,
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textLabelDark,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.lg,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontFamily: fonts.sansRegular,
    fontSize: 15.5,
    color: colors.textDark,
    padding: 0,
    margin: 0,
  },
  matchedBanner: {
    backgroundColor: colors.matchedBannerBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 22,
  },
  checkIconWrapper: {
    marginTop: 2,
  },
  matchedTextContainer: {
    flex: 1,
  },
  matchedText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.matchedBannerText,
  },
  matchedName: {
    fontFamily: fonts.sansBold,
    color: colors.matchedBannerText,
  },
  helpContainer: {
    marginBottom: 20,
  },
  helpText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSubDark,
  },
  helpLink: {
    fontFamily: fonts.sansSemiBold,
    color: colors.linkTerracotta,
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 4,
  },
  continueButton: {
    backgroundColor: colors.primaryTerracotta,
    height: 56,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: colors.primaryTerracotta,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 16.5,
    color: colors.buttonTextLight,
    letterSpacing: -0.2,
  },
});
