import test from 'node:test';
import assert from 'node:assert/strict';
import {regionalSettings,locationSettings,launchSettings} from './region.js';
import {setLocale} from '../i18n/core.js';
import spanish from '../i18n/es.js';
import portuguese from '../i18n/pt-BR.js';
import {spainVenues,spainCity} from '../../shared/spain.js';
import {REGIONS} from '../../shared/regions.js';
import {draftDefaults} from './planningModel.js';
import {calendarData,planInstants,instantForWall,wallDateTime,validatePlan,invitationText} from './plans.js';
import {hostedPlan} from './hostedPlans.js';
import {brazilVenues,brazilCity} from '../../shared/brazil.js';
import {seriesDates} from '../../worker/src/hosting-core.js';
const defaults={profile:{city:'Dublin',budget:'€€'},invite:{limit:12},organizer:{city:'Dublin',seriesName:'Women in Tech Brunch',note:'Example',nextDate:'2026-10-19'},activities:[{id:'gallery',name:'Gallery late'}]};
test('Brazil defaults are regional and preserve existing personal settings without mutating Ireland data',()=>{
  const preferences={profile:{country:'BR',city:'São Paulo',pace:'Low key'},organizer:{seriesName:'My own series',note:'Private text'}};
  const snapshot=structuredClone(preferences);
  const settings=regionalSettings(defaults,preferences,[{name:'Emma'}],'pt-BR');
  assert.equal(settings.profile.country,'BR');assert.equal(settings.profile.city,'São Paulo');
  assert.equal(settings.profile.currency,'BRL');assert.equal(settings.profile.timezone,'America/Sao_Paulo');
  assert.equal(settings.profile.pace,'Low key');assert.equal(settings.organizer.seriesName,'My own series');
  assert.equal(settings.organizer.note,'Private text');assert.equal(settings.organizer.nextDate,'');
  assert.deepEqual(preferences,snapshot);assert.equal(defaults.profile.city,'Dublin');
  assert.equal(regionalSettings(defaults,{profile:{country:'IE',city:'Cork'}},[],'pt-BR').profile.city,'Cork');
});
test('launch discovery offers only São Paulo and Barcelona, independently of language',()=>{
  const initial=regionalSettings(defaults,{},[]);
  const brazil=locationSettings(initial,'BR');
  const spain=locationSettings(brazil,'ES');
  assert.deepEqual(REGIONS.BR.cities.map(city=>city.name),['São Paulo']);
  assert.deepEqual(REGIONS.ES.cities.map(city=>city.name),['Barcelona']);
  assert.equal(spain.profile.city,'Barcelona');assert.equal(spain.profile.currency,'EUR');
  assert.equal(spain.profile.timezone,'Europe/Madrid');
  assert.equal(locationSettings(brazil,'BR','Manaus').profile.city,'São Paulo');
  assert.equal(locationSettings(spain,'ES','Madrid').profile.city,'Barcelona');
  const legacy={profile:{country:'BR',city:'Manaus',timezone:'America/Manaus'},organizer:{city:'Manaus'}};
  const snapshot=structuredClone(legacy);
  const normalised=regionalSettings(defaults,legacy);
  assert.equal(normalised.profile.city,'São Paulo');assert.equal(normalised.profile.timezone,'America/Sao_Paulo');
  assert.equal(normalised.organizer.city,'São Paulo');assert.deepEqual(legacy,snapshot);
  const ireland=locationSettings(spain,'IE');assert.equal(ireland.profile.city,'Dublin');
});
test('Brazil catalogue is scoped to the chosen city and never invents event dates or prices',()=>{
  assert.equal(brazilCity('Sao Paulo').name,'São Paulo');
  const sp=brazilVenues('Sao Paulo');assert.ok(sp.some(idea=>idea.venue.name==='MASP'));
  assert.ok(sp.every(idea=>idea.city==='São Paulo' && !idea.starts_at && !idea.price && idea.url.startsWith('https://')));
  assert.deepEqual(brazilVenues('Rio de Janeiro'),[]);
  assert.deepEqual(brazilVenues('Manaus'),[]);
  assert.ok(brazilVenues('São Paulo',['gallery']).every(idea=>idea.category==='gallery'));
});
test('Brazil plans, published events and recurring series keep local time outside Brazil',()=>{
  const old=process.env.TZ;process.env.TZ='Europe/Dublin';
  try {
    const plan={id:'br-time',title:'Café com Ana',date:'2026-10-24',time:'23:30',endDate:'2026-10-25',endTime:'01:30',timezone:'America/Sao_Paulo',capacity:6,location:'São Paulo'};
    assert.equal(validatePlan(plan),'');
    assert.equal(planInstants(plan).start.toISOString(),'2026-10-25T02:30:00.000Z');
    assert.equal(planInstants(plan).end.toISOString(),'2026-10-25T04:30:00.000Z');
    assert.match(calendarData(plan).ics,/DTSTART:20261025T023000Z/);
    assert.match(invitationText(plan),/America\/Sao_Paulo/);
    assert.equal(instantForWall('2026-10-25T14:00','America/Manaus').toISOString(),'2026-10-25T18:00:00.000Z');
    assert.equal(wallDateTime('2026-10-25T02:30Z','America/Sao_Paulo'),'2026-10-24T23:30');
    const event={id:'e',title:plan.title,starts_at:'2026-10-25T02:30:00Z',ends_at:'2026-10-25T04:30:00Z',timezone:plan.timezone,city:'São Paulo'};
    const restored=hostedPlan(event);assert.equal(restored.date,'2026-10-24');assert.equal(restored.time,'23:30');
    assert.equal(restored.endTime,'01:30');assert.equal(restored.timezone,plan.timezone);
    assert.equal(planInstants(restored).start.toISOString(),'2026-10-25T02:30:00.000Z');
    const occurrences=seriesDates({title:'Café com a turma',startsAt:'2026-10-24T17:00Z',endsAt:'2026-10-24T19:00Z',timezone:plan.timezone,capacity:6,seriesName:'Nossa turma',cadence:'Weekly',occurrences:3});
    assert.deepEqual(occurrences.map(item=>wallDateTime(item.startsAt,plan.timezone).slice(11)),['14:00','14:00','14:00']);
  } finally {if(old===undefined)delete process.env.TZ;else process.env.TZ=old;}
});

