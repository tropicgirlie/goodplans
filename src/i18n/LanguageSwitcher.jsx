import { useSyncExternalStore } from 'react';
import MaterialSelect from '../components/MaterialSelect';
import { getLocale, setLocale, subscribeLocale } from './core';
import { LAUNCH_LOCALES } from '../../shared/launch';
const languages = { en: { name: 'English', short: 'English' }, es: { name: 'Español', short: 'Español' }, 'pt-BR': { name: 'Português (Brasil)', short: 'PT-BR' } };
export function useLocale() {
  return useSyncExternalStore(subscribeLocale, getLocale, () => 'en');
}
export default function LanguageSwitcher() {
  const locale = useLocale();
  if (LAUNCH_LOCALES.length < 2) return null;
  const label = locale === 'en' ? 'Language' : 'Idioma';
  return <div className="gp-language" title={languages[locale].name}><MaterialSelect compact aria-label={label} value={locale} onChange={event => setLocale(event.target.value)}>{Object.entries(languages).filter(([value]) => LAUNCH_LOCALES.includes(value)).map(([value, language]) => <option key={value} value={value} lang={value} data-display-text={language.short}>{language.name}</option>)}</MaterialSelect></div>;
}
