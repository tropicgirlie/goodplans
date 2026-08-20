const root = (import.meta.env.VITE_GOOD_PLANS_API_URL || '').replace(/\/$/, '');
const devHostKey = import.meta.env.VITE_GOOD_PLANS_DEV_HOST_KEY;

function endpoint(path) { return `${root}${path}`; }

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set('content-type', 'application/json');
  if (devHostKey) headers.set('x-good-plans-demo-host', devHostKey);
  const response = await fetch(endpoint(path), { ...options, headers, credentials: 'include' });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(data?.error || 'Good Plans could not complete that request.');
  return data;
}

export function findVenues(input) { return request('/api/recommendations', { method: 'POST', body: JSON.stringify(input) }); }
export function createEvent(input) { return request('/api/host/events', { method: 'POST', body: JSON.stringify(input) }); }
export function submitRsvp(eventId, status) { return request(`/api/events/${encodeURIComponent(eventId)}/rsvps`, { method: 'POST', body: JSON.stringify({ status }) }); }
export function importEventLink(url) { return request('/api/host/event-imports', { method: 'POST', body: JSON.stringify({ url }) }); }
export function confirmImportedEvent(importId, input) { return request(`/api/host/event-imports/${encodeURIComponent(importId)}/confirm`, { method: 'POST', body: JSON.stringify(input) }); }
export function readEvent(slug) { return request(`/api/events/${encodeURIComponent(slug)}`); }
export function exchangeInvite(token) { return request('/api/invites/exchange', { method: 'POST', body: JSON.stringify({ token }) }); }
export function calendarDownload(slug) { return endpoint(`/api/events/${encodeURIComponent(slug)}/calendar.ics`); }

// Auth API Calls
export function getAuthStatus() { return request('/api/auth/status'); }
export function requestOtp(email) { return request('/api/auth/otp/request', { method: 'POST', body: JSON.stringify({ email }) }); }
export function verifyOtp(email, code) { return request('/api/auth/otp/verify', { method: 'POST', body: JSON.stringify({ email, code }) }); }
export function logout() { return request('/api/auth/logout', { method: 'POST' }); }

// Settings Sync API Calls
export function getBackendSettings() { return request('/api/host/settings'); }
export function saveBackendSettings(settings) { return request('/api/host/settings', { method: 'PUT', body: JSON.stringify({ settings }) }); }

