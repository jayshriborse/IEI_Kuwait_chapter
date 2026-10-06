import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';

interface AccessDeniedViewProps {
  title?: string;
  message?: string;
  featureName?: string;
}

export function AccessDeniedView({
  title = 'Member Access Required',
  message,
  featureName,
}: AccessDeniedViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const displayMessage =
    message ||
    (featureName
      ? `${featureName} is available exclusively to verified IEI Kuwait Chapter members.`
      : 'This feature is available exclusively to verified IEI Kuwait Chapter members.') +
      ' Please sign in to verify your membership or start a new membership application.';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {/* Decorative top circle */}
      <View pointerEvents="none" style={styles.decorativeCircle} />

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Image
            source={require('@/assets/images/iei-seal.png')}
            style={styles.sealIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.kicker}>IEI KUWAIT CHAPTER · RESTRICTED</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{displayMessage}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={0.85}
            onPress={() => router.push('/')}>
            <Text style={styles.signInButtonText}>Sign In to Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.85}
            onPress={() => router.push('/apply-membership')}>
            <Text style={styles.applyButtonText}>Apply for Membership</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestLink}
            activeOpacity={0.7}
            onPress={() => router.push('/guest')}>
            <Text style={styles.guestLinkText}>← Return to Guest Home</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F6DDCB',
    opacity: 0.7,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#402310',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAF4EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0D0BE',
  },
  sealIcon: {
    width: 48,
    height: 48,
  },
  kicker: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#C67139',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21,
    color: '#605C55',
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  signInButton: {
    backgroundColor: '#C67139',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#FAF4EB',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C67139',
  },
  applyButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14.5,
    color: '#C67139',
  },
  guestLink: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestLinkText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: '#8D7B68',
  },
});
