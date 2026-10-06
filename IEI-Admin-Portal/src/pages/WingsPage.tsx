import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Calendar,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Tabs, TabItem } from '../components/Tabs';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

interface WingItem {
  id: string;
  slug: string;
  name: string;
  convenors: Array<{
    id: string;
    memberId: string;
    memberCode: string;
    fullName: string;
    active: boolean;
  }>;
}

interface WingPostItem {
  id: string;
  title: string;
  body: string;
  eventDate?: string | null;
  createdAt: string;
  author: {
    fullName: string;
    memberCode: string;
  };
}

export const WingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [wings, setWings] = useState<WingItem[]>([]);
  const [activeWingSlug, setActiveWingSlug] = useState<string>('ladies-wing');
  const [posts, setPosts] = useState<WingPostItem[]>([]);
  const [isLoadingWings, setIsLoadingWings] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New / Edit Post Modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postDate, setPostDate] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Assign Convenor Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [convenorMemberCode, setConvenorMemberCode] = useState('');
  const [isSubmittingConvenor, setIsSubmittingConvenor] = useState(false);

  // Delete Post Confirmation
  const [deletePostDialog, setDeletePostDialog] = useState<{
    isOpen: boolean;
    postId: string | null;
  }>({
    isOpen: false,
    postId: null,
  });

  const fetchWings = async () => {
    setIsLoadingWings(true);
    setError(null);
    try {
      const res = await apiClient<WingItem[]>('/wings');
      setWings(res);
      if (res.length > 0 && !activeWingSlug) {
        setActiveWingSlug(res[0].slug);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wing spaces');
    } finally {
      setIsLoadingWings(false);
    }
  };

  const fetchPosts = async (slug: string) => {
    setIsLoadingPosts(true);
    try {
      const res = await apiClient<WingPostItem[]>(`/wings/${slug}/posts`);
      setPosts(res);
    } catch {
      // Fallback
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchWings();
  }, []);

  useEffect(() => {
    if (activeWingSlug) {
      fetchPosts(activeWingSlug);
    }
  }, [activeWingSlug]);

  const activeWing = wings.find((w) => w.slug === activeWingSlug);

  const tabs: TabItem[] = wings.map((w) => ({
    id: w.slug,
    label: w.name,
    icon: <Sparkles size={14} />,
  }));

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) {
      showToast('Title and body are required', 'error');
      return;
    }

    setIsSubmittingPost(true);
    try {
      if (editingPostId) {
        await apiClient(`/wings/posts/${editingPostId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: postTitle.trim(),
            body: postBody.trim(),
            eventDate: postDate ? new Date(postDate).toISOString() : null,
          }),
        });
        showToast('Wing post updated successfully.');
      } else {
        await apiClient(`/wings/${activeWingSlug}/posts`, {
          method: 'POST',
          body: JSON.stringify({
            title: postTitle.trim(),
            body: postBody.trim(),
            eventDate: postDate ? new Date(postDate).toISOString() : null,
          }),
        });
        showToast('Wing post published successfully.');
      }

      setPostModalOpen(false);
      setEditingPostId(null);
      setPostTitle('');
      setPostBody('');
      setPostDate('');
      fetchPosts(activeWingSlug);
    } catch (err: any) {
      showToast(err.message || 'Failed to save post', 'error');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePostConfirm = async () => {
    if (!deletePostDialog.postId) return;
    try {
      await apiClient(`/wings/posts/${deletePostDialog.postId}`, {
        method: 'DELETE',
      });
      showToast('Wing post soft deleted from feed.');
      setDeletePostDialog({ isOpen: false, postId: null });
      fetchPosts(activeWingSlug);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post', 'error');
    }
  };

  const handleAssignConvenor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convenorMemberCode.trim()) return;

    setIsSubmittingConvenor(true);
    try {
      await apiClient(`/wings/${activeWingSlug}/convenors`, {
        method: 'POST',
        body: JSON.stringify({
          memberCode: convenorMemberCode.trim().toUpperCase(),
        }),
      });
      showToast(`Assigned ${convenorMemberCode.toUpperCase()} as active convenor.`);
      setAssignModalOpen(false);
      setConvenorMemberCode('');
      fetchWings();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign convenor', 'error');
    } finally {
      setIsSubmittingConvenor(false);
    }
  };

  const handleRemoveConvenor = async (memberId: string) => {
    try {
      await apiClient(`/wings/${activeWingSlug}/convenors/${memberId}`, {
        method: 'DELETE',
      });
      showToast('Convenor role removed.');
      fetchWings();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove convenor', 'error');
    }
  };

  if (isLoadingWings) {
    return <SkeletonLoader type="cards" count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchWings} />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Specialized Wing Spaces
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Ladies Wing and Science Club executive spaces and activity feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            <UserCheck size={14} />
            <span>Assign Convenor</span>
          </button>
          <button
            onClick={() => {
              setEditingPostId(null);
              setPostTitle('');
              setPostBody('');
              setPostDate('');
              setPostModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Wings Tabs */}
      <Tabs tabs={tabs} activeTab={activeWingSlug} onChange={setActiveWingSlug} />

      {/* Active Wing Info Card */}
      {activeWing && (
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#201E1D]">
              {activeWing.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-[#8A7F73]">Active Convenors:</span>
              {activeWing.convenors && activeWing.convenors.length > 0 ? (
                activeWing.convenors.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EAD8] text-[#273318] border border-[#E2D5C0]"
                  >
                    <span>{c.fullName} ({c.memberCode})</span>
                    <button
                      onClick={() => handleRemoveConvenor(c.memberId)}
                      className="text-[#C62828] hover:opacity-75 cursor-pointer ml-1"
                      title="Remove convenor assignment"
                    >
                      <UserX size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#C67139]">
                  No convenor assigned.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feed Posts */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#686055]">
          Feed Activities & Announcements ({posts.length})
        </h3>

        {isLoadingPosts ? (
          <SkeletonLoader type="cards" count={3} />
        ) : posts.length === 0 ? (
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-8 text-center text-xs text-[#8A7F73]">
            No posts published in this wing space yet. Click "New Post" to publish an activity.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#201E1D]">
                      {post.title}
                    </h4>
                    {post.eventDate && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-medium shrink-0">
                        <Calendar size={11} />
                        <span>{new Date(post.eventDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5B5349] leading-relaxed mt-2">
                    {post.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFE4D0] flex items-center justify-between text-xs text-[#8A7F73]">
                  <span>
                    By {post.author?.fullName} · {new Date(post.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setPostTitle(post.title);
                        setPostBody(post.body);
                        setPostDate(post.eventDate ? post.eventDate.split('T')[0] : '');
                        setPostModalOpen(true);
                      }}
                      className="p-1 text-[#273318] hover:bg-[#F5EAD8] rounded transition-colors cursor-pointer"
                      title="Edit post"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeletePostDialog({ isOpen: true, postId: post.id })
                      }
                      className="p-1 text-[#C62828] hover:bg-[#FFEBEE] rounded transition-colors cursor-pointer"
                      title="Delete post (soft delete)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Post Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#201E1D]">
              {editingPostId ? 'Edit Wing Feed Post' : `Publish Post to ${activeWing?.name}`}
            </h3>

            <form onSubmit={handleSavePost} className="space-y-4 pt-2">
              <FormField label="Post Title" required>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. 'Let's Act' Acting Workshop Announcement"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
                  autoFocus
                />
              </FormField>

              <FormField label="Activity Body / Description" required>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={4}
                  placeholder="Provide activity details, agenda, and guidelines..."
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D] resize-none"
                />
              </FormField>

              <FormField label="Optional Event Date">
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE4D0]">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  disabled={isSubmittingPost}
                  className="px-4 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="px-4 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPost ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Convenor Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#201E1D]">
              Assign Wing Convenor
            </h3>
            <p className="text-xs text-[#686055]">
              Select a verified member to act as convenor for <strong>{activeWing?.name}</strong>.
            </p>

            <form onSubmit={handleAssignConvenor} className="space-y-4 pt-2">
              <FormField label="Member Code (ID)" required>
                <input
                  type="text"
                  value={convenorMemberCode}
                  onChange={(e) => setConvenorMemberCode(e.target.value)}
                  placeholder="e.g. IEI0022, IEI0010"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D] uppercase font-mono"
                  autoFocus
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE4D0]">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  disabled={isSubmittingConvenor}
                  className="px-4 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConvenor}
                  className="px-4 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingConvenor ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Post Dialog */}
      <ConfirmDialog
        isOpen={deletePostDialog.isOpen}
        title="Delete Wing Feed Post"
        message="Are you sure you want to soft delete this post? It will be removed from the member feeds."
        confirmLabel="Soft Delete"
        cancelLabel="Keep Post"
        variant="danger"
        onConfirm={handleDeletePostConfirm}
        onCancel={() => setDeletePostDialog({ isOpen: false, postId: null })}
      />
    </div>
  );
};
