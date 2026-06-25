import { useState, useEffect } from 'react';
import { X, Ruler, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

const CLOTHING_SIZES = [
  { size: 'S',  bust: '84-88',  waist: '64-68',  hips: '90-94',  length: '135' },
  { size: 'M',  bust: '88-92',  waist: '68-72',  hips: '94-98',  length: '137' },
  { size: 'L',  bust: '92-96',  waist: '72-76',  hips: '98-102', length: '139' },
  { size: 'XL', bust: '96-100', waist: '76-80',  hips: '102-106', length: '141' },
];

const SHOE_SIZES = [
  { eu: '36', uk: '3',   us: '5.5', foot: '22.5' },
  { eu: '37', uk: '4',   us: '6.5', foot: '23.5' },
  { eu: '38', uk: '5',   us: '7.5', foot: '24'   },
  { eu: '39', uk: '6',   us: '8.5', foot: '24.5' },
  { eu: '40', uk: '6.5', us: '9',   foot: '25.5' },
  { eu: '41', uk: '7.5', us: '10',  foot: '26'   },
];

export function SizeGuideModal({ open, onClose }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative bg-cream rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-cream z-10 flex items-center justify-between px-6 py-4 border-b border-ink/10">
              <div className="flex items-center gap-2.5">
                <Ruler className="w-5 h-5 text-silver" />
                <h2 className="font-serif italic text-lg text-ink">{t('sizeGuideTitle')}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 transition-colors"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-ink/10">
              {[t('sizeGuideClothing'), t('sizeGuideShoes')].map((label, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    tab === i
                      ? 'border-silver text-silver'
                      : 'border-transparent text-ink-soft/60 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Clothing table */}
              {tab === 0 && (
                <div>
                  <div className="overflow-x-auto rounded-xl border border-ink/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-cream-deep">
                          <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideCm')}</th>
                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideBust')}</th>
                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideWaist')}</th>
                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideHips')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CLOTHING_SIZES.map((row, i) => (
                          <tr key={row.size} className={i % 2 === 0 ? 'bg-cream' : 'bg-cream-deep/50'}>
                            <td className="px-4 py-3 font-semibold text-ink">{row.size}</td>
                            <td className="px-4 py-3 text-center text-ink-soft">{row.bust}</td>
                            <td className="px-4 py-3 text-center text-ink-soft">{row.waist}</td>
                            <td className="px-4 py-3 text-center text-ink-soft">{row.hips}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* How to measure */}
                  <div className="mt-5 p-4 bg-cream-deep rounded-xl border border-ink/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft/70 mb-3 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-silver" />
                      {t('sizeGuideHowToMeasure')}
                    </p>
                    <ul className="space-y-2 text-xs text-ink-soft">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-silver mt-1.5 flex-shrink-0" />
                        <span><strong className="text-ink">{t('sizeGuideBust')}</strong> — {t('sizeGuideBustTip')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-silver mt-1.5 flex-shrink-0" />
                        <span><strong className="text-ink">{t('sizeGuideWaist')}</strong> — {t('sizeGuideWaistTip')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-silver mt-1.5 flex-shrink-0" />
                        <span><strong className="text-ink">{t('sizeGuideHips')}</strong> — {t('sizeGuideHipsTip')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Shoes table */}
              {tab === 1 && (
                <div className="overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-deep">
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideEU')}</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideUK')}</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideUS')}</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-soft/70">{t('sizeGuideFoot')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHOE_SIZES.map((row, i) => (
                        <tr key={row.eu} className={i % 2 === 0 ? 'bg-cream' : 'bg-cream-deep/50'}>
                          <td className="px-4 py-3 text-center font-semibold text-ink">{row.eu}</td>
                          <td className="px-4 py-3 text-center text-ink-soft">{row.uk}</td>
                          <td className="px-4 py-3 text-center text-ink-soft">{row.us}</td>
                          <td className="px-4 py-3 text-center text-ink-soft">{row.foot}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tip */}
              <p className="mt-5 text-xs text-silver-deep italic text-center">
                {t('sizeGuideTip')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
