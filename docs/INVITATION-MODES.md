# Open and private invitations

Implemented and verified locally on 16 October 2026. Deployed to production on 16 October 2026; see activation notes below.

## Create a plan

Choose **New plan**, then **Who can join?**:

- **Private invitation** (default): personal links for specific friends, a dinner date, or a closed group. Uninvited visitors cannot read or self-join the event. Personal links can still be forwarded; recipients should keep theirs private.
- **Open invitation**: anyone with the shared URL can read the invitation and join using a name or nickname and an email address. No guest account is required. Email is used for the RSVP confirmation, private return link and calendar details, and is visible to the host and delivery provider; joining does not subscribe the guest to a newsletter. A random browser token makes retries idempotent; HttpOnly session cookies retain the guest identity. Names are hidden by default; the host may explicitly choose to show confirmed names, disclosed on the join form. The email requirement and confirmation delivery are a local follow-up, pending production activation below.

For an existing dance class, workshop, concert or other ticketed event, select **I’m attending an existing event** and add its HTTPS booking URL. Save the draft, sign in as an approved host, then publish. The host account requirement has not changed; this does not add public host registration.

**Get tickets / booking** opens the original organiser. Good Plans RSVP is separate, never a ticket reservation. Our group capacity/waitlist does not represent ticket availability. Cancelling a meet-up does not cancel the original event or refund tickets. Booking links also appear in copied invitation text, guest emails and calendar descriptions.

Open invitations have a copyable link in both plan details and the organiser portal. Private guests receive individual invitation links. The mode is fixed at publication; editing an existing event cannot silently expose a private invitation.

Open joining uses the existing serialized RSVP capacity and waitlist handling. It limits attempts by event/IP and caps created guest invitations. Closed, cancelled, unpublished or ended events cannot accept open joins. Guests can use the private link in their confirmation email to recover their invitation on another browser. Email addresses alone do not identify or merge guests. The host can manage guest data and support requests. No children’s profiles or care needs are collected.

## Local dance-class test

The local test uses the user’s screenshot for Saturday 17 October 2026, 10:30–11:25 Dublin time, and Mari Ribeiro’s service page for Curved Street, Temple Bar, Dublin. Booking URL: https://www.mari-ribeiro.com/book-online . Current ticket availability and the precise studio entrance must be checked with Mari. No childcare has been confirmed for this class.

The invitation is clearly labelled TEST and lives only in the local preview. Two fictional guests joined; both the new name-and-email flow and adding email to an existing RSVP were checked. No real invitations, purchases or email sends were made. It must not be shared as a live invitation.

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

## RSVP email and calendars (local follow-up)

An open guest supplies their name and email before joining. After saving an RSVP, the guest sees the actual response and email status. Existing guests without an email can add one using **Email me the invitation & calendar**. Hosts see the saved response in the guest list; acceptance is automatic when group capacity permits, rather than a separate host approval. A full group can put the guest on the waitlist.

Confirmation messages distinguish Going, Maybe, Waitlisted and Declined. They include the inviter, time, venue, a private return link, a Google Calendar link and an `invitation.ics` attachment for Apple Calendar/Outlook. Waitlisted and Maybe calendar entries are tentative. Calendar exports are saved copies, not an automatically synchronised calendar subscription. RSVP never purchases or reserves an external class ticket.

Private recovery links are stored hashed and expire; existing invitation links remain valid. Repeated identical requests reuse the delivery record, and new confirmations are limited per recipient and invitation. A delivery failure does not undo the RSVP. The interface reports failure, suppression or rate limiting without claiming an email was delivered. Development stores messages in the local mailbox and explicitly reports that no real email was sent.

Migration **0013_rsvp_confirmations.sql** is applied locally only. Production activation requires pending migrations 0012 and 0013, the matching Worker and frontend, and verification of the configured sender and delivery to an approved test recipient. Provider acceptance is not proof of inbox delivery. Local verification: 68 unit checks, four isolated Worker/D1 journeys, production build, browser joining/email forms and generated email/ICS inspection. See the [test confirmation email](./screenshots/rsvp-confirmation-email-2026-10-16.jpg).

The confirmation’s illustrated follow-up restores the original gathering collage, cream paper and pink edge. An optimised JPEG keeps the complete artwork proportions and uses a public, same-origin URL without recipient identifiers. All RSVP details and actions remain text when images are blocked. The email uses presentation tables and inline styles, with a stacked phone layout; browser checks at 320px and 390px show no horizontal overflow. Native Gmail/Outlook rendering and inbox delivery remain production checks. See the [illustrated confirmation](./screenshots/rsvp-confirmation-illustrated-2026-10-16.jpg).
