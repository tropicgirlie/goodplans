ALTER TABLE email_deliveries ADD COLUMN html_body TEXT;
ALTER TABLE email_deliveries ADD COLUMN attachments_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE local_mailbox ADD COLUMN html_body TEXT;
ALTER TABLE local_mailbox ADD COLUMN attachments_json TEXT NOT NULL DEFAULT '[]';
CREATE TABLE guest_access_tokens (
  token_hash TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX guest_access_tokens_invitation ON guest_access_tokens(invitation_id);
CREATE INDEX email_deliveries_invitation ON email_deliveries(invitation_id,created_at);
