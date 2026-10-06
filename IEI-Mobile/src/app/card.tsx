import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import { colors, fonts } from '@/theme';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@/utils/api';
import { ActivityIndicator } from 'react-native';
import {
  TabHomeIcon,
  TabEventsIcon,
  TabJobsIcon,
  TabGalleryIcon,
  TabCardIcon,
  TabCommunityIcon,
  TabMeIcon,
} from '@/components/icons/dashboard-icons';
import Svg, { Path, Circle } from 'react-native-svg';

function UserAvatarIcon({ size = 22, color = '#FFC6A5' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

import { getVerifiedMember, updateMemberPhoto, getAuthToken } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function MembershipCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const verifiedMember = getVerifiedMember();
  const [photoUri, setPhotoUri] = useState<string | null>(verifiedMember?.photoUri || null);
  const [cardToken, setCardToken] = useState<string | null>(null);

  React.useEffect(() => {
    if (!verifiedMember) return;
    const cacheKey = `@iei_signed_card_token_${verifiedMember.memberCode}`;

    AsyncStorage.getItem(cacheKey).then((cached) => {
      if (cached) {
        setCardToken(cached);
      }
    });

    const fetchSignedToken = async () => {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${getApiBaseUrl()}/me/card`, { headers });
        if (res.ok) {
          const data = await res.json();
          const tokenVal = data.cardToken || data.qrToken;
          if (tokenVal) {
            setCardToken(tokenVal);
            AsyncStorage.setItem(cacheKey, tokenVal).catch(() => {});
          }
        }
      } catch (err) {
        // Fallback to cached token
      }
    };

    fetchSignedToken();
  }, [verifiedMember?.memberCode]);

  const handleUploadPhoto = () => {
    if (!verifiedMember) return;

    Alert.alert(
      'Upload Member Photo',
      'Choose how you would like to select your photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission required',
                  'Camera permission is needed to take your photo.'
                );
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const newUri = result.assets[0].uri;
                setPhotoUri(newUri);
                updateMemberPhoto(verifiedMember.memberCode, newUri);
              }
            } catch (error) {
              console.error('Camera error:', error);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission required',
                  'Photo library permission is needed to choose your photo.'
                );
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const newUri = result.assets[0].uri;
                setPhotoUri(newUri);
                updateMemberPhoto(verifiedMember.memberCode, newUri);
              }
            } catch (error) {
              console.error('Photo library error:', error);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (!verifiedMember) {
    return (
      <AccessDeniedView
        title="Digital Membership Card"
        featureName="The digital membership card and entry QR pass"
      />
    );
  }

  const activePhoto = photoUri || verifiedMember.photoUri;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Header Title */}
          <Text style={styles.screenTitle}>Membership card</Text>
          <Text style={styles.screenSubtitle}>Show this at the door for check-in</Text>

          {/* Membership Ticket Card */}
          <View style={styles.ticketCard}>
            {/* Top decorative subtle brown wave */}
            <View pointerEvents="none" style={styles.decorativeTopShape} />

            {/* Top Section */}
            <View style={styles.ticketTopSection}>
              {/* Institution Header Row */}
              <View style={styles.institutionRow}>
                <Text style={styles.institutionText}>
                  INSTITUTION OF{'\n'}ENGINEERS (INDIA){'\n'}KUWAIT CHAPTER
                </Text>

                <View style={styles.sealBadge}>
                  <Image
                    source={require('@/assets/images/iei-seal.png')}
                    style={styles.sealLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Member Info Row */}
              <View style={styles.memberInfoRow}>
                <View style={styles.avatarCircle}>
                  {activePhoto ? (
                    <Image source={{ uri: activePhoto }} style={styles.avatarImage} />
                  ) : (
                    <UserAvatarIcon size={22} color="#FFC6A5" />
                  )}
                </View>

                <View style={styles.memberNameContainer}>
                  <Text style={styles.memberName}>
                    {verifiedMember.fullName}
                  </Text>
                  <Text style={styles.memberBranch}>
                    {verifiedMember.discipline} · Member since {verifiedMember.memberSinceYear}
                  </Text>
                </View>
              </View>

              {/* Grade & Blood Group Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>GRADE</Text>
                  <Text style={styles.gradeValue}>{verifiedMember.grade}</Text>
                </View>

                <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.metaLabel}>BLOOD GROUP</Text>
                  <Text style={styles.bloodValue}>{verifiedMember.bloodGroup}</Text>
                </View>
              </View>
            </View>

            {/* Perforated Divider */}
            <View style={styles.perforatedDivider}>
              <View style={styles.notchLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.notchRight} />
            </View>

            {/* Bottom Section */}
            <View style={styles.ticketBottomSection}>
              {/* QR Code Container */}
              <View style={styles.qrContainer}>
                {cardToken ? (
                  <QRCode
                    value={cardToken}
                    size={52}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                    ecl="L"
                  />
                ) : (
                  <ActivityIndicator size="small" color="#8B634A" />
                )}
              </View>

              {/* Member ID & IEI India No */}
              <View style={styles.idsContainer}>
                <Text style={styles.idLabel}>MEMBER ID</Text>
                <Text style={styles.idValue}>{verifiedMember.memberCode}</Text>

                <Text style={[styles.idLabel, { marginTop: 8 }]}>IEI INDIA NO.</Text>
                <Text style={styles.ieiIndiaValue}>{verifiedMember.ieiIndiaNo}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Below Card */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.walletButton} activeOpacity={0.75}>
              <Text style={styles.walletButtonText}>Add to Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              activeOpacity={0.75}
              onPress={handleUploadPhoto}>
              <Text style={styles.uploadButtonText}>
                {activePhoto ? 'Change photo' : 'Upload photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subscription Notice */}
          <TouchableOpacity
            style={styles.noticeContainer}
            activeOpacity={0.75}
            onPress={() => router.push('/renew')}>
            <View style={styles.noticeDot} />
            <Text style={styles.noticeText}>
              {verifiedMember.duesStatus} —{' '}
              <Text style={styles.noticeLink}>{verifiedMember.duesDetail}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Tab Bar with 'Card' active */}
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

          {/* Card Tab (ACTIVE) */}
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <TabCardIcon size={20} color={colors.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Card</Text>
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
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  screenTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 24,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#675F53',
    marginTop: 4,
    marginBottom: 22,
  },
  ticketCard: {
    backgroundColor: colors.dashboardStatCardBg,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  decorativeTopShape: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#532E16',
  },
  ticketTopSection: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  institutionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  institutionText: {
    fontFamily: fonts.sansBold,
    fontSize: 8.5,
    lineHeight: 11.5,
    letterSpacing: 0.9,
    color: '#D8CEC3',
    textTransform: 'uppercase',
  },
  sealBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  sealLogo: {
    width: 34,
    height: 34,
  },
  memberInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BE7F54',
    backgroundColor: '#402310',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  memberNameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    lineHeight: 18.5,
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  memberBranch: {
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
    color: '#FFC6A5',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  metaCol: {
    justifyContent: 'flex-end',
  },
  metaLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.9,
    color: '#8B634A',
    textTransform: 'uppercase',
  },
  gradeValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 20,
    color: '#FFC6A5',
    lineHeight: 23,
    marginTop: 2,
  },
  bloodValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 20,
    color: colors.textHeading,
    lineHeight: 23,
    marginTop: 2,
  },
  perforatedDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    overflow: 'hidden',
  },
  notchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.screenBgLight,
    marginLeft: -7,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#6E3C1B',
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  notchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.screenBgLight,
    marginRight: -7,
  },
  ticketBottomSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFC6A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  idsContainer: {
    marginLeft: 16,
    flex: 1,
  },
  idLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.9,
    color: '#8B634A',
    textTransform: 'uppercase',
  },
  idValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 15,
    color: colors.textHeading,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  ieiIndiaValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.textHeading,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  walletButton: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    backgroundColor: 'transparent',
    height: 42,
    paddingHorizontal: 22,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.textDark,
  },
  uploadButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 13.5,
    color: colors.primaryTerracotta,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primaryTerracotta,
    marginRight: 6,
  },
  noticeText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#675F53',
  },
  noticeLink: {
    fontFamily: fonts.sansSemiBold,
    color: colors.primaryTerracotta,
    textDecorationLine: 'underline',
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
  lockCard: {
    backgroundColor: '#FAF4EA',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4D8C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE1D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  lockIconText: {
    fontSize: 26,
  },
  lockTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#201E1D',
    marginBottom: 10,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#605C55',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: colors.primaryTerracotta,
    height: 52,
    borderRadius: 26,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});
