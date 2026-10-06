import { publicContent } from '../api/content';

export function ScopeDecisions() {
  const { heading, cards } = publicContent.scope;

  return (
    <section
      aria-label="Scope and Decisions"
      className="w-full bg-[#F5EAD8] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-[#DECAB1]"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#201E1D] tracking-tight mb-12 sm:mb-16 text-center md:text-left">
          {heading}
        </h2>

        {/* 6 rounded cards in a 2x3 / 3x2 grid, alternating peach, soft green, and beige */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card) => {
            const variantStyles = {
              peach: 'bg-[#FFE1D0] text-[#201E1D] border-[#F2CCB6]',
              green: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
              parchment: 'bg-[#EBDDC5] text-[#201E1D] border-[#DECAB1]',
            }[card.variant];

            return (
              <div
                key={card.id}
                className={`rounded-3xl border p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-start ${variantStyles}`}
              >
                {/* Title */}
                <h3 className="font-display font-black text-xl sm:text-2xl leading-snug mb-3">
                  {card.title}
                </h3>

                {/* Text from PDF */}
                <p className="font-sans text-sm sm:text-base leading-relaxed text-[#474238]">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ScopeDecisions;
