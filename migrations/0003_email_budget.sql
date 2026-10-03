-- Daily counters that cap outgoing account email (password reset and
-- verification) so abuse cannot drain the Email Service quota. Keys hold a day
-- and a hashed recipient, never a plain address.
CREATE TABLE email_budget (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
