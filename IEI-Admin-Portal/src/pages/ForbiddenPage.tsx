import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F5EAD8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-3xl p-8 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 bg-[#FFEBEE] text-[#C62828] rounded-2xl flex items-center justify-center mx-auto border border-[#FFCDD2]">
          <ShieldAlert size={32} />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C62828] bg-[#FFEBEE] px-2.5 py-1 rounded-full border border-[#FFCDD2]">
            HTTP 403 · Access Denied
          </span>
          <h1 className="mt-3 font-serif font-bold text-2xl text-[#201E1D]">
            Executive Clearance Required
          </h1>
          <p className="mt-2 text-xs text-[#686055] leading-relaxed">
            Your account <span className="font-mono font-semibold text-[#201E1D]">({user?.memberCode || 'Session'})</span> does not possess the Executive Committee office clearance required to access this portal module.
          </p>
        </div>

        <div className="bg-[#F5EAD8]/60 border border-[#E2D5C0] rounded-xl p-3.5 text-left text-xs space-y-1.5">
          <p className="font-semibold text-[#201E1D]">Authorized Chapter Roles:</p>
          <ul className="text-[11px] text-[#686055] list-disc list-inside space-y-0.5">
            <li>CHAIRMAN (Executive Approvals)</li>
            <li>GENERAL_SECRETARY (Secretariat & Scrutiny)</li>
            <li>TREASURER (Financial Audits & Receipts)</li>
            <li>EC_VOLUNTEER (Door Check-In Operations)</li>
            <li>ADMIN (Full Chapter Authority)</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#273318] text-[#F9F4ED] hover:bg-[#344420] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FFFDF9] border border-[#E2D5C0] text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
          >
            <LogOut size={14} />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
