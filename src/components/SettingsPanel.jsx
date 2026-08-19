import { useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronRight, CircleUserRound, MapPin, Plus, Settings2, SlidersHorizontal, UsersRound, X } from 'lucide-react';

const tabs = [
  ['profile', 'You', CircleUserRound],
  ['activities', 'Activities', Plus],
  ['people', 'People', UsersRound],
  ['availability', 'Availability', CalendarDays],
  ['discovery', 'Discovery', MapPin],
  ['invite', 'Invite defaults', SlidersHorizontal],
  ['organizer', 'Host a series', Settings2],
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Toggle({ checked, onChange, label, note }) {
  return <label className="setting-toggle"><span><b>{label}</b>{note && <small>{note}</small>}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}

export default function SettingsPanel({ open, onClose, settings, setSettings, initialTab = 'profile', onPreviewOrganizer }) {
  const [tab, setTab] = useState(initialTab);
  const [activityName, setActivityName] = useState('');
  const [activityQuery, setActivityQuery] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendLikes, setFriendLikes] = useState('');
  const [friendAvoids, setFriendAvoids] = useState('');
  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);
  if (!open) return null;

  const update = (section, field, value) => setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  const updateProfile = (field, value) => update('profile', field, value);
  const remove = (section, id) => setSettings((current) => ({ ...current, [section]: current[section].filter((item) => item.id !== id) }));
  const addActivity = (event) => {
    event.preventDefault();
    if (!activityName.trim()) return;
    setSettings((current) => ({ ...current, activities: [...current.activities, { id: `activity-${Date.now()}`, name: activityName.trim(), query: activityQuery.trim() || activityName.trim(), energy: 'Easy', format: 'Any group' }] }));
    setActivityName(''); setActivityQuery('');
  };
  const addFriend = (event) => {
    event.preventDefault();
    if (!friendName.trim()) return;
    setSettings((current) => ({ ...current, friends: [...current.friends, { id: `friend-${Date.now()}`, name: friendName.trim(), likes: friendLikes.trim() || 'Still getting to know', avoids: friendAvoids.trim() || 'No notes yet', visibility: 'Only me' }] }));
    setFriendName(''); setFriendLikes(''); setFriendAvoids('');
  };

  return <div className="settings-layer" role="dialog" aria-modal="true" aria-label="Planning settings">
    <button className="settings-backdrop" onClick={onClose} aria-label="Close settings" />
    <aside className="settings-panel">
      <header className="settings-header"><div><p className="eyebrow">make the plan yours</p><h2>Planning settings</h2></div><button onClick={onClose} aria-label="Close settings"><X /></button></header>
      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon /> {label}<ChevronRight /></button>)}</nav>
        <div className="settings-body">
          {tab === 'profile' && <section className="setting-section"><p className="setting-kicker">your starting point</p><h3>Where, when, and at what pace?</h3><div className="setting-grid"><label>Default city<input value={settings.profile.city} onChange={(e) => updateProfile('city', e.target.value)} /></label><label>Travel radius<select value={settings.profile.radius} onChange={(e) => updateProfile('radius', e.target.value)}><option>5 km</option><option>15 km</option><option>25 km</option><option>Happy to travel</option></select></label><label>Budget comfort<select value={settings.profile.budget} onChange={(e) => updateProfile('budget', e.target.value)}><option>Keep it free</option><option>€</option><option>€€</option><option>€€€</option></select></label><label>Usual social pace<select value={settings.profile.pace} onChange={(e) => updateProfile('pace', e.target.value)}><option>Low key</option><option>Easy going</option><option>Up for anything</option></select></label></div><Toggle label="Open to meeting new people" note="Used only when you make a mixed-group plan." checked={settings.profile.openToNew} onChange={(value) => updateProfile('openToNew', value)} /></section>}
          {tab === 'activities' && <section className="setting-section"><p className="setting-kicker">your activity palette</p><h3>Things worth making time for.</h3><p className="setting-copy">These give the planner language for searching your city. Add the specific things your people actually enjoy.</p><div className="activity-list">{settings.activities.map((activity) => <div className="saved-item" key={activity.id}><span className="saved-mark">✳</span><div><b>{activity.name}</b><small>Search: {activity.query} · {activity.energy}</small></div><button onClick={() => remove('activities', activity.id)} aria-label={`Remove ${activity.name}`}>×</button></div>)}</div><form className="compact-form" onSubmit={addActivity}><label>Activity name<input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="e.g. gallery late" /></label><label>How should Maps search it?<input value={activityQuery} onChange={(e) => setActivityQuery(e.target.value)} placeholder="e.g. contemporary art gallery" /></label><button type="submit"><Plus /> Add activity</button></form></section>}
          {tab === 'people' && <section className="setting-section"><p className="setting-kicker">friends and circles</p><h3>Keep the useful context.</h3><p className="setting-copy">Private notes help you make better suggestions. They are not shown on an invite.</p><div className="people-list">{settings.friends.map((friend) => <div className="person-item" key={friend.id}><span>{friend.name.slice(0, 1)}</span><div><b>{friend.name}</b><small>Likes: {friend.likes}</small><small>Avoids: {friend.avoids}</small></div><button onClick={() => remove('friends', friend.id)} aria-label={`Remove ${friend.name}`}>×</button></div>)}</div><form className="compact-form friend-form" onSubmit={addFriend}><label>Name<input value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Friend's name" /></label><label>They tend to love<input value={friendLikes} onChange={(e) => setFriendLikes(e.target.value)} placeholder="live music, a long walk" /></label><label>They would skip<input value={friendAvoids} onChange={(e) => setFriendAvoids(e.target.value)} placeholder="busy queues, late nights" /></label><button type="submit"><Plus /> Add person</button></form><div className="circle-row"><b>Your circles</b>{settings.circles.map((circle) => <span key={circle.id}>{circle.name} · {circle.members} people</span>)}</div></section>}
          {tab === 'availability' && <section className="setting-section"><p className="setting-kicker">availability and voting</p><h3>Give a little, not your whole calendar.</h3><p className="setting-copy">Choose the days that are usually possible. Plans can still use a shared poll for the final decision.</p><div className="day-picker">{days.map((day) => <button key={day} className={settings.availability.days.includes(day) ? 'picked' : ''} onClick={() => update('availability', 'days', settings.availability.days.includes(day) ? settings.availability.days.filter((item) => item !== day) : [...settings.availability.days, day])}>{day}</button>)}</div><label className="wide-setting">Comfortable window<select value={settings.availability.window} onChange={(e) => update('availability', 'window', e.target.value)}><option>After work</option><option>Saturday daytime</option><option>Sunday daytime</option><option>Flexible</option></select></label><Toggle label="Ask before sending reminders" note="Keeps coordination useful, not noisy." checked={settings.availability.reminders} onChange={(value) => update('availability', 'reminders', value)} /></section>}
          {tab === 'discovery' && <section className="setting-section"><p className="setting-kicker">city discovery</p><h3>Tell Maps what a good fit means.</h3><div className="setting-grid"><label>Venue vibe<select value={settings.discovery.vibe} onChange={(e) => update('discovery', 'vibe', e.target.value)}><option>Independent and local</option><option>Easy and familiar</option><option>Creative and unusual</option><option>Outdoors first</option></select></label><label>Venue timing<select value={settings.discovery.timing} onChange={(e) => update('discovery', 'timing', e.target.value)}><option>Open now</option><option>Weekend</option><option>After work</option><option>Any time</option></select></label></div><Toggle label="Prioritise accessibility notes" note="Flag venue details for the organiser to check." checked={settings.discovery.accessible} onChange={(value) => update('discovery', 'accessible', value)} /><Toggle label="Show a small shortlist" note="Start with four thoughtful options, not a wall of search results." checked={settings.discovery.shortlist} onChange={(value) => update('discovery', 'shortlist', value)} /></section>}
          {tab === 'invite' && <section className="setting-section"><p className="setting-kicker">invite defaults</p><h3>What should your friends see?</h3><div className="setting-grid"><label>Default privacy<select value={settings.invite.privacy} onChange={(e) => update('invite', 'privacy', e.target.value)}><option>Invite link only</option><option>Anyone with the link</option><option>Private guest list</option></select></label><label>Guest limit<input type="number" min="2" max="100" value={settings.invite.limit} onChange={(e) => update('invite', 'limit', Number(e.target.value))} /></label></div><Toggle label="Show the guest list" note="Everyone can see who has said yes." checked={settings.invite.showGuests} onChange={(value) => update('invite', 'showGuests', value)} /><Toggle label="Send a gentle reminder" note="A single reminder before the RSVP deadline." checked={settings.invite.reminder} onChange={(value) => update('invite', 'reminder', value)} /><Toggle label="Let guests bring someone" checked={settings.invite.plusOne} onChange={(value) => update('invite', 'plusOne', value)} /></section>}
          {tab === 'organizer' && <section className="setting-section organizer-section"><p className="setting-kicker">your organiser space</p><h3>Women in Tech Brunch</h3><p className="setting-copy">A reusable monthly event template, kept separate from your personal plans and private friend notes.</p><div className="organizer-status"><span>Next brunch</span><b>{settings.organizer.nextDate}</b><small>{settings.organizer.visibility} · draft</small></div><div className="setting-grid"><label>Series name<input value={settings.organizer.seriesName} onChange={(e) => update('organizer', 'seriesName', e.target.value)} /></label><label>Default city<input value={settings.organizer.city} onChange={(e) => update('organizer', 'city', e.target.value)} /></label><label>Cadence<select value={settings.organizer.cadence} onChange={(e) => update('organizer', 'cadence', e.target.value)}><option>Once a month</option><option>Every six weeks</option><option>Once a quarter</option></select></label><label>Guest capacity<input type="number" min="2" max="100" value={settings.organizer.capacity} onChange={(e) => update('organizer', 'capacity', Number(e.target.value))} /></label><label>Next brunch date<input value={settings.organizer.nextDate} onChange={(e) => update('organizer', 'nextDate', e.target.value)} /></label><label>Visibility<select value={settings.organizer.visibility} onChange={(e) => update('organizer', 'visibility', e.target.value)}><option>Invite only</option><option>Waitlist ready</option><option>Future public release</option></select></label></div><label className="wide-setting">What makes this brunch worth coming to?<input value={settings.organizer.note} onChange={(e) => update('organizer', 'note', e.target.value)} /></label><Toggle label="Keep a reusable monthly template" note="Start each new brunch with the same thoughtful defaults." checked={settings.organizer.template} onChange={(value) => update('organizer', 'template', value)} /><Toggle label="Prepare for a future public release" note="This does not publish the event. It just keeps the template ready for a public listing later." checked={settings.organizer.publicReady} onChange={(value) => update('organizer', 'publicReady', value)} /><button className="organizer-preview" onClick={onPreviewOrganizer}>Preview next brunch invite <ChevronRight /></button></section>}
        </div>
      </div>
      <footer className="settings-footer"><span><Check /> Saved on this device</span><button onClick={onClose}>Done</button></footer>
    </aside>
  </div>;
}
