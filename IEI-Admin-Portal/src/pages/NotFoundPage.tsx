import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5EAD8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-3xl p-8 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 bg-[#F5EAD8] text-[#C67139] rounded-2xl flex items-center justify-center mx-auto border border-[#E2D5C0]">
          <HelpCircle size={32} />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C67139] bg-[#F5EAD8] px-2.5 py-1 rounded-full border border-[#E2D5C0]">
            HTTP 404 · Page Not Found
          </span>
          <h1 className="mt-3 font-serif font-bold text-2xl text-[#201E1D]">
            Route Not Located
          </h1>
          <p className="mt-2 text-xs text-[#686055] leading-relaxed">
            The requested administration module or resource does not exist in the Institution of Engineers India Kuwait Chapter portal.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#273318] text-[#F9F4ED] hover:bg-[#344420] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Chapter Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
