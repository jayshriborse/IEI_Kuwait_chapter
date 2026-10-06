import { useNavigate } from 'react-router-dom';
import { ScreenImage } from './ScreenImage';
import type { FeatureCardItem } from '../api/content';

interface FeatureCardProps {
  card: FeatureCardItem;
}

export function FeatureCard({ card }: FeatureCardProps) {
  const navigate = useNavigate();

  const variantStyles = {
    peach: 'bg-[#FFE1D0] text-[#201E1D] border-[#F2CCB6]',
    green: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
    parchment: 'bg-[#EBDDC5] text-[#201E1D] border-[#DECAB1]',
    cream: 'bg-[#F9F4ED] text-[#201E1D] border-[#E8DFD5]',
  }[card.variant];

  return (
    <div
      onClick={() => navigate(card.route)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(card.route);
        }
      }}
      className={`rounded-3xl border p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-[#C67139] ${variantStyles}`}
    >
      <div>
        <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-5 bg-[#EBDDC5] border border-black/5 shadow-inner">
          <ScreenImage
            screenKey={card.screenshotKey}
            fallbackText={card.title}
            alt={`${card.title} Screenshot`}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <h3 className="font-display font-black text-lg sm:text-xl leading-snug mb-2">
          {card.title}
        </h3>

        <p className="font-sans text-xs sm:text-sm text-[#474238] leading-relaxed">
          {card.text}
        </p>
      </div>
    </div>
  );
}

export default FeatureCard;
