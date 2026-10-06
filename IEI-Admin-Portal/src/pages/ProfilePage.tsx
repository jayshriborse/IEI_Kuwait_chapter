import React, { useState } from 'react';
import {
  User,
  Shield,
  LogOut,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { RoleBadge } from '../components/RoleBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleSignOutAll = () => {
    logout();
    showToast('Signed out of executive session.', 'info');
    navigate('/admin/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#201E1D]">Executive Officer Profile</h1>
        <p className="text-sm text-[#686055]">
          Your authenticated identity, chapter executive mandates, and security session controls.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-[#212A14] via-[#2D391B] to-[#3B4A24] p-6 flex items-end">
          <div className="translate-y-10 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#FFFDF9] border-2 border-[#E2D5C0] shadow-md flex items-center justify-center font-serif text-2xl font-bold text-[#273318]">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="mb-2">
              <h2 className="text-xl font-serif font-bold text-white drop-shadow-sm">
                {user.fullName || user.displayName}
              </h2>
              <p className="text-xs text-[#D5E0C2] font-mono">
                {user.memberCode} · {user.grade}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="pt-12 p-6 space-y-6">
          {/* Executive Roles Strip */}
          <div className="bg-[#F5EAD8]/60 border border-[#E2D5C0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#686055] block">
                Executive Committee Mandate
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.positions && user.positions.length > 0 ? (
                  user.positions.map((pos) => <RoleBadge key={pos} position={pos} />)
                ) : (
                  <span className="text-xs text-[#8A7F73]">Standard Member Standing</span>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#686055] block">Session Authority</span>
              <span className="text-xs font-semibold text-[#2E7D32] flex items-center sm:justify-end gap-1">
                <CheckCircle2 size={13} /> Active Officer Access
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[#E2D5C0] bg-[#FFFDF9] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#201E1D] flex items-center gap-2">
                <User size={15} className="text-[#273318]" />
                Institutional Identity
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">IEI Chapter Member ID</span>
                  <span className="font-mono font-bold text-[#201E1D]">{user.memberCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">IEI India Charter No</span>
                  <span className="font-mono text-[#201E1D]">{user.ieiIndiaNo || 'Recorded at Kolkata'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Membership Grade</span>
                  <span className="font-semibold text-[#201E1D]">{user.grade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Engineering Discipline</span>
                  <span className="text-[#201E1D]">{user.discipline || 'Engineering'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#686055]">Blood Group</span>
                  <span className="font-mono font-semibold text-[#C62828]">{user.bloodGroup || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E2D5C0] bg-[#FFFDF9] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#201E1D] flex items-center gap-2">
                <Shield size={15} className="text-[#273318]" />
                Security & Linked Providers
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Verified Mobile</span>
                  <span className="font-mono text-[#201E1D]">{user.mobile || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Google Sign-In</span>
                  <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Linked (OAuth 2.0)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Apple Sign-In</span>
                  <span className="text-[#8A7F73]">Not Linked</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFE4D0]">
                  <span className="text-[#686055]">Password Authentication</span>
                  <span className="text-[#686055]">Disabled by Chapter Policy</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#686055]">JWT Session Expiry</span>
                  <span className="font-mono text-[#686055]">7 Days (Rolling)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Termination Card */}
          <div className="p-4 rounded-xl border border-[#FFCDD2] bg-[#FFEBEE]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs text-[#C62828] flex items-center gap-1.5">
                <Lock size={14} />
                Sign Out Executive Session
              </h4>
              <p className="text-[11px] text-[#8A7F73] mt-0.5">
                Terminates your current access token and clears all authenticated chapter cached states.
              </p>
            </div>

            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out of All Sessions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of the IEI Kuwait Chapter Administration Portal? Any unsaved edits will be discarded."
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={handleSignOutAll}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
};
