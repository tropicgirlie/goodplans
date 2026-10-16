export function bookingLink(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  try {
    if (typeof raw !== 'string' || raw.length > 2048) throw new Error();
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw Object.assign(new Error('Use a complete HTTPS ticket or booking link.'), { status: 400 });
  }
}
export function invitationOptions(input = {}) {
  const visibility = input.visibility ?? 'invite', planType = input.planType ?? 'own';
  if (!['invite','public'].includes(visibility) || !['own','attend'].includes(planType))
    throw Object.assign(new Error('Choose an open or private invitation and a valid plan type.'), { status: 400 });
  return {visibility,planType,bookingUrl:bookingLink(input.bookingUrl),showGuests:visibility==='public'?input.showGuests===true:input.showGuests!==false};
}

export function bookingDetails(url, attending = false) {
  const link = bookingLink(url);
  return [link ? `Tickets / booking: ${link}` : '', attending ? 'An RSVP joins our group; it does not buy or reserve an event ticket.' : ''].filter(Boolean).join('\n');
}

export function inviterName(raw) {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw !== 'string' || raw.trim().length > 80)
    throw Object.assign(new Error('Use an invitation host name of up to 80 characters.'), { status: 400 });
  return raw.trim();
}
