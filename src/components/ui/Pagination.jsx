import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function Pagination({ currentPage, totalPages, onChange }) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (currentPage >= totalPages - 3)
      return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages];
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('ariaPrevPage')}
        className="w-11 h-11 flex items-center justify-center rounded-xl border border-ink/10 bg-cream-deep text-ink-soft hover:bg-ink/5 hover:border-silver/50 hover:text-silver disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="w-11 h-11 flex items-center justify-center text-ink-soft/70 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
              currentPage === page
                ? 'bg-silver text-cream shadow-[0_0_16px_rgba(158,158,158,0.35)]'
                : 'bg-cream-deep border border-ink/10 text-ink-soft hover:bg-ink/5 hover:border-silver/50 hover:text-silver'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('ariaNextPage')}
        className="w-11 h-11 flex items-center justify-center rounded-xl border border-ink/10 bg-cream-deep text-ink-soft hover:bg-ink/5 hover:border-silver/50 hover:text-silver disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
