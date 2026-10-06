import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { getAuthToken, getVerifiedMember } from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';
import { AccessDeniedView } from '@/components/access-denied-view';

interface ReceiptRecord {
  id: string;
  method: 'BANK_TRANSFER' | 'CASH';
  submittedAt: string;
  status: 'PENDING' | 'CONFIRMED';
  receiptNo?: string | null;
  bookNo?: string | null;
  periodLabel?: string;
}

export default function MyReceiptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const verifiedMember = getVerifiedMember();

  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReceipts() {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${getApiBaseUrl()}/me/receipts`, { headers });
        if (res.ok && isMounted) {
          const data = await res.json();
          setReceipts(data.items || []);
        }
      } catch (err) {
        // Fallback to sample item if offline/dev
        if (isMounted) {
          setReceipts([
            {
              id: 'sample-1',
              method: 'BANK_TRANSFER',
              submittedAt: new Date().toISOString(),
              status: 'PENDING',
              periodLabel: '2026-27',
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReceipts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!verifiedMember) {
    return <AccessDeniedView title="My Receipts" featureName="Member receipt history" />;
  }

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return (
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 12, paddingBottom: 40 },
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronBackIcon size={16} color={colors.primaryTerracotta} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My receipts</Text>
          </View>

          <Text style={styles.subtitle}>
            Official chapter dues payment receipts and pending treasurer confirmations.
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primaryTerracotta} />
            </View>
          ) : receipts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No payment receipts yet</Text>
              <Text style={styles.emptySub}>
                When you declare a subscription payment or bank transfer, your official receipts will appear here.
              </Text>
              <TouchableOpacity
                style={styles.renewCta}
                activeOpacity={0.85}
                onPress={() => router.push('/renew')}>
                <Text style={styles.renewCtaText}>Renew subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            receipts.map((item) => {
              const isConfirmed = item.status === 'CONFIRMED';
              return (
                <View key={item.id} style={styles.receiptCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.periodText}>
                      Subscription {item.periodLabel || '2026–27'}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        isConfirmed ? styles.badgeConfirmed : styles.badgePending,
                      ]}>
                      <Text
                        style={[
                          styles.badgeText,
                          isConfirmed ? styles.badgeTextConfirmed : styles.badgeTextPending,
                        ]}>
                        {isConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValue}>KD 20</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <Text style={styles.detailValue}>
                      {item.method === 'BANK_TRANSFER' ? 'Bank transfer' : 'Cash at chapter office'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted</Text>
                    <Text style={styles.detailValue}>{formatDate(item.submittedAt)}</Text>
                  </View>

                  {isConfirmed && item.receiptNo && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Receipt Reference</Text>
                      <Text style={styles.receiptRefText}>
                        Receipt #{item.receiptNo}, Book {item.bookNo || '1'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    paddingRight: 14,
    paddingVertical: 4,
  },
  headerTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#605C55',
    lineHeight: 18,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#FAF4EB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginTop: 10,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#756C60',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  renewCta: {
    backgroundColor: colors.primaryTerracotta,
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  renewCtaText: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: colors.textDark,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePending: {
    backgroundColor: '#FFE1D0',
  },
  badgeConfirmed: {
    backgroundColor: '#E8F2E2',
  },
  badgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
  },
  badgeTextPending: {
    color: '#8A3818',
  },
  badgeTextConfirmed: {
    color: '#3B6828',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5EAD8',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#756C60',
  },
  detailValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textDark,
  },
  receiptRefText: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: '#C67139',
  },
});
