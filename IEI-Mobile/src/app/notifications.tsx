import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { getAuthToken } from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';

interface NotificationItem {
  id: string;
  badgeType: 'peach' | 'green' | 'grey';
  title: string;
  description: string;
  timestamp: string;
}

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    badgeType: 'peach',
    title: "59th Engineers' Day is tomorrow",
    description: '18:30 at Kuwait Society of Engineers. Bring your card.',
    timestamp: '1h',
  },
  {
    id: '2',
    badgeType: 'green',
    title: 'Receipt confirmed',
    description: 'Treasurer entered receipt no. 480, Book 4. KD 20 received.',
    timestamp: '2d',
  },
  {
    id: '3',
    badgeType: 'peach',
    title: 'Subscription 2026–27 is due',
    description: 'KD 20 · renew before the AGM to keep voting rights.',
    timestamp: '5d',
  },
  {
    id: '4',
    badgeType: 'peach',
    title: 'Urgent: O+ blood needed',
    description: 'Al Amiri Hospital · posted by Engr. Tijo Thomas.',
    timestamp: '1w',
  },
  {
    id: '5',
    badgeType: 'grey',
    title: 'Ladies Wing posted an activity',
    description: '"Let\'s Act" acting workshop, 6 Nov at IGNOU Salmiya.',
    timestamp: '1w',
  },
  {
    id: '6',
    badgeType: 'grey',
    title: 'AGM notice',
    description: 'Annual General Meeting 6 Feb 2027. Agenda attached.',
    timestamp: '2w',
  },
];

function formatTimestamp(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w`;
  } catch {
    return '1d';
  }
}

function mapApiNotification(item: any): NotificationItem {
  let badgeType: 'peach' | 'green' | 'grey' = 'grey';
  if (item.type === 'RECEIPT_CONFIRMED') {
    badgeType = 'green';
  } else if (
    item.type === 'EVENT_REMINDER' ||
    item.type === 'DUES_DUE' ||
    item.type === 'URGENT_BLOOD'
  ) {
    badgeType = 'peach';
  }

  return {
    id: item.id,
    badgeType,
    title: item.title,
    description: item.body,
    timestamp: formatTimestamp(item.createdAt),
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const token = getAuthToken();
        if (!token) {
          if (isMounted) {
            setNotifications(FALLBACK_NOTIFICATIONS);
            setIsLoading(false);
          }
          return;
        }

        const res = await fetch(`${getApiBaseUrl()}/me/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notifications) && data.notifications.length > 0) {
            if (isMounted) {
              setNotifications(data.notifications.map(mapApiNotification));
              setIsLoading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load notifications from API:', err);
      }
      if (isMounted) {
        setNotifications(FALLBACK_NOTIFICATIONS);
        setIsLoading(false);
      }
    }

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

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
          {/* Header Row */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronBackIcon size={16} color={colors.primaryTerracotta} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {/* Top Divider */}
          <View style={styles.divider} />

          {/* Notifications List */}
          {isLoading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primaryTerracotta} />
            </View>
          ) : (
            notifications.map((item) => {
              let badgeBg = '#FFE1D0';
              let dotBg = '#C67139';

              if (item.badgeType === 'green') {
                badgeBg = '#D1DEBB';
                dotBg = '#5B6F40';
              } else if (item.badgeType === 'grey') {
                badgeBg = '#EEE7DB';
                dotBg = '#756C60';
              }

              return (
                <View key={item.id}>
                  <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
                    {/* Left Circular Badge Indicator */}
                    <View style={[styles.badgeCircle, { backgroundColor: badgeBg }]}>
                      <View style={[styles.badgeDot, { backgroundColor: dotBg }]} />
                    </View>

                    {/* Notification Content */}
                    <View style={styles.contentColumn}>
                      <View style={styles.titleRow}>
                        <Text style={styles.notificationTitle}>{item.title}</Text>
                        <Text style={styles.timestampText}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.notificationDescription}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Divider Line below each item */}
                  <View style={styles.divider} />
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
    paddingBottom: 32,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingRight: 14,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5DC CE',
    width: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  badgeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  contentColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  notificationTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: colors.textDark,
    flex: 1,
  },
  timestampText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#8B8378',
    marginTop: 1,
  },
  notificationDescription: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 16.5,
    color: '#675F53',
    marginTop: 3,
  },
});
