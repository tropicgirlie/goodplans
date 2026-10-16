# Open and private invitations

Implemented and verified locally on 16 October 2026. Deployed to production on 16 October 2026; see activation notes below.

## Create a plan

Choose **New plan**, then **Who can join?**:

- **Private invitation** (default): personal links for specific friends, a dinner date, or a closed group. Uninvited visitors cannot read or self-join the event. Personal links can still be forwarded; recipients should keep theirs private.
- **Open invitation**: anyone with the shared URL can read the invitation and join using a name or nickname. No guest account or email is required. A random browser token makes retries idempotent; HttpOnly session cookies retain the guest identity. Names are hidden by default; the host may explicitly choose to show confirmed names, disclosed on the join form.

For an existing dance class, workshop, concert or other ticketed event, select **I’m attending an existing event** and add its HTTPS booking URL. Save the draft, sign in as an approved host, then publish. The host account requirement has not changed; this does not add public host registration.

**Get tickets / booking** opens the original organiser. Good Plans RSVP is separate, never a ticket reservation. Our group capacity/waitlist does not represent ticket availability. Cancelling a meet-up does not cancel the original event or refund tickets. Booking links also appear in copied invitation text, guest emails and calendar descriptions.

Open invitations have a copyable link in both plan details and the organiser portal. Private guests receive individual invitation links. The mode is fixed at publication; editing an existing event cannot silently expose a private invitation.

Open joining uses the existing serialized RSVP capacity and waitlist handling. It limits attempts by event/IP and caps created guest invitations. Closed, cancelled, unpublished or ended events cannot accept open joins. Changing browser or clearing data can lose access to a response; the host can manage guest data and support requests. No children’s profiles or care needs are collected.

## Local dance-class test

The local test uses the user’s screenshot for Saturday 17 October 2026, 10:30–11:25 Dublin time, and Mari Ribeiro’s service page for Curved Street, Temple Bar, Dublin. Booking URL: https://www.mari-ribeiro.com/book-online . Current ticket availability and the precise studio entrance must be checked with Mari. No childcare has been confirmed for this class.

The invitation is clearly labelled TEST and lives only in the local preview. One fictional guest joined and changed their RSVP successfully. No real invitations, purchases or email sends were made. It must not be shared as a live invitation.

## Deployment

Apply pending D1 migrations 0009–0011 before deploying the matching Worker and frontend. Migration 0010 adds event booking URL and plan type. Migration 0011 adds confirmed discovery care attributes. Keep the existing production secrets and approved-host settings. Then check one open invitation in a separate signed-out browser, one private invitation, ticket URL, capacity/waitlist and cancellation on the deployed origin.

## Production activation — 16 October 2026

Applied migrations 0009–0011 and deployed version `2c70f0a8-cf1e-44d9-b1f9-ff3ef21dbd4a` to the existing Good Plans domains. Preserved production variables, secrets, queues and approved hosts. Built assets in a temporary output directory so user-owned `dist/index.html` stayed untouched.

Production health and discovery return 200; anonymous organiser access returns 401. An account-owned dance-class draft was prepared with no guest invitations, mail reminders or published attendance details. Anonymous reads and open-join attempts against the unpublished draft return 404. A live email sign-in request was accepted; receipt and completion of the email verification remain user steps. No password credential was created.

The four complete RSVP journeys were tested in the isolated environment. Published production RSVP/cancellation checks and reviewed childcare sources remain follow-ups.

## Inviter’s name (local follow-up)

The plan editor and organiser edit form include **Your name on the invitation**. This explicit, editable name is stored on the event, independently of account email and guest names. The invitation page, copied invitation text and guest invitation email identify the host. New frontend publication asks for a name; older events without one use a generic host label rather than deriving a name from an email address. Cancelled invitations say “A plan from …”.

Migration **0012_invitation_host_name.sql** is applied to the local preview only. Apply it before deploying this follow-up. The local Mari test shows “Luana is inviting you”; the creator’s production draft still needs its explicit name set when this update is activated.

## Automatic screen sizing (local follow-up)

Invitation pages now open in the layout appropriate for the available screen width. Laptop screens start in the desktop layout, tablets use the expanded stacked view, and phones start compact. The image retains its proportions. Unmodified layouts follow window resizing; Expand/Shrink provides a temporary manual choice. A new visit selects the layout automatically again. The event editor’s compact default remains unchanged.
