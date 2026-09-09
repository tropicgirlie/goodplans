import { localDate } from "./plans";
export const DUBLIN_INTERESTS = [
  "Music",
  "Arts & culture",
  "Comedy",
  "Outdoors",
  "Food & social",
  "Other",
];
export function discoveryDraft(event) {
  const start = new Date(event.starts_at),
    end = event.ends_at ? new Date(event.ends_at) : new Date(+start + 7200000);
  const time = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    title: event.title,
    kind: "Friends outing",
    date: localDate(start),
    time: time(start),
    endTime: localDate(start) === localDate(end) ? time(end) : "",
    location: event.venue,
    cost: event.price,
    discoveryId: event.id,
    notes: `Details & tickets: ${event.url}\n\n${event.ends_at ? "" : "End time is a suggested two-hour planning window; check the event details.\n"}Adding this plan does not reserve tickets. Check the source for availability and changes.`,
    image: "good-plans-gathering-collage.png",
  };
}
