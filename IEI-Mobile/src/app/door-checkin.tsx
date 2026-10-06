import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Easing,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { colors, fonts } from '../theme';
import { ChevronBackIcon } from '../components/icons/chevron-back-icon';
import { CheckIcon } from '../components/icons/check-icon';
import { PROGRAMME_EVENTS } from '@/data/events';
import {
  processMemberCheckin,
  getCheckInStats,
  syncPendingCheckins,
  subscribeCheckInState,
  initCheckInStore,
  checkBackendHealth,
  toggleSimulatedOffline,
  downloadOfflinePack,
  CheckInRecord,
} from '@/data/checkin';
import { getVerifiedMember, getAuthLevel } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';

export default function DoorCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { eventId: paramEventId } = useLocalSearchParams<{ eventId?: string }>();

  const selectedEvent = PROGRAMME_EVENTS.find((e) => e.id === paramEventId) || PROGRAMME_EVENTS[0];
  const eventId = selectedEvent.id;

  const authLevel = getAuthLevel();
  const verifiedMember = getVerifiedMember();

  if (
    authLevel !== 'EC' &&
    verifiedMember?.role !== 'EC_OFFICER' &&
    verifiedMember?.role !== 'ADMIN' &&
    verifiedMember?.role !== 'VOLUNTEER'
  ) {
    return (
      <AccessDeniedView
        title="Door Check-in Restricted"
        message="Event door check-in scanning is restricted to authorized Executive Committee officers."
      />
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [stats, setStats] = useState(getCheckInStats(eventId));
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord>({
    id: 'init-record',
    name: 'Eng. Anu Kurian',
    memberId: 'IEI0010',
    seats: '2 seats',
    checkInTime: '21:14',
    scannedAt: new Date().toISOString(),
    eventId: eventId,
    syncStatus: 'synced',
    isOfflineRecorded: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');

  // Refs for permanent camera analyzer throttling without unhooking CameraView
  const isScanningRef = useRef(false);
  const lastScanTimeRef = useRef(0);

  // Animated laser line
  const scanAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  // Initialize store and subscribe to state changes
  useEffect(() => {
    initCheckInStore(eventId);

    const unsubscribe = subscribeCheckInState(() => {
      setStats(getCheckInStats(eventId));
    });

    // Check backend health on mount
    checkBackendHealth(eventId);

    // Auto-sync polling every 6 seconds when there are pending items
    const syncInterval = setInterval(() => {
      const currentStats = getCheckInStats(eventId);
      if (currentStats.pendingSyncCount > 0 && !currentStats.isSimulatedOffline) {
        checkBackendHealth(eventId).then((isHealthy) => {
          if (isHealthy) {
            syncPendingCheckins(eventId);
          }
        });
      }
    }, 6000);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, [eventId]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 100,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: -100,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    scanLoop.start();
    pulseLoop.start();

    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, [permission]);

  const handleBarcodeScanned = async (event: any) => {
    const rawData = typeof event === 'string' ? event : (event?.data || event?.raw);
    if (!rawData) return;

    const now = Date.now();
    // Non-blocking debounce: prevent camera burst spam without detaching native analyzer
    if (isScanningRef.current || isProcessing) return;
    if (now - lastScanTimeRef.current < 1400) return;

    isScanningRef.current = true;
    lastScanTimeRef.current = now;
    setIsProcessing(true);

    try {
      const dataStr = String(rawData).trim();
      const result = await processMemberCheckin(dataStr, eventId);

      if (result.success && result.data) {
        setLastCheckIn({ ...result.data });
        setStats(getCheckInStats(eventId));
      } else {
        Alert.alert('Scan Result', result.error || 'Unrecognized QR code or Member ID.');
      }
    } catch (err: any) {
      Alert.alert('Scan Error', err?.message || 'Failed processing check-in.');
    } finally {
      setIsProcessing(false);
      // Auto-rearm scanner after cooldown so same or next card scans instantly
      setTimeout(() => {
        isScanningRef.current = false;
      }, 1400);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualIdInput.trim()) return;

    setIsProcessing(true);
    try {
      const result = await processMemberCheckin(manualIdInput.trim(), eventId, {
        isManual: true,
        volunteerMemberId: verifiedMember?.memberCode,
      });
      if (result.success && result.data) {
        setLastCheckIn({ ...result.data });
        setStats(getCheckInStats(eventId));
        setManualModalVisible(false);
        setManualIdInput('');
      } else {
        Alert.alert('Member Not Found', result.error || 'Invalid Member ID');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Check-in failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncPress = async () => {
    const res = await syncPendingCheckins(eventId);
    if (res.success) {
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${res.syncedCount} scan(s)${
          res.duplicateCount > 0 ? ` (${res.duplicateCount} duplicate(s) merged)` : ''
        } with backend.`
      );
    } else {
      Alert.alert('Sync Failed', 'Could not reach the backend. Check-ins remain securely saved offline.');
    }
  };

  const handleToggleOfflinePress = () => {
    const isNowOffline = toggleSimulatedOffline(eventId);
    if (isNowOffline) {
      Alert.alert(
        'Offline Mode Activated',
        'Device is simulating offline state. Scans will be stored locally and queued for auto-sync.'
      );
    } else {
      Alert.alert(
        'Online Mode Restored',
        'Device is reconnected to the backend. Syncing any pending scans now...'
      );
    }
  };

  const handleDownloadOfflinePress = async () => {
    setIsDownloadingOffline(true);
    try {
      const res = await downloadOfflinePack(eventId);
      if (res.success) {
        Alert.alert(
          'Offline Pack Ready',
          `Downloaded RSVP list (${res.count} attendees) and signing public key. Offline QR verification is now active.`,
        );
      } else {
        Alert.alert('Download Failed', res.error || 'Could not download offline pack.');
      }
    } finally {
      setIsDownloadingOffline(false);
    }
  };

  // Determine status color and text
  const isActuallyOnline = stats.isOnline && !stats.isSimulatedOffline;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content Wrapper */}
      <View
        style={[
          styles.mainWrapper,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
          },
        ]}>
        {/* Top Header Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}>
            <ChevronBackIcon size={18} color="#F9F4ED" />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Door check-in</Text>
            <Text style={styles.headerSubtitle}>{selectedEvent.title}</Text>
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterNumber}>{stats.checkedInTotal}</Text>
            <Text style={styles.counterLabel}>OF {stats.totalCapacity}</Text>
          </View>
        </View>

        {/* Network & Sync Status Pill Bar */}
        <View style={styles.networkStatusRow}>
          <TouchableOpacity
            style={[
              styles.statusPill,
              isActuallyOnline ? styles.statusPillOnline : styles.statusPillOffline,
            ]}
            activeOpacity={0.8}
            onPress={handleToggleOfflinePress}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActuallyOnline ? '#4ADE80' : '#FBBF24' },
              ]}
            />
            <Text style={styles.statusPillText}>
              {stats.isSyncing
                ? 'Syncing with backend...'
                : isActuallyOnline
                ? 'Online · Live Sync'
                : `Offline Mode ${stats.pendingSyncCount > 0 ? `(${stats.pendingSyncCount} pending)` : ''}`}
            </Text>
            <Text style={styles.statusPillSub}>Tap to toggle mode</Text>
          </TouchableOpacity>

          {stats.pendingSyncCount > 0 && isActuallyOnline && (
            <TouchableOpacity
              style={styles.syncActionButton}
              activeOpacity={0.8}
              onPress={handleSyncPress}>
              {stats.isSyncing ? (
                <ActivityIndicator size="small" color="#F9F4ED" />
              ) : (
                <Text style={styles.syncActionText}>
                  Sync {stats.pendingSyncCount}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Download list for offline Action */}
        <TouchableOpacity
          style={styles.downloadOfflineButton}
          activeOpacity={0.8}
          disabled={isDownloadingOffline}
          onPress={handleDownloadOfflinePress}>
          {isDownloadingOffline ? (
            <ActivityIndicator size="small" color="#FFC6A5" />
          ) : (
            <Text style={styles.downloadOfflineText}>
              Download list for offline
            </Text>
          )}
        </TouchableOpacity>

        {/* Middle Scanner / Viewfinder Frame with Real Camera */}
        <View style={styles.scannerContainer}>
          <View
            style={[
              styles.viewfinderBox,
              permission?.granted && styles.viewfinderBoxActive,
            ]}>
            {/* Real Camera Preview */}
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              />
            ) : (
              <TouchableOpacity
                style={styles.permissionPrompt}
                activeOpacity={0.8}
                onPress={requestPermission}>
                <Text style={styles.permissionText}>
                  Tap to enable camera for QR scanning
                </Text>
              </TouchableOpacity>
            )}

            {/* 4 Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeftBracket]} />
            <View style={[styles.cornerBracket, styles.topRightBracket]} />
            <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
            <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

            {/* Real Animated Laser Sweep Line */}
            <Animated.View
              style={[
                styles.animatedLaserBeam,
                {
                  transform: [{ translateY: scanAnim }],
                  opacity: pulseAnim,
                },
              ]}
              pointerEvents="none">
              <View style={styles.laserGlow} />
              <View style={styles.laserCore} />
            </Animated.View>

            {/* Scan Laser Guide Text */}
            <View style={styles.scanLineContainer} pointerEvents="none">
              <Text style={styles.scanGuideText}>
                POINT AT THE MEMBER'S CARD
              </Text>
            </View>
          </View>
        </View>

        {/* Check-in Notification Banner (Adapts dynamically to Warning, Online, Offline, and Duplicate) */}
        {(() => {
          const hasWarning = Boolean(lastCheckIn.noRsvp || lastCheckIn.duesOverdue);
          const isWarning = hasWarning && !lastCheckIn.isAlreadyCheckedIn;

          return (
            <View
              style={[
                styles.checkedInBanner,
                lastCheckIn.isAlreadyCheckedIn
                  ? styles.bannerDuplicate
                  : isWarning
                  ? styles.bannerWarning
                  : lastCheckIn.isOfflineRecorded
                  ? styles.bannerOffline
                  : styles.bannerOnline,
              ]}>
              <View
                style={[
                  styles.checkBadgeCircle,
                  lastCheckIn.isAlreadyCheckedIn
                    ? styles.badgeDuplicate
                    : isWarning
                    ? styles.badgeWarning
                    : lastCheckIn.isOfflineRecorded
                    ? styles.badgeOffline
                    : styles.badgeOnline,
                ]}>
                {lastCheckIn.isAlreadyCheckedIn ? (
                  <Text style={styles.badgeEmoji}>⚠️</Text>
                ) : isWarning ? (
                  <Text style={styles.badgeEmoji}>⚠️</Text>
                ) : lastCheckIn.isOfflineRecorded ? (
                  <Text style={styles.badgeEmoji}>💾</Text>
                ) : (
                  <CheckIcon size={18} color="#F9F4ED" />
                )}
              </View>

              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>
                  {lastCheckIn.name}
                  {lastCheckIn.isAlreadyCheckedIn
                    ? ' (Already Checked In)'
                    : isWarning
                    ? ' (Warning)'
                    : lastCheckIn.isOfflineRecorded
                    ? ' recorded offline'
                    : ' checked in'}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {lastCheckIn.memberId} · {lastCheckIn.seats} · {lastCheckIn.checkInTime}
                  {lastCheckIn.manual
                    ? ` · Manual (by ${lastCheckIn.volunteerMemberId || verifiedMember?.memberCode || 'Volunteer'})`
                    : ''}
                  {lastCheckIn.isAlreadyCheckedIn
                    ? ' · Duplicate ignored'
                    : isWarning
                    ? ` · ⚠️ ${[
                        lastCheckIn.noRsvp ? 'No RSVP' : null,
                        lastCheckIn.duesOverdue ? 'Dues overdue' : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}`
                    : lastCheckIn.isOfflineRecorded
                    ? ' · Saved locally (will auto-sync)'
                    : ' · Verified online'}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* Bottom Enter Member ID CTA */}
        <TouchableOpacity
          style={styles.manualEntryButton}
          activeOpacity={0.85}
          onPress={() => setManualModalVisible(true)}>
          <Text style={styles.manualEntryText}>Enter a Member ID instead</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Member ID Entry Modal */}
      <Modal
        visible={manualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Member ID</Text>
            <Text style={styles.modalSubtitle}>
              Type the member ID (e.g. IEI0005, IEI0010, IEI0015, IEI0022). Works in both online and offline modes.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. IEI0005"
              placeholderTextColor="#8D7B68"
              autoCapitalize="characters"
              value={manualIdInput}
              onChangeText={setManualIdInput}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                activeOpacity={0.7}
                onPress={() => {
                  setManualModalVisible(false);
                  setManualIdInput('');
                }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                activeOpacity={0.85}
                disabled={isProcessing}
                onPress={handleManualSubmit}>
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#F9F4ED" />
                ) : (
                  <Text style={styles.modalConfirmText}>Check In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#402310',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5A3218',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#F9F4ED',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#D8CEC3',
  },
  counterBox: {
    alignItems: 'flex-end',
  },
  counterNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#FFC6A5',
    lineHeight: 24,
  },
  counterLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    color: '#D8CEC3',
    letterSpacing: 0.8,
  },

  // Network & Sync status row
  networkStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusPillOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  statusPillOffline: {
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPillText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: '#F9F4ED',
    flex: 1,
  },
  statusPillSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    color: '#D8CEC3',
    opacity: 0.85,
  },
  syncActionButton: {
    backgroundColor: '#C67139',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncActionText: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: '#F9F4ED',
  },

  // Scanner Viewfinder
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  viewfinderBox: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 340,
    backgroundColor: '#4E2A14',
    borderRadius: 26,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewfinderBoxActive: {
    backgroundColor: '#000000',
  },
  permissionPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFC6A5',
    textAlign: 'center',
  },

  // Corner Brackets
  cornerBracket: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: '#FFC6A5',
    zIndex: 10,
  },
  topLeftBracket: {
    top: 22,
    left: 22,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 16,
  },
  topRightBracket: {
    top: 22,
    right: 22,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 16,
  },
  bottomLeftBracket: {
    bottom: 22,
    left: 22,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 16,
  },
  bottomRightBracket: {
    bottom: 22,
    right: 22,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 16,
  },

  // Real Animated Laser Beam
  animatedLaserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  laserGlow: {
    position: 'absolute',
    width: '90%',
    height: 12,
    backgroundColor: 'rgba(198, 113, 57, 0.35)',
    borderRadius: 6,
  },
  laserCore: {
    width: '92%',
    height: 2.5,
    backgroundColor: '#FF9E64',
    shadowColor: '#FF9E64',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 1,
  },

  // Scan Line Guide Text
  scanLineContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    zIndex: 8,
  },
  scanGuideText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    color: '#FFC6A5',
    letterSpacing: 1.4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(78, 42, 20, 0.85)',
    borderRadius: 4,
  },

  // Checked In Banner
  checkedInBanner: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerOnline: {
    backgroundColor: '#2F4420',
  },
  bannerOffline: {
    backgroundColor: '#573D19',
    borderWidth: 1,
    borderColor: '#C67139',
  },
  bannerWarning: {
    backgroundColor: '#573D19',
    borderWidth: 1.5,
    borderColor: '#C67139',
  },
  bannerDuplicate: {
    backgroundColor: '#4A3423',
    borderWidth: 1,
    borderColor: '#8A5832',
  },
  downloadOfflineButton: {
    marginHorizontal: 4,
    marginBottom: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8A5832',
    backgroundColor: '#351B0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadOfflineText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: '#FFC6A5',
    letterSpacing: 0.3,
  },
  checkBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeOnline: {
    backgroundColor: '#4A6B34',
  },
  badgeOffline: {
    backgroundColor: '#8C561E',
  },
  badgeWarning: {
    backgroundColor: '#8C561E',
  },
  badgeDuplicate: {
    backgroundColor: '#6A4325',
  },
  badgeEmoji: {
    fontSize: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14.5,
    color: '#F9F4ED',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#D8CEC3',
  },

  // Bottom Manual Button
  manualEntryButton: {
    height: 52,
    backgroundColor: '#5A3218',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualEntryText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#FFC6A5',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F5EAD8',
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
    marginBottom: 16,
    lineHeight: 17,
  },
  modalInput: {
    backgroundColor: '#EBDDC5',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: '#201E1D',
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: '#8D7B68',
  },
  modalConfirmButton: {
    backgroundColor: '#C67139',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: '#F9F4ED',
  },
});
