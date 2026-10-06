import React from 'react';
import { X, Download, FileText } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string | null;
  fileName?: string;
  mimeType?: string;
  onDownload?: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileName = 'document',
  mimeType = 'image/jpeg',
  onDownload,
}) => {
  if (!isOpen || !fileUrl) return null;

  const isPdf =
    mimeType.includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf') ||
    fileUrl.toLowerCase().includes('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E2D5C0] bg-[#F5EAD8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#273318] text-[#F9F4ED] flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm text-[#201E1D] truncate">
                {title}
              </h3>
              <p className="text-[11px] text-[#686055] font-mono truncate">
                {fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                title="Download verified document"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#686055] hover:text-[#201E1D] hover:bg-[#EFE4D0] rounded-lg transition-colors"
              title="Close viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* File Body Preview */}
        <div className="flex-1 bg-[#201E1D]/5 p-4 flex items-center justify-center overflow-auto">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title={title}
              className="w-full h-full rounded-xl border border-[#E2D5C0] shadow-inner bg-white"
            />
          ) : (
            <img
              src={fileUrl}
              alt={title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-md border border-[#E2D5C0]"
            />
          )}
        </div>
      </div>
    </div>
  );
};
