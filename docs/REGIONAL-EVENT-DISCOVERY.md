# Regional event discovery

12 October 2026. Implementation plan; Brazil and Spain live feeds are not connected.

Launch scope: **São Paulo, Brazil; Barcelona, Spain**. Ireland stays as currently supported. Other Brazil/Spain cities are outside this launch.

Language and location are independent. English, Spanish and Brazilian Portuguese change the interface. A chosen country and city determine suggestions, currency and event timezone. Changing language never relocates an existing plan or translates a person's private notes.

## Available locally

- Material Design select menus in navigation, planning, settings, discovery, support and newsletter forms.
- São Paulo and Barcelona location settings, with reais/euros and the appropriate city timezone. Ireland remains available in every language. Existing saved plans retain their own location and timezone.
- Evergreen Brazil venue ideas in São Paulo and Spain ideas in Barcelona. These do not have invented dates, prices, availability or tickets.
- Good Plans editorial suggestion titles and descriptions translated across all three languages. Official venue names and organiser-authored listings remain as supplied.
- A suggestion opens an editable personal draft with the chosen region's currency and timezone. Personal planning remains local unless account sync is enabled.

## Source strategy

| Source | Proposed use | Access and limitations |
| --- | --- | --- |
| [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/) | Provider events filtered by `countryCode=BR` or `ES`, then city and event date | API key required. Supports Brazil and Spain; actual availability varies by city and category. It cannot be treated as complete coverage of local classes or retreats. |
| [Sympla producer API](https://developers.sympla.com.br/__virtual/developers/api-doc) | Listings from participating Brazilian organisers | Producer-oriented access to an organiser's own events; do not assume access to all Sympla events. Require organiser permission and appropriate API credentials. |
| Official cultural programmes | Classes, museums, community activities and seasonal events | Current links are for visiting programmes. Confirm an authorised API/feed or permission before building an importer. A public webpage alone is not an API contract. |
| Local studios, community groups and retreat hosts | Gaps in creative classes, women-centred gatherings and caregiving activities | Offer manual entry or an approved RSS/JSON/iCalendar feed. Keep source links and review changes before publishing. |

Examples already linked: [Sesc São Paulo](https://www.sescsp.org.br/programacao/), [Barcelona's Parc de la Ciutadella](https://www.barcelona.cat/es/que-hacer-en-bcn/parques-y-jardines/parc-de-la-ciutadella-92086011921). These links do not imply feed agreements or a confirmed event listing.

## Build sequence for live collection

1. **Make stored discovery records regional.** Add country, canonical city, timezone, currency, source language, source URL, provider update time and last successful check. Backfill existing discovery listings as Dublin/Ireland only after reviewing the current dataset. Add indexes for country/city/date. Keep source identity stable for deduplication.
2. **Scope every read and edit.** Public discovery, organiser manual entry, review queues, saved discovery drafts and newsletter editions need country/city filters. Regional profile settings must never change a previously saved or published event's timezone/currency.
3. **Extend the background collector.** Generalise the Dublin provider job to São Paulo (BR) and Barcelona (ES), with country-specific queries such as aquarela/cerâmica/dança/retiro and acuarela/cerámica/baile/retiro. Respect provider limits, use bounded retries and preserve provider dates/timezones rather than the viewer's browser timezone. Keep credentials in Worker secrets.
4. **Publish only reviewed listings.** Ingest into a candidate queue, deduplicate, retain the original source, and review suitability/accuracy. Mark explicit women-only or caregiving requirements from source information, never inferred from names. Partner outings should include broad shared interests. Significant date/venue/cancellation changes need re-review or withdrawal. Expired, cancelled and stale listings disappear from public discovery.
5. **Add a plan with one action.** Copy verified date, time, place, source link and cost into an editable draft. Clearly say that adding a plan does not reserve tickets. Unknown prices/end times must remain unknown or explicitly labelled as planning estimates.
6. **Add regional newsletters separately.** Store subscription city and delivery language independently of interface language and consent. Prepare a city-specific weekly edition for organiser approval; verify unsubscribe, suppression and delivery before enabling automatic sends.

## Before claiming live coverage

- Test Brazil and Spain provider fixtures, city isolation, unavailable providers, missing prices, cancellation, refresh and duplicate handling.
- Test São Paulo and Barcelona event and calendar times from a browser in Ireland; retain timezone support for older plans outside the launch cities.
- Verify a real authorised source in each launch city and review a pilot batch.
- Deploy the migration, collector and regional query routes together, then run a production smoke test.
- Verify actual newsletter delivery and consent per region before exposing signup.

The existing automatic collector, manual newsletter listings and subscriptions are Dublin-specific. Translating their interface does not make them a Brazil or Spain feed. No production feed, deployment or external delivery was activated in this UI follow-up.


### Public launch scope — English and Dublin only

The creator has narrowed the visible release to English and Dublin. Language and country/city selectors are hidden. Existing saved plans retain their authored content, locations and timezones. Spanish, Brazilian Portuguese, São Paulo and Barcelona remain deferred; their dictionaries and catalogue work are kept for a later release. Regional source collectors and newsletters are not blockers for this Dublin release. English links and legacy translated URLs use the English interface; new planning defaults use Dublin, EUR and Europe/Dublin.
