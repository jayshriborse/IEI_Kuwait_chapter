import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
  className = '',
}) => {
  if (!isOpen) return null;

  const positionClasses =
    position === 'left' ? 'left-0 animate-in slide-in-from-left' : 'right-0 animate-in slide-in-from-right';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div
        className={`fixed inset-y-0 ${positionClasses} max-w-xs w-full bg-[#212A14] text-[#F9F4ED] shadow-2xl flex flex-col duration-200 ${className}`}
      >
        <div className="p-4 border-b border-[#384723] flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#F9F4ED]">
            {title || 'Menu'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#A9B890] hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};
