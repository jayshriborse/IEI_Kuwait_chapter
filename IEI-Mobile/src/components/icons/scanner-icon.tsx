import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function ScanViewfinderIcon({ size = 22, color = '#F9F4ED' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V6C4 4.89543 4.89543 4 6 4H8"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M16 4H18C19.1046 4 20 4.89543 20 6V8"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M4 16V18C4 19.1046 4.89543 20 6 20H8"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M16 20H18C19.1046 20 20 19.1046 20 18V16"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M8 12H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
