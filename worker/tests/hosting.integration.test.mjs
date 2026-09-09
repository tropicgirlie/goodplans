import test from "node:test";
import assert from "node:assert/strict";
const root = process.env.TEST_API_URL || "http://127.0.0.1:8787";
function client() {
  let cookie = "";
  return async (path, method = "GET", body) => {
    const response = await fetch(`${root}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        cookie,
        "cf-connecting-ip": `test-${process.pid}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const set = response.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return { status: response.status, data: await response.json() };
  };
}
test("host journey: sign-in, series, private invites, plus-ones, waitlist, edit, email, sync and cancellation", async () => {
  const host = client(),
    anonymous = client(),
    first = client(),
    second = client();
  assert.equal((await anonymous("/api/host/events")).status, 401);
  const login = await host("/api/auth/otp/request", "POST", {
    email: "tessa@example.com",
  });
  assert.equal(login.status, 200, JSON.stringify(login.data));
  assert.match(login.data.devCode, /^\d{6}$/);
  assert.equal(
    (
      await host("/api/auth/otp/verify", "POST", {
        email: "tessa@example.com",
        code: login.data.devCode,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await anonymous("/api/auth/otp/verify", "POST", {
        email: "tessa@example.com",
        code: login.data.devCode,
      })
    ).status,
    400,
  );
  const draft = {
    clientId: crypto.randomUUID(),
    title: "Integration test gathering",
    startsAt: "2026-10-20T13:00:00Z",
    endsAt: "2026-10-20T15:00:00Z",
    timezone: "Europe/Dublin",
    capacity: 2,
    publish: true,
    seriesName: "Integration test series",
    cadence: "Once a month",
    occurrences: 3,
    plusOne: true,
    reminder: true,
    guests: [
      { name: "First test guest", email: "guest1@example.com" },
      { name: "Second test guest", email: "guest2@example.com" },
    ],
  };
  const created = await host("/api/host/events", "POST", draft);
  assert.equal(created.status, 201, JSON.stringify(created.data));
  assert.equal(created.data.events.length, 3);
  assert.equal(created.data.events[1].starts_at, "2026-11-20T14:00:00.000Z");
  const event = created.data.event;
  assert.equal(
    (await host("/api/host/events", "POST", draft)).data.event.id,
    event.id,
    "retries must not duplicate events",
  );
  assert.equal((await anonymous(`/api/events/${event.slug}`)).status, 404);
  for (const [guest, link] of [
    [first, event.inviteLinks[0]],
    [second, event.inviteLinks[1]],
  ])
    assert.equal(
      (
        await guest("/api/invites/exchange", "POST", {
          token: new URLSearchParams(new URL(link.inviteUrl).hash.slice(1)).get(
            "invite",
          ),
        })
      ).status,
      200,
    );
  assert.equal(
    (
      await first(`/api/events/${event.id}/rsvps`, "POST", {
        status: "accepted",
        partySize: 2,
      })
    ).data.rsvp.status,
    "accepted",
  );
  assert.equal(
    (
      await second(`/api/events/${event.id}/rsvps`, "POST", {
        status: "accepted",
      })
    ).data.rsvp.status,
    "waitlisted",
  );
  assert.equal(
    (
      await first(`/api/events/${event.id}/rsvps`, "POST", {
        status: "declined",
      })
    ).status,
    200,
  );
  let dashboard = await host(`/api/host/events/${event.id}/dashboard`);
  assert.equal(
    dashboard.data.guests.find((g) => g.guest_name === "Second test guest")
      .status,
    "accepted",
  );
  assert.equal(
    (await second(`/api/events/${event.slug}`)).data.rsvp.status,
    "accepted",
  );
  assert.equal(
    (
      await host(`/api/host/events/${event.id}`, "PATCH", {
        title: "Updated integration event",
        revision: 1,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await host(`/api/host/events/${event.id}`, "PATCH", {
        title: "Stale update",
        revision: 1,
      })
    ).status,
    409,
  );
  const mailed = await host(`/api/host/events/${event.id}/invite`, "POST", {
    invitationId: event.inviteLinks[0].invitationId,
    sendEmail: true,
  });
  assert.equal(mailed.status, 200, JSON.stringify(mailed.data));
  dashboard = await host(`/api/host/events/${event.id}/dashboard`);
  assert.ok(dashboard.data.deliveries.some((d) => d.status === "sent"));
  const workspace = await host("/api/host/workspace");
  const data = workspace.data.data || {
    plans: [],
    people: [],
    saved: [],
    preferences: {},
  };
  assert.equal(
    (
      await host("/api/host/workspace", "PUT", {
        data,
        revision: workspace.data.revision,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await host("/api/host/workspace", "PUT", {
        data,
        revision: workspace.data.revision,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await host(`/api/host/events/${event.id}/cancel`, "POST", {
        scope: "series",
      })
    ).status,
    200,
  );
  assert.equal(
    (await second(`/api/events/${event.slug}`)).data.event.status,
    "cancelled",
  );
  assert.equal(
    (
      await second(`/api/events/${event.id}/rsvps`, "POST", {
        status: "accepted",
      })
    ).status,
    409,
  );
  const all = await host("/api/host/events");
  assert.equal(
    all.data.events.filter(
      (e) => e.series_id === event.series_id && e.status === "cancelled",
    ).length,
    3,
  );
  assert.equal(
    (await host(`/api/host/events/${event.id}/publish`, "POST", {})).status,
    409,
    "cancellation cannot be undone through the old publish endpoint",
  );
  const reminder = await host("/api/host/events", "POST", {
    ...draft,
    clientId: crypto.randomUUID(),
    seriesName: "",
    occurrences: 1,
    title: "Reminder verification",
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    endsAt: new Date(Date.now() + 7200000).toISOString(),
  });
  assert.equal(reminder.status, 201);
  const reminderId = reminder.data.event.id;
  assert.equal(
    (await fetch(`${root}/__scheduled?cron=*/15+*+*+*+*`)).status,
    200,
  );
  let reminders = (
    await host(`/api/host/events/${reminderId}/dashboard`)
  ).data.deliveries.filter((d) =>
    d.subject.startsWith("Your plan is coming up"),
  );
  for (let i = 0; i < 30 && reminders.length !== 2; i++) {
    await new Promise((r) => setTimeout(r, 100));
    reminders = (
      await host(`/api/host/events/${reminderId}/dashboard`)
    ).data.deliveries.filter((d) =>
      d.subject.startsWith("Your plan is coming up"),
    );
  }
  assert.equal(reminders.length, 2);
  await host(`/api/host/events/${reminderId}`, "PATCH", {
    title: "Renamed reminder verification",
    revision: 1,
  });
  await fetch(`${root}/__scheduled?cron=*/15+*+*+*+*`);
  reminders = (
    await host(`/api/host/events/${reminderId}/dashboard`)
  ).data.deliveries.filter((d) =>
    d.subject.startsWith("Your plan is coming up"),
  );
  assert.equal(
    reminders.length,
    2,
    "editing a title must not duplicate reminders",
  );
  const relogin = await host("/api/auth/otp/request", "POST", {
    email: "tessa@example.com",
  });
  assert.equal(relogin.status, 200);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await anonymous("/api/auth/otp/verify", "POST", {
          email: "tessa@example.com",
          code: "000000",
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await anonymous("/api/auth/otp/verify", "POST", {
        email: "tessa@example.com",
        code: relogin.data.devCode,
      })
    ).status,
    400,
    "five incorrect attempts invalidate the code",
  );
  const csrf = await fetch(`${root}/api/auth/otp/request`, {
    method: "POST",
    headers: {
      origin: "https://untrusted.example",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email: "tessa@example.com" }),
  });
  assert.equal(csrf.status, 403);
});
