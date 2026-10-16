import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarData,
  validatePlan,
  prettyDate,
  invitationText,
  planInstants,
  planOnDate,
} from "./plans.js";
import { discoveryDraft, fitsPlanningContext } from "./discovery.js";
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
test("partner planning includes broad shared activities and records the context", () => {
  const music = {
    id: "music",
    title: "Live music",
    starts_at: "2026-10-01T19:00:00Z",
    ends_at: null,
    venue: "Dublin",
    category: "Music",
    url: "https://example.com/music",
    themes_json: '["partners"]',
  };
  assert.equal(fitsPlanningContext(music, "partner"), true);
  assert.equal(
    fitsPlanningContext(
      {
        ...music,
        category: "Women & community",
        themes_json: '["women","partners"]',
      },
      "partner",
    ),
    false,
  );
  assert.equal(
    fitsPlanningContext(
      {
        ...music,
        category: "Women & community",
        themes_json: '["women","partner-explicit"]',
      },
      "partner",
    ),
    true,
  );
  assert.match(discoveryDraft(music, "partner").notes, /my partner/);
});

test("overnight plans span Dublin DST and preserve imported start/end instants", () => {
  const oldTZ = process.env.TZ;
  process.env.TZ = "Europe/Dublin";
  try {
    const overnight = { ...plan, date: "2026-10-24", time: "23:00", endDate: "2026-10-25", endTime: "03:00" };
    assert.equal(validatePlan(overnight), "");
    const instants = planInstants(overnight);
    assert.equal((instants.end - instants.start) / 3600000, 5);
    const exported = calendarData(overnight);
    assert.match(exported.ics, /DTSTART:20261024T220000Z/);
    assert.match(exported.ics, /DTEND:20261025T030000Z/);
    assert.match(invitationText(overnight), /25 Oct/);
    assert.ok(validatePlan({ ...overnight, endDate: "2026-10-23" }));
    const imported = discoveryDraft({ id: "overnight", title: "Retreat", starts_at: "2026-10-24T22:00:00Z", ends_at: "2026-10-25T03:00:00Z", url: "https://example.com/retreat" });
    assert.equal(imported.endDate, "2026-10-25");
    assert.equal(imported.endTime, "03:00");
    assert.match(calendarData({ ...imported, id: "retreat" }).ics, /DTEND:20261025T030000Z/);
    const repeatedHour = { ...plan, date: "2026-10-25", time: "01:30", endTime: "03:00", startsAt: "2026-10-25T01:30:00Z" };
    assert.equal(planInstants(repeatedHour).start.toISOString(), "2026-10-25T01:30:00.000Z", "preserve the second repeated hour from a source timestamp");
  } finally { if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ; }
});

test("the diary includes every day of a retreat and excludes midnight end and cancellation", () => {
  const retreat = { ...plan, date: "2026-10-24", endDate: "2026-10-26" };
  assert.equal(planOnDate(retreat, "2026-10-24"), true);
  assert.equal(planOnDate(retreat, "2026-10-25"), true);
  assert.equal(planOnDate(retreat, "2026-10-26"), true);
  assert.equal(planOnDate(retreat, "2026-10-27"), false);
  assert.equal(planOnDate({ ...retreat, endTime: "00:00" }, "2026-10-26"), false);
  assert.equal(planOnDate({ ...retreat, status: "cancelled" }, "2026-10-25"), false);
});

test('open invitations retain booking links, private defaults and a separate RSVP meaning', async () => {
  const { invitationOptions, bookingLink } = await import('../../shared/invitations.js');
  const { hostedPlan } = await import('./hostedPlans.js');
  assert.equal(invitationOptions().visibility,'invite');
  assert.equal(invitationOptions({visibility:'public'}).showGuests,false);
  assert.equal(invitationOptions({visibility:'public',showGuests:true}).showGuests,true);
  for(const url of ['javascript:alert(1)','http://example.com','https://user:pass@example.com'])assert.throws(()=>bookingLink(url));
  const draft=discoveryDraft({id:'dance',title:'Dance with Mari',starts_at:'2026-10-17T09:30:00Z',ends_at:'2026-10-17T10:25:00Z',url:'https://www.mari-ribeiro.com/book-online',venue:'Curved Street, Dublin',price:'Check booking page'});
  assert.equal(draft.time,'10:30');assert.equal(draft.endTime,'11:25');assert.equal(draft.planType,'attend');
  const projected=hostedPlan({id:'a',title:draft.title,starts_at:draft.startsAt,ends_at:draft.endsAt,timezone:'Europe/Dublin',visibility:'public',plan_type:'attend',booking_url:draft.bookingUrl,share_url:'https://goodplans.example/events/dance',capacity:20,show_guests:0});
  const text=invitationText(projected);
  assert.match(text,/mari-ribeiro.com\/book-online/);assert.match(text,/does not buy or reserve/);assert.match(text,/goodplans.example\/events\/dance/);
  assert.equal(projected.showGuests,false);
  assert.match(new URL(calendarData(projected).google).searchParams.get('details'),/mari-ribeiro.com\/book-online/);
  assert.match(calendarData(projected).ics.replace(/\r\n /g,''),/does not buy or reserve/);
});

test('inviter name stays separate from guest identity in invitations and survives server projection', async () => {
  const { hostedPlan }=await import('./hostedPlans.js');
  const { inviterName }=await import('../../shared/invitations.js');
  const invitation=hostedPlan({id:'host-test',title:'Saturday dance',starts_at:'2026-10-17T09:30:00Z',ends_at:'2026-10-17T10:25:00Z',timezone:'Europe/Dublin',host_name:'Luana',capacity:12,visibility:'public'}, {}, {invitee:'Mary'});
  assert.equal(invitation.hostName,'Luana');assert.equal(invitation.invitee,'Mary');
  assert.match(invitationText(invitation),/^Luana is inviting you: Saturday dance/);
  assert.doesNotMatch(invitationText(invitation),/Mary is inviting/);
  assert.equal(inviterName('  Viviane  '),'Viviane');assert.throws(()=>inviterName('x'.repeat(81)));
});
