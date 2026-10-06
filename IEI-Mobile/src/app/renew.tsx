import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { UploadTrayIcon } from '@/components/icons/upload-tray-icon';

import { getVerifiedMember, getAuthToken } from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function RenewSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const verifiedMember = getVerifiedMember();

  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('bank');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    uri: string;
    mimeType?: string;
    type?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    amountKd: string;
    periodLabel: string;
    startsOn?: string;
    endsOn?: string;
    paymentInstructions?: {
      bank: {
        beneficiary: string;
        iban: string;
        bankName: string;
      };
      cashOffice: {
        address: string;
        daysAndHours: string;
        summary: string;
      };
    };
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSubscription() {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${getApiBaseUrl()}/me/subscription`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setSubscriptionInfo({
              amountKd: data.amountKd || '20',
              periodLabel: data.period?.label || '2026-27',
              startsOn: data.period?.startsOn,
              endsOn: data.period?.endsOn,
              paymentInstructions: data.paymentInstructions,
            });
          }
        }
      } catch (err) {
        // Fallback to defaults
      }
    }
    loadSubscription();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!verifiedMember) {
    return (
      <AccessDeniedView
        title="Subscription Renewal"
        featureName="Member dues renewal and declarations"
      />
    );
  }

  const formatPeriodDates = () => {
    if (subscriptionInfo?.startsOn && subscriptionInfo?.endsOn) {
      const s = new Date(subscriptionInfo.startsOn);
      const e = new Date(subscriptionInfo.endsOn);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${sStr} – ${eStr}`;
      }
    }
    return '1 Apr 2026 – 31 Mar 2027';
  };

  const handleAttachReceipt = () => {
    Alert.alert(
      'Attach Receipt',
      'Choose an option to upload your payment receipt',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission needed',
                  'Camera permission is required to take a photo of your receipt.'
                );
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `receipt_${Date.now()}.jpg`;
                setAttachedFile({
                  name: fileName,
                  uri: asset.uri,
                  mimeType: asset.mimeType || 'image/jpeg',
                  type: 'Photo receipt',
                });
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
                  'Permission needed',
                  'Photo library permission is required to select your receipt.'
                );
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `receipt_${Date.now()}.jpg`;
                setAttachedFile({
                  name: fileName,
                  uri: asset.uri,
                  mimeType: asset.mimeType || 'image/jpeg',
                  type: 'Photo receipt',
                });
              }
            } catch (error) {
              console.error('Image library error:', error);
            }
          },
        },
        {
          text: 'Choose PDF Document',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const doc = result.assets[0];
                setAttachedFile({
                  name: doc.name || 'receipt.pdf',
                  uri: doc.uri,
                  mimeType: doc.mimeType || 'application/pdf',
                  type: doc.mimeType?.includes('pdf') ? 'PDF document' : 'Document receipt',
                });
              }
            } catch (error) {
              console.error('Document picker error:', error);
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

  const handleSubmit = async () => {
    if (paymentMethod === 'bank' && !attachedFile) {
      Alert.alert('Missing Receipt', 'Please attach your transfer receipt before submitting for confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('method', paymentMethod === 'bank' ? 'BANK_TRANSFER' : 'CASH');

      if (paymentMethod === 'bank' && attachedFile) {
        let detectedMime = attachedFile.mimeType;
        if (!detectedMime) {
          const ext = attachedFile.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') detectedMime = 'application/pdf';
          else if (ext === 'png') detectedMime = 'image/png';
          else detectedMime = 'image/jpeg';
        }

        formData.append('receipt', {
          uri: attachedFile.uri,
          name: attachedFile.name,
          type: detectedMime,
        } as any);
      }

      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/me/subscription/declarations`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push('/with-treasurer');
      } else {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Submission failed. Please try again.');
        Alert.alert('Submission Error', errorMsg);
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Could not communicate with chapter server. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 14 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Top Header Row with Back Button */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronBackIcon size={16} color={colors.primaryTerracotta} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Renew subscription</Text>
          </View>

          {/* Amount Due Banner Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountTag}>AMOUNT DUE</Text>
            <Text style={styles.amountValue}>KD {subscriptionInfo?.amountKd || '20'}</Text>
            <Text style={styles.amountSubtitle}>
              Subscription [{formatPeriodDates()}] · Member {verifiedMember.memberCode}
            </Text>
          </View>

          {/* Payment Method Selection */}
          <Text style={styles.sectionHeading}>HOW DID YOU PAY?</Text>

          {/* Option 1: Bank transfer */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              paymentMethod === 'bank' && styles.methodCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('bank')}>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'bank' && styles.radioCircleSelected,
              ]}>
              {paymentMethod === 'bank' && <View style={styles.radioDot} />}
            </View>

            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Bank transfer</Text>
              <Text style={styles.methodSubtitle}>Upload the transfer receipt</Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Cash at the chapter office */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              styles.methodCardMarginTop,
              paymentMethod === 'cash' && styles.methodCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('cash')}>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'cash' && styles.radioCircleSelected,
              ]}>
              {paymentMethod === 'cash' && <View style={styles.radioDot} />}
            </View>

            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Cash at the chapter office</Text>
              <Text style={styles.methodSubtitle}>
                {subscriptionInfo?.paymentInstructions?.cashOffice?.summary ||
                  (subscriptionInfo?.paymentInstructions?.cashOffice?.address && subscriptionInfo?.paymentInstructions?.cashOffice?.daysAndHours
                    ? `${subscriptionInfo.paymentInstructions.cashOffice.address} · ${subscriptionInfo.paymentInstructions.cashOffice.daysAndHours}`
                    : 'KSE, Soor St · Sun–Thu 17:30–20:30')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Chapter Account Box (shown for Bank transfer) */}
          {paymentMethod === 'bank' && (
            <View style={styles.accountBox}>
              <Text style={styles.accountHeader}>CHAPTER ACCOUNT</Text>

              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Beneficiary</Text>
                <Text style={styles.accountValue}>
                  {subscriptionInfo?.paymentInstructions?.bank?.beneficiary || 'IEI Kuwait Chapter'}
                </Text>
              </View>

              <View style={[styles.accountRow, styles.accountRowMargin]}>
                <Text style={styles.accountLabel}>IBAN</Text>
                <Text style={styles.accountValue}>
                  {subscriptionInfo?.paymentInstructions?.bank?.iban || '[KW00 0000 0000 0000]'}
                </Text>
              </View>

              <View style={[styles.accountRow, styles.accountRowMargin]}>
                <Text style={styles.accountLabel}>Reference</Text>
                <Text style={styles.accountValue}>{verifiedMember.memberCode}</Text>
              </View>
            </View>
          )}

          {/* Attach Receipt Dashed Box */}
          {paymentMethod === 'bank' && (
            <TouchableOpacity
              style={styles.dropzone}
              activeOpacity={0.75}
              onPress={handleAttachReceipt}>
              <UploadTrayIcon size={24} color={attachedFile ? colors.primaryTerracotta : '#675F53'} />
              <Text style={styles.dropzoneTitle} numberOfLines={1}>
                {attachedFile ? attachedFile.name : 'Attach your receipt'}
              </Text>
              <Text style={styles.dropzoneSubtitle}>
                {attachedFile
                  ? `${attachedFile.type || 'Attached'} · Tap to change`
                  : 'Photo or PDF · the treasurer confirms it'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Bottom Panel with Submit CTA */}
        <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.88}
            disabled={isSubmitting}
            onPress={handleSubmit}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for confirmation</Text>
            )}
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 14,
    paddingVertical: 4,
  },
  headerTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  amountCard: {
    backgroundColor: colors.primaryTerracotta,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  amountTag: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#FFE8DB',
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  amountSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#FFE8DB',
    lineHeight: 16,
  },
  sectionHeading: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#756C60',
    marginBottom: 12,
  },
  methodCard: {
    backgroundColor: colors.profileCardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodCardMarginTop: {
    marginTop: 10,
  },
  methodCardSelected: {
    borderColor: colors.primaryTerracotta,
    backgroundColor: '#FFF8F4',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C0B6A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioCircleSelected: {
    borderColor: colors.primaryTerracotta,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryTerracotta,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 2,
  },
  methodSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
  },
  accountBox: {
    backgroundColor: '#EBE3D7',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  accountHeader: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: '#756C60',
    marginBottom: 10,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountRowMargin: {
    marginTop: 8,
  },
  accountLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
  },
  accountValue: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: colors.textDark,
  },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C0B6A5',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: '#FAF5EE',
  },
  dropzoneTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: colors.textDark,
    marginTop: 8,
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#756C60',
  },
  bottomPanel: {
    backgroundColor: '#F9F4ED',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: colors.primaryTerracotta,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  submitButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 15.5,
    color: colors.buttonTextLight,
    letterSpacing: -0.2,
  },
});
