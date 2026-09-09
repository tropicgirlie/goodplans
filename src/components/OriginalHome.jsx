import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Music2,
  Paintbrush,
  Send,
  Settings2,
  Sparkles,
  UsersRound,
  LogOut,
} from "lucide-react";
import GoogleMapsExplorer from "./GoogleMapsExplorer";
import SettingsPanel from "./SettingsPanel";
import AffinityMatchMatrix from "./AffinityMatchMatrix";
import { FRIENDS_DATA } from "../data/mockData";
import { importEventLink, readImportedIdea } from "../lib/goodPlansApi";
import { localDate } from "../lib/plans";
const ideas = [
  {
    mark: "make",
    title: "Make something",
    note: "Pottery, collage, or an after-hours workshop",
    color: "coral",
  },
  {
    mark: "loud",
    title: "Go somewhere loud",
    note: "A gig, a tiny cinema, a dance floor",
    color: "blue",
  },
  {
    mark: "city",
    title: "See your city",
    note: "A new neighbourhood, market, or exhibition",
    color: "olive",
  },
  {
    mark: "away",
    title: "Get away",
    note: "A day trip, sleepover, or long weekend",
    color: "orange",
  },
];

const defaultSettings = {
  profile: {
    city: "Dublin",
    radius: "25 km",
    budget: "€€",
    pace: "Easy going",
    openToNew: true,
  },
  activities: [
    {
      id: "gallery",
      name: "Gallery late",
      query: "contemporary art gallery",
      energy: "Easy",
      format: "One-to-one",
    },
    {
      id: "cinema",
      name: "Tiny cinema",
      query: "independent cinema",
      energy: "Easy",
      format: "Any group",
    },
    {
      id: "make",
      name: "Make something",
      query: "pottery or creative workshop",
      energy: "Social",
      format: "Small group",
    },
    {
      id: "walk",
      name: "Out of town",
      query: "coastal walk or day trip",
      energy: "Fresh air",
      format: "Any group",
    },
  ],
  friends: [
    {
      id: "maya",
      name: "Maya",
      likes: "film, new food, a slower Sunday",
      avoids: "packed places and very late nights",
      visibility: "Only me",
    },
    {
      id: "katie",
      name: "Katie",
      likes: "music, making things, meeting people",
      avoids: "long travel days",
      visibility: "Only me",
    },
  ],
  circles: [
    { id: "sunday", name: "Sunday people", members: 5 },
    { id: "work-friends", name: "Work friends", members: 4 },
  ],
  availability: {
    days: ["Thu", "Sat", "Sun"],
    window: "Sunday daytime",
    reminders: true,
  },
  discovery: {
    vibe: "Independent and local",
    timing: "Weekend",
    accessible: true,
    shortlist: true,
  },
  invite: {
    privacy: "Invite link only",
    limit: 12,
    showGuests: true,
    reminder: true,
    plusOne: false,
  },
  organizer: {
    seriesName: "Women in Tech Brunch",
    city: "Dublin",
    cadence: "Once a month",
    capacity: 24,
    nextDate: "2026-10-19",
    visibility: "Invite only",
    note: "A low-pressure table for women working in and around technology.",
    template: true,
    publicReady: false,
  },
};

