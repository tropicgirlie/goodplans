import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { receiptContent, queueRsvpConfirmation, currentConfirmation } from '../src/rsvp-mail.js';
import { guestEmail } from '../../shared/invitations.js';
import { sha256 } from '../src/core.js';

function fixture() {
  const db=new DatabaseSync(':memory:');
  const migrations=new URL('../migrations/',import.meta.url);
  for(const file of readdirSync(migrations).filter(f=>f.endsWith('.sql')).sort()) db.exec(readFileSync(new URL(file,migrations),'utf8'));
  db.exec(`INSERT INTO users(id,email) VALUES ('mail-host','mail-host@example.com');
    INSERT INTO events(id,host_user_id,slug,title,starts_at,ends_at,timezone,venue_name,capacity,status,visibility,host_name,booking_url,plan_type) VALUES ('mail-event','mail-host','test-dance','Dance with Mari','2026-10-17T09:30:00Z','2026-10-17T10:25:00Z','Europe/Dublin','Test studio, Dublin',12,'published','public','Luana','https://example.com/tickets','attend');
    INSERT INTO invitations(id,event_id,guest_name,guest_email,token_hash) VALUES ('mail-guest','mail-event','Test dancer','dancer@example.com','original-invitation-hash');
    INSERT INTO rsvps(id,event_id,invitation_id,status,party_size) VALUES ('mail-rsvp','mail-event','mail-guest','accepted',1);`);
  const prepare=(sql,args=[])=>({bind:(...values)=>prepare(sql,values),first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})});
  const env={ENVIRONMENT:'development',DB:{prepare,batch:async list=>Promise.all(list.map(item=>item.run()))}};
  const event=()=>db.prepare("SELECT * FROM events WHERE id='mail-event'").get();
  const guest=()=>db.prepare("SELECT * FROM invitations WHERE id='mail-guest'").get();
  return {db,env,event,guest};
}
test('RSVP receipt has actual status, safe calendar choices and a stable private return link',async()=>{
  const {db,env,event,guest}=fixture();
  const first=await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example');
  assert.equal(first.status,'development');
  const token=new URLSearchParams(new URL(first.devInviteUrl).hash.slice(1)).get('invite');
  assert.equal(db.prepare('SELECT invitation_id FROM guest_access_tokens WHERE token_hash=?').get(await sha256(token)).invitation_id,'mail-guest');
  assert.equal((await currentConfirmation(env,event(),guest(),{status:'accepted',party_size:1})).status,'development');
  assert.equal(await currentConfirmation(env,event(),guest(),{status:'maybe',party_size:1}),null,'an older going receipt must not claim the maybe response was emailed');
  assert.equal(guest().token_hash,'original-invitation-hash','email links must not invalidate the original personal invitation');
  const mail=db.prepare("SELECT * FROM local_mailbox WHERE recipient='dancer@example.com'").get();
  assert.match(mail.subject,/You’re in/);assert.match(mail.body,/Luana/);assert.match(mail.body,/10:30/);assert.match(mail.body,/Google Calendar/);assert.match(mail.body,/does not buy or reserve/);
  const attachment=JSON.parse(mail.attachments_json)[0],ics=Buffer.from(attachment.content,'base64').toString('utf8');
  assert.equal(attachment.filename,'invitation.ics');assert.match(ics,/DTSTART:20261017T093000Z/);assert.match(ics,/STATUS:CONFIRMED/);assert.doesNotMatch(ics,new RegExp(token));assert.doesNotMatch(ics,/dancer@example.com/);
  assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).devInviteUrl,first.devInviteUrl);
  assert.equal(db.prepare("SELECT count(*) AS n FROM local_mailbox WHERE recipient='dancer@example.com'").get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM guest_access_tokens').get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM newsletter_subscribers').get().n,0);
  db.exec("UPDATE rsvps SET status='waitlisted' WHERE invitation_id='mail-guest'");
  await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example');
  const waiting=db.prepare("SELECT * FROM local_mailbox WHERE subject LIKE '%waitlist%'").get();
  assert.match(waiting.body,/do not have a confirmed place/);assert.doesNotMatch(waiting.subject,/You’re in/);
  assert.match(Buffer.from(JSON.parse(waiting.attachments_json)[0].content,'base64').toString(),/STATUS:TENTATIVE/);
  db.close();
});
test('mail failure keeps the RSVP saved and retries the same payload and recovery link',async t=>{
  const {db,env,event,guest}=fixture();env.ENVIRONMENT='production';env.RESEND_API_KEY='test-only';env.EMAIL_FROM='test@example.com';
  const bodies=[];let works=false;
  t.mock.method(globalThis,'fetch',async(_url,options)=>{bodies.push(options.body);return works?Response.json({id:'test-provider-id'}):new Response('',{status:503});});
  assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).status,'failed');
  assert.equal(db.prepare("SELECT status FROM rsvps WHERE id='mail-rsvp'").get().status,'accepted');
  works=true;assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).status,'sent');
  assert.equal(bodies[0],bodies[1]);assert.equal(db.prepare('SELECT count(*) AS n FROM guest_access_tokens').get().n,1);
  db.close();
});
test('suppression and per-recipient limits do not undo a saved RSVP',async()=>{
  const {db,env,event,guest}=fixture();
  db.prepare('INSERT INTO email_suppressions(email_hash,reason,created_at) VALUES (?,?,?)').run(await sha256('dancer@example.com'),'bounce',new Date().toISOString());
  assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).status,'suppressed');
  db.exec('DELETE FROM email_suppressions');
  for(let revision=2;revision<=5;revision++){
    db.prepare("UPDATE events SET revision=? WHERE id='mail-event'").run(revision);
    assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).status,'development');
  }
  db.exec("UPDATE events SET revision=6 WHERE id='mail-event'");
  assert.equal((await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example')).status,'limited');
  assert.equal(db.prepare("SELECT status FROM rsvps WHERE id='mail-rsvp'").get().status,'accepted');db.close();
});
test('confirmation HTML escapes authored text and calendar lines retain UTF-8 characters',()=>{
  const {db,event,guest}=fixture();
  const edited={...event(),title:'<script>alert(1)</script> '+ 'é'.repeat(100)};
  const message=receiptContent(edited,guest(),{status:'accepted',party_size:2},'https://goodplans.example/events/test#invite=test-token','https://goodplans.example');
  assert.doesNotMatch(message.html,/<script>/);assert.match(message.html,/&lt;script&gt;/);
  const ics=Buffer.from(message.attachments[0].content,'base64').toString();
  for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
  assert.ok(ics.replace(/\r\n /g,'').includes(edited.title));
  assert.equal(guestEmail(' DANCER@example.com '),'dancer@example.com');
  for(const invalid of ['',null,'bad email','a'.repeat(255)+'@example.com'])assert.throws(()=>guestEmail(invalid));
  db.close();
});

test('changing recipient addresses cannot bypass the confirmation limit for one invitation',async()=>{
  const {db,env,event,guest}=fixture();
  for(let n=0;n<6;n++){
    db.prepare("UPDATE invitations SET guest_email=? WHERE id='mail-guest'").run(`address${n}@example.com`);
    const result=await queueRsvpConfirmation(env,event(),guest(),'https://goodplans.example');
    assert.equal(result.status,n<5?'development':'limited');
    if(n===5)assert.equal((await currentConfirmation(env,event(),guest(),{status:'accepted',party_size:1})).status,'limited');
  }
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_mailbox').get().n,5);
  db.close();
});
