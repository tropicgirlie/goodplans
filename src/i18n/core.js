import spanish from './es.js';
import portuguese from './pt-BR.js';
import { LAUNCH_LOCALES } from '../../shared/launch.js';
const supportedLocales = LAUNCH_LOCALES;
const dictionaries = Object.fromEntries(Object.entries({ es: spanish, 'pt-BR': portuguese }).map(([language, entries]) => [language,
  Object.assign(Object.create(null), Object.fromEntries(Object.entries(entries).map(([key, value]) => [key.trim().replace(/\s+/g, ' '), value])))
]));
const metadata = {
  en: { date: 'en-IE', title: 'Good Plans — Make time for your people', description: 'Plan catch-ups, outings and events with your people. Private plans stay on your device.' },
  es: { date: 'es-ES', title: 'Good Plans — Haz un hueco para tu gente', description: 'Organiza encuentros, escapadas y eventos con tu gente. Tus planes privados se guardan en tu dispositivo.' },
  'pt-BR': { date: 'pt-BR', title: 'Good Plans — Reserve tempo para quem você gosta', description: 'Planeje encontros, passeios e eventos com sua turma. Seus planos privados ficam salvos no seu dispositivo.' },
};
const STORAGE_KEY = 'good-plans-language';
const listeners = new Set();
function initialLocale() {
  if (typeof window === 'undefined') return 'en';
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (supportedLocales.includes(requested)) return requested;
  try { const saved = localStorage.getItem(STORAGE_KEY); return supportedLocales.includes(saved) ? saved : 'en'; } catch { return 'en'; }
}
let locale = initialLocale();
export const getLocale = () => locale;
export const dateLocale = () => metadata[locale].date;
// Recover built-in sample copy saved by an earlier translated release.
// Callers supply a small allowlist; never apply this to authored plans or notes.
export function originalSampleCopy(value, candidates) {
  return candidates.find(key => key === value || Object.values(dictionaries).some(dictionary => dictionary[key] === value)) ?? value;
}
// Carry the choice between full-page app links even when browser storage is disabled.
export function localeHref(path) {
  if (locale === 'en' || !path.startsWith('/') || path.startsWith('//')) return path;
  const url = new URL(path, 'https://goodplans.invalid');
  url.searchParams.set('lang', locale);
  return url.pathname + url.search + url.hash;
}
export function subscribeLocale(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function setLocale(next) {
  if (!supportedLocales.includes(next)) return;
  locale = next;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Language still works without storage. */ }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    // Preserve route context, private invite hash and the modal's history state.
    window.history.replaceState(window.history.state, '', url);
  }
  updateDocumentLanguage();
  listeners.forEach(listener => listener());
}
export function updateDocumentLanguage() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* Local language choice is optional. */ }
  const description = document.querySelector('meta[name=description]');
  if (description) description.content = metadata[locale].description;
  document.title = metadata[locale].title;
}
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.fromEntries(Object.entries(dictionaries).map(([language, dictionary]) => [language,
  Object.entries(dictionary).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => {
    const tokens = [...key.matchAll(/\{(\d+)\}/g)];
    const parts = key.split(/\{\d+\}/);
    return { regex: new RegExp('^' + parts.map(escapeRegex).join('(.*?)') + '$'), value, tokens };
  })
]));
// Translate display copy without changing enum values, request payloads or stored data.
// Non-string React children pass through untouched; user-authored content is kept verbatim at call sites.
export function ui(value) {
  if (locale === 'en' || typeof value !== 'string' || !value.trim()) return value;
  const dictionary = dictionaries[locale];
  const key = value.trim().replace(/\s+/g, ' ');
  let translated = dictionary[key];
  if (translated === undefined) {
    for (const { regex, value: template, tokens } of patterns[locale]) {
      const match = key.match(regex);
      if (!match) continue;
      translated = template.replace(/\{(\d+)\}/g, (_, index) => {
        const position = tokens.findIndex(token => token[1] === index);
        return match[position + 1];
      });
      break;
    }
  }
  if (translated === undefined && key.includes(' · ')) {
    translated = key.split(' · ').map(part => dictionary[part] ?? part).join(' · ');
  }
  return translated === undefined ? value : value.slice(0, value.length - value.trimStart().length) + translated + value.slice(value.trimEnd().length);
}
