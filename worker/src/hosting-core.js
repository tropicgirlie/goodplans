import { zonedParts, wallTimeToUTC } from "../../shared/timezones.js";
export { zonedParts, wallTimeToUTC } from "../../shared/timezones.js";
export function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
export function validateEvent(input) {
  if (
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.length > 120
  )
    fail("Give the event a name of 1–120 characters.");
  const start = new Date(input.startsAt),
    end = new Date(input.endsAt);
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || end <= start)
    fail("Choose a valid start and a later end time.");
  if (
    !Number.isInteger(Number(input.capacity)) ||
    input.capacity < 1 ||
    input.capacity > 500
  )
    fail("Capacity must be between 1 and 500.");
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format(start);
  } catch {
    fail("Choose a valid timezone.");
  }
  if (!input.timezone) fail("Timezone is required.");
}
export function seriesDates(input) {
  validateEvent(input);
  const total = input.seriesName ? Number(input.occurrences || 1) : 1;
  if (!Number.isInteger(total) || total < 1 || total > 12)
    fail("Create between 1 and 12 occurrences.");
  const cadence = input.cadence || "Once a month";
  if (
    input.seriesName &&
    !["Weekly", "Once a month", "Every six weeks", "Once a quarter"].includes(
      cadence,
    )
  )
    fail("Choose a supported recurrence.");
  const shift = (iso, i) => {
    if (!i) return new Date(iso).toISOString();
    const p = zonedParts(iso, input.timezone);
    const d = new Date(Date.UTC(p.year, p.month - 1, p.day));
    if (cadence === "Weekly" || cadence === "Every six weeks")
      d.setUTCDate(d.getUTCDate() + i * (cadence === "Weekly" ? 7 : 42));
    else {
      d.setUTCDate(1);
      d.setUTCMonth(
        d.getUTCMonth() + i * (cadence === "Once a quarter" ? 3 : 1),
      );
      d.setUTCDate(
        Math.min(
          p.day,
          new Date(
            Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
          ).getUTCDate(),
        ),
      );
    }
    return wallTimeToUTC(
      {
        ...p,
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
      },
      input.timezone,
    );
  };
  return Array.from({ length: total }, (_, i) => ({
    startsAt: shift(input.startsAt, i),
    endsAt: shift(input.endsAt, i),
  }));
}
export function partyStatus({
  capacity,
  occupied,
  currentSize = 0,
  requestedSize = 1,
  requestedStatus,
}) {
  if (!["accepted", "maybe", "declined"].includes(requestedStatus))
    fail("Choose going, maybe, or declined.");
  return requestedStatus === "accepted" &&
    occupied - currentSize + requestedSize > capacity
    ? "waitlisted"
    : requestedStatus;
}
