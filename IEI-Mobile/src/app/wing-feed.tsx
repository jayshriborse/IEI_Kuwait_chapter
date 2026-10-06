import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { ChevronBackIcon } from '../components/icons/chevron-back-icon';
import { AccessDeniedView } from '../components/access-denied-view';
import { getVerifiedMember, getAuthToken, getAuthLevel } from '@/data/member-session';
import { getApiBaseUrl } from '@/utils/api';

interface PostAuthor {
  id: string;
  memberCode: string;
  fullName: string;
}

interface WingPost {
  id: string;
  wingId: string;
  authorMemberId: string;
  title: string;
  body: string;
  eventDate?: string | null;
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  author?: PostAuthor;
}

interface WingConvenor {
  memberId: string;
  memberCode: string;
  fullName: string;
  assignedAt: string;
}

interface WingData {
  id: string;
  slug: string;
  name: string;
  isCurrentUserConvenor: boolean;
  convenors: WingConvenor[];
}

export default function WingFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const slug = (params.slug as string) || 'ladies-wing';

  const verifiedMember = getVerifiedMember();
  const isGuest = getAuthLevel() === 'GUEST' || !verifiedMember;

  const [wing, setWing] = useState<WingData | null>(null);
  const [posts, setPosts] = useState<WingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editingPost, setEditingPost] = useState<WingPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/wings/${slug}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        setErrorMsg('Access denied: guests and unlinked accounts cannot view wing feeds');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(errJson.message || 'Failed to load wing feed');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setWing(data.wing);
      setPosts(data.posts || []);
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Network error connecting to wing feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a title for the activity post.');
      return;
    }
    if (!newBody.trim()) {
      Alert.alert('Required Field', 'Please enter description details for the post.');
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      const payload: any = {
        title: newTitle.trim(),
        body: newBody.trim(),
      };
      if (newEventDate.trim()) {
        payload.eventDate = new Date(newEventDate.trim()).toISOString();
      }

      const res = await fetch(`${getApiBaseUrl()}/wings/${slug}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        Alert.alert('Post Failed', errJson.message || 'Could not create post. Backend permission check failed.');
        return;
      }

      setNewTitle('');
      setNewBody('');
      setNewEventDate('');
      setShowComposer(false);
      fetchFeed();
      Alert.alert('Activity Published', 'Post has been published and notifications sent to chapter members.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not communicate with server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = (post: WingPost) => {
    Alert.alert(
      'Delete Post',
      `Are you sure you want to delete "${post.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = getAuthToken();
              const res = await fetch(`${getApiBaseUrl()}/wings/posts/${post.id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                Alert.alert('Delete Failed', errJson.message || 'Could not delete post');
                return;
              }

              fetchFeed();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete post');
            }
          },
        },
      ],
    );
  };

  const openEditModal = (post: WingPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditEventDate(post.eventDate ? post.eventDate.split('T')[0] : '');
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      setUpdating(true);
      const token = getAuthToken();
      const payload: any = {
        title: editTitle.trim(),
        body: editBody.trim(),
      };
      if (editEventDate.trim()) {
        payload.eventDate = new Date(editEventDate.trim()).toISOString();
      }

      const res = await fetch(`${getApiBaseUrl()}/wings/posts/${editingPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        Alert.alert('Update Failed', errJson.message || 'Could not update post');
        return;
      }

      setEditingPost(null);
      fetchFeed();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update post');
    } finally {
      setUpdating(false);
    }
  };

  if (isGuest) {
    return (
      <AccessDeniedView
        featureName={slug === 'ladies-wing' ? 'Ladies Wing Space' : 'Science Club Space'}
        title="Linked Member Access Required"
        message="Wing spaces and feeds are exclusively accessible to verified, linked members of the IEI Kuwait Chapter. Please sign in to your member account to view activities."
      />
    );
  }

  const wingTitle = wing?.name || (slug === 'ladies-wing' ? 'Ladies Wing' : 'Science Club');
  const isConvenor = Boolean(wing?.isCurrentUserConvenor);
  const isAdmin = verifiedMember?.memberCode === 'IEI9000' || verifiedMember?.role === 'ADMIN';
  const canPost = isConvenor || isAdmin;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: Math.max(insets.bottom, 24) + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C67139" />
          }>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>{wingTitle}</Text>
              <Text style={styles.headerSubtitle}>
                {slug === 'ladies-wing'
                  ? 'Executive & community initiatives'
                  : 'For the children of the IEI family'}
              </Text>
            </View>
          </View>

          {/* Wing Convenor Banner */}
          {wing?.convenors && wing.convenors.length > 0 ? (
            <View style={styles.convenorBanner}>
              <Text style={styles.convenorLabel}>CONVENOR</Text>
              <Text style={styles.convenorName}>
                {wing.convenors.map((c) => c.fullName).join(', ')}
              </Text>
            </View>
          ) : null}

          {/* Convenor Action: Create Post Button (Shown only if convenor or ADMIN) */}
          {canPost ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.postActionButton}
                activeOpacity={0.85}
                onPress={() => setShowComposer(!showComposer)}>
                <Text style={styles.postActionButtonText}>
                  {showComposer ? '✕ Close Composer' : '+ Post Activity'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Inline Composer */}
          {showComposer && canPost ? (
            <View style={styles.composerCard}>
              <Text style={styles.composerTitle}>New Activity Post</Text>
              <Text style={styles.composerHint}>
                Publish an activity to the {wingTitle} feed. All chapter members will receive a notification.
              </Text>

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Hands-on Science Workshop"
                placeholderTextColor="#A89A8A"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Details of the activity, timing, venue..."
                placeholderTextColor="#A89A8A"
                multiline
                numberOfLines={4}
                value={newBody}
                onChangeText={setNewBody}
              />

              <Text style={styles.inputLabel}>Event Date (Optional, YYYY-MM-DD)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 2026-11-20"
                placeholderTextColor="#A89A8A"
                value={newEventDate}
                onChangeText={setNewEventDate}
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                activeOpacity={0.85}
                disabled={submitting}
                onPress={handleCreatePost}>
                {submitting ? (
                  <ActivityIndicator color="#FAF7F2" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Publish to Feed</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Feed Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#C67139" size="large" />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No activities yet</Text>
              <Text style={styles.emptySubtitle}>
                {canPost
                  ? 'Tap "+ Post Activity" above to publish the first post for this wing.'
                  : 'Check back soon for upcoming events and announcements.'}
              </Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {posts.map((post) => {
                const isAuthor = verifiedMember && post.authorMemberId === verifiedMember.id;
                const canManage = isAuthor || isAdmin;

                const formattedDate = new Date(post.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const eventDateFormatted = post.eventDate
                  ? new Date(post.eventDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                return (
                  <View key={post.id} style={styles.postCard}>
                    {/* Post Header */}
                    <View style={styles.postHeaderRow}>
                      <View style={styles.authorMeta}>
                        <Text style={styles.authorName}>
                          {post.author?.fullName || 'Wing Convenor'}
                        </Text>
                        <Text style={styles.postDate}>{formattedDate}</Text>
                      </View>

                      {/* Event Tag */}
                      {eventDateFormatted ? (
                        <View style={styles.eventBadge}>
                          <Text style={styles.eventBadgeText}>Family · {eventDateFormatted}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Post Content */}
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postBody}>{post.body}</Text>

                    {/* Convenor Manage Buttons (Edit / Soft-delete) */}
                    {canManage ? (
                      <View style={styles.manageRow}>
                        <TouchableOpacity
                          style={styles.manageButton}
                          activeOpacity={0.7}
                          onPress={() => openEditModal(post)}>
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.manageButton}
                          activeOpacity={0.7}
                          onPress={() => handleDeletePost(post)}>
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Edit Post Modal */}
      <Modal visible={Boolean(editingPost)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Activity Post</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.inputField}
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              multiline
              numberOfLines={4}
              value={editBody}
              onChangeText={setEditBody}
            />

            <Text style={styles.inputLabel}>Event Date (Optional, YYYY-MM-DD)</Text>
            <TextInput
              style={styles.inputField}
              value={editEventDate}
              onChangeText={setEditEventDate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={() => setEditingPost(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, updating && { opacity: 0.7 }]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={handleUpdatePost}>
                {updating ? (
                  <ActivityIndicator color="#FAF7F2" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: '#FAF7F2',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EDE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#8D7B68',
    marginTop: 2,
  },
  convenorBanner: {
    backgroundColor: '#F5EFE6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBDDC5',
  },
  convenorLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: '#C67139',
    letterSpacing: 0.8,
    marginRight: 8,
  },
  convenorName: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: '#201E1D',
  },
  actionRow: {
    marginBottom: 14,
  },
  postActionButton: {
    backgroundColor: '#C67139',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  postActionButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#FAF7F2',
    letterSpacing: 0.3,
  },
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5DECE',
  },
  composerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#201E1D',
  },
  composerHint: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#8D7B68',
    marginTop: 2,
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#6E503E',
    marginTop: 8,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DECE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#201E1D',
    fontFamily: fonts.sansRegular,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#272E1B',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#FAF7F2',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#8D7B68',
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#FDEEE9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#C67139',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
  },
  emptySubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#8D7B68',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  postsList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5DECE',
  },
  postHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#201E1D',
  },
  postDate: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#8D7B68',
    marginTop: 1,
  },
  eventBadge: {
    backgroundColor: '#E1EECC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  eventBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#272E1B',
  },
  postTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#201E1D',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  postBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#403C36',
    lineHeight: 20,
  },
  manageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE2',
  },
  manageButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  editButtonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#C67139',
  },
  deleteButtonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#B03525',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E5DECE',
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#201E1D',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#F3EDE2',
  },
  cancelButtonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: '#6E503E',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#C67139',
  },
  saveButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#FAF7F2',
  },
});
