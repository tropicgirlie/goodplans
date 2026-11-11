# Cursor branch review — 10 November 2026

**Disposition:** The creator rejected these changes. All three Cursor commits were reverted in commit `6d444db` and that revert was pushed to `cursor/invite-preview-pilot-mobile-fc39`. The resulting branch tree exactly matches pre-Cursor base `5d67f00`. The local Us & About/native app files were preserved; no Cursor feature import is planned. Findings below document the rejected implementation.

Reviewed `origin/cursor/invite-preview-pilot-mobile-fc39` at `6417ff8`, against the shared main ancestor `5d67f00` and the current local workspace. This is a code/build review; phone/browser interactions on that branch were not tested. The creator's exact intended Cursor changes are still being clarified.

## Why the work diverged

The local Us & About display rebrand and `mobile/ios/GoodPlans.xcodeproj` have not been committed/pushed. Cursor's remote branch starts from the older Good Plans snapshot and therefore contains neither. Its `docs/IOS-APP.md` explicitly proposes an installable web app and a future native wrapper, while this workspace already has a native SwiftUI app. The two implementations should not be merged indiscriminately or described as the same iOS deliverable.

## Findings

1. **Different app direction and outdated name.** Cursor adds a manifest, Apple web-app metadata, a React home screen and bottom navigation. It does not add native SwiftUI functionality. The manifest, phone home and mobile-shell documentation still say Good Plans. References: `docs/IOS-APP.md:3,31`; `public/manifest.webmanifest:2–3`; `src/components/IosHome.jsx:44`.
2. **Phone width changes the product entry point.** `src/lib/iosApp.js:64` sets `appMode` for every phone-width browser, even without installation or `?app=1`. `src/App.jsx` then substitutes `IosHome` for the marketing homepage. This hides the website's public demonstration and explanatory content from ordinary phone visitors. Treat a responsive website and an explicitly selected app mode separately unless that replacement is intentional.
3. **Plan cards lose their destination.** `src/components/IosHome.jsx:117` sends every plan card to the plan list, without the selected plan ID. The existing routing model supports a specific plan context; the card should open that plan.
4. **The upcoming shortlist is not chronological.** `src/components/IosHome.jsx:29–31` filters using only the start date, then takes the first three stored records. It can surface a later/undated plan before an imminent one, retain already-ended plans from today, and omit an ongoing multi-day plan that began yesterday. Reuse the existing time-aware planning model before limiting results.
5. **The new invitation preview has separate behaviour from real invitations.** It offers a labelled demo rather than actual RSVP functionality. Its custom dialog (`src/components/InvitationPreviewDemo.jsx:104`) does not implement Escape handling, focus containment or focus restoration. Its save payload (`:89–100`) omits the time/endTime displayed by the preview. Keep the preview idea only after aligning the draft handoff, accessibility and wording with existing invitation behaviour.

## Validation

- Cursor branch: all 70 existing JavaScript checks and a fresh Vite production build pass in an isolated detached worktree. These checks do not cover the new mobile entry-point, plan-card navigation or preview accessibility.
- Current local SwiftUI app: 10 core tests and a fresh signed iOS Simulator build pass. This does not establish full UI/production readiness for the ongoing native changes.
- No Cursor changes were merged into the working source. Existing native work, Us & About branding, user-owned `dist/index.html` and `.claude/` were preserved. No production deployment, database mutation or real email send occurred.

## Original review recommendation (superseded by rejection)

Use the current Us & About website and native app as the shared baseline first. Keep the native iOS app as the app deliverable. Consider the public invitation-preview improvement separately, without automatically replacing the phone website with a second app shell. Confirm the creator's original Cursor instruction before importing the desired behaviour.
