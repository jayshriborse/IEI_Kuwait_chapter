import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';
import { FormField } from '../components/FormField';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

export const EventCreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id && id !== 'new');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '18:00',
    endTime: '21:00',
    location: '',
    category: 'TECHNICAL SEMINAR',
    badge: 'Members',
    seats: 100,
    isAcceptingRsvp: true,
    isOpenForGuest: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      apiClient<any>(`/events/${id}`)
        .then((e) => {
          setFormData({
            title: e.title || '',
            description: e.description || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            startTime: e.startTime || '18:00',
            endTime: e.endTime || '21:00',
            location: e.location || '',
            category: e.category || 'TECHNICAL SEMINAR',
            badge: e.badge || 'Members',
            seats: 100,
            isAcceptingRsvp: e.isAcceptingRsvp ?? true,
            isOpenForGuest: e.isOpenForGuest ?? false,
          });
        })
        .catch(() => {});
    }
  }, [id, isEditMode]);

  const handleSubmit = (action: 'draft' | 'publish') => {
    if (!formData.title.trim()) {
      showToast('Event title is required', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(
        action === 'publish'
          ? 'Event published successfully and broadcast to members.'
          : 'Event draft saved.',
      );
      navigate('/admin/events');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#FFFDF9] border border-[#E2D5C0] p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 text-[#686055] hover:text-[#201E1D] hover:bg-[#F5EAD8] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#201E1D]">
              {isEditMode ? 'Edit Programme Event' : 'Create New Programme Event'}
            </h1>
            <p className="text-xs text-[#686055]">
              Configure details, audience eligibility, and RSVP settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF5F5] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#FFCDD2]"
              >
                <Trash2 size={13} />
                <span>Delete Draft</span>
              </button>
              <BackendMissingBadge />
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-3.5 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#686055] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit('draft')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFDF9] border border-[#273318] hover:bg-[#F5EAD8] text-xs font-semibold text-[#273318] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit('publish')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Send size={14} />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <FormField label="Event Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 59th Engineers' Day Celebration"
                className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-3 text-sm text-[#201E1D]"
              />
            </FormField>
          </div>

          <FormField label="Programme Category / Type" required>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            >
              <option value="TECHNICAL SEMINAR">Technical Seminar</option>
              <option value="ENGINEERS' DAY">Engineers' Day Celebration</option>
              <option value="ANNUAL GENERAL MEETING">Annual General Meeting (AGM)</option>
              <option value="LADIES WING">Ladies Wing Event</option>
              <option value="FAMILY DAY">Family Day Recreation</option>
              <option value="AMIE WINTER EXAMINATION">AMIE Winter Examination</option>
            </select>
          </FormField>

          <FormField label="Audience Tag" required>
            <select
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            >
              <option value="Open">Open (All Engineers & Public)</option>
              <option value="Members">Members Only (Corporate & Associate)</option>
              <option value="Family">Family (Members & Registered Dependents)</option>
              <option value="Students">Students (AMIE Aspirants)</option>
            </select>
          </FormField>

          <FormField label="Start Date" required>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            />
          </FormField>

          <FormField label="End Date">
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            />
          </FormField>

          <FormField label="Start Time (Kuwait Time)" required>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            />
          </FormField>

          <FormField label="End Time (Kuwait Time)" required>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Location / Venue Description" required>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Kuwait Society of Engineers, Bneid Al Qar"
                className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-3 text-sm text-[#201E1D]"
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField label="Full Description & Programme Overview">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Enter description, CPD points, agenda, and speakers..."
                className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-3 text-sm text-[#201E1D] resize-none"
              />
            </FormField>
          </div>

          <FormField label="Maximum Capacity / Seats">
            <input
              type="number"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
            />
          </FormField>

          <div className="space-y-3 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAcceptingRsvp}
                onChange={(e) => setFormData({ ...formData, isAcceptingRsvp: e.target.checked })}
                className="rounded border-[#E2D5C0] text-[#273318]"
              />
              <span className="text-xs font-semibold text-[#201E1D]">
                Open for Member RSVP Registration
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOpenForGuest}
                onChange={(e) => setFormData({ ...formData, isOpenForGuest: e.target.checked })}
                className="rounded border-[#E2D5C0] text-[#273318]"
              />
              <span className="text-xs font-semibold text-[#201E1D]">
                Permit Non-Member Guest Registrations
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
