import MaterialSelect from "./MaterialSelect";
import LocationPicker from "./LocationPicker";
import { ui, dateLocale } from "../i18n/core";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  MapPin,
  Plus,
  Settings2,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";

import { personError, personRecord } from "../lib/planningModel";

const tabs = [
  ["profile", "You", CircleUserRound],
  ["activities", "Activities", Plus],
  ["people", "People", UsersRound],
  ["availability", "Availability", CalendarDays],
  ["discovery", "Discovery", MapPin],
  ["invite", "Invite defaults", SlidersHorizontal],
  ["organizer", "Host a series", Settings2],
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Toggle({ checked, onChange, label, note }) {
  return (
    <label className="setting-toggle">
      <span>
        <b>{ui(label)}</b>
        {note && <small>{ui(note)}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
}

export default function SettingsPanel({
  open,
  onClose,
  settings,
  setSettings,
  initialTab = "profile",
  onPreviewOrganizer,
  onCreateOrganizer,
  onImportIdea,
  importMessage,
  syncStatus,
  currentUser,
  onLogout,
  onLoginClick,
}) {
  const dialogRef = useRef(null);
  const [friendError, setFriendError] = useState("");
  const [tab, setTab] = useState(initialTab);
  const [activityName, setActivityName] = useState("");
  const [activityQuery, setActivityQuery] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendLikes, setFriendLikes] = useState("");
  const [friendAvoids, setFriendAvoids] = useState("");
  const [ideaUrl, setIdeaUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    dialog.querySelector(".settings-header button")?.focus();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  if (!open) return null;

  const update = (section, field, value) =>
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  const updateProfile = (field, value) => update("profile", field, value);
  const remove = (section, id) =>
    setSettings((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== id),
    }));
  const addActivity = (event) => {
    event.preventDefault();
    if (!activityName.trim()) return;
    setSettings((current) => ({
      ...current,
      activities: [
        ...current.activities,
        {
          id: `activity-${Date.now()}`,
          name: activityName.trim(),
          query: activityQuery.trim() || activityName.trim(),
          energy: "Easy",
          format: "Any group",
        },
      ],
    }));
    setActivityName("");
    setActivityQuery("");
  };
  const addFriend = (event) => {
    event.preventDefault();
    const message = personError(friendName, settings.friends);
    if (message) { setFriendError(message); return; }
    setFriendError("");
    setSettings(current => ({ ...current, friends: [...current.friends, personRecord(null, { name: friendName, likes: friendLikes, avoids: friendAvoids })] }));
    setFriendName("");
    setFriendLikes("");
    setFriendAvoids("");
  };
  const importIdea = async (event) => {
    event.preventDefault();
    if (!ideaUrl.trim() || !onImportIdea) return;
    setIsImporting(true);
    try {
      await onImportIdea(ideaUrl.trim());
      setIdeaUrl("");
    } catch {
      /* The parent renders the helpful error. */
    } finally {
      setIsImporting(false);
    }
  };
  const organizerDate = new Date(settings.organizer.nextDate);
  const organizerDateLabel = Number.isNaN(organizerDate.getTime())
    ? settings.organizer.nextDate
    : new Intl.DateTimeFormat(dateLocale(), {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(organizerDate);

  return (
    <dialog
      ref={dialogRef}
      className="settings-layer"
      aria-label={ui("Planning settings")}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === dialogRef.current) onClose(); }}
    >
      <aside className="settings-panel">
        <header className="settings-header">
          <div>
            <p className="eyebrow">{ui("make the plan yours")}</p>
            <h2>{ui("Planning settings")}</h2>
          </div>
          <button onClick={onClose} aria-label={ui("Close settings")}>
            <X />
          </button>
        </header>
        <div className="settings-layout">
          <nav className="settings-tabs" aria-label={ui("Settings sections")}>
            {tabs.map(([id, label, Icon]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                <Icon /> {ui(label)}
                <ChevronRight />
              </button>
            ))}
          </nav>
          <div className="settings-body">
            {tab === "profile" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("your starting point")}</p>
                <h3>{ui("Where, when, and at what pace?")}</h3>
                <div
                  className="organizer-status"
                  style={{ margin: "18px 0 24px" }}
                >
                  <span>{ui("Account Identity")}</span>
                  {currentUser ? (
                    <div>
                      <b
                        style={{
                          fontSize: "18px",
                          display: "block",
                          lineHeight: 1.1,
                        }}
                      >{ui("Logged in as ")}{currentUser.display_name}
                      </b>
                      <small
                        style={{
                          display: "block",
                          color: "#625b47",
                          marginTop: "3px",
                        }}
                      >
                        {currentUser.email}
                      </small>
                      <button
                        onClick={onLogout}
                        style={{
                          border: 0,
                          background: "none",
                          padding: 0,
                          font: "inherit",
                          fontSize: "11px",
                          color: "var(--hot)",
                          textDecoration: "underline",
                          fontWeight: 700,
                          marginTop: "8px",
                          cursor: "pointer",
                        }}
                      >{ui("Log out of host account")}</button>
                    </div>
                  ) : (
                    <div>
                      <b
                        style={{
                          fontSize: "18px",
                          display: "block",
                          lineHeight: 1.1,
                        }}
                      >{ui("Saved locally on this device")}</b>
                      <small
                        style={{
                          display: "block",
                          color: "#625b47",
                          marginTop: "3px",
                        }}
                      >{ui("Sign in to send invitations. Account sync is optional and can be enabled in your dashboard.")}</small>
                      <button
                        onClick={onLoginClick}
                        style={{
                          border: 0,
                          background: "none",
                          padding: 0,
                          font: "inherit",
                          fontSize: "11px",
                          color: "var(--blue)",
                          textDecoration: "underline",
                          fontWeight: 700,
                          marginTop: "8px",
                          cursor: "pointer",
                        }}
                      >{ui("Sign in as Host")}</button>
                    </div>
                  )}
                </div>
                <div className="setting-grid">
                  <LocationPicker settings={settings} onChange={setSettings} timezones/>
                  <label>{ui("Travel radius")}<MaterialSelect aria-label={ui("Travel radius")}
                      value={settings.profile.radius}
                      onChange={(e) => updateProfile("radius", e.target.value)}
                    >
                      <option value={"5 km"}>{ui("5 km")}</option>
                      <option value={"15 km"}>{ui("15 km")}</option>
                      <option value={"25 km"}>{ui("25 km")}</option>
                      <option value={"Happy to travel"}>{ui("Happy to travel")}</option>
                    </MaterialSelect>
                  </label>
                  <label>{ui("Budget comfort")}<MaterialSelect aria-label={ui("Budget comfort")}
                      value={settings.profile.budget}
                      onChange={(e) => updateProfile("budget", e.target.value)}
                    >
                      <option value={"Keep it free"}>{ui("Keep it free")}</option>
                      {(settings.profile.country === "BR" ? ["R$", "R$ R$", "R$ R$ R$"] : ["€", "€€", "€€€"]).map(budget=><option value={budget} key={budget}>{budget}</option>)}
                    </MaterialSelect>
                  </label>
                  <label>{ui("Usual social pace")}<MaterialSelect aria-label={ui("Usual social pace")}
                      value={settings.profile.pace}
                      onChange={(e) => updateProfile("pace", e.target.value)}
                    >
                      <option value={"Low key"}>{ui("Low key")}</option>
                      <option value={"Easy going"}>{ui("Easy going")}</option>
                      <option value={"Up for anything"}>{ui("Up for anything")}</option>
                    </MaterialSelect>
                  </label>
                </div>
                <p className="setting-copy">{ui("City and social pace help order starter ideas. Budget and travel distance are planning notes; confirm prices, travel and opening hours with the venue.")}</p>
                <Toggle
                  label={ui("Open to meeting new people")}
                  note={ui("Used only when you make a mixed-group plan.")}
                  checked={settings.profile.openToNew}
                  onChange={(value) => updateProfile("openToNew", value)}
                />
              </section>
            )}
            {tab === "activities" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("your activity palette")}</p>
                <h3>{ui("Things worth making time for.")}</h3>
                <p className="setting-copy">{ui("Keep a palette of activities to use when choosing your next plan. Add the specific things your people actually enjoy.")}</p>
                <div className="activity-list">
                  {settings.activities.map((activity) => (
                    <div className="saved-item" key={activity.id}>
                      <span className="saved-mark">✳</span>
                      <div>
                        <b>{["gallery", "cinema", "make", "walk"].includes(activity.id) ? ui(activity.name) : activity.name}</b>
                        <small>{ui("Search: ")}{["gallery", "cinema", "make", "walk"].includes(activity.id) ? ui(activity.query) : activity.query} · {ui(activity.energy)}
                        </small>
                      </div>
                      <button
                        onClick={() => remove("activities", activity.id)}
                        aria-label={ui(`Remove ${["gallery", "cinema", "make", "walk"].includes(activity.id) ? ui(activity.name) : activity.name}`)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <form className="compact-form" onSubmit={addActivity}>
                  <label>{ui("Activity name")}<input
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      placeholder={ui("e.g. gallery late")}
                    />
                  </label>
                  <label>{ui("Keywords for the shortlist")}<input
                      value={activityQuery}
                      onChange={(e) => setActivityQuery(e.target.value)}
                      placeholder={ui("e.g. contemporary art gallery")}
                    />
                  </label>
                  <button type="submit">
                    <Plus />{ui(" Add activity")}</button>
                </form>
              </section>
            )}
            {tab === "people" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("friends and circles")}</p>
                <h3>{ui("Keep the useful context.")}</h3>
                <p className="setting-copy">{ui("Interests help order your ideas on this device. Notes and preferences are never included in invitations.")}</p>
                <div className="people-list">
                  {settings.friends.map((friend) => (
                    <div className="person-item" key={friend.id}>
                      <span>{friend.name.slice(0, 1)}</span>
                      <div>
                        <b>{friend.name}</b>
                        <small>{friend.note || ui("No private notes yet")}</small>
                        {friend.likes && <small>{ui("Likes: ")}{friend.likes}</small>}
                        {friend.avoids && <small>{ui("Avoids: ")}{friend.avoids}</small>}
                      </div>
                      <button
                        onClick={() => remove("friends", friend.id)}
                        aria-label={ui(`Remove ${friend.name}`)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <form className="compact-form friend-form" onSubmit={addFriend}>
                  <label>{ui("Name")}<input
                      maxLength={80}
                      required
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      placeholder={ui("Friend's name")}
                    />
                  </label>
                  <label>{ui("They tend to love")}<input
                      maxLength={300}
                      value={friendLikes}
                      onChange={(e) => setFriendLikes(e.target.value)}
                      placeholder={ui("live music, a long walk")}
                    />
                  </label>
                  <label>{ui("They would skip")}<input
                      maxLength={300}
                      value={friendAvoids}
                      onChange={(e) => setFriendAvoids(e.target.value)}
                      placeholder={ui("busy queues, late nights")}
                    />
                  </label>
                  <button type="submit">
                    <Plus />{ui(" Add person")}</button>
                </form>
                {friendError && <p role="alert">{ui(friendError)}</p>}
                <div className="circle-row">
                  <b>{ui("Your circles")}</b>
                  {(settings.circles || []).map((circle) => (
                    <span key={circle.id}>
                      {circle.name} · {ui(circle.members)}{ui(" people")}</span>
                  ))}
                </div>
              </section>
            )}
            {tab === "availability" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("availability and voting")}</p>
                <h3>{ui("Give a little, not your whole calendar.")}</h3>
                <p className="setting-copy">{ui("Choose the days that are usually possible. Choose the exact event dates in your plan.")}</p>
                <div className="day-picker">
                  {days.map((day) => (
                    <button
                      key={day}
                      className={
                        settings.availability.days.includes(day) ? "picked" : ""
                      }
                      onClick={() =>
                        update(
                          "availability",
                          "days",
                          settings.availability.days.includes(day)
                            ? settings.availability.days.filter(
                                (item) => item !== day,
                              )
                            : [...settings.availability.days, day],
                        )
                      }
                    >
                      {ui(day)}
                    </button>
                  ))}
                </div>
                <label className="wide-setting">{ui("Comfortable window")}<MaterialSelect aria-label={ui("Comfortable window")}
                    value={settings.availability.window}
                    onChange={(e) =>
                      update("availability", "window", e.target.value)
                    }
                  >
                    <option value={"After work"}>{ui("After work")}</option>
                    <option value={"Saturday daytime"}>{ui("Saturday daytime")}</option>
                    <option value={"Sunday daytime"}>{ui("Sunday daytime")}</option>
                    <option value={"Flexible"}>{ui("Flexible")}</option>
                  </MaterialSelect>
                </label>
                <p className="setting-copy">{ui("Choose email reminders separately for each plan before publishing.")}</p>
              </section>
            )}
            {tab === "discovery" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("city discovery")}</p>
                <h3>{ui("A few preferences for your shortlist.")}</h3>
                <div className="setting-grid">
                  <label>{ui("Venue vibe")}<MaterialSelect aria-label={ui("Venue vibe")}
                      value={settings.discovery.vibe}
                      onChange={(e) =>
                        update("discovery", "vibe", e.target.value)
                      }
                    >
                      <option value={"Independent and local"}>{ui("Independent and local")}</option>
                      <option value={"Easy and familiar"}>{ui("Easy and familiar")}</option>
                      <option value={"Creative and unusual"}>{ui("Creative and unusual")}</option>
                      <option value={"Outdoors first"}>{ui("Outdoors first")}</option>
                    </MaterialSelect>
                  </label>
                  <label>{ui("Preferred time")}<MaterialSelect aria-label={ui("Preferred time")}
                      value={settings.discovery.timing}
                      onChange={(e) =>
                        update("discovery", "timing", e.target.value)
                      }
                    >
                      <option value="Open now">{ui("Open now — confirm with venue")}</option>
                      <option value={"Weekend"}>{ui("Weekend")}</option>
                      <option value={"After work"}>{ui("After work")}</option>
                      <option value={"Any time"}>{ui("Any time")}</option>
                    </MaterialSelect>
                  </label>
                </div>
                <Toggle
                  label={ui("Prioritise accessibility notes")}
                  note={ui("Flag venue details for the organiser to check.")}
                  checked={settings.discovery.accessible}
                  onChange={(value) => update("discovery", "accessible", value)}
                />
                <Toggle
                  label={ui("Show a small shortlist")}
                  note={ui("Start with four thoughtful options, not a wall of search results.")}
                  checked={settings.discovery.shortlist}
                  onChange={(value) => update("discovery", "shortlist", value)}
                />
              </section>
            )}
            {tab === "invite" && (
              <section className="setting-section">
                <p className="setting-kicker">{ui("invite defaults")}</p>
                <h3>{ui("What should your friends see?")}</h3>
                <div className="setting-grid">
                  <label>{ui("Default privacy")}<MaterialSelect aria-label={ui("Default privacy")}
                      value={settings.invite.privacy}
                      onChange={(e) =>
                        update("invite", "privacy", e.target.value)
                      }
                    >
                      <option value={"Invite link only"}>{ui("Invite link only")}</option>
                    </MaterialSelect>
                  </label>
                  <label>{ui("Guest limit")}<input
                      type="number"
                      min="2"
                      max="100"
                      value={settings.invite.limit}
                      onChange={(e) =>
                        update("invite", "limit", Number(e.target.value))
                      }
                    />
                  </label>
                </div>
                <Toggle
                  label={ui("Show the guest list")}
                  note={ui("Everyone can see who has said yes.")}
                  checked={settings.invite.showGuests}
                  onChange={(value) => update("invite", "showGuests", value)}
                />
                <Toggle
                  label={ui("Send a gentle reminder")}
                  note={ui("A reminder within 24 hours before each event, for guests with email addresses.")}
                  checked={settings.invite.reminder}
                  onChange={(value) => update("invite", "reminder", value)}
                />
                <Toggle
                  label={ui("Let guests bring someone")}
                  checked={settings.invite.plusOne}
                  onChange={(value) => update("invite", "plusOne", value)}
                />
              </section>
            )}
            {tab === "organizer" && (
              <section className="setting-section organizer-section">
                <p className="setting-kicker">{ui("your organiser space")}</p>
                <h3>{ui("Your next regular gathering.")}</h3>
                <p className="setting-copy">{ui("A reusable event template, kept separate from your personal plans and private friend notes.")}</p>
                <div className="organizer-status">
                  <span>{ui("Next gathering")}</span>
                  <b>{ui(organizerDateLabel)}</b>
                  <small>{ui(settings.organizer.visibility)}{ui(" · draft")}</small>
                </div>
                <div className="setting-grid">
                  <label>{ui("Series name")}<input
                      value={settings.organizer.seriesName}
                      onChange={(e) =>
                        update("organizer", "seriesName", e.target.value)
                      }
                    />
                  </label>
                  <label>{ui("Default city")}<input
                      value={settings.organizer.city}
                      readOnly
                    />
                  </label>
                  <label>{ui("Cadence")}<MaterialSelect aria-label={ui("Cadence")}
                      value={settings.organizer.cadence}
                      onChange={(e) =>
                        update("organizer", "cadence", e.target.value)
                      }
                    >
                      <option value="Weekly">{ui("Every week")}</option>
                      <option value={"Once a month"}>{ui("Once a month")}</option>
                      <option value={"Every six weeks"}>{ui("Every six weeks")}</option>
                      <option value={"Once a quarter"}>{ui("Once a quarter")}</option>
                    </MaterialSelect>
                  </label>
                  <label>{ui("Number of events")}<input type="number" min="2" max="12" value={settings.organizer.count || 3} onChange={e => update("organizer", "count", Number(e.target.value))} /></label>
                  <label>{ui("Guest capacity")}<input
                      type="number"
                      min="2"
                      max="100"
                      value={settings.organizer.capacity}
                      onChange={(e) =>
                        update("organizer", "capacity", Number(e.target.value))
                      }
                    />
                  </label>
                  <label>{ui("First event date")}<input
                      type="date"
                      value={settings.organizer.nextDate}
                      onChange={(e) =>
                        update("organizer", "nextDate", e.target.value)
                      }
                    />
                  </label>
                  <label>{ui("Visibility")}<MaterialSelect aria-label={ui("Visibility")}
                      value={settings.organizer.visibility}
                      onChange={(e) =>
                        update("organizer", "visibility", e.target.value)
                      }
                    >
                      <option value={"Invite only"}>{ui("Invite only")}</option>
                    </MaterialSelect>
                  </label>
                </div>
                <label className="wide-setting">{ui("What makes this gathering worth coming to?")}<input
                    value={settings.organizer.note}
                    onChange={(e) =>
                      update("organizer", "note", e.target.value)
                    }
                  />
                </label>
                <p className="setting-copy">{ui("These series defaults are saved for your next gathering.")}</p>
                <p className="setting-copy">{ui("Series are private. Each occurrence has its own invitations and RSVP list.")}</p>
                {onImportIdea && <form className="import-idea" onSubmit={importIdea}>
                  <label>{ui("Bring an idea")}<input
                      type="url"
                      value={ideaUrl}
                      onChange={(e) => setIdeaUrl(e.target.value)}
                      placeholder={ui("Paste an approved event or Maps link")}
                    />
                  </label>
                  <button type="submit" disabled={isImporting}>
                    {ui(isImporting ? "Checking link…" : "Make an event draft")}
                  </button>
                </form>
                }
                {importMessage && (
                  <p className="import-message">{ui(importMessage)}</p>
                )}
                <div className="organizer-actions">
                  <button
                    className="organizer-preview"
                    onClick={onCreateOrganizer}
                  >{ui("Create series draft ")}<ChevronRight />
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
        <footer className="settings-footer">
          <div>
            {currentUser ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#5a5447",
                  fontSize: "11px",
                }}
              >
                <Check style={{ width: "15px", color: "var(--blue)" }} />
                {ui(syncStatus === "loading" && "Loading your account...")}
                {ui(syncStatus === "local" && "Saved on this device.")}
                {ui(syncStatus === "syncing" && "Saving changes to cloud...")}
                {ui(syncStatus === "synced" &&
                  `Synced to cloud (${currentUser?.email || "host"})`)}
                {ui(syncStatus === "error" &&
                  "Cloud sync needs attention. Your local changes are kept.")}
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#5a5447",
                  fontSize: "11px",
                }}
              >
                <Check style={{ width: "15px" }} />{ui("Saved locally.")}{" "}
                <button
                  onClick={onLoginClick}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    font: "inherit",
                    color: "var(--blue)",
                    textDecoration: "underline",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >{ui("Sign in as Host")}</button>{" "}{ui("to send invitations. Enable account sync separately in your dashboard.")}</span>
            )}
          </div>
          <button onClick={onClose}>{ui("Done")}</button>
        </footer>
      </aside>
    </dialog>
  );
}
