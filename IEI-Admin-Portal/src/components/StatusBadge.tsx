import React from 'react';

export type BadgeVariant =
  | 'AWAITING_REVIEW'
  | 'UNDER_SCRUTINY'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRAFT'
  | 'PAID'
  | 'DUE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'UPCOMING'
  | 'COMPLETED'
  | 'UPLOADED'
  | 'MISSING'
  | 'INVALID'
  | 'EXPIRED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CONSENT_GRANTED'
  | 'UNANSWERED'
  | string;

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-[#ECEFF1] text-[#455A64] border-[#CFD8DC]'; // default neutral
  let displayText = label || status;

  switch (normalized) {
    case 'APPROVED':
    case 'PAID':
    case 'CONFIRMED':
    case 'ACTIVE':
    case 'UPLOADED':
    case 'GOOD_STANDING':
    case 'CONSENT_GRANTED':
      colorClasses = 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
      if (!label && normalized === 'APPROVED') displayText = 'Approved';
      if (!label && normalized === 'PAID') displayText = 'Paid';
      if (!label && normalized === 'CONFIRMED') displayText = 'Confirmed';
      if (!label && normalized === 'UPLOADED') displayText = 'Uploaded';
      break;

    case 'UNDER_SCRUTINY':
    case 'UNDER_REVIEW':
      colorClasses = 'bg-[#FFF8E1] text-[#B78103] border-[#FFE082]';
      if (!label) displayText = 'Under Review';
      break;

    case 'AWAITING_REVIEW':
    case 'PENDING':
    case 'AWAITING_CONFIRMATION':
      colorClasses = 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]';
      if (!label && normalized === 'AWAITING_REVIEW') displayText = 'Pending Review';
      if (!label && normalized === 'AWAITING_CONFIRMATION') displayText = 'Awaiting Confirmation';
      if (!label && normalized === 'PENDING') displayText = 'Pending';
      break;

    case 'REJECTED':
    case 'INVALID':
    case 'EXPIRED':
    case 'DUES_OVERDUE':
    case 'DUE':
    case 'REFUSED':
      colorClasses = 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
      if (!label && normalized === 'REJECTED') displayText = 'Returned / Rejected';
      if (!label && normalized === 'DUE') displayText = 'Dues Pending';
      if (!label && normalized === 'INVALID') displayText = 'Invalid Document';
      break;

    case 'DRAFT':
    case 'MISSING':
    case 'UNANSWERED':
      colorClasses = 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]';
      if (!label && normalized === 'MISSING') displayText = 'Missing';
      if (!label && normalized === 'UNANSWERED') displayText = 'Unanswered';
      if (!label && normalized === 'DRAFT') displayText = 'Draft';
      break;

    case 'UPCOMING':
      colorClasses = 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]';
      if (!label) displayText = 'Upcoming';
      break;

    case 'COMPLETED':
      colorClasses = 'bg-[#F5F5F5] text-[#757575] border-[#E0E0E0]';
      if (!label) displayText = 'Completed';
      break;

    default:
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs tracking-wide uppercase font-sans ${colorClasses} ${sizeClasses}`}
    >
      {displayText}
    </span>
  );
};
