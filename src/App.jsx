import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, ChevronRight, MapPin, Music2, Paintbrush, Send, Settings2, Sparkles, UsersRound, LogOut } from 'lucide-react';
import GoogleMapsExplorer from './components/GoogleMapsExplorer';
import SettingsPanel from './components/SettingsPanel';
import LoginScreen from './components/LoginScreen';
import AffinityMatchMatrix from './components/AffinityMatchMatrix';
import { FRIENDS_DATA } from './data/mockData';
import { createEvent, exchangeInvite, importEventLink, readEvent, submitRsvp, getAuthStatus, getBackendSettings, saveBackendSettings, logout } from './lib/goodPlansApi';

const ideas = [
  { mark: 'make', title: 'Make something', note: 'Pottery, collage, or an after-hours workshop', color: 'coral' },
  { mark: 'loud', title: 'Go somewhere loud', note: 'A gig, a tiny cinema, a dance floor', color: 'blue' },
  { mark: 'city', title: 'See your city', note: 'A new neighbourhood, market, or exhibition', color: 'olive' },
  { mark: 'away', title: 'Get away', note: 'A day trip, sleepover, or long weekend', color: 'orange' },
];

const defaultSettings = {
  profile: { city: 'Dublin', radius: '25 km', budget: '€€', pace: 'Easy going', openToNew: true },
  activities: [
    { id: 'gallery', name: 'Gallery late', query: 'contemporary art gallery', energy: 'Easy', format: 'One-to-one' },
    { id: 'cinema', name: 'Tiny cinema', query: 'independent cinema', energy: 'Easy', format: 'Any group' },
    { id: 'make', name: 'Make something', query: 'pottery or creative workshop', energy: 'Social', format: 'Small group' },
    { id: 'walk', name: 'Out of town', query: 'coastal walk or day trip', energy: 'Fresh air', format: 'Any group' },
  ],
  friends: [
    { id: 'maya', name: 'Maya', likes: 'film, new food, a slower Sunday', avoids: 'packed places and very late nights', visibility: 'Only me' },
    { id: 'katie', name: 'Katie', likes: 'music, making things, meeting people', avoids: 'long travel days', visibility: 'Only me' },
  ],
  circles: [{ id: 'sunday', name: 'Sunday people', members: 5 }, { id: 'work-friends', name: 'Work friends', members: 4 }],
  availability: { days: ['Thu', 'Sat', 'Sun'], window: 'Sunday daytime', reminders: true },
  discovery: { vibe: 'Independent and local', timing: 'Weekend', accessible: true, shortlist: true },
  invite: { privacy: 'Invite link only', limit: 12, showGuests: true, reminder: true, plusOne: false },
  organizer: { seriesName: 'Women in Tech Brunch', city: 'Dublin', cadence: 'Once a month', capacity: 24, nextDate: '2026-10-19', visibility: 'Invite only', note: 'A low-pressure table for women working in and around technology.', template: true, publicReady: false },
};

function Sticker({ icon: Icon, className = '' }) { return <span className={`sticker ${className}`}><Icon aria-hidden="true" strokeWidth={2.3} /></span>; }
function Doodle({ type }) { return <span className={`doodle doodle-${type}`} aria-hidden="true"><i /><i /><i /></span>; }

function friendlyDate(value) {
  if (!value) return 'A date to be confirmed';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('en-IE', { weekday: 'long', day: 'numeric', month: 'long' }).format(parsed);
}

function planFromEvent(event, calendar, cover = '/images/good-plans-women-tech-brunch.png') {
  return { id: event.id, slug: event.slug, title: event.title, date: friendlyDate(event.starts_at || event.startsAt), venue: { name: event.venue_name || event.venueName, address: event.venue_address || event.venueAddress }, cover: event.cover_url || cover, calendar, counts: event.counts };
}

