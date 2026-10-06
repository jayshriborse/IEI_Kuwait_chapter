import React, { useState } from 'react';

// Screenshot mapping to user-uploaded screenshots in assets/screens/
import homeScreen from '../assets/screens/media_1790928880046.png';
import signinScreen from '../assets/screens/media_1790927849945.png';
import rsvpScreen from '../assets/screens/media_1790929325467.png';
import cardScreen from '../assets/screens/media_1790931882708.png';
import renewScreen from '../assets/screens/media_1790931132895.png';
import eventsScreen from '../assets/screens/media_1790933509700.png';
import galleryScreen from '../assets/screens/media_1790932287167.png';
import jobsScreen from '../assets/screens/media_1790932840077.png';
import communityScreen from '../assets/screens/media_1790934316952.png';
import privacyScreen from '../assets/screens/media_1790992633189.png';

const SCREEN_MAP: Record<string, string> = {
  home: homeScreen,
  signin: signinScreen,
  rsvp: rsvpScreen,
  card: cardScreen,
  renew: renewScreen,
  events: eventsScreen,
  gallery: galleryScreen,
  jobs: jobsScreen,
  community: communityScreen,
  privacy: privacyScreen,
};

interface ScreenImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  screenKey?: string;
  fallbackText?: string;
  className?: string;
}

export function ScreenImage({
  screenKey,
  fallbackText,
  className = '',
  alt = 'IEI Screen Preview',
  ...props
}: ScreenImageProps) {
  const [error, setError] = useState(false);
  const src = screenKey ? SCREEN_MAP[screenKey] : undefined;

  if (!src || error) {
    return (
      <div
        className={`w-full h-full min-h-[180px] bg-[#EBDDC5] text-[#8B634A] rounded-2xl flex items-center justify-center p-4 text-center font-sans text-xs border border-[#DECAB1] ${className}`}
      >
        <span>{fallbackText || 'IEI Kuwait Screen'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`w-full object-cover object-top rounded-2xl ${className}`}
      {...props}
    />
  );
}

export default ScreenImage;
