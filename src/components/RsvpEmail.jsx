import { useEffect, useState } from 'react';
import { emailRsvpConfirmation } from '../lib/goodPlansApi';

export function confirmationMessage(status) {
  if(status==='development')return 'Your RSVP is saved. In this test preview, no real email is sent.';
  if(status==='sent')return 'Your RSVP email is on its way. Check your inbox or spam folder.';
  if(status==='queued')return 'Your RSVP is saved. Your confirmation email is queued.';
  if(status==='limited')return 'Your RSVP is saved. The email limit has been reached; try again later.';
  if(['failed','suppressed'].includes(status))return 'Your RSVP is saved, but the email could not be sent. Check your address below or ask your host for help.';
  return '';
}
export default function RsvpEmail({plan,onRefresh}) {
  const [email,setEmail]=useState(plan.guestEmail||''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
  useEffect(()=>setStatus(''),[plan.confirmation?.status,plan.rsvp?.status]);
  const message=confirmationMessage(status||plan.confirmation?.status);
  return <section className="gp-rsvp-email">
    {message&&<p role="status" className="gp-field-note">{message}</p>}
    <details open={!plan.guestEmail?true:undefined}>
      <summary>{plan.guestEmail?'Email confirmation & address':'Email me the invitation & calendar'}</summary>
      <p className="gp-field-note">We’ll email your current RSVP, a private return link and calendar options. Your email is visible to the host, never other guests. This does not sign you up for a newsletter.</p>
      <form className="gp-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const result=await emailRsvpConfirmation(plan.remoteId,plan.invitationId,email);setStatus(result.confirmation.status);await onRefresh?.();}catch(e){setError(e.message);}finally{setBusy(false);}}}>
        <label>Your email<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <button className="gp-button secondary" disabled={busy}>{busy?'Sending…':'Email my RSVP & calendar'}</button>
        {error&&<p role="alert" className="gp-error">{error}</p>}
      </form>
    </details>
  </section>;
}