test('changing language alone never changes country, currency, city or timezone',()=>{
  const before=regionalSettings(defaults,{});
  try {
    for(const locale of ['en','es','pt-BR']) {
      setLocale(locale);
      const after=regionalSettings(defaults,{});
      assert.deepEqual(after.profile,before.profile);
    }
    const legacy=regionalSettings(defaults,{profile:{city:'Manaus'}},[]);
    assert.equal(legacy.profile.country,'BR');assert.equal(legacy.profile.timezone,'America/Sao_Paulo');
  } finally {setLocale('en');}
});
test('Spain settings and local ideas retain geography across all interface languages',()=>{
  const spain=locationSettings(regionalSettings(defaults,{}),'ES');
  assert.equal(spain.profile.city,'Barcelona');assert.equal(spain.profile.currency,'EUR');assert.equal(spain.profile.timezone,'Europe/Madrid');
  const canary=locationSettings(spain,'ES','Santa Cruz de Tenerife');
  assert.equal(canary.profile.city,'Barcelona');assert.equal(canary.profile.timezone,'Europe/Madrid');
  assert.equal(draftDefaults({...spain,organizer:{...spain.organizer,city:'Las Palmas de Gran Canaria'}},true).timezone,'Atlantic/Canary');
  assert.equal(spainCity('Malaga').name,'Málaga');
  assert.deepEqual(spainVenues('Madrid'),[]);
  assert.ok(spainVenues('Barcelona').some(idea=>idea.venue.name==='Parc de la Ciutadella'));
  assert.ok(spainVenues('Barcelona').every(idea=>idea.city==='Barcelona'&&!idea.starts_at&&!idea.price));
  assert.deepEqual(spainVenues('Valencia'),[]);
  try {
    for(const locale of ['en','es','pt-BR']) {
      setLocale(locale);
      assert.deepEqual(regionalSettings(defaults,canary).profile,canary.profile);
      for(const idea of [...brazilVenues('São Paulo'),...spainVenues('Madrid'),...spainVenues('Barcelona')]) {
        assert.ok(idea.name);
        if(locale!=='en') {const dictionary=locale==='es'?spanish:portuguese;assert.ok(dictionary[idea.name]);assert.ok(dictionary[idea.description]);}
      }
    }
    assert.equal(spanish['Art and conversation at MASP'],'Arte y conversación en el MASP');
  } finally {setLocale('en');}
});


test('visible launch always uses Dublin without mutating legacy regional settings or saved plans',()=>{
  for (const profile of [{country:'BR',city:'São Paulo',timezone:'America/Sao_Paulo'},{country:'ES',city:'Barcelona',timezone:'Europe/Madrid'},{country:'IE',city:'Cork'}]) {
    const preferences={profile:{...profile,pace:'Low key',budget:'R$ R$'},organizer:{city:profile.city,seriesName:'My friends'}};
    const snapshot=structuredClone(preferences);
    const settings=launchSettings(defaults,preferences,[{name:'João'}]);
    assert.equal(settings.profile.country,'IE');assert.equal(settings.profile.city,'Dublin');
    assert.equal(settings.profile.timezone,'Europe/Dublin');assert.equal(settings.profile.currency,'EUR');
    assert.equal(settings.profile.budget,'€€');
    assert.equal(settings.organizer.city,'Dublin');assert.equal(settings.organizer.seriesName,'My friends');
    assert.equal(settings.profile.pace,'Low key');assert.equal(settings.friends[0].name,'João');
    assert.equal(draftDefaults(settings).timezone,'Europe/Dublin');
    assert.deepEqual(preferences,snapshot);
  }
});

test('launch restores only known sample translations and keeps custom activity names',()=>{
  const preferences={activities:[{id:'gallery',name:'Arte e conversa',query:'galeria de arte ou museu'},{id:'custom',name:'Aquarela com João',query:'Nossa oficina'}]};
  const original=structuredClone(preferences);
  const settings=launchSettings(defaults,preferences);
  assert.equal(settings.activities[0].name,'Art and conversation');
  assert.equal(settings.activities[0].query,'art gallery or museum');
  assert.equal(settings.activities[1].name,'Aquarela com João');
  assert.deepEqual(preferences,original);
});
