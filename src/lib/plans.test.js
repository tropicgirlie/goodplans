import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarData,
  validatePlan,
  prettyDate,
  invitationText,
} from "./plans.js";
const plan = {
  id: "test",
  title: "Coffee, cake; catch-up",
  date: "2026-09-20",
  time: "14:00",
  endTime: "16:00",
  capacity: 12,
  location: "Dublin",
  notes: "Bring a friend\nAnd a smile",
};
test("calendar exports include the chosen start and end time", () => {
  const result = calendarData(plan);
  const stamp = (date) =>
    new Date(date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = stamp("2026-09-20T14:00");
  const end = stamp("2026-09-20T16:00");
  assert.match(result.ics, new RegExp(`DTSTART:${start}`));
  assert.match(result.ics, new RegExp(`DTEND:${end}`));
  assert.equal(
    new URL(result.google).searchParams.get("dates"),
    `${start}/${end}`,
  );
  assert.ok(result.ics.includes("SUMMARY:Coffee\\, cake\\; catch-up"));
  assert.ok(result.ics.includes("DESCRIPTION:Bring a friend\\nAnd a smile"));
});
test("undecided dates never generate fictional calendar events", () => {
  assert.equal(calendarData({ ...plan, date: "" }), null);
  assert.equal(prettyDate(""), "Date to be decided");
  assert.match(
    invitationText({ ...plan, date: "" }),
    /Date to be decided together/,
  );
});
test("rejects reversed times, empty titles and invalid capacity", () => {
  assert.equal(validatePlan(plan), "");
  for (const change of [
    { endTime: "12:00" },
    { title: "  " },
    { capacity: 0 },
    { capacity: 1.5 },
    { capacity: 501 },
  ])
    assert.ok(validatePlan({ ...plan, ...change }));
});
test("folds unicode calendar lines to 75 UTF-8 bytes", () => {
  const result = calendarData({ ...plan, notes: "☕é".repeat(100) });
  for (const line of result.ics.split("\r\n"))
    assert.ok(Buffer.byteLength(line, "utf8") <= 75);
});
