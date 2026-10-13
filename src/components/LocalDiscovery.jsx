import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { ui } from '../i18n/core';
import { brazilVenues } from '../../shared/brazil';
import { spainVenues } from '../../shared/spain';
import { REGIONS } from '../../shared/regions';
import LocationPicker from './LocationPicker';
export function localIdeaDraft(idea, profile, context='friends') {
  return {title:ui(idea.name),city:profile.city,country:profile.country,timezone:profile.timezone,currency:profile.currency,kind:'Friends outing',
    date:'',time:'14:00',endTime:'16:00',location:idea.venue?.name ? [idea.venue.name,ui(idea.venue.address)].filter(Boolean).join(', ') : '',
    cost:'',notes:[ui(idea.description),idea.url ? ui(`Source: ${idea.url}`):'',context==='partner'?ui('Planning with: my partner.'):context==='family'?ui('Planning with: family or caregiving.'):''].filter(Boolean).join('\n\n')};
}
export default function LocalDiscovery({ settings, onSettingsChange, onCreate }) {
  const [context,setContext]=useState('friends');
  const [query,setQuery]=useState('');
  const isBrazil=settings.profile.country==='BR';
  const local=(isBrazil ? brazilVenues : spainVenues)(settings.profile.city);
  const ideas=[...local,
    {id:'br-coffee',name:isBrazil?"Coffee and a catch-up at a padaria":"Coffee and a catch-up in the neighbourhood",category:'coffee-stroll',description:isBrazil?"Choose a neighbourhood padaria or café. Pick a time and leave space to catch up.":"Choose a neighbourhood café. Pick a time and leave space to catch up."},
    {id:'br-games',name:"Board games with your people",category:'board-games',description:"Meet at someone’s home or a place you choose together. Everyone can bring a game or something to share."},
    {id:'br-lunch',name:"An unhurried Sunday lunch",category:'dinner-out',description:"At home or a neighbourhood restaurant. Agree what everyone brings and how to share the cost."},
    {id:'br-creative',name:"A watercolour, pottery or dance class",category:'pottery-workshop',description:"Choose a class in your city. Check availability, price, accessibility and registration directly with the organiser."},
  ].filter(idea=>`${ui(idea.name)} ${ui(idea.description)} ${idea.venue?.name||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
  return <section className="dublin-discovery">
    <span className="gp-eyebrow">{ui(isBrazil ? 'BRAZIL · LOCAL LIFE' : 'SPAIN · LOCAL LIFE')}</span><h1>{ui(`Ideas in ${settings.profile.city}`)}</h1>
    <p>{ui('A café, a creative class, a Sunday lunch. Find a little time together in your city.')}</p>
    <LocationPicker settings={settings} onChange={onSettingsChange}/>
    <fieldset className="dublin-context-picker"><legend>{ui('Who are you planning with?')}</legend>
      {[['friends','Friends'],['partner','My partner'],['family','Family or caregiving']].map(([value,label])=><button key={value} type="button" aria-pressed={context===value} className={context===value?'selected':''} onClick={()=>setContext(value)}>{ui(label)}</button>)}
    </fieldset>
    <label className="gp-form gp-local-search">{ui('Search ideas')}<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={ui('A café, a park, something creative…')}/></label>
    <p className="gp-field-note">{ui('These are outing ideas, not confirmed events. Check official programmes, prices and availability, then choose the date of your own plan.')}</p>
    <div className="dublin-grid">{ideas.map(idea=><article className="dublin-pick" key={idea.id}>
      <span className="gp-tag">{idea.venue ? ui('Official source') : ui('Make it your own')}</span>
      <h3>{ui(idea.name)}</h3><p>{idea.venue?.name || settings.profile.city}</p><p>{ui(idea.description)}</p>
      <div className="gp-detail-actions"><button className="gp-button" onClick={()=>onCreate(localIdeaDraft(idea,settings.profile,context))}><Plus/>{ui('Make a plan')}</button>
        {idea.url && <a href={idea.url} target="_blank" rel="noreferrer" className="gp-text-button">{ui('Check programme')}<ArrowUpRight/></a>}
      </div>
    </article>)}</div>
    {!ideas.length&&<p role="status">{ui('Try another category or search.')}</p>}
    <p className="gp-field-note">{ui(`No automatic event feed or newsletter is connected for ${ui(REGIONS[settings.profile.country].name)} yet. You can still create your own events and invite your people.`)}</p>
  </section>;
}
