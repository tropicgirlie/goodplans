import test from 'node:test';
import assert from 'node:assert/strict';
import { setLocale, ui, getLocale, dateLocale, localeHref } from './core.js';
import { pageUrl, pageFromUrl, routeContext } from '../lib/planningModel.js';
import { invitationText, calendarData } from '../lib/plans.js';
import { activityCategories, rankIdeas } from '../../shared/recommendations.js';

test('public launch only accepts English and retains private route context', () => {
  const href = pageUrl('Organiser portal', { event:'e1', tool:'newsletter', issue:'i1' });
  const search = new URL(href, 'https://example.com').search;
  for (const requested of ['es','pt-BR','fr','en']) {
    setLocale(requested);
    assert.equal(getLocale(), 'en');
    assert.equal(ui('Create a plan'), 'Create a plan');
    assert.equal(dateLocale(), 'en-IE');
  }
  assert.equal(pageFromUrl(search), 'Organiser portal');
  assert.deepEqual(routeContext(search), {plan:null,event:'e1',tool:'newsletter',issue:'i1'});
  assert.equal(localeHref('/?page=privacy'), '/?page=privacy');
});

test('old language preferences and links reload in English without losing saved plans', async () => {
  const values = new Map([['good-plans-language','pt-BR'],['good-plans-outings-v2','private plans']]);
  let url = 'https://example.com/?lang=es&view=host&event=e1&plan=p1#token=test-only';
  const state = {modal:true,previous:'/?view=plans'};
  const description = {content:''};
  globalThis.localStorage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  globalThis.window = {location:{get href(){return url;},get search(){return new URL(url).search;}},history:{state,replaceState(next,unused,href){assert.equal(next,state);url=String(href);}}};
  globalThis.document = {documentElement:{lang:'pt-BR'},querySelector:()=>description,title:''};
  try {
    const reloaded = await import('./core.js?test=english-launch');
    assert.equal(reloaded.getLocale(), 'en');
    reloaded.updateDocumentLanguage();
    assert.equal(document.documentElement.lang, 'en');
    assert.match(document.title, /Make time for your people/);
    setLocale('en');
    assert.equal(new URL(url).searchParams.get('plan'), 'p1');
    assert.equal(new URL(url).searchParams.get('event'), 'e1');
    assert.equal(new URL(url).hash, '#token=test-only');
    assert.equal(values.get('good-plans-outings-v2'), 'private plans');
    globalThis.localStorage.setItem = () => {throw new Error('Storage disabled');};
    assert.doesNotThrow(()=>setLocale('en'));
  } finally {delete globalThis.window;delete globalThis.localStorage;delete globalThis.document;setLocale('en');}
});

test('English interface preserves multilingual authored invitations and calendar data', () => {
  const plan = {id:'saved',title:'Café e aquarela com João',location:'São Paulo',notes:'Levar pincéis',date:'2026-10-19',time:'14:00',endTime:'16:00',timezone:'America/Sao_Paulo'};
  const original = structuredClone(plan);
  assert.match(invitationText(plan), /Café e aquarela com João/);
  assert.match(calendarData(plan).ics, /SUMMARY:Café e aquarela com João/);
  assert.match(calendarData(plan).ics, /DESCRIPTION:Levar pincéis/);
  assert.match(calendarData(plan).ics, /DTSTART:20261019T170000Z/);
  assert.deepEqual(plan,original);
});

test('Spanish interests order local suggestions using the same stable category IDs', () => {
  const interests = activityCategories('acuarela, cerámica, cine, senderismo, cena, retiros');
  assert.ok(interests.includes('pottery-workshop'));
  assert.ok(interests.includes('cinema'));
  assert.ok(interests.includes('outdoor-walk'));
  const ideas = [{category:'dinner-out',noise:'high'},{category:'pottery-workshop',noise:'low'}];
  assert.equal(rankIdeas(ideas,[{likes:'cerámica tranquila',avoids:'lugares ruidosos'}])[0].category, 'pottery-workshop');
});

test('Portuguese dictionary covers the same UI copy and preserves template arguments', async () => {
  const {default:es} = await import('./es.js');
  const {default:pt} = await import('./pt-BR.js');
  assert.deepEqual(Object.keys(pt).sort(), Object.keys(es).sort());
  for (const [key,value] of Object.entries(pt)) {
    assert.ok(value.trim(), `Empty translation: ${key}`);
    assert.deepEqual([...value.matchAll(/\{\d+\}/g)].map(match=>match[0]).sort(), [...key.matchAll(/\{\d+\}/g)].map(match=>match[0]).sort(), `Template arguments: ${key}`);
  }
});

test('Brazilian Portuguese interests and quiet preferences rank stable categories', () => {
  const interests = activityCategories('chá, jogos de tabuleiro, aquarela, cerâmica, caminhada, jantar, retiro, exposição, museu, cinema');
  for (const category of ['coffee-stroll','board-games','pottery-workshop','outdoor-walk','dinner-out','retreat','gallery','cinema']) assert.ok(interests.includes(category), category);
  const ideas = [{category:'dinner-out',noise:'high'},{category:'pottery-workshop',noise:'low'}];
  const ranked = rankIdeas(ideas,[{likes:'cerâmica tranquila',avoids:'lugares barulhentos e multidões'}]);
  assert.equal(ranked[0].category, 'pottery-workshop');
  assert.match(ranked[0].reason, /A quieter option/);
});