function Invite({ onBack, plan, settings }) {
  const [rsvp, setRsvp] = useState(null);
  const [counts, setCounts] = useState(plan.counts || null);
  const [responseError, setResponseError] = useState('');
  const venue = plan.venue?.name || 'The Fumbally Stables';
  const address = plan.venue?.address || `${settings.profile.city} 8`;
  const respond = async (status) => {
    setResponseError('');
    setRsvp(status);
    if (!plan.id) return;
    try {
      const result = await submitRsvp(plan.id, status === 'yes' ? 'accepted' : 'maybe');
      setCounts(result.counts);
      setRsvp(result.rsvp.status === 'accepted' ? 'yes' : result.rsvp.status);
    } catch (error) { setResponseError(error.message); }
  };
  return <main className="invite-page"><button className="back-link" onClick={onBack}><ChevronRight className="rotate-180" /> Back to planning</button><section className="invite-sheet"><div className="invite-head"><div className="tiny-mark">made with good plans</div><div className="invite-ribbon">a Sunday together</div></div><div className="invite-photo-wrap"><img src={plan.cover || '/images/good-plans-invite-collage.png'} alt="A handmade collage of friends gathering around an invitation" /><span className="tape tape-one" /><span className="tape tape-two" /><Sticker icon={Paintbrush} className="invite-sticker one" /><Sticker icon={Music2} className="invite-sticker two" /></div><div className="invite-title-wrap"><p className="eyebrow">you are invited to</p><h1>{plan.title}</h1><p>an easy afternoon for meeting the people behind the group chat</p></div><div className="invite-details"><div><CalendarDays /><span><b>{plan.date}</b><br />14:00 to 18:00</span></div><div><MapPin /><span><b>{venue}</b><br />{address}</span></div><div><UsersRound /><span><b>Up to {settings.invite.limit} people</b><br />{counts ? `${counts.accepted} going${counts.waitlisted ? ` · ${counts.waitlisted} waitlisted` : ''}` : settings.invite.showGuests ? 'the guest list is visible to everyone' : 'a private invite list'}</span></div></div><p className="invite-note">There is a table booked, a small creative activity nearby, and nothing you need to prepare. Come as you are.</p><div className="rsvp-row"><button className={`rsvp ${rsvp === 'yes' ? 'selected' : ''}`} onClick={() => respond('yes')}><Check /> I’m in</button><button className={`rsvp quiet ${rsvp === 'maybe' ? 'selected' : ''}`} onClick={() => respond('maybe')}>Maybe</button></div>{plan.calendar && <div className="calendar-row"><a href={plan.calendar.google} target="_blank" rel="noreferrer">Add to Google Calendar</a><a href={plan.calendar.ics}>Download calendar file</a></div>}{responseError && <p className="invite-error">{responseError}</p>}{rsvp && <p className="rsvp-message">{rsvp === 'yes' ? 'Lovely. You are on the list.' : rsvp === 'waitlisted' ? 'You are on the waitlist. We will let you know if a place opens.' : 'No pressure. We will keep you posted.'}</p>}<div className="invite-foot">planned by Tessa · {settings.invite.privacy}</div></section></main>;
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('good-plans-settings') || '{}'); return { ...defaultSettings, ...saved, profile: { ...defaultSettings.profile, ...saved.profile }, availability: { ...defaultSettings.availability, ...saved.availability }, discovery: { ...defaultSettings.discovery, ...saved.discovery }, invite: { ...defaultSettings.invite, ...saved.invite }, organizer: { ...defaultSettings.organizer, ...saved.organizer } }; } catch { return defaultSettings; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMode, setSettingsMode] = useState('profile');
  const [showInvite, setShowInvite] = useState(false);
  const [showOrganizerInvite, setShowOrganizerInvite] = useState(false);
  const [organizerEvent, setOrganizerEvent] = useState(null);
  const [openedEvent, setOpenedEvent] = useState(null);
  const [importMessage, setImportMessage] = useState('');
  const [friend, setFriend] = useState('Maya');
  const [activityId, setActivityId] = useState('gallery');
  const [moment, setMoment] = useState('A free Sunday afternoon');
  const [madePlan, setMadePlan] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [pickedDate, setPickedDate] = useState('Sun 21');
  const [dateVotes, setDateVotes] = useState({ 'Sat 20': 3, 'Sun 21': 5, 'Thu 25': 2 });

  // Host Auth & Cloud Sync States
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'syncing' | 'synced' | 'error'
  const [selectedFriends, setSelectedFriends] = useState(['f1', 'f2']);

  // Restore session & settings on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getAuthStatus();
        if (result.user) {
          setCurrentUser(result.user);
          const settingsResult = await getBackendSettings();
          if (settingsResult.settings) {
            setSettings(settingsResult.settings);
            setSyncStatus('synced');
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Save settings locally and sync to cloud if logged in
  useEffect(() => {
    localStorage.setItem('good-plans-settings', JSON.stringify(settings));
    if (!currentUser) return;

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await saveBackendSettings(settings);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to sync settings:', error);
        setSyncStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings, currentUser]);

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    try {
      setSyncStatus('syncing');
      const settingsResult = await getBackendSettings();
      if (settingsResult.settings) {
        setSettings(settingsResult.settings);
        setSyncStatus('synced');
      } else {
        await saveBackendSettings(settings);
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Failed to sync settings after login:', error);
      setSyncStatus('error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setSyncStatus('local');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const city = settings.profile.city;
  const selectedActivity = settings.activities.find((activity) => activity.id === activityId) || settings.activities[0];
  const plan = { title: selectedActivity?.name || 'Sunday soft launch', date: pickedDate === 'Sun 21' ? 'Sunday, 21 September' : `${pickedDate}, September`, venue: selectedVenue };
  const localOrganizerPlan = { title: settings.organizer.seriesName, date: friendlyDate(settings.organizer.nextDate), venue: { name: `${settings.organizer.city} brunch venue`, address: settings.organizer.city }, cover: '/images/good-plans-women-tech-brunch.png' };
  const organizerPlan = organizerEvent || localOrganizerPlan;
  useEffect(() => {
    const match = window.location.pathname.match(/^\/events\/([^/]+)$/);
    if (!match) return;
    const slug = decodeURIComponent(match[1]);
    const token = new URLSearchParams(window.location.hash.slice(1)).get('invite');
    const openInvite = async () => {
      try {
        if (token) { await exchangeInvite(token); window.history.replaceState({}, '', `/events/${slug}`); }
        const result = await readEvent(slug);
        setOpenedEvent(planFromEvent({ ...result.event, counts: result.counts }, result.calendar));
      } catch { /* The normal landing page remains available when an invite is unavailable. */ }
    };
    openInvite();
  }, []);
  const createOrganizerEvent = async () => {
    setImportMessage('');
    try {
      const date = settings.organizer.nextDate;
      const result = await createEvent({ title: settings.organizer.seriesName, description: settings.organizer.note, startsAt: `${date}T14:00:00+01:00`, endsAt: `${date}T18:00:00+01:00`, timezone: 'Europe/Dublin', venueName: `${settings.organizer.city} brunch venue`, venueAddress: settings.organizer.city, city: settings.organizer.city, capacity: settings.organizer.capacity, visibility: settings.organizer.visibility === 'Future public release' ? 'public' : 'invite', organisationName: 'Women in Tech', seriesName: settings.organizer.seriesName, cadence: settings.organizer.cadence, templateName: 'Women in Tech brunch', templateFormat: 'brunch', audienceTone: 'women in tech', mood: 'thoughtful and warm', ageRange: '25-55', palette: ['terracotta', 'butter', 'dusty violet', 'ink'], artDirection: 'Refined editorial paper collage with a long-table conversation, city details, flowers and spacious layered paper.' });
      setOrganizerEvent(planFromEvent(result.event, result.urls));
      setShowOrganizerInvite(true);
      setShowInvite(true);
      setShowSettings(false);
    } catch (error) {
      if (error.message.includes('401') || error.message.toLowerCase().includes('sign-in') || error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('host sign-in is required')) {
        setShowLogin(true);
        setShowSettings(false);
      } else {
        setImportMessage(error.message);
      }
    }
  };
  const importIdea = async (url) => {
    try { const result = await importEventLink(url); setImportMessage(`Idea received. We are preparing the editable draft: ${result.import.id.slice(-8)}.`); return result; }
    catch (error) { setImportMessage(error.message); throw error; }
  };
  if (openedEvent) return <Invite onBack={() => { setOpenedEvent(null); window.history.pushState({}, '', '/'); }} plan={openedEvent} settings={settings} />;
  if (showLogin) return <LoginScreen onBack={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />;
  if (showInvite) return <Invite onBack={() => { setShowInvite(false); setShowOrganizerInvite(false); }} plan={showOrganizerInvite ? organizerPlan : plan} settings={{ ...settings, invite: { ...settings.invite, limit: showOrganizerInvite ? settings.organizer.capacity : settings.invite.limit, privacy: showOrganizerInvite ? settings.organizer.visibility : settings.invite.privacy } }} />;
  const scrollToPlanner = () => document.querySelector('#planner')?.scrollIntoView({ behavior: 'smooth' });
  const makePlan = (event) => { event.preventDefault(); setMadePlan(true); };
  const vote = (date) => { setPickedDate(date); setDateVotes((current) => ({ ...current, [date]: current[date] + (date === pickedDate ? 0 : 1) })); };

  const handlePlanOutingForFriends = (recommendedActivity) => {
    const activeFriends = FRIENDS_DATA.filter(f => selectedFriends.includes(f.id));
    setFriend(activeFriends.map(f => f.name).join(', '));
    if (recommendedActivity) {
      const activityMatch = settings.activities.find(act => 
        recommendedActivity.name.toLowerCase().includes(act.name.toLowerCase()) || 
        act.name.toLowerCase().includes(recommendedActivity.name.toLowerCase())
      );
      if (activityMatch) {
        setActivityId(activityMatch.id);
      }
      if (recommendedActivity.venue) {
        setSelectedVenue(recommendedActivity.venue);
      }
    }
    setMadePlan(true);
    document.querySelector('#planner')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openSettings = (tab = 'profile') => {
    if (!currentUser) {
      setShowLogin(true);
    } else {
      setSettingsMode(tab);
      setShowSettings(true);
    }
  };
  return <main><SettingsPanel open={showSettings} initialTab={settingsMode} onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} importMessage={importMessage} onImportIdea={importIdea} onCreateOrganizer={createOrganizerEvent} onPreviewOrganizer={() => { setShowSettings(false); setShowOrganizerInvite(true); setShowInvite(true); }} syncStatus={syncStatus} currentUser={currentUser} onLogout={handleLogout} onLoginClick={() => { setShowSettings(false); setShowLogin(true); }} />
    <nav className="nav"><a className="brand" href="#top" aria-label="Good Plans home"><img className="brand-mark" src="/images/good-plans-mark.png" alt="" /><span>good<br /><i>plans</i></span></a><div className="nav-links"><a href="#about">About</a><a href="#how">How it works</a><a href="#ideas">Ideas</a>{currentUser ? (<><button onClick={() => openSettings('profile')}><Settings2 /> Organizer Portal</button><button onClick={handleLogout} className="flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Logout ({currentUser.display_name})</button></>) : (<button onClick={() => setShowLogin(true)} className="flex items-center gap-1"><UsersRound className="w-3.5 h-3.5" /> Organizer Portal</button>)}</div><button className="nav-button" onClick={scrollToPlanner}>Start a plan <ArrowUpRight /></button></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">for busy lives and better friendships</p><h1>Make time.<br /><em>Make it good.</em></h1><p className="hero-lede">Your friends are not another task on the list. Good Plans helps you turn “we should catch up” into a break that works for the people you love.</p><div className="hero-actions"><button className="primary" onClick={scrollToPlanner}>Plan something <ArrowUpRight /></button><button className="text-action" onClick={() => openSettings('profile')}>Organizer Portal <Settings2 /></button></div></div><div className="hero-collage" aria-label="A collage of friends making plans"><div className="hero-picture"><img src="/images/good-plans-hero-sticker.png" alt="A transparent cut-paper collage of friends, a calendar, map, headphones, travel and making" /></div></div></section>
    <section className="ticker" aria-label="Things to plan"><span>the gig</span><i>✳</i><span>the gallery late</span><i>✳</i><span>the one person you never see enough</span><i>✳</i><span>the group escape</span><i>✳</i></section>
    <section className="about" id="about"><div className="about-mark"><img src="/images/good-plans-mark.png" alt="The Good Plans calendar and map-pin mark" /></div><div className="about-copy"><p className="eyebrow">why good plans exists</p><h2>Friendship needs a place in the diary.</h2><p>Life gets full. Work, motherhood and other care, travel, family and the never-ending group chat can make seeing each other feel strangely hard. Good Plans gives the people you care about a little more thought, so a real break can actually happen.</p></div><div className="about-promises"><div><span>01</span><b>Context, not guesswork</b><p>Keep the small details that make a plan feel right: energy, tastes, travel and what to avoid.</p></div><div><span>02</span><b>A plan for the actual people</b><p>Build around a one-to-one, familiar friends, or a new mixed group with different comfort levels.</p></div><div><span>03</span><b>Less arranging, more showing up</b><p>Find a place, agree a time, then send an invite people want to open.</p></div></div></section>
    <section className="bg-white py-12 border-t-2 border-b-2 border-[var(--ink)]">
      <AffinityMatchMatrix selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} onOpenPlanModal={handlePlanOutingForFriends} />
    </section>
    <section className="planner-section" id="planner"><div className="section-intro"><p className="eyebrow">the clever bit</p><h2>Start with your people.</h2><p>Bring the context you already know about your friends. Good Plans pairs it with availability, activity preferences and nearby venues. Nothing in your private notes is sent in an invite.</p><button className="section-settings" onClick={() => openSettings('profile')}><Settings2 /> Edit planning settings</button><button className="organizer-link" onClick={() => openSettings('organizer')}><UsersRound /> Hosting a monthly series? Set it up here.</button></div><form className="planner-card" onSubmit={makePlan}><label>Who are you making time for?<input value={friend} onChange={(event) => setFriend(event.target.value)} list="friends" placeholder="Name or group" /><datalist id="friends">{settings.friends.map((item) => <option key={item.id} value={item.name} />)}{settings.circles.map((item) => <option key={item.id} value={item.name} />)}</datalist></label><label>What could you do?<select value={activityId} onChange={(event) => setActivityId(event.target.value)}>{settings.activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name} · {activity.energy}</option>)}</select></label><label>What kind of moment?<select value={moment} onChange={(event) => setMoment(event.target.value)}><option>A free Sunday afternoon</option><option>A catch-up after work</option><option>A first meeting with new people</option><option>A weekend away</option></select></label><button className="primary create" type="submit"><Sparkles /> Find a good idea</button>{madePlan && <div className="plan-result"><span>For {friend} in {city}</span><b>{selectedActivity?.name || 'Sunday soft launch'}</b><p>{selectedVenue ? `${selectedVenue.name} is the first stop. ${selectedVenue.fit}.` : `Start with ${selectedActivity?.query || 'something that fits'} near you, then choose a venue.`}</p><div className="date-poll"><small>Pick a date to send to the group</small><div>{Object.entries(dateVotes).map(([date, votes]) => <button type="button" key={date} className={pickedDate === date ? 'picked' : ''} onClick={() => vote(date)}><b>{date}</b><span>{votes} votes</span></button>)}</div></div><button type="button" onClick={() => setShowInvite(true)}>Preview the invite <Send /></button></div>}</form></section>
    <GoogleMapsExplorer city={city} activity={selectedActivity?.query} onSelectVenue={(venue) => { setSelectedVenue(venue); setMadePlan(true); document.querySelector('#planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} />
    <section className="ideas" id="ideas"><div className="ideas-head"><p className="eyebrow">start anywhere</p><h2>The plan is the excuse.</h2><p>Good Plans thinks about the details. You get to show up.</p></div><div className="idea-grid">{ideas.map(({ mark, title, note, color }) => <article className={`idea-card ${color}`} key={title}><Doodle type={mark} /><h3>{title}</h3><p>{note}</p><button onClick={() => { const match = settings.activities.find((activity) => activity.name.toLowerCase().includes(title.split(' ')[0].toLowerCase())); if (match) setActivityId(match.id); scrollToPlanner(); }}>Make this a plan <ArrowUpRight /></button></article>)}</div></section>
    <section className="event-promo" id="how"><div className="event-paper"><div className="event-mini-photo"><img src="/images/good-plans-invite-collage.png" alt="A handmade collage of friends gathering around an invitation" /></div><p className="eyebrow">when it comes together</p><h2>Send an invite<br />worth opening.</h2><p>Every finished plan becomes a warm, simple page your friends can keep, read, and RSVP to.</p><button onClick={() => setShowInvite(true)}>See an event page <ArrowUpRight /></button></div><div className="event-aside"><span>01</span><b>Make a plan</b><span>02</span><b>Share the feeling</b><span>03</span><b>Meet there</b></div></section>
    <footer><a className="brand" href="#top"><img className="brand-mark" src="/images/good-plans-mark.png" alt="" /><span>good<br /><i>plans</i></span></a><p>for busy women who want to see their people more.</p><button onClick={() => openSettings('profile')}>Organizer Portal</button><button onClick={() => openSettings('organizer')}>Host a series</button><span>made by luana.systems</span></footer>
  </main>;
}
