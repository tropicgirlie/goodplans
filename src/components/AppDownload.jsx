import Artwork from "./Artwork";
import { localeHref, ui } from "../i18n/core";

const testFlightUrl = (import.meta.env.VITE_TESTFLIGHT_URL || "").trim();
const hasTestFlightLink = /^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+\/?$/.test(testFlightUrl);

export default function AppDownload() {
  return (
    <main className="gp-app service-page gp-app-download">
      <section aria-labelledby="app-download-title">
        <a href={localeHref("/")}>{ui("← Us & About home")}</a>
        <Artwork className="gp-app-download-mark" src="/images/good-plans-mark.png" alt="" loading="eager" sizes="96px" />
        <h1 id="app-download-title">{ui("Us & About for iPhone")}</h1>
        <p>{ui("Make plans with friends, discover Dublin events and keep your invitations in one place.")}</p>
        {hasTestFlightLink ? (
          <a className="gp-button" href={testFlightUrl}>{ui("Join the TestFlight beta")}</a>
        ) : (
          <p className="gp-app-download-status">{ui("TestFlight invitations are being prepared.")}</p>
        )}
      </section>
    </main>
  );
}
