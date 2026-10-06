import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface JobIconProps {
  size?: number;
  color?: string;
}

export function JobIcon({ size = 16, color = '#201E1D' }: JobIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
      <Path
        d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
