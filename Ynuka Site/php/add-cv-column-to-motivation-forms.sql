-- Add CV file URL column if table already exists
-- Run this if you've already created the opportunity_motivation_forms table

ALTER TABLE `opportunity_motivation_forms` 
ADD COLUMN `cv_file_url` longtext AFTER `message`;

-- Verify the column was added
DESC opportunity_motivation_forms;
