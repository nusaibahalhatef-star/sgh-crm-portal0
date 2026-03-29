-- 0043_add_indexes_tracking.sql
-- Add indexes to improve BI aggregation query performance

-- Index visitSessions on createdAt, source, utmCampaign
ALTER TABLE `visitSessions`
  ADD INDEX `idx_visitSessions_createdAt` (`createdAt`),
  ADD INDEX `idx_visitSessions_source` (`source`),
  ADD INDEX `idx_visitSessions_utmCampaign` (`utmCampaign`);

-- Index abandonedForms on createdAt and contacted flag
ALTER TABLE `abandonedForms`
  ADD INDEX `idx_abandonedForms_createdAt` (`createdAt`),
  ADD INDEX `idx_abandonedForms_contacted` (`contacted`);

-- Note: If these indexes already exist, the migration will fail; run idempotent checks or drop/create accordingly.
