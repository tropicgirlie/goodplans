# Us & About for iOS

The native app uses the existing Us & About website and Cloudflare API. The first TestFlight build is `0.1.0 (1)`.

## Open and run

Open `ios/GoodPlans.xcodeproj`, select the **GoodPlans** scheme and an iPhone Simulator, then Run. The generated project is committed, so XcodeGen is optional. Requires Xcode with an iOS 17+ SDK; verified with Xcode 26.6 / iOS 26.5 Simulator on 4 November 2026.

```sh
# Regenerate after changing project.yml (XcodeGen must already be installed).
xcodegen generate --spec mobile/ios/project.yml

# Keep normal simulator ad-hoc signing enabled: Keychain requires app identity.
xcodebuild -project mobile/ios/GoodPlans.xcodeproj -scheme GoodPlans \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/good-plans-ios-build build

swift test --package-path mobile/GoodPlansCore
```

For a physical iPhone, choose your Apple development team in Signing & Capabilities. The beta keeps `systems.luana.goodplans.prototype` so existing installs can retain their local plans and sessions.

## What works in this preview

- Native My plans and My people screens: create, edit and remove local drafts and people, select friends, choose Dublin dates and an explicit end time, and keep useful private preferences. Data survives app restart.
- Public Dublin discovery API with search and category filters; a source can become an editable local draft. Loading, failure and empty are distinct. On 4 November the live feed has no reviewed upcoming entries: the app shows that honestly.
- Native calendar review sheet and system sharing. Calendar additions are independent copies; they do not automatically track later host changes. Sharing a local planning message does **not** collect RSVPs.
- Existing approved-host email-code sign-in and explicit confirmation before publishing an open/private invitation. Publishing sends the plan and selected guest names, not private friend preferences. The organiser portal remains the place for series, published edits, guest operations and curation.
- Paste an existing invitation, show the inviter, venue, tickets, response and closed/cancelled state; open joining and personal-link RSVP API integration, plus-one and waitlist feedback. Guests can continue using the website without installing this app.
- Native backup export/import with a replacement confirmation. These are app backups, not web-browser backup imports or cloud sync.

## Privacy and credentials

Plans and people live in an atomically saved, protected Application Support file. This does not exclude local files from normal iOS device backups. Cookies, personal invitation links and retry tokens use this device's Keychain; they are excluded from the app's JSON export. An exported backup still contains names, notes and plan details, so share it deliberately. There is no contact-book access, location tracking, analytics SDK, advertising identifier or API key bundled here.

Sign-in does not upload the local workspace. Publishing and guest RSVPs intentionally send their required details to the existing Us & About API/email service. Signing out ends the host session; local drafts and private guest invitation access remain on the device. Do not use a shared device for private invitations.

The app uses `https://goodplans.luana.systems`. Production emails/RSVPs are real when the person submits them. Automated tests use an isolated URLProtocol stub; UI verification used fictional local records and public **read-only** production requests, not real host publication or RSVPs.

## Invitation links

Paste links from the current production domains in **My plans → Have an invitation link?**. Private `#invite=` capabilities are validated and exchanged for per-invitation cookies. They should never be committed, logged or put into screenshots.

The development-only scheme `goodplans-preview` accepts an encoded HTTPS invitation in its `url` query parameter. There is no Universal Links entitlement yet: normal links still open the website. Associated Domains, an AASA endpoint, Apple team identity and an installed-app routing test depend on the final domain/team decision.

## TestFlight

Sign in to the Apple developer team in Xcode Settings → Accounts. Select that team for the GoodPlans target, archive for a generic iOS device, then upload from Xcode Organizer to the App Store Connect app with the matching bundle ID. Increment the build number in `ios/project.yml` and regenerate the project before uploading another build of the same version.

After Apple approves the first external beta and the external testing group has a public invitation link, set `VITE_TESTFLIGHT_URL` to that link when building the website. The iPhone app page at `/?page=app` will show the join button. Until the link is configured, the page shows the beta status.

## Verification and release gates

See [verification record](docs/VERIFICATION.md) and [brand decision](docs/BRAND-DECISION.md). The core tests cover persistence, corrupted backups, dates/DST, restricted invitation URLs, event identity, explicit guest context, API failures, and publication payload/privacy/idempotency. A successful simulator build is not full end-to-end production verification.

During beta, verify future open/private host-to-guest journeys, cookie restoration and expiry, Keychain persistence on a signed device, receipt and cancellation delivery, VoiceOver, larger text, iPad rotation, and failure recovery. Before an App Store launch, complete in-app account deletion, privacy disclosures and manifest audit, review credentials, and screenshots and support metadata.
