import { Webhook } from 'svix';
import { id, sha256 } from './core.js';
import { fail } from './hosting-core.js';

export async function operations(request, env, { response, body, requireHost }) {
  const path = new URL(request.url).pathname;
  if (path === '/api/webhooks/resend' && request.method === 'POST') {
    if (!env.RESEND_WEBHOOK_SECRET) fail('Webhook is not configured.', 503);
    const raw = await request.text();
    if (raw.length > 100000) fail('Payload too large.', 413);
    let event;
    try { new Webhook(env.RESEND_WEBHOOK_SECRET).verify(raw, {
      'svix-id': request.headers.get('svix-id'),
      'svix-timestamp': request.headers.get('svix-timestamp'),
      'svix-signature': request.headers.get('svix-signature'),
    }); event = JSON.parse(raw); } catch { fail('Invalid webhook signature.', 401); }
    const kinds = { 'email.bounced':'bounced', 'email.complained':'complained', 'email.suppressed':'suppressed', 'email.delivered':'delivered', 'email.failed':'failed' };
    const kind = kinds[event.type], provider = event.data?.email_id;
    if (!kind || typeof provider !== 'string') return response({ok:true});
    const receipt = request.headers.get('svix-id');
    if (await env.DB.prepare('SELECT id FROM email_provider_events WHERE id=?').bind(receipt).first()) return response({ok:true});
    const now = new Date().toISOString();
    const statements = [env.DB.prepare('INSERT OR IGNORE INTO email_provider_events VALUES (?,?,?,?)').bind(receipt,provider,kind,now)];
    if (['bounced','complained','suppressed'].includes(kind)) {
      for (const email of (Array.isArray(event.data.to) ? event.data.to : []).slice(0,100)) {
        if (typeof email !== 'string') continue;
        statements.push(env.DB.prepare('INSERT OR IGNORE INTO email_suppressions VALUES (?,?,?)').bind(await sha256(email.trim().toLowerCase()),kind,now));
      }
    }
    for (const table of ['email_deliveries','newsletter_deliveries']) statements.push(env.DB.prepare(`UPDATE ${table} SET status=?,error=? WHERE provider_id=? AND status NOT IN ('bounced','complained','suppressed')`).bind(kind,kind==='delivered'?null:`Provider reported ${kind}`,provider));
    await env.DB.batch(statements);
    return response({ok:true});
  }
  if (path === '/api/support' && request.method === 'POST') {
    const input = await body(request);
    const email = String(input.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254) fail('Enter a valid email address.');
    if (!['help','export','delete'].includes(input.kind)) fail('Choose a request type.');
    const message=String(input.message||'').trim();
    if(message.length<10||message.length>2000) fail('Please use 10–2,000 characters.');
    const now=new Date().toISOString(), until=new Date(Date.now()+3600000).toISOString();
    const key='support:'+await sha256(request.headers.get('cf-connecting-ip')||'local');
    const rate=await env.DB.prepare('INSERT INTO auth_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(key,until,now,now).first();
    if(rate.count>5) fail('Please try again in an hour.',429);
    const reference=id('help');
    await env.DB.prepare('INSERT INTO support_requests(id,email,kind,message,created_at) VALUES (?,?,?,?,?)').bind(reference,email,input.kind,message,now).run();
    return response({reference});
  }
  if(path === '/api/host/operations') {
    await requireHost(request,env);
    if(request.method==='POST') {
      const input=await body(request);
      if(!['open','resolved'].includes(input.status)) fail('Invalid status.');
      await env.DB.prepare('UPDATE support_requests SET status=? WHERE id=?').bind(input.status,input.id).run();
      return response({ok:true});
    }
    if(request.method==='GET') {
      const [requests,jobs,mail,newsletter]=await Promise.all([
        env.DB.prepare('SELECT * FROM support_requests ORDER BY created_at DESC LIMIT 100').all(),
        env.DB.prepare('SELECT * FROM service_jobs').all(),
        env.DB.prepare('SELECT status,count(*) AS count FROM email_deliveries GROUP BY status').all(),
        env.DB.prepare('SELECT status,count(*) AS count FROM newsletter_deliveries GROUP BY status').all(),
      ]);
      return response({requests:requests.results,jobs:jobs.results,mail:mail.results,newsletter:newsletter.results,ready:{email:!!(env.RESEND_API_KEY&&env.EMAIL_FROM),webhook:!!env.RESEND_WEBHOOK_SECRET,discovery:!!env.TICKETMASTER_API_KEY}});
    }
  }
  return null;
}
export async function trackJob(env,name,run) {
  const record=status=>env.DB.prepare('INSERT INTO service_jobs VALUES (?,?,?) ON CONFLICT(name) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at').bind(name,status,new Date().toISOString()).run();
  await record('running');
  try { await run(); await record('completed'); } catch(error) { await record('failed'); console.error('Scheduled job failed',name); throw error; }
}
