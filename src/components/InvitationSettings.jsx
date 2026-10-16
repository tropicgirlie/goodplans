import { useId } from 'react';
export default function InvitationSettings({form,onChange}) {
  const group=useId();
  return <fieldset className="gp-invitation-settings"><legend>Who can join?</legend>
    <label className="gp-host-name-field">Your name on the invitation<input value={form.hostName||''} maxLength={80} autoComplete="given-name" placeholder="e.g. Luana" onChange={e=>onChange({...form,hostName:e.target.value})}/><small>Friends will see “{form.hostName?.trim()||'Your name'} is inviting you”. This is separate from your account email.</small></label>
    {[['invite','Private invitation','Only the people you invite. Each guest gets a personal invitation link.'],['public','Open invitation','Anyone with the shared link can join you. The link can be forwarded.']].map(([value,title,description])=><label key={value} className={(form.visibility||'invite')===value?'selected':''}><input type="radio" name={group} value={value} checked={(form.visibility||'invite')===value} onChange={()=>onChange({...form,visibility:value,...(value==='public'?{showGuests:false}:{})})}/><span><b>{title}</b><small>{description}</small></span></label>)}
    <label className="gp-attending-option"><input type="checkbox" checked={form.planType==='attend'} onChange={e=>onChange({...form,planType:e.target.checked?'attend':'own'})}/><span><b>I’m attending an existing event</b><small>A dance class, gig or workshop: invite friends to join you, while tickets stay with the original organiser.</small></span></label>
    {form.planType==='attend'&&<label className="gp-booking-field">Ticket or booking link (optional)<input type="url" value={form.bookingUrl||''} maxLength={2048} placeholder="https://…" onChange={e=>onChange({...form,bookingUrl:e.target.value})}/></label>}
  </fieldset>;
}
