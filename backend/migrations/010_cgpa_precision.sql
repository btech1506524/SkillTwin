-- Store the full onboarding range, including the valid value 10.00.
-- This forward migration preserves existing values and is safe to rerun.
ALTER TABLE users MODIFY COLUMN cgpa DECIMAL(4,2) NULL;
