import { useNavigate } from 'react-router-dom';
import { ScreenImage } from './ScreenImage';
import { publicContent } from '../api/content';

export function FeatureGrid() {
  const navigate = useNavigate();
  const { cards } = publicContent.features;

  return (
    <section
      id="features"
      aria-label="Features"
      className="w-full bg-[#F5EAD8] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* 4 image-top cards in a grid: 4 on desktop (lg), 2 on tablet (md), 1 on phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const variantStyles = {
              green: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
              cream: 'bg-[#F9F4ED] text-[#201E1D] border-[#E8DFD5]',
              parchment: 'bg-[#EBDDC5] text-[#201E1D] border-[#DECAB1]',
              peach: 'bg-[#FFE1D0] text-[#201E1D] border-[#F2CCB6]',
            }[card.variant];

            return (
              <div
                key={card.id}
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
                  {/* Top Screenshot Preview / Rounded Beige Placeholder */}
                  <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-5 bg-[#EBDDC5] border border-black/5 shadow-inner">
                    <ScreenImage
                      screenKey={card.screenshotKey}
                      fallbackText={card.title}
                      alt={`${card.title} Screenshot`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-lg sm:text-xl leading-snug mb-2">
                    {card.title}
                  </h3>

                  {/* One-line Description */}
                  <p className="font-sans text-xs sm:text-sm text-[#474238] leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
