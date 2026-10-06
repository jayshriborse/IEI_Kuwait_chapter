import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { ChevronBackIcon } from '../components/icons/chevron-back-icon';
import { ScanViewfinderIcon } from '../components/icons/scanner-icon';
import { getCheckedInCount, subscribeCheckInState, initCheckInStore } from '@/data/checkin';
import { getVerifiedMember, getAuthLevel, getAuthToken } from '@/data/member-session';
import { AccessDeniedView } from '@/components/access-denied-view';
import { getApiBaseUrl } from '@/utils/api';

interface EcReceiptItem {
  id: string;
  memberCode: string;
  memberName: string;
  method: string;
  amountKd: string;
  submittedAt: string;
  hasFile: boolean;
}

export default function ECToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [checkedInCount, setCheckedInCount] = useState(getCheckedInCount());

  // EC receipts state
  const [receipts, setReceipts] = useState<EcReceiptItem[]>([]);
  const [unpaidCount, setUnpaidCount] = useState<number | null>(null);
  const [receiptsCount, setReceiptsCount] = useState<number | null>(null);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

  // Confirm sheet modal state
  const [selectedReceipt, setSelectedReceipt] = useState<EcReceiptItem | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [receiptNo, setReceiptNo] = useState('');
  const [bookNo, setBookNo] = useState('');
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const authLevel = getAuthLevel();
  const verifiedMember = getVerifiedMember();

  const loadReceipts = useCallback(async () => {
    try {
      setIsLoadingReceipts(true);
      const token = getAuthToken();
      const res = await fetch(`${getApiBaseUrl()}/ec/receipts?status=PENDING`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.items || []);
        if (data.counts) {
          setUnpaidCount(data.counts.unpaid);
          setReceiptsCount(data.counts.receiptsToConfirm);
        }
      }
    } catch (err) {
      console.warn('Failed to load EC receipts:', err);
    } finally {
      setIsLoadingReceipts(false);
    }
  }, []);

  const handleConfirm = async () => {
    if (!selectedReceipt) return;
    if (!receiptNo.trim() || !bookNo.trim()) {
      setConfirmError('Receipt no. and Book no. are required');
      return;
    }
    setConfirmError(null);
    setIsSubmittingConfirm(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${getApiBaseUrl()}/ec/receipts/${selectedReceipt.id}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            receiptNo: receiptNo.trim(),
            bookNo: bookNo.trim(),
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : errData.message || 'Failed to confirm receipt';
        setConfirmError(msg);
        return;
      }

      setConfirmModalVisible(false);
      setSelectedReceipt(null);
      setReceiptNo('');
      setBookNo('');
      await loadReceipts();
    } catch (err: any) {
      setConfirmError(err.message || 'Failed to confirm receipt');
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  useEffect(() => {
    initCheckInStore();
    const unsub = subscribeCheckInState(() => {
      setCheckedInCount(getCheckedInCount());
    });
    loadReceipts();
    return unsub;
  }, [loadReceipts]);

  if (authLevel !== 'EC' && verifiedMember?.role !== 'EC_OFFICER' && verifiedMember?.role !== 'ADMIN') {
    return (
      <AccessDeniedView
        title="EC Tools Restricted"
        message="Executive Committee tools, scrutiny workflows, and treasurer reports are restricted to authorized chapter office bearers."
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Forest Green Header Container */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 16) + 8 },
        ]}>
        <View style={styles.headerWrapper}>
          {/* Header Title Row */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={18} color="#F9F4ED" />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.headerSubtitle}>CHAPTER OFFICE · 2026–27</Text>
              <Text style={styles.headerTitle}>EC tools</Text>
            </View>
          </View>

          {/* 3 Stats in a Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{unpaidCount !== null ? unpaidCount : 57}</Text>
              <Text style={styles.statLabel}>UNPAID</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>TO REVIEW</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{receiptsCount !== null ? receiptsCount : receipts.length}</Text>
              <Text style={styles.statLabel}>RECEIPTS</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* Tonight's Attendance Card */}
        <TouchableOpacity
          style={styles.attendanceCard}
          activeOpacity={0.85}
          onPress={() => router.push('/door-checkin')}>
          <View style={styles.attendanceIconCircle}>
            <ScanViewfinderIcon size={22} color="#F9F4ED" />
          </View>

          <View style={styles.attendanceContent}>
            <Text style={styles.attendanceTitle}>Tonight's attendance</Text>
            <Text style={styles.attendanceSubtitle}>
              Engineers' Day · {checkedInCount} checked in of 104 RSVPs
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section 1: RENEWAL RISK */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            RENEWAL RISK — CALL THESE FIRST
          </Text>

          <View style={styles.riskList}>
            {/* Member 1: Subbiah Somasundaram */}
            <View style={styles.memberRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#FFE1D0' }]}>
                <Text style={styles.avatarText}>SS</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Engr. Subbiah Somasundaram</Text>
                <Text style={styles.memberSub}>Paid 3 of 3 years · lapsed this year</Text>
              </View>
              <View style={styles.highValueBadge}>
                <Text style={styles.highValueBadgeText}>High value</Text>
              </View>
            </View>

            {/* Member 2: Upendra Kumar Behura */}
            <View style={styles.memberRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#CCDBB2' }]}>
                <Text style={styles.avatarText}>UB</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Engr. Upendra Kumar Behura</Text>
                <Text style={styles.memberSub}>Paid 3 of 3 years · no response to UTSAV</Text>
              </View>
              <View style={styles.highValueBadge}>
                <Text style={styles.highValueBadgeText}>High value</Text>
              </View>
            </View>

            {/* Member 3: Valentine Borges */}
            <View style={styles.memberRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#DCD3C4' }]}>
                <Text style={styles.avatarText}>VB</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Engr. Valentine Borges</Text>
                <Text style={styles.memberSub}>Paid 2 of 3 years</Text>
              </View>
              <View style={styles.mediumBadge}>
                <Text style={styles.mediumBadgeText}>Medium</Text>
              </View>
            </View>

            {/* Member 4: Ramesh Rajendran */}
            <View style={[styles.memberRow, styles.memberRowLast]}>
              <View style={[styles.avatarCircle, { backgroundColor: '#FFE1D0' }]}>
                <Text style={styles.avatarText}>RR</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Engr. Ramesh Rajendran</Text>
                <Text style={styles.memberSub}>Paid 1 of 3 years · unreachable</Text>
              </View>
              <View style={styles.unreachableBadge}>
                <Text style={styles.unreachableBadgeText}>Unreachable</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: APPLICATIONS AWAITING REVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>APPLICATIONS AWAITING REVIEW</Text>

          <View style={styles.reviewCard}>
            {/* Applicant 1: Prakash Nair */}
            <TouchableOpacity
              style={styles.reviewRow}
              activeOpacity={0.75}
              onPress={() => router.push('/review-application')}>
              <View style={[styles.avatarCircle, { backgroundColor: '#CCDBB2' }]}>
                <Text style={styles.avatarText}>PN</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Eng. Prakash Nair</Text>
                <Text style={styles.memberSub}>AMIE · Mechanical · applied 28 Aug</Text>
              </View>
              <Text style={styles.newApplicantText}>New</Text>
            </TouchableOpacity>

            {/* Applicant 2: Divya Menon */}
            <TouchableOpacity
              style={[styles.reviewRow, styles.reviewRowLast]}
              activeOpacity={0.75}
              onPress={() => router.push('/review-application')}>
              <View style={[styles.avatarCircle, { backgroundColor: '#FFE1D0' }]}>
                <Text style={styles.avatarText}>DM</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>Eng. Divya Menon</Text>
                <Text style={styles.memberSub}>MIE · Electrical · applied 31 Aug</Text>
              </View>
              <View style={styles.docsOkButton}>
                <Text style={styles.docsOkButtonText}>Docs ok</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: RECEIPTS TO CONFIRM */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>RECEIPTS TO CONFIRM</Text>

          <View style={styles.receiptsList}>
            {receipts.length === 0 ? (
              <View style={[styles.receiptRow, styles.receiptRowLast]}>
                <View style={styles.receiptInfo}>
                  <Text style={styles.receiptSub}>No receipts awaiting confirmation</Text>
                </View>
              </View>
            ) : (
              receipts.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.receiptRow,
                    index === receipts.length - 1 && styles.receiptRowLast,
                  ]}>
                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptName}>{item.memberName}</Text>
                    <Text style={styles.receiptSub}>
                      {item.method === 'BANK_TRANSFER' ? 'Bank transfer' : 'Cash'} · KD {item.amountKd}
                      {item.hasFile ? ' · receipt attached' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedReceipt(item);
                      setReceiptNo('');
                      setBookNo('');
                      setConfirmError(null);
                      setConfirmModalVisible(true);
                    }}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Confirm Receipt Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSubmittingConfirm) {
            setConfirmModalVisible(false);
            setSelectedReceipt(null);
          }
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm receipt</Text>
            <Text style={styles.modalSubtitle}>
              {selectedReceipt
                ? `${selectedReceipt.memberName} (${selectedReceipt.memberCode}) · KD ${selectedReceipt.amountKd}`
                : ''}
            </Text>

            {confirmError ? (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>{confirmError}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>RECEIPT NO. *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 480"
              placeholderTextColor="#8D7B68"
              value={receiptNo}
              onChangeText={setReceiptNo}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>BOOK NO. *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 4"
              placeholderTextColor="#8D7B68"
              value={bookNo}
              onChangeText={setBookNo}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                activeOpacity={0.7}
                disabled={isSubmittingConfirm}
                onPress={() => {
                  setConfirmModalVisible(false);
                  setSelectedReceipt(null);
                  setConfirmError(null);
                }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, isSubmittingConfirm && { opacity: 0.7 }]}
                activeOpacity={0.85}
                disabled={isSubmittingConfirm}
                onPress={handleConfirm}>
                {isSubmittingConfirm ? (
                  <ActivityIndicator size="small" color="#F9F4ED" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
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
    backgroundColor: '#F5EAD8',
  },

  // Top Dark Olive / Forest Green Header
  headerContainer: {
    backgroundColor: '#273318',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 22,
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#384824',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerSubtitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    color: '#A9B890',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#F9F4ED',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#384824',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#F9F4ED',
    marginBottom: 3,
  },
  statLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    color: '#A9B890',
    letterSpacing: 0.8,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Attendance Card
  attendanceCard: {
    backgroundColor: '#FFE1D0',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  attendanceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C67139',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  attendanceContent: {
    flex: 1,
  },
  attendanceTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16.5,
    color: '#201E1D',
    marginBottom: 3,
  },
  attendanceSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#5A4535',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    letterSpacing: 1.1,
    marginBottom: 10,
  },

  // Renewal Risk List
  riskList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  memberRowLast: {
    borderBottomWidth: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: '#201E1D',
  },
  memberInfo: {
    flex: 1,
    paddingRight: 8,
  },
  memberName: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 2,
  },
  memberSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
  },

  // Status Badges
  highValueBadge: {
    backgroundColor: '#FFE1D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highValueBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8A3818',
  },
  mediumBadge: {
    backgroundColor: '#EBE0CE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediumBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#555',
  },
  unreachableBadge: {
    backgroundColor: '#EBE0CE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreachableBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#666',
  },

  // Applications Awaiting Review Card
  reviewCard: {
    backgroundColor: '#FAF4EA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EBDDC5',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE0CE',
  },
  reviewRowLast: {
    borderBottomWidth: 0,
  },
  newApplicantText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: '#C67139',
  },
  docsOkButton: {
    borderWidth: 1,
    borderColor: '#C67139',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  docsOkButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: '#C67139',
  },

  // Receipts List
  receiptsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D5C3',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D5C3',
  },
  receiptRowLast: {
    borderBottomWidth: 1,
  },
  receiptInfo: {
    flex: 1,
    paddingRight: 10,
  },
  receiptName: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 3,
  },
  receiptSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#605C55',
  },
  confirmButton: {
    backgroundColor: '#C67139',
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 13.5,
    color: '#F9F4ED',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
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
  modalErrorBox: {
    backgroundColor: '#FDE8E8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  modalErrorText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#C53030',
  },
  inputLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: '#8D7B68',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#EBDDC5',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#201E1D',
    marginBottom: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#8D7B68',
  },
  modalConfirmButton: {
    backgroundColor: '#C67139',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontFamily: fonts.displayBold,
    fontSize: 13.5,
    color: '#F9F4ED',
  },
});
