import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Modal({ isOpen, onClose, title, children }) {
  const { t } = useLanguage();
  // Focus initial + piège Tab + fermeture Échap + restauration du focus.
  const dialogRef = useFocusTrap(isOpen, onClose);

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-0">
      {/* Overlay Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={dialogRef}
        className="relative z-50 w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
            {title}
          </h3>
          <Button variant="icon" onClick={onClose} aria-label={t('fermer')}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
