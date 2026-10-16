import { randomToken, sha256, calendarUrls, makeIcs } from './core.js';
import { emailStatement, deliverPending } from './mail.js';
import { guestEmail } from '../../shared/invitations.js';

const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const labels = {accepted:'You’re in',maybe:'Your maybe is saved',waitlisted:'You’re on the waitlist',declined:'Your RSVP is declined',cancelled:'This meet-up is cancelled'};
function base64(text) {
  let bytes = '';
  for (const byte of new TextEncoder().encode(text)) bytes += String.fromCharCode(byte);
  return btoa(bytes);
}
export function receiptContent(event, invitation, rsvp, privateUrl, origin) {
  const status = event.status==='cancelled'?'cancelled':rsvp.status;
  const label=labels[status], host=event.host_name||'Your host';
  const time = new Intl.DateTimeFormat('en-IE',{timeZone:event.timezone,dateStyle:'full',timeStyle:'short'});
  const schedule=`${time.format(new Date(event.starts_at))} – ${time.format(new Date(event.ends_at))} (${event.timezone})`;
  const meaning=status==='accepted'?`You have a place in ${host}’s group.`:status==='waitlisted'?'You do not have a confirmed place in the group yet. We’ll email you if a place opens.':status==='maybe'?'You have not confirmed attendance. You can change your response using your private link.':status==='declined'?'You are not counted as attending.':'Our group meet-up is cancelled; check the original organiser about the underlying event.';
  const ticketNote=event.plan_type==='attend'?'Your Good Plans RSVP does not buy or reserve a ticket. Book your own ticket with the original organiser.':'';
  const details=[`${host} is inviting you to ${event.title}.`,schedule,event.venue_name,`${rsvp.party_size||1} ${rsvp.party_size===2?'people':'person'} in your party.`,meaning,event.booking_url?`Tickets / booking: ${event.booking_url}`:'',ticketNote].filter(Boolean);
  const calendarEvent={...event,title:status==='waitlisted'?`Waitlist — ${event.title}`:status==='maybe'?`Maybe — ${event.title}`:event.title,description:[event.description,`Your response: ${label}.`,meaning].filter(Boolean).join('\n\n'),calendar_status:['declined','cancelled'].includes(status)?'CANCELLED':status==='accepted'?'CONFIRMED':'TENTATIVE'};
  const google=calendarUrls(calendarEvent,origin).google;
  const text=[`${label}: ${event.title}`,`Hi ${invitation.guest_name},`,...details,`Your private invitation:\n${privateUrl}`,`Add to Google Calendar:\n${google}`,'Apple Calendar or Outlook: open the attached invitation.ics file.','Calendar additions are saved copies. Reopen your invitation for the latest details.','This email is about your RSVP only. It does not subscribe you to a newsletter.'].filter(Boolean).join('\n\n');
  const artworkUrl = new URL('/images/good-plans-gathering-email.jpg', origin).href;
  const html = `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media only screen and (max-width:560px){.email-shell{padding:16px 10px!important}.email-content{padding:24px 20px!important}.cover-cell{display:block!important;width:100%!important;padding:0 0 24px!important}.title-cell{display:block!important;width:100%!important}.email-title{font-size:30px!important}}</style></head>
<body style="margin:0;padding:0;background:#fff0ca;color:#28241f;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff0ca"><tr><td class="email-shell" align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px"><tr><td style="padding:0 0 20px;text-align:center;font-size:12px;font-weight:bold;letter-spacing:3px">GOOD PLANS &nbsp; / &nbsp; TIME WELL SPENT</td></tr>
<tr><td style="background:#f49ac2;padding:0 6px 6px 0">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fffdf8;border:2px solid #28241f">
<tr><td class="email-content" style="padding:28px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td class="cover-cell" width="208" valign="middle" style="width:208px;padding:0 26px 0 0"><img src="${escape(artworkUrl)}" alt="" width="208" height="325" style="display:block;width:208px;max-width:100%;height:auto;margin:0 auto;border:0"></td>
<td class="title-cell" valign="middle"><p style="margin:0 0 20px"><span style="display:inline-block;border:1px solid #28241f;border-radius:20px;padding:8px 14px;background:#fff0ca;font-size:14px;font-weight:bold">${escape(label)}</span></p><h1 class="email-title" style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;margin:0 0 18px;overflow-wrap:anywhere">${escape(event.title)}</h1><p style="font-size:16px;line-height:1.5;margin:0">A plan from <strong>${escape(host)}</strong></p></td>
</tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;border-top:1px solid #d9caad"><tr><td style="padding-top:24px;font-size:16px;line-height:1.6">
<p style="margin:0 0 16px">Hi ${escape(invitation.guest_name)},</p>
${details.slice(1).map(line=>`<p style="margin:0 0 16px">${escape(line)}</p>`).join('')}
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 20px"><tr><td bgcolor="#a83f2c" style="border-radius:24px;text-align:center"><a href="${escape(privateUrl)}" style="display:inline-block;background:#a83f2c;border:1px solid #a83f2c;border-radius:24px;color:#ffffff;padding:13px 20px;font-size:15px;font-weight:bold;line-height:1.5;text-decoration:none">Open your private invitation</a></td></tr></table>
<p style="margin:0 0 12px"><a href="${escape(google)}" style="color:#a83f2c;font-weight:bold;text-decoration:underline">Add to Google Calendar</a></p><p style="margin:0;font-size:14px">Apple Calendar or Outlook: open the attached invitation.ics file.</p>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:20px 12px 0;font-size:12px;line-height:1.6;text-align:center">Calendar additions are saved copies. Reopen your invitation for the latest details.<br>This RSVP email does not subscribe you to a newsletter. Keep your personal invitation link private.</td></tr>
</table></td></tr></table></body></html>`;
  return {subject:`${label}: ${event.title}`,text,html,attachments:[{filename:'invitation.ics',content:base64(makeIcs(calendarEvent))}]};
}

