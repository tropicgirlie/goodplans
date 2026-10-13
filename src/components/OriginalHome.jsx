import MaterialSelect from "./MaterialSelect";
import LocationPicker from "./LocationPicker";
import { launchSettings, regionDiscoveryLabel } from "../lib/region";
import { BRAZIL_FRIENDS } from "../../shared/brazil";
import { SPAIN_FRIENDS } from "../../shared/spain";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import { ui, localeHref } from "../i18n/core";
import Artwork from "./Artwork";
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
import { localDate, wallDateTime } from "../lib/plans";
import { draftDefaults } from "../lib/planningModel";
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

export const defaultSettings = {
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
  syncError,
  syncRecovery,
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
  const settings = launchSettings(defaultSettings, preferences);
  const activityCopy = (activity, field = "name") => ["gallery", "cinema", "make", "walk"].includes(activity?.id) ? ui(activity[field]) : activity?.[field];
  const setSettings = (updater) =>
    onPreferencesChange(
      typeof updater === "function" ? updater(settings) : updater,
    );
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMode, setSettingsMode] = useState("profile");
  const [friend, setFriend] = useState(settings.profile.country === "BR" ? "Ana" : settings.profile.country === "ES" ? "Lucía" : "Maya");
  const [activityId, setActivityId] = useState("gallery");
  const [moment, setMoment] = useState("A free Sunday afternoon");
  const [madePlan, setMadePlan] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [pickedDate, setPickedDate] = useState("");
  const [selectedFriends, setSelectedFriends] = useState(["f1", "f2"]);
  const [importMessage, setImportMessage] = useState("");
  const city = settings.profile.city;
  const exampleFriends = settings.profile.country === "BR" ? BRAZIL_FRIENDS : settings.profile.country === "ES" ? SPAIN_FRIENDS : FRIENDS_DATA;
  const selectedActivity =
    settings.activities.find((a) => a.id === activityId) ||
    settings.activities[0];

  const setShowLogin = onLogin;
  const handleLogout = onLogout;
  const scrollToPlanner = () =>
    document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" });
  const openSettings = (tab = "profile") => {
    onManage(tab === "organizer" ? "Organiser portal" : "My people");
  };
  const makePlan = (e) => {
    e.preventDefault();
    openPlan();
  };
  const openPlan = () =>
    onCreate({
      title: activityCopy(selectedActivity) || ui("A good day together"),
      date: pickedDate,
      guests: friend
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      location: selectedVenue
        ? [selectedVenue.name, selectedVenue.address].filter(Boolean).join(", ")
        : "",
      city,
      notes: ui(moment),
      capacity: settings.invite.limit,
      plusOne: settings.invite.plusOne,
      showGuests: settings.invite.showGuests,
      reminder: settings.invite.reminder,
      image: "good-plans-invite-collage.png",
    });
  const createOrganizerEvent = () => {
    setShowSettings(false);
    onCreate({
      ...draftDefaults(settings, true),
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
      city: settings.organizer.city,
      image: "good-plans-women-tech-brunch.png",
    });
  };
  const importIdea = async (url) => {
    try {
      const result = await importEventLink(url);
      setImportMessage(
        "Reading the source. You will review the details before publishing.",
      );
      for (let attempt = 0; attempt < 20; attempt++) {
        const { import: source } = await readImportedIdea(result.import.id);
        if (source.status === "failed")
          throw new Error(
            "This page could not be imported. Create a plan manually or try another link.",
          );
        if (source.status === "ready_for_review") {
          const draft = JSON.parse(source.draft_json || "{}");
          const start = draft.startsAt ? new Date(draft.startsAt) : null;
          const valid = start && !Number.isNaN(+start);
          const timezone = draft.timezone || settings.profile.timezone;
          const sourceEnd = draft.endsAt ? new Date(draft.endsAt) : null;
          const end = valid ? sourceEnd && !Number.isNaN(+sourceEnd) && sourceEnd > start ? sourceEnd : new Date(+start + 7200000) : null;
          const time = (d) => wallDateTime(d,timezone).split('T')[1];
          setShowSettings(false);
          onCreate({
            title: draft.title || "",
            date: valid ? localDate(start,timezone) : "",
            timezone,
            startsAt: valid ? start.toISOString() : undefined,
            endsAt: valid ? end.toISOString() : undefined,
            time: valid ? time(start) : "14:00",
            endTime: valid ? time(end) : "16:00",
            endDate: valid && localDate(end,timezone) !== localDate(start,timezone) ? localDate(end,timezone) : "",
            location: [draft.venueName, draft.venueAddress]
              .filter(Boolean)
              .join(", "),
            notes: [draft.description, ui(`Source: ${url}`)]
              .filter(Boolean)
              .join("\n\n"),
            kind: "Single event",
          });
          setImportMessage("Imported details are ready for your review.");
          return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error(
        "The source is still processing. Try again shortly, or create a plan manually.",
      );
    } catch (error) {
      setImportMessage(error.message);
      throw error;
    }
  };
  const handlePlanOutingForFriends = (recommended) => {
    setFriend(
      exampleFriends.filter((f) => selectedFriends.includes(f.id))
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
      {ui(syncRecovery)}
      {syncError && (
        <p className="invite-error" role="alert">
          {ui(syncError)}
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
        <a className="brand" href="#top" aria-label={ui("Good Plans home")}>
          <Artwork
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
          <a href="#about">{ui("About")}</a>
          <a href="#how">{ui("How it works")}</a>
          <a href="#ideas">{ui("Ideas")}</a>
          <button onClick={() => onManage("My plans")}>{ui("My plans")}</button>
          <button onClick={() => onManage("Dublin this week")}>{ui(regionDiscoveryLabel(settings.profile))}</button>
          {currentUser ? (
            <>
              <button onClick={() => onManage("Organiser portal")}>
                <Settings2 />{ui(" My events")}</button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />{ui(" Logout (")}{currentUser.display_name})
              </button>
            </>
          ) : (
            <button
              onClick={() => onManage("Organiser portal")}
              className="flex items-center gap-1"
            >
              <UsersRound className="w-3.5 h-3.5" />{ui(" My events")}</button>
          )}
        </div>
        <LanguageSwitcher />
        <button className="nav-button" onClick={scrollToPlanner}>{ui("Start a plan ")}<ArrowUpRight />
        </button>
      </nav>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{ui("for busy lives and better friendships")}</p>
          <h1>{ui("Make time.")}<br />
            <em>{ui("Make it good.")}</em>
          </h1>
          <p className="hero-lede">{ui("Your friends are not another task on the list. Good Plans helps you turn “we should catch up” into a break that works for the people you love.")}</p>
          <div className="hero-actions">
            <button className="primary" onClick={scrollToPlanner}>{ui("Plan something ")}<ArrowUpRight />
            </button>
            <button
              className="text-action"
              onClick={() => onManage("Organiser portal")}
            >{ui("My events ")}<Settings2 />
            </button>
          </div>
        </div>
        <div
          className="hero-collage"
          aria-label={ui("A collage of friends making plans")}
        >
          <div className="hero-picture">
            <Artwork
              src="/images/good-plans-hero-sticker.png"
              loading="eager"
              fetchPriority="high"
              alt={ui("A transparent cut-paper collage of friends, a calendar, map, headphones, travel and making")}
            />
          </div>
        </div>
      </section>
      <section className="ticker" aria-label={ui("Things to plan")}>
        <span>{ui("the gig")}</span>
        <i>✳</i>
        <span>{ui("the gallery late")}</span>
        <i>✳</i>
        <span>{ui("the one person you never see enough")}</span>
        <i>✳</i>
        <span>{ui("the group escape")}</span>
        <i>✳</i>
      </section>
      <section className="about" id="about">
        <div className="about-mark">
          <Artwork
            src="/images/good-plans-mark.png"
            alt={ui("The Good Plans calendar and map-pin mark")}
          />
        </div>
        <div className="about-copy">
          <p className="eyebrow">{ui("why good plans exists")}</p>
          <h2>{ui("Friendship needs a place in the diary.")}</h2>
          <p>{ui("Life gets full. Work, motherhood and other care, travel, family and the never-ending group chat can make seeing each other feel strangely hard. Good Plans gives the people you care about a little more thought, so a real break can actually happen.")}</p>
        </div>
        <div className="about-promises">
          <div>
            <span>01</span>
            <b>{ui("Context, not guesswork")}</b>
            <p>{ui("Keep the small details that make a plan feel right: energy, tastes, travel and what to avoid.")}</p>
          </div>
          <div>
            <span>02</span>
            <b>{ui("A plan for the actual people")}</b>
            <p>{ui("Build around a one-to-one, familiar friends, or a new mixed group with different comfort levels.")}</p>
          </div>
          <div>
            <span>03</span>
            <b>{ui("Less arranging, more showing up")}</b>
            <p>{ui("Find a place, agree a time, then send an invite people want to open.")}</p>
          </div>
        </div>
      </section>
      <div
        style={{
          background: "var(--paper)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="gp-home-location"><LocationPicker settings={settings} onChange={setSettings}/></div>
        <AffinityMatchMatrix
          friends={exampleFriends}
          city={city}
          preferences={settings}
          selectedFriends={selectedFriends}
          setSelectedFriends={setSelectedFriends}
          onOpenPlanModal={recommended => onCreate({
            title: ui(recommended.name),
            city,
            location: [recommended.venue?.name, recommended.venue?.address].filter(Boolean).join(", "),
            guests: exampleFriends.filter(f => selectedFriends.includes(f.id)).map(f => f.name),
            notes: ui("Example draft: replace the sample guest names and confirm venue details before inviting anyone."),
          })}
          onPersonalise={() => onManage("My people")}
        />
      </div>
      <section className="planner-section" id="planner">
        <div className="section-intro">
          <p className="eyebrow">{ui("the clever bit")}</p>
          <h2>{ui("Start with your people.")}</h2>
          <p>{ui("Try this illustrative planner with a sample name. Review an editable draft, or open your dashboard to save your own friends and private notes. No account needed; sign in when you want to send invitations.")}</p>
          <button
            className="section-settings"
            onClick={() => openSettings("profile")}
          >
            <Settings2 />{ui(" Open my people & planning settings")}</button>
          <button
            className="organizer-link"
            onClick={() => openSettings("organizer")}
          >
            <UsersRound />{ui(" Hosting a monthly series? Set it up here.")}</button>
        </div>
        <form className="planner-card" onSubmit={makePlan}>
          <label>{ui("Who are you making time for?")}<input
              value={friend}
              onChange={(event) => setFriend(event.target.value)}
              list="friends"
              placeholder={settings.profile.country === "BR" ? ui("Example: Ana or Sunday friends") : ui("Example: Maya or Sunday friends")}
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
          <label>{ui("What could you do?")}<MaterialSelect aria-label={ui("What could you do?")}
              value={activityId}
              onChange={(event) => setActivityId(event.target.value)}
            >
              {settings.activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activityCopy(activity)} · {ui(activity.energy)}
                </option>
              ))}
            </MaterialSelect>
          </label>
          <label>{ui("What kind of moment?")}<MaterialSelect aria-label={ui("What kind of moment?")}
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
            >
              <option value={"A free Sunday afternoon"}>{ui("A free Sunday afternoon")}</option>
              <option value={"A catch-up after work"}>{ui("A catch-up after work")}</option>
              <option value={"A first meeting with new people"}>{ui("A first meeting with new people")}</option>
              <option value={"A weekend away"}>{ui("A weekend away")}</option>
            </MaterialSelect>
          </label>
          <button className="primary create" type="submit">
            <Sparkles />{ui(" Review my draft")}</button>
          {madePlan && (
            <div className="plan-result">
              <span>{ui("For ")}{friend}{ui(" in ")}{city}
              </span>
              <b>{activityCopy(selectedActivity) || ui("Sunday soft launch")}</b>
              <p>
                {ui(selectedVenue
                  ? `${selectedVenue.name} is the first stop. ${selectedVenue.fit}.`
                  : `Start with ${selectedActivity?.query || "something that fits"} near you, then choose a venue.`)}
              </p>
              <div className="date-poll">
                <label>{ui("When would you like to go?")}<input
                    type="date"
                    min={localDate(new Date(),settings.profile.timezone)}
                    value={pickedDate}
                    onChange={(e) => setPickedDate(e.target.value)}
                  />
                </label>
                <small>{ui("Leave blank if you’re still deciding.")}</small>
              </div>
              <button type="button" onClick={openPlan}>{ui("Add details & save this plan ")}<Send />
              </button>
            </div>
          )}
        </form>
      </section>
      <GoogleMapsExplorer
        city={city}
        country={settings.profile.country}
        activity={selectedActivity?.query}
        activityLabel={activityCopy(selectedActivity, "query")}
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
          <CalendarDays />{ui("Create a single event")}</button>
        <button
          className="primary"
          onClick={() => onCreate({ kind: "Gathering" })}
        >
          <UsersRound />{ui("Create a gathering")}</button>
        <button className="text-action" onClick={() => onManage("My plans")}>{ui("Saved plans ")}<ArrowUpRight />
        </button>
        <button className="text-action" onClick={() => onManage("My people")}>{ui("My people ")}<UsersRound />
        </button>
        <button
          className="text-action"
          onClick={() => onManage("Dublin this week")}
        >{ui(regionDiscoveryLabel(settings.profile))}<ArrowUpRight />
        </button>
        <button className="text-action" onClick={() => onManage("Saved ideas")}>{ui("Saved ideas ")}<ArrowUpRight />
        </button>
      </div>
      <section className="ideas" id="ideas">
        <div className="ideas-head">
          <p className="eyebrow">{ui("start anywhere")}</p>
          <h2>{ui("The plan is the excuse.")}</h2>
          <p>{ui("Good Plans thinks about the details. You get to show up.")}</p>
        </div>
        <div className="idea-grid">
          {ideas.map(({ mark, title, note, color }) => (
            <article className={`idea-card ${color}`} key={title}>
              <Doodle type={mark} />
              <h3>{ui(title)}</h3>
              <p>{ui(note)}</p>
              <button
                type="button"
                aria-pressed={saved.includes(mark)}
                onClick={() => onBookmark(mark)}
              >
                {ui(saved.includes(mark) ? "Saved ✓" : "Save idea")}
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
              >{ui("Make this a plan ")}<ArrowUpRight />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="event-promo" id="how">
        <div className="event-paper">
          <div className="event-mini-photo">
            <Artwork
              src="/images/good-plans-invite-collage.png"
              alt={ui("A handmade collage of friends gathering around an invitation")}
            />
          </div>
          <p className="eyebrow">{ui("when it comes together")}</p>
          <h2>{ui("Send an invite")}<br />{ui("worth opening.")}</h2>
          <p>{ui("Every finished plan becomes a warm, simple page your friends can keep, read, and RSVP to.")}</p>
          <button onClick={openPlan}>{ui("See an event page ")}<ArrowUpRight />
          </button>
        </div>
        <div className="event-aside">
          <span>01</span>
          <b>{ui("Make a plan")}</b>
          <span>02</span>
          <b>{ui("Share the feeling")}</b>
          <span>03</span>
          <b>{ui("Meet there")}</b>
        </div>
      </section>
      <footer><a href={localeHref("/?page=privacy")}>{ui("Privacy")}</a><a href={localeHref("/?page=support")}>{ui("Help & data requests")}</a>
        <a className="brand" href="#top">
          <Artwork
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
        <p>{ui("for busy women who want to see their people more.")}</p>
        <button onClick={() => onManage("Organiser portal")}>{ui("My events")}</button>
        <button onClick={() => openSettings("organizer")}>{ui("Host a series")}</button>
        <span>{ui("made by luana.systems")}</span>
      </footer>
    </main>
  );
}
