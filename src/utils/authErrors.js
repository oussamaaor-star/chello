/**
 * Traduction des messages d'erreur Supabase Auth (anglais) en messages FR.
 * Les messages Supabase ne sont pas localisés ; on les mappe vers des clés i18n.
 *
 * Usage : translateAuthError(t, error.message)  → string localisée
 */

// [regex sur le message brut Supabase, clé i18n]
const RULES = [
  [/email not confirmed/i,                                'authErrEmailNotConfirmed'],
  [/invalid login credentials/i,                          'authErrInvalidCreds'],
  [/(email address.*invalid|invalid format|unable to validate email)/i, 'authErrEmailInvalid'],
  [/(user already registered|already.*registered|already exists)/i,     'authErrUserExists'],
  [/password should be at least|password is too short/i,  'authErrPasswordShort'],
  [/(rate limit|too many requests|for security purposes)/i, 'authErrRateLimit'],
];

export function translateAuthError(t, rawMessage) {
  if (!rawMessage) return t('authErrGeneric');
  for (const [re, key] of RULES) {
    if (re.test(rawMessage)) return t(key);
  }
  return t('authErrGeneric');
}
