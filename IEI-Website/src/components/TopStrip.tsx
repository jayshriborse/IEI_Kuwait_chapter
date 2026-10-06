import { Mail, Phone } from 'lucide-react';
import { publicContent } from '../api/content';

export function TopStrip() {
  const { mailText, callText, email, phone } = publicContent.topStrip;

  return (
    <div className="w-full bg-[#341B0B] text-[#D8CEC3] border-b border-[#4A2610] text-xs py-2 px-4 sm:px-8">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 hover:text-[#FFC6A5] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC6A5] rounded"
          >
            <Mail size={14} className="text-[#FFC6A5] shrink-0" />
            <span>{mailText}</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-2 hover:text-[#FFC6A5] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC6A5] rounded"
          >
            <Phone size={14} className="text-[#FFC6A5] shrink-0" />
            <span>{callText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TopStrip;
