-- D1 limits each row to 2 MB. Native gzip preserves the existing 4 MiB API
-- contract and full-catalog progress without dropping cards or evidence.
ALTER TABLE learner_state ADD COLUMN encoding TEXT NOT NULL DEFAULT 'json';