async function confirmationKey(event,invitation,rsvp,email) {
  return `receipt-${await sha256(JSON.stringify([invitation.id,email,event.revision,event.status,rsvp.status,rsvp.party_size]))}`;
}
export async function currentConfirmation(env,event,invitation,rsvp) {
  if(!invitation?.guest_email||!rsvp)return null;
  try {
    const email=guestEmail(invitation.guest_email);
    const key=await confirmationKey(event,invitation,rsvp,email);
    const delivery=await env.DB.prepare('SELECT status FROM email_deliveries WHERE id=?').bind(key).first();
    if(delivery)return {status:env.ENVIRONMENT==='development'&&delivery.status==='sent'?'development':delivery.status};
    const recipientKey=`receipt-email:${await sha256(`${event.id}:${email}`)}`;
    const limit=await env.DB.prepare('SELECT key FROM auth_limits WHERE key IN (?,?) AND count>5 AND expires_at>? LIMIT 1').bind(recipientKey,`receipt-invitation:${invitation.id}`,Math.floor(Date.now()/1000)).first();
    return limit?{status:'limited'}:null;
  }catch{return null;}
}

// Each response/version/recipient gets one stable outbox item. Retries reuse its body and link.
export async function queueRsvpConfirmation(env, event, invitation, origin) {
  if (!invitation.guest_email) return {status:'not_requested'};
  try {
    const email=guestEmail(invitation.guest_email);
    const latest=await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(event.id).first();
    const rsvp=await env.DB.prepare('SELECT status,party_size FROM rsvps WHERE invitation_id=?').bind(invitation.id).first();
    if(!latest||!rsvp)return {status:'not_requested'};
    const key=await confirmationKey(latest,invitation,rsvp,email);
    let delivery=await env.DB.prepare('SELECT status,body FROM email_deliveries WHERE id=?').bind(key).first();
    let privateUrl;
    if(!delivery){
      const seconds=Math.floor(Date.now()/1000);
      const rateKey=`receipt-email:${await sha256(`${event.id}:${email}`)}`;
      for(const limitKey of [rateKey,`receipt-invitation:${invitation.id}`]){
        const rate=await env.DB.prepare('INSERT INTO auth_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(limitKey,seconds+3600,seconds,seconds).first();
        if(rate.count>5)return {status:'limited'};
      }
      const token=randomToken();
      privateUrl=`${origin}/events/${event.slug}#invite=${encodeURIComponent(token)}`;
      const message=receiptContent(latest,invitation,rsvp,privateUrl,origin);
      const expires=new Date(Math.max(Date.now()+30*86400000,+new Date(latest.ends_at)+7*86400000)).toISOString();
      await env.DB.batch([
        env.DB.prepare('INSERT INTO guest_access_tokens(token_hash,invitation_id,expires_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM email_deliveries WHERE id=?)').bind(await sha256(token),invitation.id,expires,key),
        emailStatement(env,{key,eventId:event.id,invitationId:invitation.id,to:email,...message}),
      ]);
    }
    await deliverPending(env,key);
    delivery=await env.DB.prepare('SELECT status,body FROM email_deliveries WHERE id=?').bind(key).first();
    // Only local test mode exposes a mailbox link to make the complete recovery journey testable.
    const devInviteUrl=env.ENVIRONMENT==='development'?(delivery?.body.match(/Your private invitation:\n(\S+)/)?.[1]||privateUrl):undefined;
    return {status:env.ENVIRONMENT==='development'&&delivery?.status==='sent'?'development':delivery?.status||'failed',...(devInviteUrl?{devInviteUrl}:{})};
  } catch {
    return {status:'failed'}; // Saving an RSVP must not be rolled back or misreported by a mail failure.
  }
}
