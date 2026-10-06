import React, { useState, useEffect } from 'react';
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
import { ClockIcon } from '../components/icons/clock-icon';
import { getAuthToken } from '../data/member-session';
import { getApiBaseUrl } from '../utils/api';

export default function WithTreasurerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [treasurerName, setTreasurerName] = useState('Engr. Sudhir Shyam Menghani');
  const [amountKd, setAmountKd] = useState('20');
  const [submittedDate, setSubmittedDate] = useState('Recently');
  const [paymentMethod, setPaymentMethod] = useState('Bank transfer');
  const [statusText, setStatusText] = useState('Awaiting confirmation');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${getApiBaseUrl()}/me/subscription`, { headers });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.treasurerName) setTreasurerName(data.treasurerName);
          if (data.amountKd) setAmountKd(data.amountKd);

          if (data.declaration) {
            setPaymentMethod(data.declaration.method === 'CASH' ? 'Cash at office' : 'Bank transfer');
            if (data.declaration.submittedAt) {
              const d = new Date(data.declaration.submittedAt);
              if (!isNaN(d.getTime())) {
                setSubmittedDate(
                  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
                    ', ' +
                    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                );
              }
            }
            if (data.declaration.status === 'CONFIRMED') {
              setStatusText('Confirmed');
            }
          }
        }
      } catch (err) {}
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 24) + 20, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>

          {/* Pending Clock Icon Badge */}
          <View style={styles.clockBadge}>
            <ClockIcon size={24} color="#201E1D" />
          </View>

          {/* Title */}
          <Text style={styles.title}>With the treasurer</Text>

          {/* Description */}
          <Text style={styles.description}>
            {treasurerName} will confirm your KD {amountKd} payment and enter the receipt book number. You'll get a notification and the receipt will appear under My receipts.
          </Text>

          {/* Status / Transaction Details Card */}
          <View style={styles.detailsCard}>
            {/* Submitted Date */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Submitted</Text>
              <Text style={styles.dataValue}>{submittedDate}</Text>
            </View>

            {/* Method */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Method</Text>
              <Text style={styles.dataValue}>{paymentMethod}</Text>
            </View>

            {/* Status */}
            <View style={[styles.dataRow, styles.dataRowLast]}>
              <Text style={styles.dataLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{statusText}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 4 },
          ]}>
          {/* My receipts button -> routes to /my-receipts (no loop) */}
          <TouchableOpacity
            style={styles.receiptsButton}
            activeOpacity={0.8}
            onPress={() => router.push('/my-receipts')}>
            <Text style={styles.receiptsButtonText}>My receipts</Text>
          </TouchableOpacity>

          {/* Done button */}
          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.85}
            onPress={() => router.push('/dashboard')}>
            <Text style={styles.doneButtonText}>Done</Text>
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
    paddingHorizontal: 22,
  },

  // Clock Badge
  clockBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#CCDBB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  // Title & Description
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: '#201E1D',
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#3E3832',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#EBDDC5',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataRowLast: {
    paddingBottom: 2,
  },
  dataLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: '#6B6358',
  },
  dataValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#201E1D',
  },
  statusBadge: {
    backgroundColor: '#FFE1D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: '#8A3818',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5EAD8',
    paddingTop: 12,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  receiptsButton: {
    flex: 1,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#FAF4EA',
    borderWidth: 1,
    borderColor: '#DCCBB0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptsButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#201E1D',
  },
  doneButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#C67139',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#F9F4ED',
  },
});
