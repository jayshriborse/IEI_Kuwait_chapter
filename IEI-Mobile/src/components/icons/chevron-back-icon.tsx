import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronBackIconProps {
  size?: number;
  color?: string;
}

export function ChevronBackIcon({ size = 18, color = '#C67139' }: ChevronBackIconProps) {
  return (
    <Svg width={size * 0.6} height={size} viewBox="0 0 10 16" fill="none">
      <Path
        d="M8.5 1.5L2 8L8.5 14.5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
