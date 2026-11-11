# Native preview verification — 4 November 2026

## Passed

- Swift package: 10 core tests covering Dublin DST/ISO dates, backup round trip and corrupt-file preservation, duplicate IDs, invitation URL boundaries, discovery-to-draft data, accurate local share copy, explicit invitation identity/party size, mismatched exchange, HTTP/HTML failures and minimal/idempotent publication payload.
- Full iOS Simulator app build: Xcode 26.6, iOS 26.5. Normal ad-hoc simulator signing is required for Keychain. An early unsigned build compiled but failed Keychain writes; rebuilding with normal signing resolved this and the live invitation then loaded.
- iPhone 17 Pro Simulator: created a fictional local plan and friend, edited the plan to select the friend, saved and reopened; both persisted through process termination, rebuilt-app installation and relaunch.
- Calendar review UI opens with the chosen title/dates. The first inspection exposed a missing venue; the implementation was corrected and rechecked. Cancelled the editor and discarded the unsaved event; no calendar event was written.
- Native planning-message share sheet opens; dismissed without sending.
- Live discovery request succeeds with zero reviewed upcoming events and shows its explicit empty state.
- Pasted existing public October dance invitation: actual event title, “Luana is inviting you,” Dublin date/time, venue and original ticket link render; ended event has a closed-response notice, no RSVP form.

## Deliberately not claimed as verified

No real host sign-in, future publication, guest RSVP, receipt, cancellation, or account deletion was performed from the native app. Those still need controlled end-to-end tests. No new production event/guest was created and no real email was sent. Live read-only calls do not verify authenticated cookie expiry/restoration or idempotency against the actual Worker; core tests use isolated protocol stubs.

Physical-device testing, VoiceOver, large accessibility text, narrow iPhones, iPad/rotation, dark appearance, backup import/export UI, failure/recovery journeys, interrupted network requests and installed-app links remain release gates. The preview uses a light appearance explicitly while dark colours are pending. No TestFlight distribution or App Store submission exists.

Screenshots are Simulator evidence, not design mockups. Test data remains only in the Simulator's private app container and is not seeded into a fresh installation.

## 5 November 2026 — Us & About display rebrand

The signed Simulator build has `CFBundleDisplayName` set to **Us & About**. Installed it over the existing prototype with the same bundle/Keychain/local-data identifiers; the fictional saved plan and friend remain present. The You screen shows Us & About with the existing illustrated mark. Ten core tests and the full app build pass. [App screenshot](us-and-about-ios-2026-11-05.png). Production remains unchanged.
