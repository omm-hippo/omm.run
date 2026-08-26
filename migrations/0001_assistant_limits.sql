-- Apply to a dedicated D1 database before binding it as ASSISTANT_DB.
-- No prompt, response text, IP address, URL, command, option, or secret is stored.
CREATE TABLE IF NOT EXISTS assistant_budget (
  bucket TEXT PRIMARY KEY,
  used INTEGER NOT NULL CHECK (used >= 1),
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS assistant_selection_cache (
  question_hash TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('command', 'clarify')),
  command_id TEXT,
  expires_at INTEGER NOT NULL,
  CHECK (
    (action = 'command' AND command_id IS NOT NULL) OR
    (action = 'clarify' AND command_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS assistant_budget_expiry
  ON assistant_budget (expires_at);
CREATE INDEX IF NOT EXISTS assistant_selection_cache_expiry
  ON assistant_selection_cache (expires_at);
