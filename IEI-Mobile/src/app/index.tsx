import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';

import { colors, fonts, spacing, borderRadius } from '@/theme';
import { GoogleIcon } from '@/components/icons/google-icon';
import { AppleIcon } from '@/components/icons/apple-icon';
import {
  authenticateWithGoogle,
  authenticateWithApple,
  setGuestSession,
} from '@/data/member-session';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google OAuth configuration with Expo AuthSession
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const hasRealClientId = Boolean(
    (webClientId && !webClientId.includes('-dev')) ||
    (androidClientId && !androidClientId.includes('-dev')) ||
    (iosClientId && !iosClientId.includes('-dev'))
  );

  const redirectUri = makeRedirectUri({
    scheme: 'ieimobile',
    path: 'oauthredirect',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: webClientId || '1082348721389-dev.apps.googleusercontent.com',
      iosClientId: iosClientId,
      androidClientId: androidClientId,
      redirectUri,
    },
    { scheme: 'ieimobile' },
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleToken(id_token);
      }
    } else if (response?.type === 'error') {
      setAuthError('Google sign in encountered an issue. Please try again.');
      setIsLoadingGoogle(false);
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setIsLoadingGoogle(true);
    setAuthError(null);
    try {
      const res = await authenticateWithGoogle(idToken);
      if (res.success) {
        if (res.isLinked && res.member) {
          router.replace('/dashboard');
        } else {
          router.push('/find-record');
        }
      } else {
        setAuthError(res.error || 'Failed to authenticate with server');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    setAuthError(null);
    if (!hasRealClientId) {
      setAuthError(
        'Google Client ID is not configured yet. Please set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID or EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in IEI-Mobile/.env.',
      );
      return;
    }

    setIsLoadingGoogle(true);
    try {
      if (request) {
        await promptAsync();
      } else {
        setAuthError('Google sign-in could not be opened. Please try again in a moment.');
        setIsLoadingGoogle(false);
      }
    } catch (err: any) {
      setAuthError('Google sign-in could not be opened.');
      setIsLoadingGoogle(false);
    }
  };

  const handleContinueWithApple = async () => {
    setAuthError(null);
    setIsLoadingApple(true);
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setAuthError('Sign in with Apple is available on iOS devices.');
        setIsLoadingApple(false);
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const fullName = credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : undefined;

        const res = await authenticateWithApple({
          identityToken: credential.identityToken,
          user: credential.user,
          email: credential.email || undefined,
          fullName,
        });

        if (res.success) {
          if (res.isLinked && res.member) {
            router.replace('/dashboard');
          } else {
            router.push('/find-record');
          }
        } else {
          setAuthError(res.error || 'Apple authentication failed');
        }
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        setAuthError(e.message || 'Apple sign-in encountered an issue.');
      }
    } finally {
      setIsLoadingApple(false);
    }
  };

  // Scale decorative circles dynamically to look balanced on all phone sizes
  const topCircleSize = Math.max(300, Math.min(windowWidth * 0.85, 380));
  const bottomCircleSize = Math.max(320, Math.min(windowWidth * 0.95, 420));

  return (
    <View style={styles.container}>
      {/* Decorative background circles clipped by screen bounds */}
      <View
        pointerEvents="none"
        style={[
          styles.decorativeCircleTop,
          {
            width: topCircleSize,
            height: topCircleSize,
            borderRadius: topCircleSize / 2,
            top: -topCircleSize * 0.15,
            right: -topCircleSize * 0.22,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.decorativeCircleBottom,
          {
            width: bottomCircleSize,
            height: bottomCircleSize,
            borderRadius: bottomCircleSize / 2,
            bottom: windowHeight * 0.08,
            left: -bottomCircleSize * 0.28,
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Section */}
          <View style={styles.topSection}>
            {/* IEI Seal Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/iei-seal.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Chapter Badge */}
            <Text style={styles.chapterBadge}>EST. 1995 · KUWAIT CHAPTER</Text>

            {/* Heading */}
            <Text style={styles.heading}>
              Engineering,{'\n'}professionally
            </Text>

            {/* Body Description */}
            <Text style={styles.bodyDescription}>
              The Institution of Engineers (India) in Kuwait — your membership, the programme and the
              chapter directory in one place.
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>240</Text>
                <Text style={styles.statLabel}>MEMBERS</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>31</Text>
                <Text style={styles.statLabel}>YEARS</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>EVENTS A YEAR</Text>
              </View>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Bottom Action Section */}
          <View style={styles.bottomSection}>
            {/* Error Message if any */}
            {authError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.88}
              disabled={isLoadingGoogle || isLoadingApple}
              onPress={handleContinueWithGoogle}>
              {isLoadingGoogle ? (
                <ActivityIndicator size="small" color="#201E1D" />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Sign In Button */}
            <TouchableOpacity
              style={styles.appleButton}
              activeOpacity={0.85}
              disabled={isLoadingGoogle || isLoadingApple}
              onPress={handleContinueWithApple}>
              {isLoadingApple ? (
                <ActivityIndicator size="small" color={colors.appleButtonText} />
              ) : (
                <>
                  <AppleIcon size={20} color={colors.appleButtonText} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orDividerContainer}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR</Text>
              <View style={styles.orDividerLine} />
            </View>

            {/* Login with Email / Mobile */}
            <TouchableOpacity
              style={styles.emailMobileButton}
              activeOpacity={0.85}
              disabled={isLoadingGoogle || isLoadingApple}
              onPress={() => router.push('/find-record')}>
              <Text style={styles.emailMobileButtonText}>Login with Email / Mobile</Text>
            </TouchableOpacity>

            {/* Browse as Guest */}
            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.75}
              onPress={async () => {
                await setGuestSession(true);
                router.replace('/guest');
              }}>
              <Text style={styles.guestButtonText}>Browse as a guest</Text>
            </TouchableOpacity>

            {/* Footer Registration Notice */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerPrompt}>
                Not a member yet?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/apply-membership')}>
                  Apply for membership
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  decorativeCircleTop: {
    position: 'absolute',
    backgroundColor: colors.circleTopRight,
  },
  decorativeCircleBottom: {
    position: 'absolute',
    backgroundColor: colors.circleBottomLeft,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 26,
  },
  logo: {
    width: 80,
    height: 80,
  },
  chapterBadge: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 1.4,
    color: colors.textPeach,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  heading: {
    fontFamily: fonts.displayBlack,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.5,
    color: colors.textHeading,
    marginBottom: 18,
  },
  bodyDescription: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textBody,
    marginBottom: 30,
    maxWidth: 340,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontFamily: fonts.displayBlack,
    fontSize: 28,
    lineHeight: 32,
    color: colors.textPeach,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  bottomSection: {
    width: '100%',
    paddingTop: 8,
  },
  googleButton: {
    backgroundColor: colors.googleButtonBg,
    height: 56,
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 16.5,
    color: colors.googleButtonText,
    letterSpacing: -0.2,
  },
  appleButton: {
    backgroundColor: colors.appleButtonBg,
    borderWidth: 1.5,
    borderColor: colors.appleButtonBorder,
    height: 56,
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  appleButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 16.5,
    color: colors.appleButtonText,
    letterSpacing: -0.2,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: '#FFB4B4',
    textAlign: 'center',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(216, 206, 195, 0.18)',
  },
  orDividerText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginHorizontal: 14,
    textTransform: 'uppercase',
  },
  emailMobileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.appleButtonBorder,
    height: 56,
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emailMobileButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 16,
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    paddingVertical: 6,
  },
  guestButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 15.5,
    color: colors.textPeach,
    letterSpacing: -0.2,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  footerPrompt: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textFooter,
    textAlign: 'center',
  },
  footerLink: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.textPeach,
    textDecorationLine: 'underline',
  },
});
