import React from 'react';
import type { OfficePosition } from '../types/auth.types';
import { formatPositionTitle } from '../permissions/roles';

interface RoleBadgeProps {
  position: OfficePosition | string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  position,
  size = 'md',
}) => {
  const isTreasurer = position === 'TREASURER';
  const isChairman = position === 'CHAIRMAN';
  const isSecretary = position === 'GENERAL_SECRETARY';

  let badgeStyle =
    'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'; // default green

  if (isTreasurer) {
    badgeStyle = 'bg-[#FFF9E6] text-[#B8860B] border-[#FFE082] font-bold'; // Gold
  } else if (isChairman) {
    badgeStyle = 'bg-[#FBE9E7] text-[#D84315] border-[#FFCCBC] font-bold'; // Deep Terracotta
  } else if (isSecretary) {
    badgeStyle = 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB] font-semibold'; // Royal Blue
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${padding} ${badgeStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formatPositionTitle(position as OfficePosition)}
    </span>
  );
};
