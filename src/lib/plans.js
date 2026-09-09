export const PLAN_KEY = "good-plans-outings-v2";
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function prettyDate(value, options = {}) {
  if (!value) return "Date to be decided";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime())
    ? "Date to be decided"
    : new Intl.DateTimeFormat("en-IE", {
        day: "numeric",
        month: "short",
        ...options,
      }).format(date);
}
export function validatePlan(plan) {
  if (!plan.title.trim()) return "Give your plan a name.";
  if (plan.date && plan.endTime <= plan.time)
    return "Choose an end time after the start time.";
  if (
    !Number.isInteger(Number(plan.capacity)) ||
    plan.capacity < 1 ||
    plan.capacity > 500
  )
    return "Choose a guest limit between 1 and 500.";
  return "";
}
export function calendarData(plan) {
  if (!plan.date) return null;
  const stamp = (value) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = stamp(`${plan.date}T${plan.time || "14:00"}`);
  const end = stamp(`${plan.date}T${plan.endTime || "16:00"}`);
  const escape = (value) =>
    String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: plan.title,
    dates: `${start}/${end}`,
    location: plan.location || "",
    details: plan.notes || "",
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
    `DESCRIPTION:${escape(plan.notes)}`,
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
    `You're invited: ${plan.title}`,
    plan.date
      ? `${prettyDate(plan.date, { weekday: "long", year: "numeric" })} · ${plan.time}–${plan.endTime}`
      : "Date to be decided together",
    plan.location || "Place to be decided",
    plan.cost ? `Cost: ${plan.cost}` : "",
    plan.notes,
    "Let me know if you can make it!",
  ]
    .filter(Boolean)
    .join("\n\n");
}
