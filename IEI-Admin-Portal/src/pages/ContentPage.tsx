import React, { useState } from 'react';
import {
  Layers,
  Newspaper,
  Bell,
  Image,
  Archive,
  FileCode,
  Flag,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Tabs, TabItem } from '../components/Tabs';
import { BackendMissingBadge } from '../components/BackendMissingBadge';

export const ContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('news');

  const tabs: TabItem[] = [
    { id: 'news', label: 'News Articles', icon: <Newspaper size={14} /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={14} /> },
    { id: 'gallery', label: 'Gallery & Photos', icon: <Image size={14} /> },
    { id: 'archives', label: 'Chapter Archives', icon: <Archive size={14} /> },
    { id: 'pages', label: 'Static Pages', icon: <FileCode size={14} /> },
    { id: 'banners', label: 'Mobile Banners', icon: <Flag size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Content Management & Publications
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Manage chapter news bulletins, announcements, photo gallery, archives, and mobile banners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#E2D5C0]"
          >
            <Plus size={14} />
            <span>Create New Content</span>
          </button>
          <BackendMissingBadge />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Actions Toolbar */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#686055]">
          Content Operations
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <Edit size={13} />
            <span>Edit</span>
          </button>
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <CheckCircle size={13} />
            <span>Publish</span>
          </button>
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <XCircle size={13} />
            <span>Unpublish</span>
          </button>
          {activeTab === 'gallery' && (
            <>
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
              >
                <span>Approve Photo</span>
              </button>
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
              >
                <span>Reject Photo</span>
              </button>
            </>
          )}
          <BackendMissingBadge />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-10 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#F5EAD8] text-[#273318] flex items-center justify-center mx-auto">
          <Layers size={26} />
        </div>
        <div>
          <h2 className="text-base font-serif font-bold text-[#201E1D]">
            No {tabs.find((t) => t.id === activeTab)?.label} Published
          </h2>
          <p className="text-xs text-[#686055] max-w-md mx-auto mt-1 leading-relaxed">
            Content entries for this category will appear once published or synchronized with chapter CMS.
          </p>
        </div>
        <div>
          <BackendMissingBadge label="Dynamic CMS schema pending backend migration" />
        </div>
      </div>
    </div>
  );
};
