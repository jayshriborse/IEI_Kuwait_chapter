import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function VisaCardIcon({ size = 18, color = '#201E1D' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M3 10H21"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M7 15H11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BookmarkIcon({ size = 20, color = '#201E1D' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V20.5C18 20.8931 17.5544 21.1186 17.234 20.8878L12 17.1122L6.76602 20.8878C6.44558 21.1186 6 20.8931 6 20.5V4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
