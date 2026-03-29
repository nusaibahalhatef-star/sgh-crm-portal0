-- 0042_add_normalized_phone.sql
-- Add normalizedPhone column, backfill digits-only values, and create index for fast lookups

ALTER TABLE `whatsapp_conversations`
  ADD COLUMN `normalizedPhone` VARCHAR(64);

-- Backfill normalizedPhone by stripping non-digits (MySQL 8+ with REGEXP_REPLACE)
-- If your MySQL version doesn't support REGEXP_REPLACE, run a JS backfill script instead.

UPDATE `whatsapp_conversations`
SET `normalizedPhone` = REGEXP_REPLACE(IFNULL(`phoneNumber`, ''), '[^0-9]', '');

-- Add index
CREATE INDEX `idx_whatsapp_conversations_normalizedPhone` ON `whatsapp_conversations` (`normalizedPhone`);
