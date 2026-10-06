import React, { useState, useEffect } from 'react';
import {
  Send,
  Bell,
  MessageCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Tabs, TabItem } from '../components/Tabs';
import { FormField } from '../components/FormField';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

export const CommunicationPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('notifications');
  const [composeOpen, setComposeOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [isSending, setIsSending] = useState(false);

  // WhatsApp links state
  const [whatsappLinks, setWhatsappLinks] = useState([
    { id: '1', name: 'IEI Kuwait Official Broadcast', url: 'https://chat.whatsapp.com/sample-broadcast', active: true },
    { id: '2', name: 'Civil Engineering Discipline Group', url: 'https://chat.whatsapp.com/sample-civil', active: true },
    { id: '3', name: 'Electrical Engineering Group', url: 'https://chat.whatsapp.com/sample-electrical', active: true },
    { id: '4', name: 'Ladies Wing Community', url: 'https://chat.whatsapp.com/sample-ladies', active: true },
  ]);

  const tabs: TabItem[] = [
    { id: 'notifications', label: 'Push Notifications & Notices', icon: <Bell size={14} /> },
    { id: 'whatsapp', label: 'WhatsApp & External Groups', icon: <MessageCircle size={14} /> },
  ];

  const fetchHistory = async () => {
    try {
      const res = await apiClient<any[]>('/me/notifications');
      setHistory(Array.isArray(res) ? res : []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast(`Notification "${title}" sent to audience: ${audience}.`);
      setComposeOpen(false);
      setTitle('');
      setMessage('');
      fetchHistory();
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Official Chapter Communication
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Broadcast push notices and manage chapter external group directory (no in-app chat).
          </p>
        </div>

        {activeTab === 'notifications' && (
          <button
            onClick={() => setComposeOpen(!composeOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Send size={14} />
            <span>Compose Notification</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Compose Form (if open) */}
          {composeOpen && (
            <div className="bg-[#FFFDF9] border border-[#273318] rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE4D0]">
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Compose Chapter Broadcast Notification
                </h2>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="text-xs text-[#686055] hover:text-[#201E1D]"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Notification Title" required>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CPD Technical Lecture Announcement"
                      className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
                      autoFocus
                    />
                  </FormField>

                  <FormField label="Target Audience Group" required>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
                    >
                      <option value="ALL">All Chapter Members</option>
                      <option value="FELLOWS">FIE (Fellows Only)</option>
                      <option value="CIVIL">Civil Discipline Members</option>
                      <option value="ELECTRICAL">Electrical Discipline Members</option>
                      <option value="MECHANICAL">Mechanical Discipline Members</option>
                      <option value="RSVP_EVENT_1">RSVPs of Engineers' Day Celebration</option>
                      <option value="BLOOD_DONORS">Consenting Blood Donors Only</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Broadcast Message Body" required>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Enter notification copy to display on mobile banner..."
                    className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D] resize-none"
                  />
                </FormField>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE4D0]">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed border border-[#E2D5C0]"
                    >
                      <Clock size={13} />
                      <span>Schedule Delivery</span>
                    </button>
                    <BackendMissingBadge />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast(`Preview: [${title}] ${message}`)}
                      className="px-3.5 py-1.5 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-4 py-1.5 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSending ? 'Sending...' : 'Send Broadcast'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* History List */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#201E1D] pb-3 border-b border-[#EFE4D0]">
              Broadcast Notifications History
            </h2>

            {history.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-8 text-center">
                No notification broadcast records in this view.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0]">
                {history.map((n) => (
                  <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-[#201E1D]">{n.title}</div>
                      <p className="text-[#5B5349] mt-0.5">{n.body}</p>
                      <div className="text-[10px] text-[#8A7F73] font-mono mt-1">
                        Type: {n.type} · Dispatched at {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-[#E8F5E9] text-[#2E7D32]">
                      Delivered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Groups Tab */}
      {activeTab === 'whatsapp' && (
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE4D0]">
            <div>
              <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                Chapter WhatsApp Link Directory
              </h2>
              <p className="text-xs text-[#686055]">
                Manage external chat group invitations visible on the member mobile app.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#EFE4D0]">
            {whatsappLinks.map((link) => (
              <div key={link.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-[#201E1D]">{link.name}</div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#C67139] hover:underline flex items-center gap-1 font-mono mt-0.5"
                  >
                    <span>{link.url}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      link.active
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#FFEBEE] text-[#C62828]'
                    }`}
                  >
                    {link.active ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => {
                      setWhatsappLinks((prev) =>
                        prev.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l)),
                      );
                      showToast(`Updated status for "${link.name}"`);
                    }}
                    className="px-2.5 py-1 text-xs border border-[#E2D5C0] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
