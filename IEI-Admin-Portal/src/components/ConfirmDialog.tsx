import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requiresReason?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  requiresReason = false,
  reasonPlaceholder = 'Please specify the reason...',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setError('A valid reason is required to proceed with this action.');
      return;
    }
    setError('');
    onConfirm(requiresReason ? reason.trim() : undefined);
  };

  let confirmButtonColor = 'bg-[#C62828] hover:bg-[#b71c1c] text-white';
  if (variant === 'warning') {
    confirmButtonColor = 'bg-[#C67139] hover:bg-[#b05f2c] text-white';
  } else if (variant === 'primary') {
    confirmButtonColor = 'bg-[#273318] hover:bg-[#344421] text-white';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                variant === 'danger'
                  ? 'bg-[#FFEBEE] text-[#C62828]'
                  : variant === 'warning'
                  ? 'bg-[#FFF3E0] text-[#E65100]'
                  : 'bg-[#F5EAD8] text-[#273318]'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-base font-serif font-bold text-[#201E1D]">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-[#8A7F73] hover:text-[#201E1D] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-[#5B5349] leading-relaxed">
          {message}
        </p>

        {/* Required Reason Input */}
        {requiresReason && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A]">
              Required Justification / Reason <span className="text-[#C62828]">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              rows={3}
              disabled={isLoading}
              className="w-full bg-[#FFFDF9] border border-[#D5C6AF] rounded-xl p-3 text-sm text-[#201E1D] focus:outline-none focus:ring-2 focus:ring-[#273318]/40 resize-none placeholder:text-[#A89F91]"
            />
            {error && (
              <p className="text-xs text-[#C62828] font-medium">{error}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE4D0]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-[#E2D5C0] text-[#5B5349] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonColor}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
