import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, LogIn, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import sealLogo from '../assets/iei-seal.png';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [memberCode, setMemberCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Check demo mode warning banner
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true';

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (user && (!user.positions || user.positions.length === 0) && user.memberCode !== 'IEI9000') {
        navigate('/admin/forbidden', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = memberCode.trim().toUpperCase();
    const cleanMobile = mobile.trim();

    if (!cleanCode || !cleanMobile) {
      setError('Please provide both Member ID and registered mobile number.');
      return;
    }

    if (attemptCount >= 5) {
      setError('Too many failed sign-in attempts. Account temporarily locked for security. Please wait before retrying.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ memberCode: cleanCode, mobile: cleanMobile });
      setAttemptCount(0);

      // Verify if account has admin or officer role
      if (
        (!loggedUser.positions || loggedUser.positions.length === 0) &&
        loggedUser.memberCode !== 'IEI9000' &&
        loggedUser.memberCode !== 'ADMIN'
      ) {
        navigate('/admin/forbidden', { replace: true });
        return;
      }

      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setAttemptCount((prev) => prev + 1);
      if (err.statusCode === 429) {
        setError('Rate limit exceeded. Please wait 15 minutes before retrying.');
      } else if (err.statusCode === 404 || err.statusCode === 401) {
        setError('Invalid credentials. Member ID or mobile number does not match registered chapter records.');
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212A14] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Demo Mode Warning Banner */}
      {isDevMode && (
        <div className="w-full max-w-md mb-4 p-3 bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl flex items-center gap-2.5 text-xs text-[#E65100] shadow-sm">
          <AlertTriangle size={16} className="shrink-0 text-[#E65100]" />
          <div>
            <strong>Demo Accounts Active:</strong> IEI9001 (Treasurer), IEI9002 (Chairman), IEI9003 (Secretary), IEI9004 (Volunteer). Disabled in production.
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#D4C8B8] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#273318] p-7 text-center relative">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FFFDF9] p-1.5 shadow-md flex items-center justify-center">
            <img
              src={sealLogo}
              alt="IEI Kuwait Seal"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="font-serif font-bold text-lg text-[#F9F4ED] tracking-wide">
            IEI Kuwait Chapter
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A9B890] mt-1 font-semibold">
            Administration Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-8 bg-[#F5EAD8]/40">
          <div className="mb-6 text-center">
            <h2 className="text-sm font-serif font-bold text-[#201E1D]">
              Sign In with Authorized Member Account
            </h2>
            <p className="text-xs text-[#686055] mt-1">
              Access is restricted to Chapter Officers and Executive Committee members.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#FFF5F5] border border-[#F5C2C7] rounded-xl flex items-start gap-2.5 text-xs text-[#842029]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="memberCode"
                className="block text-xs font-semibold text-[#201E1D] uppercase tracking-wider mb-1.5"
              >
                Member ID
              </label>
              <input
                id="memberCode"
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="e.g. IEI9001, IEI9002"
                className="w-full px-4 py-2.5 bg-[#FFFDF9] border border-[#D4C8B8] rounded-xl text-sm text-[#201E1D] placeholder-[#A3998D] focus:outline-none focus:ring-2 focus:ring-[#C67139] transition-all uppercase"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-xs font-semibold text-[#201E1D] uppercase tracking-wider mb-1.5"
              >
                Registered Mobile Number
              </label>
              <input
                id="mobile"
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 00000001, 00000002"
                className="w-full px-4 py-2.5 bg-[#FFFDF9] border border-[#D4C8B8] rounded-xl text-sm text-[#201E1D] placeholder-[#A3998D] focus:outline-none focus:ring-2 focus:ring-[#C67139] transition-all"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#C67139] hover:bg-[#B56430] text-[#F9F4ED] font-serif font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Verification Notice */}
          <div className="mt-6 pt-4 border-t border-[#E2D5C0] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#686055]">
              <ShieldCheck size={14} className="text-[#273318]" />
              <span>Backend Enforced Roles & Session Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
