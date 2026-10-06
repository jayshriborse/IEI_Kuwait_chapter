
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'cream' | 'peach' | 'green' | 'parchment';
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'cream',
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    dark: 'bg-[#402310] text-[#F9F4ED] border-[#5D3011]',
    cream: 'bg-[#F9F4ED] text-[#201E1D] border-[#E8DFD5]',
    peach: 'bg-[#FFE1D0] text-[#201E1D] border-[#F2CCB6]',
    green: 'bg-[#E1EECC] text-[#272E1B] border-[#D0E2B4]',
    parchment: 'bg-[#EBDDC5] text-[#201E1D] border-[#DECAB1]',
  }[variant];

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200'
    : '';

  return (
    <div
      className={`rounded-3xl border p-6 md:p-7 shadow-sm ${variantStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
