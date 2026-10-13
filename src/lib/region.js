import { ui, originalSampleCopy } from '../i18n/core.js';
import { brazilCity } from '../../shared/brazil.js';
import { spainCity } from '../../shared/spain.js';
import { REGIONS, regionalCity } from '../../shared/regions.js';
import { LAUNCH_LOCATION } from '../../shared/launch.js';
export function launchSettings(defaults, preferences = {}, friends) {
  // Apply launch defaults in memory; never rewrite saved event records or preferences.
  return regionalSettings(defaults, {
    ...preferences,
    profile: { ...preferences.profile, ...LAUNCH_LOCATION,
      budget: preferences.profile?.budget?.startsWith('R$') ? defaults.profile.budget : preferences.profile?.budget || defaults.profile.budget },
    organizer: { ...preferences.organizer, city: LAUNCH_LOCATION.city },
    activities: (preferences.activities || defaults.activities).map(activity => {
      const original = defaults.activities.find(item => item.id === activity.id);
      if (!original) return activity;
      const regional = {
        gallery: ['Art and conversation', 'art gallery or museum'],
        cinema: ['Cinema and a catch-up', 'cinema'],
        make: ['Watercolour or ceramics', 'watercolour or pottery class'],
        walk: ['A walk in the park', 'park or walking trail'],
      }[activity.id] || [];
      return { ...activity,
        name: originalSampleCopy(activity.name, [original.name, regional[0]].filter(Boolean)),
        query: originalSampleCopy(activity.query, [original.query, regional[1]].filter(Boolean)),
        energy: originalSampleCopy(activity.energy, [original.energy].filter(Boolean)),
        format: originalSampleCopy(activity.format, [original.format].filter(Boolean)),
      };
    }),
  }, friends);
}
export function regionalSettings(defaults, preferences = {}, friends) {
  // Recognise legacy locations, but keep discovery within the launch cities.
  const country = Object.hasOwn(REGIONS, preferences.profile?.country) ? preferences.profile.country : brazilCity(preferences.profile?.city) ? 'BR' : spainCity(preferences.profile?.city) ? 'ES' : defaults.profile?.country || 'IE';
  const result = { ...defaults, ...preferences };
  for (const key of ['profile','availability','discovery','invite','organizer']) result[key] = {...defaults[key], ...preferences[key]};
  result.profile.country = country;
  const region = REGIONS[country];
  if (country !== 'IE') {
    const explicit = preferences.profile?.country === country;
    result.profile.city = region.city;
    result.profile.timezone = region.timezone;
    result.profile.currency = region.currency;
    if (!explicit) result.profile.budget = country==='BR' ? 'R$ R$' : '€€';
    if (!preferences.organizer?.nextDate) result.organizer.nextDate = '';
    result.organizer.city = result.profile.city;
    if (!preferences.organizer?.seriesName || preferences.organizer.seriesName === defaults.organizer.seriesName) result.organizer.seriesName = ui('Coffee with the group');
    if (!preferences.organizer?.note || preferences.organizer.note === defaults.organizer.note) result.organizer.note = ui('An unhurried catch-up with your people.');
    if (!preferences.activities) result.activities = defaults.activities.map(activity => ({...activity,
      ...(activity.id === 'gallery' ? {name:'Art and conversation',query:'art gallery or museum'} :
        activity.id === 'cinema' ? {name:'Cinema and a catch-up',query:'cinema'} :
        activity.id === 'make' ? {name:'Watercolour or ceramics',query:'watercolour or pottery class'} :
        {name:'A walk in the park',query:'park or walking trail'})}));
  } else {
    result.profile.currency = 'EUR';
    result.profile.timezone ||= 'Europe/Dublin';
  }
  if (friends) result.friends = friends;
  return result;
}
export function locationSettings(settings, country, city) {
  const region = REGIONS[country] || REGIONS.IE;
  const nextCity = country !== 'IE' || city === undefined ? region.city : city;
  return {...settings,profile:{...settings.profile,country,city:nextCity,currency:region.currency,
    budget: country===settings.profile.country ? settings.profile.budget : country==='BR'?'R$ R$':'€€',
    timezone:regionalCity(country,nextCity)?.timezone || (country===settings.profile.country ? settings.profile.timezone : null) || region.timezone},
    organizer:{...settings.organizer,city:nextCity}};
}
export const regionDiscoveryLabel = profile => profile.country !== 'IE' ? 'Local ideas' : 'Dublin this week';