function Sticker({ icon: Icon, className = "" }) {
  return (
    <span className={`sticker ${className}`}>
      <Icon aria-hidden="true" strokeWidth={2.3} />
    </span>
  );
}
function Doodle({ type }) {
  return (
    <span className={`doodle doodle-${type}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function OriginalHome({
  syncError, syncRecovery,
  preferences,
  onPreferencesChange,
  syncStatus,
  onCreate,
  onManage,
  onLogin,
  currentUser,
  onLogout,
  saved,
  onBookmark,
}) {
  const settings = { ...defaultSettings, ...preferences };
  for (const key of [
    "profile",
    "availability",
    "discovery",
    "invite",
    "organizer",
  ])
    settings[key] = { ...defaultSettings[key], ...preferences?.[key] };
  const setSettings = (updater) =>
    onPreferencesChange(
      typeof updater === "function" ? updater(settings) : updater,
    );
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMode, setSettingsMode] = useState("profile");
  const [friend, setFriend] = useState("Maya");
  const [activityId, setActivityId] = useState("gallery");
  const [moment, setMoment] = useState("A free Sunday afternoon");
  const [madePlan, setMadePlan] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [pickedDate, setPickedDate] = useState("");
  const [selectedFriends, setSelectedFriends] = useState(["f1", "f2"]);
  const [importMessage, setImportMessage] = useState("");
  const city = settings.profile.city;
  const selectedActivity =
    settings.activities.find((a) => a.id === activityId) ||
    settings.activities[0];

  const setShowLogin = onLogin;
  const handleLogout = onLogout;
  const scrollToPlanner = () =>
    document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" });
  const openSettings = (tab = "profile") => {
    setSettingsMode(tab);
    setShowSettings(true);
  };
  const makePlan = (e) => {
    e.preventDefault();
    setMadePlan(true);
  };
  const openPlan = () =>
    onCreate({
      title: selectedActivity?.name || "A good day together",
      date: pickedDate,
      guests: friend
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      location: selectedVenue
        ? [selectedVenue.name, selectedVenue.address].filter(Boolean).join(", ")
        : "",
      notes: moment,
      capacity: settings.invite.limit,
      plusOne: settings.invite.plusOne,
      showGuests: settings.invite.showGuests,
      reminder: settings.invite.reminder,
      image: "good-plans-invite-collage.png",
    });
  const createOrganizerEvent = () => {
    setShowSettings(false);
    onCreate({
      kind: "Gathering",
      seriesName: settings.organizer.seriesName,
      cadence: settings.organizer.cadence,
      occurrences: 3,
      plusOne: settings.invite.plusOne,
      showGuests: settings.invite.showGuests,
      reminder: settings.invite.reminder,
      title: settings.organizer.seriesName,
      date: settings.organizer.nextDate,
      notes: settings.organizer.note,
      capacity: settings.organizer.capacity,
      location: settings.organizer.city,
      image: "good-plans-women-tech-brunch.png",
    });
  };
  const importIdea = async (url) => {
    try {
      const result=await importEventLink(url);
      setImportMessage('Reading the source. You will review the details before publishing.');
      for(let attempt=0;attempt<20;attempt++){
        const {import:source}=await readImportedIdea(result.import.id);
        if(source.status==='failed')throw new Error('This page could not be imported. Create a plan manually or try another link.');
        if(source.status==='ready_for_review'){
          const draft=JSON.parse(source.draft_json||'{}');const start=draft.startsAt?new Date(draft.startsAt):null;
          const valid=start&&!Number.isNaN(+start);const time=d=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
          setShowSettings(false);onCreate({title:draft.title||'',date:valid?localDate(start):'',time:valid?time(start):'14:00',endTime:valid?time(new Date(+start+7200000)):'16:00',location:[draft.venueName,draft.venueAddress].filter(Boolean).join(', '),notes:[draft.description,`Source: ${url}`].filter(Boolean).join('\n\n'),kind:'Single event'});setImportMessage('Imported details are ready for your review.');return result;
        }
        await new Promise(resolve=>setTimeout(resolve,1000));
      }
      throw new Error('The source is still processing. Try again shortly, or create a plan manually.');
    }catch(error){setImportMessage(error.message);throw error;}
  };
  const handlePlanOutingForFriends = (recommended) => {
    setFriend(
      FRIENDS_DATA.filter((f) => selectedFriends.includes(f.id))
        .map((f) => f.name)
        .join(", "),
    );
    const match = settings.activities.find((a) =>
      recommended?.name?.toLowerCase().includes(a.name.toLowerCase()),
    );
    if (match) setActivityId(match.id);
    if (recommended?.venue) setSelectedVenue(recommended.venue);
    setMadePlan(true);
    scrollToPlanner();
  };
  return (
    <main className="original-site">
      {syncRecovery}
      {syncError && (
        <p className="invite-error" role="alert">
          {syncError}
        </p>
      )}
      <SettingsPanel
        open={showSettings}
        initialTab={settingsMode}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
        importMessage={importMessage}
        onImportIdea={importIdea}
        onCreateOrganizer={createOrganizerEvent}
        onPreviewOrganizer={createOrganizerEvent}
        syncStatus={syncStatus}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => {
          setShowSettings(false);
          setShowLogin(true);
        }}
      />
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Good Plans home">
          <img
            className="brand-mark"
            src="/images/good-plans-mark.png"
            alt=""
          />
          <span>
            good
            <br />
            <i>plans</i>
          </span>
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#how">How it works</a>
          <a href="#ideas">Ideas</a>
          <button onClick={() => onManage("My plans")}>My plans</button>
          {currentUser ? (
            <>
              <button onClick={() => onManage("Organiser portal")}>
                <Settings2 /> Organizer Portal
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout (
                {currentUser.display_name})
              </button>
            </>
          ) : (
            <button
              onClick={() => onManage("Organiser portal")}
              className="flex items-center gap-1"
            >
              <UsersRound className="w-3.5 h-3.5" /> Organizer Portal
            </button>
          )}
        </div>
        <button className="nav-button" onClick={scrollToPlanner}>
          Start a plan <ArrowUpRight />
        </button>
      </nav>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">for busy lives and better friendships</p>
          <h1>
            Make time.
            <br />
            <em>Make it good.</em>
          </h1>
          <p className="hero-lede">
            Your friends are not another task on the list. Good Plans helps you
            turn “we should catch up” into a break that works for the people you
            love.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={scrollToPlanner}>
              Plan something <ArrowUpRight />
            </button>
            <button
              className="text-action"
              onClick={() => onManage("Organiser portal")}
            >
              Organizer Portal <Settings2 />
            </button>
          </div>
        </div>
        <div
          className="hero-collage"
          aria-label="A collage of friends making plans"
        >
          <div className="hero-picture">
            <img
              src="/images/good-plans-hero-sticker.png"
              alt="A transparent cut-paper collage of friends, a calendar, map, headphones, travel and making"
            />
          </div>
        </div>
      </section>
      <section className="ticker" aria-label="Things to plan">
        <span>the gig</span>
        <i>✳</i>
        <span>the gallery late</span>
        <i>✳</i>
        <span>the one person you never see enough</span>
        <i>✳</i>
        <span>the group escape</span>
        <i>✳</i>
      </section>
      <section className="about" id="about">
        <div className="about-mark">
          <img
            src="/images/good-plans-mark.png"
            alt="The Good Plans calendar and map-pin mark"
          />
        </div>
        <div className="about-copy">
          <p className="eyebrow">why good plans exists</p>
          <h2>Friendship needs a place in the diary.</h2>
          <p>
            Life gets full. Work, motherhood and other care, travel, family and
            the never-ending group chat can make seeing each other feel
            strangely hard. Good Plans gives the people you care about a little
            more thought, so a real break can actually happen.
          </p>
        </div>
        <div className="about-promises">
          <div>
            <span>01</span>
            <b>Context, not guesswork</b>
            <p>
              Keep the small details that make a plan feel right: energy,
              tastes, travel and what to avoid.
            </p>
          </div>
          <div>
            <span>02</span>
            <b>A plan for the actual people</b>
            <p>
              Build around a one-to-one, familiar friends, or a new mixed group
              with different comfort levels.
            </p>
          </div>
          <div>
            <span>03</span>
            <b>Less arranging, more showing up</b>
            <p>
              Find a place, agree a time, then send an invite people want to
              open.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white py-12 border-t-2 border-b-2 border-[var(--ink)]">
        <p className="original-demo-note">
          Example circle · sample friends and compatibility scores
        </p>
        <AffinityMatchMatrix
          selectedFriends={selectedFriends}
          setSelectedFriends={setSelectedFriends}
          onOpenPlanModal={handlePlanOutingForFriends}
        />
      </section>
      <section className="planner-section" id="planner">
        <div className="section-intro">
          <p className="eyebrow">the clever bit</p>
          <h2>Start with your people.</h2>
          <p>
            Bring the context you already know about your friends. Good Plans
            pairs it with availability, activity preferences and nearby venues.
            Nothing in your private notes is sent in an invite.
          </p>
          <button
            className="section-settings"
            onClick={() => openSettings("profile")}
          >
            <Settings2 /> Edit planning settings
          </button>
          <button
            className="organizer-link"
            onClick={() => openSettings("organizer")}
          >
            <UsersRound /> Hosting a monthly series? Set it up here.
          </button>
        </div>
        <form className="planner-card" onSubmit={makePlan}>
          <label>
            Who are you making time for?
            <input
              value={friend}
              onChange={(event) => setFriend(event.target.value)}
              list="friends"
              placeholder="Name or group"
            />
            <datalist id="friends">
              {settings.friends.map((item) => (
                <option key={item.id} value={item.name} />
              ))}
              {settings.circles.map((item) => (
                <option key={item.id} value={item.name} />
              ))}
            </datalist>
          </label>
          <label>
            What could you do?
            <select
              value={activityId}
              onChange={(event) => setActivityId(event.target.value)}
            >
              {settings.activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} · {activity.energy}
                </option>
              ))}
            </select>
          </label>
          <label>
            What kind of moment?
            <select
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
            >
              <option>A free Sunday afternoon</option>
              <option>A catch-up after work</option>
              <option>A first meeting with new people</option>
              <option>A weekend away</option>
            </select>
          </label>
          <button className="primary create" type="submit">
            <Sparkles /> Find a good idea
          </button>
          {madePlan && (
            <div className="plan-result">
              <span>
                For {friend} in {city}
              </span>
              <b>{selectedActivity?.name || "Sunday soft launch"}</b>
              <p>
                {selectedVenue
                  ? `${selectedVenue.name} is the first stop. ${selectedVenue.fit}.`
                  : `Start with ${selectedActivity?.query || "something that fits"} near you, then choose a venue.`}
              </p>
              <div className="date-poll">
                <label>
                  When would you like to go?
                  <input
                    type="date"
                    min={localDate()}
                    value={pickedDate}
                    onChange={(e) => setPickedDate(e.target.value)}
                  />
                </label>
                <small>Leave blank if you’re still deciding.</small>
              </div>
              <button type="button" onClick={openPlan}>
                Add details &amp; save this plan <Send />
              </button>
            </div>
          )}
        </form>
      </section>
      <GoogleMapsExplorer
        city={city}
        activity={selectedActivity?.query}
        onSelectVenue={(venue) => {
          setSelectedVenue(venue);
          setMadePlan(true);
          document
            .querySelector("#planner")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />
      <div className="original-plan-tools">
        <button
          className="primary"
          onClick={() => onCreate({ kind: "Single event" })}
        >
          <CalendarDays />
          Create a single event
        </button>
        <button
          className="primary"
          onClick={() => onCreate({ kind: "Gathering" })}
        >
          <UsersRound />
          Create a gathering
        </button>
        <button className="text-action" onClick={() => onManage("My plans")}>
          Saved plans <ArrowUpRight />
        </button>
        <button className="text-action" onClick={() => onManage("My people")}>
          My people <UsersRound />
        </button>
        <button className="text-action" onClick={() => onManage("Saved ideas")}>
          Saved ideas <ArrowUpRight />
        </button>
      </div>
      <section className="ideas" id="ideas">
        <div className="ideas-head">
          <p className="eyebrow">start anywhere</p>
          <h2>The plan is the excuse.</h2>
          <p>Good Plans thinks about the details. You get to show up.</p>
        </div>
        <div className="idea-grid">
          {ideas.map(({ mark, title, note, color }) => (
            <article className={`idea-card ${color}`} key={title}>
              <Doodle type={mark} />
              <h3>{title}</h3>
              <p>{note}</p>
              <button
                type="button"
                aria-pressed={saved.includes(mark)}
                onClick={() => onBookmark(mark)}
              >
                {saved.includes(mark) ? "Saved ✓" : "Save idea"}
              </button>
              <button
                onClick={() => {
                  const activity = {
                    make: "make",
                    loud: "cinema",
                    city: "gallery",
                    away: "walk",
                  }[mark];
                  setActivityId(activity);
                  scrollToPlanner();
                }}
              >
                Make this a plan <ArrowUpRight />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="event-promo" id="how">
        <div className="event-paper">
          <div className="event-mini-photo">
            <img
              src="/images/good-plans-invite-collage.png"
              alt="A handmade collage of friends gathering around an invitation"
            />
          </div>
          <p className="eyebrow">when it comes together</p>
          <h2>
            Send an invite
            <br />
            worth opening.
          </h2>
          <p>
            Every finished plan becomes a warm, simple page your friends can
            keep, read, and RSVP to.
          </p>
          <button onClick={openPlan}>
            See an event page <ArrowUpRight />
          </button>
        </div>
        <div className="event-aside">
          <span>01</span>
          <b>Make a plan</b>
          <span>02</span>
          <b>Share the feeling</b>
          <span>03</span>
          <b>Meet there</b>
        </div>
      </section>
      <footer>
        <a className="brand" href="#top">
          <img
            className="brand-mark"
            src="/images/good-plans-mark.png"
            alt=""
          />
          <span>
            good
            <br />
            <i>plans</i>
          </span>
        </a>
        <p>for busy women who want to see their people more.</p>
        <button onClick={() => onManage("Organiser portal")}>
          Organizer Portal
        </button>
        <button onClick={() => openSettings("organizer")}>Host a series</button>
        <span>made by luana.systems</span>
      </footer>
    </main>
  );
}
