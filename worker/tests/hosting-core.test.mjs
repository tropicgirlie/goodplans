import test from "node:test";
import assert from "node:assert/strict";
import {
  seriesDates,
  validateEvent,
  partyStatus,
} from "../src/hosting-core.js";
import { sendEmail } from "../src/mail.js";
const base = {
  title: "Brunch",
  startsAt: "2026-10-20T13:00:00Z",
  endsAt: "2026-10-20T15:00:00Z",
  timezone: "Europe/Dublin",
  capacity: 12,
  seriesName: "Monthly brunch",
  cadence: "Once a month",
  occurrences: 3,
};
test("monthly recurrence preserves local time across DST", () => {
  const dates = seriesDates(base);
  assert.equal(dates[1].startsAt, "2026-11-20T14:00:00.000Z");
  assert.equal(dates.length, 3);
});
test("month-end recurrence clamps without drifting subsequent occurrences", () => {
  const dates = seriesDates({
    ...base,
    startsAt: "2027-01-31T14:00Z",
    endsAt: "2027-01-31T16:00Z",
  });
  assert.equal(dates[1].startsAt, "2027-02-28T14:00:00.000Z");
  assert.equal(dates[2].startsAt, "2027-03-31T13:00:00.000Z");
});
test("invalid dates, timezone and capacity are rejected on the server", () => {
  for (const change of [
    { title: " " },
    { endsAt: base.startsAt },
    { timezone: "bad-zone" },
    { capacity: 0 },
  ])
    assert.throws(() => validateEvent({ ...base, ...change }));
});
test("plus-one occupies a real seat and existing party does not count twice", () => {
  assert.equal(
    partyStatus({
      capacity: 2,
      occupied: 1,
      requestedSize: 2,
      requestedStatus: "accepted",
    }),
    "waitlisted",
  );
  assert.equal(
    partyStatus({
      capacity: 2,
      occupied: 2,
      currentSize: 2,
      requestedSize: 2,
      requestedStatus: "accepted",
    }),
    "accepted",
  );
});
test("production email fails closed without credentials", async () => {
  await assert.rejects(
    () =>
      sendEmail(
        { ENVIRONMENT: "production" },
        { key: "test", to: "test@example.com", subject: "test", text: "test" },
      ),
    /not configured/,
  );
});

test("email provider failures never report sent", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("unavailable", { status: 503 }),
  );
  await assert.rejects(
    () =>
      sendEmail(
        { RESEND_API_KEY: "test-only", EMAIL_FROM: "test@example.com" },
        {
          key: "failure-test",
          to: "guest@example.com",
          subject: "Test",
          text: "Test",
        },
      ),
    /rejected delivery/,
  );
});
test("email provider receives stable idempotency key and confirms acceptance", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], "stable-test-key");
    assert.deepEqual(JSON.parse(options.body).to, ["guest@example.com"]);
    return Response.json({ id: "provider-test-id" });
  });
  assert.equal(
    await sendEmail(
      { RESEND_API_KEY: "test-only", EMAIL_FROM: "test@example.com" },
      {
        key: "stable-test-key",
        to: "guest@example.com",
        subject: "Test",
        text: "Test",
      },
    ),
    "provider-test-id",
  );
});
