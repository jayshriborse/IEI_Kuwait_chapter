import { useNavigate } from 'react-router-dom';
import { Calendar, IdCard, Briefcase, Users } from 'lucide-react';
import { publicContent } from '../api/content';

const iconMap = {
  calendar: Calendar,
  'id-card': IdCard,
  briefcase: Briefcase,
  users: Users,
};

export function HeroCardRow() {
  const navigate = useNavigate();
  const { heroCards } = publicContent;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 -mt-10 sm:-mt-16 relative z-20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {heroCards.map((card) => {
          const Icon = iconMap[card.iconName] || Calendar;

          const variantStyles = {
            green: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
            peach: 'bg-[#FFE1D0] text-[#201E1D] border-[#F2CCB6]',
            parchment: 'bg-[#EBDDC5] text-[#201E1D] border-[#DECAB1]',
            cream: 'bg-[#F9F4ED] text-[#201E1D] border-[#E8DFD5]',
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
              className={`rounded-3xl border p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-[#C67139] ${variantStyles}`}
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-[#402310] shrink-0">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h2 className="font-display font-black text-lg sm:text-xl leading-tight">
                  {card.title}
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#474238] leading-relaxed">
                {card.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HeroCardRow;
