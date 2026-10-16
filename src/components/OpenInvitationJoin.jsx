import { useState } from 'react';
import { joinOpenInvitation } from '../lib/goodPlansApi';
function joinToken(id) {
  const key=`good-plans-open-join:${id}`;
  try { const saved=sessionStorage.getItem(key);if(/^[a-f0-9]{64}$/.test(saved||''))return saved; } catch { /* Optional recovery only. */ }
  const token=[...crypto.getRandomValues(new Uint8Array(32))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  try{sessionStorage.setItem(key,token);}catch{/* Cookie will retain a completed response. */}
  return token;
}
export default function OpenInvitationJoin({plan,partySize,onJoined}) {
  const [token]=useState(()=>joinToken(plan.remoteId)),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <section className="gp-open-join"><h3>Come along?</h3><p>No account needed. Add your name so the host knows you’re joining.</p>
    <p className="gp-field-note">{plan.showGuests?'Your name will be visible to anyone with this invitation link.':'Your name is visible to the host; the public invitation keeps guest names private.'} Your response is remembered in this browser.</p>
    <form className="gp-form" onSubmit={async e=>{e.preventDefault();const name=new FormData(e.currentTarget).get('name'),status=e.nativeEvent.submitter?.value||'accepted';setBusy(true);setError('');try{await joinOpenInvitation(plan.remoteId,{name,status,joinToken:token,partySize});await onJoined();}catch(e){setError(e.message);}finally{setBusy(false);}}}>
      <label>Your name or nickname<input name="name" required maxLength={80} autoComplete="given-name"/></label>
      <div className="gp-detail-actions"><button name="status" value="accepted" className="gp-button" disabled={busy}>{busy?'Saving…':'I’m joining you'}</button><button name="status" value="maybe" className="gp-button secondary" disabled={busy}>Maybe</button></div>
      {error&&<p role="alert" className="gp-error">{error}</p>}
    </form>
  </section>;
}
