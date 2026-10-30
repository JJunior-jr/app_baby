import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon,
  children,
  footer,
  maxWidthClassName = 'max-w-[430px] landscape:max-w-lg',
}) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Container */}
      <div
        className={`relative z-10 w-full ${maxWidthClassName} h-auto max-h-[90vh] flex flex-col justify-between overflow-y-auto shadow-2xl border transition-colors animate-in zoom-in-95 duration-200`}
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--app-card-radius)',
        }}
      >
        {/* Navigation / Padrão Header */}
        <header className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition rounded-xl hover:bg-white/10 active:scale-95 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="text-center px-2">
            <h2 id="modal-title" className="text-base font-bold text-gray-100 flex items-center justify-center gap-1.5">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#878ca5] mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>

          <div className="w-8 h-8 flex items-center justify-center text-xl shrink-0">
            {headerIcon || <div className="w-6" />}
          </div>
        </header>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {children}
        </div>

        {/* Modal Actions Footer */}
        {footer && (
          <footer
            className="p-5 pt-2 pb-5 border-t border-white/10 shrink-0 transition-colors"
            style={{
              backgroundColor: 'var(--color-dominant)',
              borderColor: 'var(--color-border)',
            }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
