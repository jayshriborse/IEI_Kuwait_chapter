import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A]">
          {label} {required && <span className="text-[#C62828]">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#8A7F73]">{hint}</span>}
      </div>
      <div>{children}</div>
      {error && <p className="text-xs text-[#C62828] font-medium">{error}</p>}
    </div>
  );
};
