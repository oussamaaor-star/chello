import { Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function CheckoutSteps({ current }) {
  const { t } = useLanguage();

  const STEPS = [
    { id: 1, label: t('stepsLivraison') },
    { id: 2, label: t('stepsRecap') },
  ];

  return (
    <nav aria-label={t('ariaCheckoutSteps')} className="flex items-center justify-center gap-0 mb-8 sm:mb-10">
      {STEPS.map((step, idx) => {
        const isCompleted = current > step.id;
        const isActive    = current === step.id;
        const isLast      = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-ink border-ink text-cream'
                    : 'bg-cream-deep border-ink/10 text-ink-soft'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  isActive ? 'text-ink' : isCompleted ? 'text-emerald-400' : 'text-ink-soft'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 sm:mx-2 mb-5 rounded-full transition-all duration-500 ${
                  current > step.id ? 'bg-emerald-500' : 'bg-ink/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
