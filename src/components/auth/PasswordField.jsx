import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AnimatedInput } from './AuthLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export function PasswordField({ label, id, error, ...props }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const fieldLabel = label ?? t('loginPassword');

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {fieldLabel}
      </label>
      <div className="relative">
        <AnimatedInput
          id={id}
          type={visible ? 'text' : 'password'}
          className={error ? 'ring-2 ring-red-500/50' : ''}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-3 flex items-center text-ink-soft hover:text-silver transition-colors z-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-silver/40"
          aria-label={visible ? t('pwdHide') : t('pwdShow')}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
