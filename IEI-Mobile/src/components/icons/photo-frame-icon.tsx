import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface PhotoFrameIconProps {
  size?: number;
  color?: string;
}

export function PhotoFrameIcon({ size = 28, color = '#8A8075' }: PhotoFrameIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path
        d="M21 15l-5-5L5 21"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
