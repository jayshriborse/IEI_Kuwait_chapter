
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'google' | 'apple' | 'outline' | 'ghost' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-display font-black rounded-full transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3.5 text-base gap-2.5 min-h-[48px]',
    lg: 'px-7 py-4 text-base md:text-lg gap-3 min-h-[56px]',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#C67139] text-[#F9F4ED] hover:bg-[#b5632e] shadow-md hover:shadow-lg focus-visible:ring-[#C67139]',
    terracotta:
      'bg-[#C67139] text-[#F9F4ED] hover:bg-[#b5632e] shadow-md hover:shadow-lg focus-visible:ring-[#C67139]',
    google:
      'bg-[#F9F4ED] text-[#201E1D] hover:bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-[#F9F4ED]',
    apple:
      'bg-transparent border-[1.5px] border-[#BE7F54] text-[#F9F4ED] hover:bg-[#5D3011]/30 hover:border-[#FFC6A5] hover:-translate-y-0.5 focus-visible:ring-[#BE7F54]',
    outline:
      'bg-transparent border border-[#D4C8B8] text-[#201E1D] hover:bg-[#EBDDC5]/40 focus-visible:ring-[#D4C8B8]',
    ghost:
      'bg-transparent text-[#FFC6A5] hover:text-[#ffd6be] hover:underline focus-visible:ring-[#FFC6A5]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
