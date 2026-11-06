import { useEffect, useState } from "react";

/** True when running as an installed iOS / PWA home-screen app. */
export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
  // iOS Safari "Add to Home Screen"
  if (typeof navigator !== "undefined" && navigator.standalone === true) return true;
  return false;
}

export function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function wantsAppMode(search = "") {
  try {
    const params = new URLSearchParams(
      search || (typeof window !== "undefined" ? window.location.search : ""),
    );
    if (params.get("app") === "1") return true;
  } catch {
    /* ignore */
  }
  return isStandaloneDisplay();
}

/** Phone-width layout used for the iOS app shell. */
export function usePhoneLayout(breakpoint = 760) {
  const [phone, setPhone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false,
  );
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setPhone(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [breakpoint]);
  return phone;
}

export function useIosAppMode() {
  const phone = usePhoneLayout();
  const [appMode, setAppMode] = useState(() => wantsAppMode());
  useEffect(() => {
    const sync = () => setAppMode(wantsAppMode());
    sync();
    window.addEventListener("resize", sync);
    const media = window.matchMedia?.("(display-mode: standalone)");
    media?.addEventListener?.("change", sync);
    return () => {
      window.removeEventListener("resize", sync);
      media?.removeEventListener?.("change", sync);
    };
  }, []);
  return {
    phone,
    appMode: appMode || phone,
    standalone: isStandaloneDisplay(),
    apple: isAppleMobile(),
    showInstallTip: isAppleMobile() && !isStandaloneDisplay(),
  };
}
