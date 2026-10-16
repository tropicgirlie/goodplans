import { Webhook } from "svix";
import test from "node:test";
import assert from "node:assert/strict";
const root = process.env.TEST_API_URL || "http://127.0.0.1:8787";
function client() {
  const cookies = new Map();
  return async (path, method = "GET", body) => {
    const response = await fetch(`${root}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join("; "),
        "cf-connecting-ip": `test-${process.pid}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    for (const set of response.headers.getSetCookie()) {
      const pair = set.split(";")[0], index = pair.indexOf("=");
      cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
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
        invitationId: event.inviteLinks[0].invitationId,
        status: "accepted",
        partySize: 2,
      })
    ).data.rsvp.status,
    "accepted",
  );
  assert.equal(
    (
      await second(`/api/events/${event.id}/rsvps`, "POST", {
        invitationId: event.inviteLinks[1].invitationId,
        status: "accepted",
      })
    ).data.rsvp.status,
    "waitlisted",
  );
  assert.equal(
    (
      await first(`/api/events/${event.id}/rsvps`, "POST", {
        invitationId: event.inviteLinks[0].invitationId,
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
        invitationId: event.inviteLinks[1].invitationId,
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

test("Dublin newsletter: discovery, opt-in, interests, preview, approval, idempotence and unsubscribe", async () => {
  const host = client(),
    guest = client();
  assert.equal((await guest("/api/host/newsletter")).status, 401);
  assert.equal((await guest('/api/host/newsletter/import-link','POST',{url:'https://dublin.ie/whats-on/'})).status,401);
  assert.equal((await guest('/api/host/newsletter/sources','POST',{name:'Test',url:'https://dublin.ie/whats-on/'})).status,401);
  const login = await host("/api/auth/otp/request", "POST", {
    email: "tessa@example.com",
  });
  assert.equal(login.status, 200, JSON.stringify(login.data));
  assert.equal(
    (
      await host("/api/auth/otp/verify", "POST", {
        email: "tessa@example.com",
        code: login.data.devCode,
      })
    ).status,
    200,
  );
  assert.equal((await host('/api/host/newsletter/import-link','POST',{url:'https://127.0.0.1/private'})).status,400);
  assert.equal((await host('/api/host/newsletter/sources','POST',{name:'Test public programme',url:'https://dublin.ie/whats-on/',keywords:'watercolour'})).status,200);
  const source=(await host('/api/host/newsletter')).data.sources[0];
  assert.equal(source.keywords,'watercolour');
  assert.equal((await host('/api/host/operations')).data.ready.discovery,true);
  assert.equal((await host('/api/host/newsletter/sources','POST',{id:source.id,name:'Edited programme',url:source.url,keywords:'retreat, dance'})).status,200);
  assert.equal((await host('/api/host/newsletter')).data.sources[0].keywords,'retreat, dance');
  assert.equal((await host('/api/host/newsletter/sources','POST',{id:source.id,enabled:false})).status,200);
  const listing = {
    title: "Newsletter integration concert",
    venue: "Dublin test venue",
    starts_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    category: "Music",
    price: "Free",
    url: "https://example.com/dublin-test-event",
  };
  assert.equal(
    (await host("/api/host/newsletter/listings", "POST", listing)).status,
    200,
  );
  assert.equal(
    (await host("/api/host/newsletter/listings", "POST", listing)).status,
    200,
  );
  const discovery = await guest("/api/discovery");
  assert.equal(
    discovery.data.events.filter((e) => e.title === listing.title).length,
    1,
  );
  const e = discovery.data.events.find((e) => e.title === listing.title);
  assert.equal(
    (await guest(`/api/discovery/${e.id}`)).data.event.title,
    listing.title,
  );
  const subscribe = await guest("/api/newsletter/subscribe", "POST", {
    email: "weekly-reader@example.com",
    interests: ["Music"],
    consent: true,
  });
  assert.equal(subscribe.status, 200, JSON.stringify(subscribe.data));
  const token = new URLSearchParams(
    new URL(subscribe.data.devLink).hash.slice(1),
  ).get("token");
  const manage = (action, extra = {}) =>
    guest("/api/newsletter/manage", "POST", { token, action, ...extra });
  assert.equal((await manage("read")).data.status, "pending");
  assert.equal((await host("/api/host/newsletter")).data.subscribers, 0);
  assert.equal((await manage("confirm")).data.status, "active");
  const nonmatch = await guest("/api/newsletter/subscribe", "POST", {
    email: "outdoor-reader@example.com",
    interests: ["Outdoors"],
    consent: true,
  });
  const otherToken = new URLSearchParams(
    new URL(nonmatch.data.devLink).hash.slice(1),
  ).get("token");
  await guest("/api/newsletter/manage", "POST", {
    token: otherToken,
    action: "confirm",
  });
  const prepared = await host("/api/host/newsletter/prepare", "POST", {});
  assert.equal(prepared.status, 200, JSON.stringify(prepared.data));
  let issue = prepared.data.issue;
  assert.equal(
    (await host("/api/host/newsletter/prepare", "POST", {})).data.issue.id,
    issue.id,
  );
  assert.equal(
    (await host("/api/host/newsletter")).data.deliveries.length,
    0,
    "preparing must not send emails",
  );
  const saved = await host(`/api/host/newsletter/issues/${issue.id}`, "PATCH", {
    revision: issue.revision,
    subject: "This week in Dublin",
    intro: "A test edition.",
    eventIds: [e.id],
  });
  assert.equal(saved.status, 200, JSON.stringify(saved.data));
  assert.equal(
    (
      await host(`/api/host/newsletter/issues/${issue.id}/approve`, "POST", {
        revision: issue.revision,
      })
    ).status,
    409,
  );
  issue = (await host("/api/host/newsletter")).data.issues.find(
    (i) => i.id === issue.id,
  );
  await host("/api/host/newsletter/listings", "POST", {
    ...listing,
    id: e.id,
    price: "EUR 5",
  });
  assert.equal(
    (
      await host(`/api/host/newsletter/issues/${issue.id}/approve`, "POST", {
        revision: issue.revision,
      })
    ).status,
    409,
    "changed listing must be reviewed again",
  );
  await host(`/api/host/newsletter/issues/${issue.id}`, "PATCH", {
    revision: issue.revision,
    subject: issue.subject,
    intro: issue.intro,
    eventIds: [e.id],
  });
  issue = (await host("/api/host/newsletter")).data.issues.find(
    (i) => i.id === issue.id,
  );
  const approved = await host(
    `/api/host/newsletter/issues/${issue.id}/approve`,
    "POST",
    { revision: issue.revision },
  );
  assert.equal(approved.status, 200, JSON.stringify(approved.data));
  assert.equal(approved.data.recipients, 1);
  assert.equal(
    (
      await host(`/api/host/newsletter/issues/${issue.id}/approve`, "POST", {
        revision: issue.revision,
      })
    ).status,
    409,
  );
  let dashboard = (await host("/api/host/newsletter")).data;
  assert.equal(
    dashboard.deliveries.find(
      (d) => d.issue_id === issue.id && d.status === "sent",
    ).count,
    1,
  );
  assert.equal(
    (await manage("preferences", { interests: ["Arts & culture"] })).data
      .interests[0],
    "Arts & culture",
  );
  assert.equal((await manage("unsubscribe")).data.status, "unsubscribed");
  assert.equal(
    (await manage("confirm")).status,
    400,
    "old link cannot resubscribe without fresh consent",
  );
  assert.equal(
    (await host("/api/host/newsletter/hide", "POST", { id: e.id })).status,
    200,
  );
  assert.equal((await guest(`/api/discovery/${e.id}`)).status, 404);
  assert.equal(
    (
      await guest("/api/newsletter/subscribe", "POST", {
        email: "no-consent@example.com",
        consent: false,
      })
    ).status,
    400,
  );
  assert.equal(
    (await host("/api/host/newsletter/collect", "POST", {})).status,
    503,
    "missing feed key is explicit",
  );
  assert.equal((await guest('/api/host/operations')).status,401);
  const support=await guest('/api/support','POST',{email:'guest@example.com',kind:'delete',message:'Please remove my guest record.'});
  assert.equal(support.status,200);
  const ops=(await host('/api/host/operations')).data;
  assert.ok(ops.requests.some(r=>r.id===support.data.reference));
  assert.equal((await host('/api/host/operations','POST',{id:support.data.reference,status:'resolved'})).status,200);
  const raw=JSON.stringify({type:'email.complained',data:{email_id:'provider-test',to:['blocked@example.com']}});
  assert.equal((await fetch(`${root}/api/webhooks/resend`,{method:'POST',body:raw})).status,401);
  const timestamp=new Date(), msgId='test-complaint';
  const signature=new Webhook(process.env.TEST_WEBHOOK_SECRET).sign(msgId,timestamp,raw);
  const webhook=()=>fetch(`${root}/api/webhooks/resend`,{method:'POST',body:raw,headers:{'svix-id':msgId,'svix-timestamp':String(Math.floor(+timestamp/1000)),'svix-signature':signature}});
  const hookResult=await webhook(); assert.equal(hookResult.status,200,await hookResult.text());
  assert.equal((await webhook()).status,200);
  assert.equal((await guest('/api/newsletter/subscribe','POST',{email:'blocked@example.com',consent:true,interests:[]})).status,400);
  assert.equal((await manage('delete')).data.status,'deleted');
  assert.equal((await manage('read')).status,404);

});

test("shared-browser invitations keep separate HttpOnly identities and reject wrong or missing context", async () => {
  const host = client(), browser = client(), outsider = client();
  const login = await host("/api/auth/otp/request", "POST", { email: "identitytest@example.com" });
  await host("/api/auth/otp/verify", "POST", { email: "identitytest@example.com", code: login.data.devCode });
  const created = await host("/api/host/events", "POST", {
    clientId: crypto.randomUUID(), title: "Shared browser overnight retreat",
    startsAt: "2026-10-24T22:00:00Z", endsAt: "2026-10-25T03:00:00Z", timezone: "Europe/Dublin", capacity: 4, publish: true,
    guests: [{ name: "Emma test" }, { name: "Sam test" }],
  });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  const event = created.data.event, [emma, sam] = event.inviteLinks;
  const exchange = async link => browser("/api/invites/exchange", "POST", { token: new URLSearchParams(new URL(link.inviteUrl).hash.slice(1)).get("invite") });
  assert.equal((await exchange(emma)).data.invitationId, emma.invitationId);
  assert.equal((await exchange(sam)).data.invitationId, sam.invitationId);
  for (const link of [emma, sam]) {
    const read = await browser(`/api/events/${event.slug}?invitation=${link.invitationId}`);
    assert.equal(read.data.guest.name, link.guestName);
    assert.equal(read.data.event.ends_at, "2026-10-25T03:00:00.000Z");
  }
  assert.equal((await browser(`/api/events/${event.id}/rsvps`, "POST", { status: "accepted", invitationId: emma.invitationId })).status, 200);
  assert.equal((await browser(`/api/events/${event.id}/rsvps`, "POST", { status: "maybe", invitationId: sam.invitationId })).status, 200);
  assert.equal((await browser(`/api/events/${event.id}/rsvps`, "POST", { status: "declined" })).status, 409);
  assert.equal((await browser(`/api/events/${event.id}/rsvps`, "POST", { status: "declined", invitationId: "invite-not-owned" })).status, 403);
  assert.equal((await outsider(`/api/events/${event.id}/rsvps`, "POST", { status: "accepted", invitationId: emma.invitationId })).status, 403);
  const dashboard = await host(`/api/host/events/${event.id}/dashboard`);
  assert.equal(dashboard.data.guests.find(g => g.id === emma.invitationId).status, "accepted");
  assert.equal(dashboard.data.guests.find(g => g.id === sam.invitationId).status, "maybe");
  const listing = (await host("/api/host/events")).data.events.find(e => e.id === event.id);
  assert.equal(listing.counts.accepted, 1);
  assert.equal(listing.guests.find(g => g.id === sam.invitationId).status, "maybe");
});

test('open meet-up: anonymous join, private names, ticket link, idempotency, capacity, edit and cancellation', async () => {
  const host=client(),first=client(),second=client(),anonymous=client();
  const login=await host('/api/auth/otp/request','POST',{email:'identitytest@example.com'});
  assert.equal(login.status,200,JSON.stringify(login.data));
  assert.equal((await host('/api/auth/otp/verify','POST',{email:'identitytest@example.com',code:login.data.devCode})).status,200);
  const input={clientId:crypto.randomUUID(),title:'LOCAL TEST — Join my dance class',startsAt:new Date(Date.now()+86400000).toISOString(),endsAt:new Date(Date.now()+90000000).toISOString(),timezone:'Europe/Dublin',capacity:1,publish:true,visibility:'public',planType:'attend',venueName:'Test dance studio, Dublin',bookingUrl:'https://www.mari-ribeiro.com/book-online',guests:[]};
  const invalid=await host('/api/host/events','POST',{...input,clientId:crypto.randomUUID(),bookingUrl:'javascript:alert(1)'});
  assert.equal(invalid.status,400);
  const created=await host('/api/host/events','POST',input);assert.equal(created.status,201,JSON.stringify(created.data));
  const event=created.data.event;
  let page=await anonymous(`/api/events/${event.slug}`);
  assert.equal(page.status,200);assert.equal(page.data.event.visibility,'public');assert.equal(page.data.event.booking_url,input.bookingUrl);assert.equal(page.data.event.plan_type,'attend');assert.equal(page.data.event.show_guests,0);assert.ok(page.data.event.share_url.endsWith(`/events/${event.slug}`));assert.equal(page.data.event.host_user_id,undefined);assert.equal(page.data.event.client_id,undefined);
  const token='a'.repeat(64),token2='b'.repeat(64);
  assert.equal((await first(`/api/events/${event.id}/join`,'POST',{name:'Bad party size',status:'accepted',partySize:2,joinToken:token})).status,400);
  const joined=await first(`/api/events/${event.id}/join`,'POST',{name:'First test dancer',status:'accepted',partySize:1,joinToken:token});
  assert.equal(joined.status,200,JSON.stringify(joined.data));assert.equal(joined.data.rsvp.status,'accepted');
  assert.equal((await first(`/api/events/${event.id}/join`,'POST',{name:'First test dancer',status:'accepted',joinToken:token})).data.invitationId,joined.data.invitationId);
  const waiting=await second(`/api/events/${event.id}/join`,'POST',{name:'Second test dancer',status:'accepted',joinToken:token2});
  assert.equal(waiting.data.rsvp.status,'waitlisted');
  page=await anonymous(`/api/events/${event.slug}`);assert.deepEqual(page.data.guests,[]);assert.equal(page.data.guest,null);
  assert.equal((await host(`/api/host/events/${event.id}/dashboard`)).data.guests.length,2);
  assert.equal((await first(`/api/events/${event.slug}`)).data.guest.name,'First test dancer');
  assert.equal((await first(`/api/events/${event.id}/rsvps`,'POST',{invitationId:joined.data.invitationId,status:'declined',partySize:1})).status,200);
  assert.equal((await second(`/api/events/${event.slug}`)).data.rsvp.status,'accepted');
  assert.equal((await host(`/api/host/events/${event.id}`,'PATCH',{bookingUrl:'https://www.mari-ribeiro.com/service-page/all-levels-brazilian-dance',revision:1})).status,200);
  assert.match((await anonymous(`/api/events/${event.slug}`)).data.event.booking_url,/service-page/);
  const privateEvent=(await host('/api/host/events','POST',{...input,clientId:crypto.randomUUID(),title:'Private dinner',visibility:'invite'})).data.event;
  assert.equal((await anonymous(`/api/events/${privateEvent.slug}`)).status,404);
  assert.equal((await anonymous(`/api/events/${privateEvent.id}/join`,'POST',{name:'Intruder',status:'accepted',joinToken:token})).status,404);
  const draft=(await host('/api/host/events','POST',{...input,clientId:crypto.randomUUID(),title:'Unpublished open draft',publish:false})).data.event;
  assert.equal((await anonymous(`/api/events/${draft.slug}`)).status,404);
  const past=(await host('/api/host/events','POST',{...input,clientId:crypto.randomUUID(),title:'Ended meet-up',startsAt:new Date(Date.now()-7200000).toISOString(),endsAt:new Date(Date.now()-3600000).toISOString()})).data.event;
  assert.equal((await anonymous(`/api/events/${past.id}/join`,'POST',{name:'Late test dancer',status:'accepted',joinToken:token})).status,409);
  const csrf=await fetch(`${root}/api/events/${event.id}/join`,{method:'POST',headers:{origin:'https://other.example','content-type':'application/json'},body:JSON.stringify({name:'Cross-site test',status:'accepted',joinToken:token})});assert.equal(csrf.status,403);
  assert.equal((await host(`/api/host/events/${event.id}/cancel`,'POST',{scope:'event'})).status,200);
  assert.equal((await anonymous(`/api/events/${event.id}/join`,'POST',{name:'Late guest',status:'accepted',joinToken:token})).status,404);
});
