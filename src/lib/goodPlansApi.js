const root = (import.meta.env.VITE_GOOD_PLANS_API_URL || "").replace(/\/$/, "");
const devHostKey = import.meta.env.VITE_GOOD_PLANS_DEV_HOST_KEY;

function endpoint(path) {
  return `${root}${path}`;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("content-type", "application/json");
  if (devHostKey) headers.set("x-good-plans-demo-host", devHostKey);
  const response = await fetch(endpoint(path), {
    ...options,
    headers,
    credentials: "include",
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok)
    throw new Error(
      data?.error ||
        "Good Plans could not complete that request. Please try again.",
    );
  if (!contentType.includes("application/json"))
    throw new Error(
      "The invitation service is unavailable. Your local drafts are safe. Please try again later.",
    );
  return data;
}

export function findVenues(input) {
  return request("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function createEvent(input) {
  return request("/api/host/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function submitRsvp(eventId, status, partySize = 1) {
  return request(`/api/events/${encodeURIComponent(eventId)}/rsvps`, {
    method: "POST",
    body: JSON.stringify({ status, partySize }),
  });
}
export function importEventLink(url) {
  return request("/api/host/event-imports", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}
export function confirmImportedEvent(importId, input) {
  return request(
    `/api/host/event-imports/${encodeURIComponent(importId)}/confirm`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
export function readEvent(slug) {
  return request(`/api/events/${encodeURIComponent(slug)}`);
}
export function exchangeInvite(token) {
  return request("/api/invites/exchange", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
export function calendarDownload(slug) {
  return endpoint(`/api/events/${encodeURIComponent(slug)}/calendar.ics`);
}

// Auth API Calls
export function getAuthStatus() {
  return request("/api/auth/status");
}
export function requestOtp(email) {
  return request("/api/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
export function verifyOtp(email, code) {
  return request("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}
export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

// Settings Sync API Calls
export function getBackendSettings() {
  return request("/api/host/settings");
}
export function saveBackendSettings(settings) {
  return request("/api/host/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}
export function listHostEvents() {
  return request("/api/host/events");
}
export function hostDashboard(id) {
  return request(`/api/host/events/${encodeURIComponent(id)}/dashboard`);
}
export function updateHostEvent(id, input) {
  return request(`/api/host/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
export function cancelHostEvent(id, scope = "event") {
  return request(`/api/host/events/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ scope }),
  });
}
export function inviteGuest(id, input) {
  return request(`/api/host/events/${encodeURIComponent(id)}/invite`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function retryEmails(id) {
  return request(`/api/host/events/${encodeURIComponent(id)}/retry-email`, {
    method: "POST",
    body: "{}",
  });
}
export function readWorkspace() {
  return request("/api/host/workspace");
}
export function saveWorkspace(data, revision) {
  return request("/api/host/workspace", {
    method: "PUT",
    body: JSON.stringify({ data, revision }),
  });
}

export function readImportedIdea(id) {
  return request(`/api/host/event-imports/${encodeURIComponent(id)}`);
}

export function publishHostEvent(id) {
  return request(`/api/host/events/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    body: "{}",
  });
}

export function discoveryEvents() {
  return request("/api/discovery");
}
export function discoveryEvent(id) {
  return request(`/api/discovery/${encodeURIComponent(id)}`);
}
export function newsletterSubscribe(input) {
  return request("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function newsletterManage(input) {
  return request("/api/newsletter/manage", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function newsletterDashboard() {
  return request("/api/host/newsletter");
}
export function newsletterAction(action, input = {}) {
  return request(`/api/host/newsletter/${action}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function newsletterSave(id, input) {
  return request(`/api/host/newsletter/issues/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
