import { zonedParts, wallTimeToUTC } from "../../shared/timezones.js";
import { ui, dateLocale } from "../i18n/core.js";
import { bookingLink, invitationOptions, bookingDetails } from '../../shared/invitations.js';
export const PLAN_KEY = "good-plans-outings-v2";
export function localDate(date = new Date(), timezone) {
  if (timezone) { const p = zonedParts(date, timezone); return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`; }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function prettyDate(value, options = {}) {
  if (!value) return ui("Date to be decided");
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime())
    ? ui("Date to be decided")
    : new Intl.DateTimeFormat(dateLocale(), {
        day: "numeric",
        month: "short",
        ...options,
      }).format(date);
}
export function validatePlan(plan) {
  if (!plan.title.trim()) return "Give your plan a name.";
  try { invitationOptions(plan); } catch(error) { return error.message; }
  if (plan.endDate && !plan.date) return "Choose a start date before adding an end date.";
  if (plan.date) {
    const { start, end } = planInstants(plan);
    if (Number.isNaN(+start) || Number.isNaN(+end) || end <= start)
      return "Choose an end date and time after the start.";
  }
  if (
    !Number.isInteger(Number(plan.capacity)) ||
    plan.capacity < 1 ||
    plan.capacity > 500
  )
    return "Choose a guest limit between 1 and 500.";
  return "";
}
export function wallDateTime(instant, timezone) {
  const d = new Date(instant);
  const p = timezone ? zonedParts(d, timezone) : {hour:d.getHours(),minute:d.getMinutes()};
  return `${localDate(d, timezone)}T${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}
export function instantForWall(value, timezone) {
  if (!timezone) return new Date(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return new Date(NaN);
  try { return new Date(wallTimeToUTC({year:+match[1],month:+match[2],day:+match[3],hour:+match[4],minute:+match[5]},timezone)); } catch { return new Date(NaN); }
}
export function planInstants(plan) {
  const make = (instant, date, time) => {
    const wall = `${date}T${time}`;
    const d = new Date(instant);
    return !Number.isNaN(+d) && wallDateTime(d,plan.timezone) === wall ? d : instantForWall(wall,plan.timezone);
  };
  const endDate = plan.endDate || plan.date;
  return {start:make(plan.startsAt,plan.date,plan.time || '14:00'),end:make(plan.endsAt,endDate,plan.endTime || '16:00')};
}
export function planDateText(plan) {
  if (!plan.date) return ui("Date to be decided together");
  const start = `${prettyDate(plan.date, { weekday: "long", year: "numeric" })} · ${plan.time}`;
  return plan.endDate && plan.endDate !== plan.date
    ? `${start} – ${prettyDate(plan.endDate, { weekday: "long", year: "numeric" })} · ${plan.endTime}`
    : `${start}–${plan.endTime}`;
}
export function planOnDate(plan, date) {
  if (!plan.date || plan.status === "cancelled") return false;
  const endDate = plan.endDate || plan.date;
  return date >= plan.date && (date < endDate || (date === endDate && (plan.endTime !== "00:00" || date === plan.date)));
}
export function calendarData(plan) {
  if (!plan.date) return null;
  const stamp = (value) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const instants = planInstants(plan);
  const start = stamp(instants.start);
  const end = stamp(instants.end);
  const escape = (value) =>
    String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const details = [plan.notes, bookingDetails(plan.bookingUrl,plan.planType==='attend')].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: plan.title,
    dates: `${start}/${end}`,
    location: plan.location || "",
    details,
  });
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Good Plans//Planner//EN",
    "BEGIN:VEVENT",
    `UID:${plan.id}@goodplans`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escape(plan.title)}`,
    `LOCATION:${escape(plan.location)}`,
    `DESCRIPTION:${escape(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // Fold at 75 UTF-8 octets so longer titles and notes remain valid iCalendar.
  const fold = (line) => {
    let out = "",
      count = 0;
    for (const char of line) {
      const size = new TextEncoder().encode(char).length;
      if (count + size > 75) {
        out += "\r\n ";
        count = 1;
      }
      out += char;
      count += size;
    }
    return out;
  };
  return {
    google: `https://calendar.google.com/calendar/render?${params}`,
    ics: lines.map(fold).join("\r\n") + "\r\n",
  };
}
export function invitationText(plan) {
  return [
    ui(`You're invited: ${plan.title}`),
    planDateText(plan),
    plan.timezone ? `${ui("Times in ")}${plan.timezone}` : "",
    plan.location || ui("Place to be decided"),
    plan.cost ? ui(`Cost: ${plan.cost}`) : "",
    plan.notes,
    plan.bookingUrl ? `Tickets / booking: ${bookingLink(plan.bookingUrl)}` : '',
    plan.planType==='attend' ? 'Join me at this event. Our RSVP does not buy or reserve an event ticket.' : '',
    plan.visibility==='public' && plan.publicUrl ? `Join me: ${plan.publicUrl}` : '',
    ui("Let me know if you can make it!"),
  ]
    .filter(Boolean)
    .join("\n\n");
}
